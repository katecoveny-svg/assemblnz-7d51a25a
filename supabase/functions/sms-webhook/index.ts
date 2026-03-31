import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_SYSTEM_ADDON = `

SMS RULES — You are responding via text message (SMS):
- Keep responses UNDER 400 characters when possible (max 1600)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const sb = createClient(supabaseUrl, serviceKey);

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Service temporarily unavailable.</Message></Response>',
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // Parse Twilio webhook payload
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = String(value);
      }
    } else {
      body = await req.json();
    }

    const fromNumber = body.From || "";
    const toNumber = body.To || "";
    const messageBody = body.Body || "";
    const messageSid = body.MessageSid || "";

    if (!fromNumber || !toNumber || !messageBody) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Invalid request.</Message></Response>',
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // Look up which agent is assigned to this Twilio number
    const { data: phoneMapping } = await sb
      .from("sms_phone_numbers")
      .select("*")
      .eq("twilio_number", toNumber)
      .eq("is_active", true)
      .single();

    if (!phoneMapping) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>This number is not currently active. Visit assembl.co.nz for help.</Message></Response>',
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    const agentId = phoneMapping.agent_id;
    const agentName = phoneMapping.agent_name;

    // Find or create conversation
    let conversation: any;
    const { data: existing } = await sb
      .from("sms_conversations")
      .select("*")
      .eq("phone_number", fromNumber)
      .eq("agent_id", agentId)
      .single();

    if (existing) {
      conversation = existing;
      await sb.from("sms_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created } = await sb
        .from("sms_conversations")
        .insert({
          phone_number: fromNumber,
          agent_id: agentId,
          sms_phone_number_id: phoneMapping.id,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();
      conversation = created;
    }

    // Store inbound message
    await sb.from("sms_messages").insert({
      conversation_id: conversation.id,
      direction: "inbound",
      body: messageBody,
      twilio_sid: messageSid,
      status: "received",
    });

    // Load conversation history (last 20 messages)
    const { data: history } = await sb
      .from("sms_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Get agent system prompt from chat function
    const chatUrl = `${supabaseUrl}/functions/v1/chat`;
    const promptRes = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ agentId, getSystemPrompt: true }),
    });

    let systemPrompt = `You are ${agentName} from Assembl, a specialist business advisor for New Zealand.`;
    if (promptRes.ok) {
      const promptData = await promptRes.json();
      if (promptData.systemPrompt) {
        systemPrompt = promptData.systemPrompt;
      }
    }

    // Add SMS-specific instructions
    const fullSystemPrompt = systemPrompt + SMS_SYSTEM_ADDON + `\nCurrent date/time: ${new Date().toISOString()}`;

    // Build conversation messages
    const isNewConversation = !history || history.length <= 1;
    const messages: Array<{ role: string; content: string }> = [];

    if (isNewConversation) {
      messages.push({
        role: "system",
        content: fullSystemPrompt + `\n\nThis is a NEW conversation. Introduce yourself briefly: "Kia ora, I'm ${agentName} from Assembl. [one sentence about your specialty]. How can I help?"`,
      });
    } else {
      messages.push({ role: "system", content: fullSystemPrompt });
    }

    // Add history as alternating messages
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.body,
        });
      }
    }

    // Call AI via Lovable gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 800,
      }),
    });

    let reply = "Sorry, I'm having trouble right now. Try again shortly or visit assembl.co.nz.";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content || reply;
    }

    // Truncate to SMS limit
    if (reply.length > 1590) {
      reply = reply.substring(0, 1587) + "...";
    }

    // Store outbound message
    await sb.from("sms_messages").insert({
      conversation_id: conversation.id,
      direction: "outbound",
      body: reply,
      status: "sent",
    });

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`;
    return new Response(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Something went wrong. Please try again.</Message></Response>',
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
