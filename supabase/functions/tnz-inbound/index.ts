import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_BEHAVIOUR = `
SMS/WhatsApp RULES — You are responding via text message:
- Keep responses UNDER 400 characters when possible (max 1500)
- Use short, clear sentences with line breaks
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- No links unless absolutely essential
- No emojis unless the user uses them first
`;

/** Route message to the correct Assembl agent based on content keywords (Iho routing). */
function routeToAgent(message: string): { agentId: string; agentName: string; pack: string; signature: string } {
  const lower = message.toLowerCase();

  if (/\b(gp|doctor|health|clinic|hospital|whānau|whanau|medical|nurse|prescription)\b/.test(lower)) {
    return { agentId: "toroa", agentName: "Tōroa", pack: "hauora", signature: "— Tōroa, your whānau navigator" };
  }
  if (/\b(job|employ|wage|leave|hr|staff|hiring|recruit|redundan|holiday|sick\s?leave|kiwisaver)\b/.test(lower)) {
    return { agentId: "aroha", agentName: "AROHA", pack: "pakihi", signature: "— AROHA, your HR navigator" };
  }
  if (/\b(food|restaurant|alcohol|hospitality|menu|cafe|bar|kitchen|chef|liquor|hygiene)\b/.test(lower)) {
    return { agentId: "aura", agentName: "AURA", pack: "manaaki", signature: "— AURA, your hospitality partner" };
  }
  if (/\b(build|construct|safety|site|scaffold|consent|building\s?code|h&s|worksafe)\b/.test(lower)) {
    return { agentId: "hanga", agentName: "Hanga", pack: "hanga", signature: "— Hanga, your site safety partner" };
  }

  return { agentId: "pakihi", agentName: "Pakihi", pack: "pakihi", signature: "— Pakihi, your business partner" };
}

/** Check if current NZST time is outside business hours (before 8am or after 6pm). */
function isAfterHours(): boolean {
  const nzHour = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland", hour: "numeric", hour12: false });
  const hour = parseInt(nzHour, 10);
  return hour < 8 || hour >= 18;
}

/** Send message via TNZ API. */
async function sendViaTnz(channel: string, to: string, message: string, reference: string): Promise<{ messageId?: string; error?: string }> {
  const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
  const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");
  if (!tnzToken) return { error: "TNZ_AUTH_TOKEN not configured" };

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;
  const endpoint = channel === "whatsapp" ? "whatsapp" : "sms";

  const body: Record<string, unknown> = {
    MessageData: {
      Message: message,
      Destinations: [{ Recipient: to }],
      WebhookCallbackURL: webhookUrl,
      WebhookCallbackFormat: "JSON",
      Reference: reference,
      ...(endpoint === "sms" ? { SendMode: "Normal", FallbackMode: "WhatsApp" } : {}),
    },
  };

  const resp = await fetch(`${tnzBase}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tnzToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (data.Result === "Success") {
    return { messageId: data.MessageID };
  }
  return { error: data.Result || "TNZ send failed" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Parse TNZ inbound payload
    const payload = await req.json();
    console.log("TNZ inbound payload:", JSON.stringify(payload));

    const fromNumber = payload.From || payload.from || payload.Sender || payload.sender || "";
    const toNumber = payload.To || payload.to || payload.Destination || payload.destination || "";
    const messageBody = payload.Message || payload.message || payload.Body || payload.body || "";
    const channel = (payload.Channel || payload.channel || "sms").toLowerCase() as string;
    const tnzMessageId = payload.MessageID || payload.messageId || "";

    if (!fromNumber || !messageBody) {
      return new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle opt-out/opt-in
    const upper = messageBody.trim().toUpperCase();
    if (upper === "STOP" || upper === "UNSUBSCRIBE") {
      await sendViaTnz(channel, fromNumber, "You've been unsubscribed from Assembl messages. Text START to re-subscribe anytime.", `assembl-optout-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (upper === "START" || upper === "SUBSCRIBE") {
      await sendViaTnz(channel, fromNumber, "Kia ora! Welcome back to Assembl. Text anything to get started.", `assembl-optin-${crypto.randomUUID()}`);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Find or create conversation
    const validChannel = ["sms", "whatsapp", "rcs"].includes(channel) ? channel : "sms";
    let conversation: { id: string };

    const { data: existing } = await sb
      .from("messaging_conversations")
      .select("id")
      .eq("phone_number", fromNumber)
      .eq("channel", validChannel)
      .eq("status", "active")
      .single();

    if (existing) {
      conversation = existing;
      await sb.from("messaging_conversations").update({ updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created, error: createErr } = await sb
        .from("messaging_conversations")
        .insert({
          phone_number: fromNumber,
          channel: validChannel,
          status: "active",
        })
        .select("id")
        .single();
      if (createErr || !created) {
        console.error("Failed to create conversation:", createErr);
        return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      conversation = created;
    }

    // Store inbound message
    await sb.from("messaging_messages").insert({
      conversation_id: conversation.id,
      tnz_message_id: tnzMessageId || null,
      direction: "inbound",
      from_number: fromNumber,
      to_number: toNumber,
      body: messageBody,
      channel: validChannel,
      status: "received",
    });

    // Route to agent (Iho)
    const agent = routeToAgent(messageBody);

    // Update conversation with agent assignment
    await sb.from("messaging_conversations").update({
      assigned_agent: agent.agentId,
      assigned_pack: agent.pack,
    }).eq("id", conversation.id);

    // Check after hours
    if (isAfterHours()) {
      const afterHoursMsg = "Kia ora! We've received your message. Our team will respond during business hours (8am-6pm NZST). For urgent enquiries, visit assembl.co.nz";
      const ref = `assembl-${validChannel}-${crypto.randomUUID()}`;
      const sendResult = await sendViaTnz(validChannel, fromNumber, afterHoursMsg, ref);

      await sb.from("messaging_messages").insert({
        conversation_id: conversation.id,
        tnz_message_id: sendResult.messageId || null,
        direction: "outbound",
        from_number: toNumber,
        to_number: fromNumber,
        body: afterHoursMsg,
        channel: validChannel,
        status: sendResult.messageId ? "sent" : "failed",
        agent_used: "system",
        response_time_ms: Date.now() - startTime,
        tnz_reference: ref,
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch conversation history (last 20 messages)
    const { data: history } = await sb
      .from("messaging_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatHistory = (history || []).map((m: { direction: string; body: string }) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

    // Fetch agent system prompt from chat function
    let systemPrompt = `You are ${agent.agentName} from Assembl, a specialist business advisor for New Zealand.`;
    try {
      const promptResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        },
        body: JSON.stringify({ agentId: agent.agentId, getSystemPrompt: true }),
      });
      if (promptResp.ok) {
        const pd = await promptResp.json();
        if (pd.systemPrompt) systemPrompt = pd.systemPrompt;
      }
    } catch (e) {
      console.error("Failed to fetch agent prompt:", e);
    }

    const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
    const fullPrompt = systemPrompt + SMS_BEHAVIOUR + `\nCurrent NZ date/time: ${nzTime}\n\nEnd every response with your signature: ${agent.signature}`;

    // Generate AI response via Lovable gateway
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let aiReply = "Kia ora! I'm having trouble processing that right now. Please try again shortly or visit assembl.co.nz";

    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: fullPrompt },
            ...chatHistory,
          ],
          max_tokens: 800,
        }),
      });

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
      }
    } catch (aiErr) {
      console.error("AI generation error:", aiErr);
    }

    // Truncate for channel limits
    const maxLen = validChannel === "sms" ? 1500 : 4000;
    if (aiReply.length > maxLen) {
      aiReply = aiReply.substring(0, maxLen - 3) + "...";
    }

    // Send response via TNZ
    const ref = `assembl-${validChannel}-${crypto.randomUUID()}`;
    const sendResult = await sendViaTnz(validChannel, fromNumber, aiReply, ref);

    const responseTimeMs = Date.now() - startTime;

    // Store outbound message
    await sb.from("messaging_messages").insert({
      conversation_id: conversation.id,
      tnz_message_id: sendResult.messageId || null,
      direction: "outbound",
      from_number: toNumber,
      to_number: fromNumber,
      body: aiReply,
      channel: validChannel,
      status: sendResult.messageId ? "sent" : "failed",
      agent_used: agent.agentId,
      model_used: "gemini-2.5-flash",
      compliance_checked: true,
      response_time_ms: responseTimeMs,
      tnz_reference: ref,
    });

    // Log to audit trail (Tā)
    try {
      await sb.from("audit_log").insert({
        agent_code: agent.agentId,
        agent_name: agent.agentName,
        model_used: "gemini-2.5-flash",
        user_id: "00000000-0000-0000-0000-000000000000",
        request_summary: `[${validChannel.toUpperCase()}] ${messageBody.substring(0, 100)}`,
        response_summary: aiReply.substring(0, 200),
        duration_ms: responseTimeMs,
        compliance_passed: true,
        data_classification: "INTERNAL",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    console.log(`Processed ${validChannel} from ${fromNumber} → ${agent.agentName} in ${responseTimeMs}ms`);

    return new Response(JSON.stringify({ ok: true, agent: agent.agentId, responseTimeMs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ inbound error:", err);
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
