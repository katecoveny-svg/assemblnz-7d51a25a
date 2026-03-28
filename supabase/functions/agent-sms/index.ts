import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Generic Agent SMS Webhook
 *
 * Routes incoming SMS to any Assembl agent based on the Twilio phone number.
 * Each agent can have its own Twilio number configured in agent_sms_config.
 *
 * Twilio webhook URL format:
 *   POST /functions/v1/agent-sms
 *
 * The function looks up which agent is assigned to the receiving Twilio number,
 * fetches that agent's system prompt from the chat function, and responds.
 */

const SMS_BEHAVIOUR = `\n\nSMS RULES — You are responding via text message (SMS):
- Keep responses UNDER 400 characters when possible
- Use short, clear sentences
- Use line breaks for lists, not bullets or markdown
- Never use markdown formatting (no **, ##, etc.)
- Be helpful and direct — like texting a knowledgeable colleague
- If the question needs a long answer, give the key point first then say "Reply MORE for details"
- Use NZ English (colour, organise, etc.)
- Current date/time: `;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const sb = createClient(supabaseUrl, serviceKey);

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

    const incomingBody = body.Body || body.body || "";
    const fromNumber = body.From || body.from || "";
    const toNumber = body.To || body.to || "";
    const messageSid = body.MessageSid || body.message_sid || "";

    // === Handle opt-out ===
    const upperBody = incomingBody.trim().toUpperCase();
    if (upperBody === "STOP" || upperBody === "UNSUBSCRIBE") {
      return twimlResponse("You've been unsubscribed. Text START to re-subscribe anytime.");
    }
    if (upperBody === "START" || upperBody === "SUBSCRIBE") {
      return twimlResponse("Welcome back! Text anything to get started.");
    }

    // === Look up which agent this Twilio number belongs to ===
    const { data: smsConfig } = await sb
      .from("agent_sms_config")
      .select("*")
      .eq("twilio_phone_number", toNumber)
      .eq("enabled", true)
      .single();

    if (!smsConfig) {
      // Fallback: try to match without +country code normalization
      const cleanTo = toNumber.replace(/\D/g, "");
      const { data: fallbackConfig } = await sb
        .from("agent_sms_config")
        .select("*")
        .eq("enabled", true)
        .limit(50);

      const matched = fallbackConfig?.find(
        (c: any) => c.twilio_phone_number?.replace(/\D/g, "") === cleanTo
      );

      if (!matched) {
        return twimlResponse(
          "This number is not currently configured. Please contact the business directly."
        );
      }

      return await handleAgentSms(sb, matched, fromNumber, incomingBody, messageSid, LOVABLE_API_KEY, supabaseUrl);
    }

    return await handleAgentSms(sb, smsConfig, fromNumber, incomingBody, messageSid, LOVABLE_API_KEY, supabaseUrl);
  } catch (error) {
    console.error("Agent SMS webhook error:", error);
    return twimlResponse("Something went wrong. Please try again.");
  }
});

async function handleAgentSms(
  sb: any,
  config: any,
  fromNumber: string,
  incomingBody: string,
  messageSid: string,
  apiKey: string | undefined,
  supabaseUrl: string
): Promise<Response> {
  const agentId = config.agent_id;
  const userId = config.user_id;

  // Log inbound message
  await sb.from("agent_sms_messages").insert({
    user_id: userId,
    agent_id: agentId,
    phone_number: fromNumber,
    direction: "inbound",
    body: incomingBody,
    twilio_sid: messageSid,
    status: "received",
  });

  // Fetch recent conversation history for this phone + agent
  const { data: recentMessages } = await sb
    .from("agent_sms_messages")
    .select("direction, body, created_at")
    .eq("user_id", userId)
    .eq("agent_id", agentId)
    .eq("phone_number", fromNumber)
    .order("created_at", { ascending: false })
    .limit(10);

  const chatHistory = (recentMessages || [])
    .reverse()
    .map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.body,
    }));

  // Fetch agent system prompt from the chat function
  let systemPrompt = "";
  try {
    const promptResp = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({ agentId, getSystemPrompt: true }),
    });
    if (promptResp.ok) {
      const promptData = await promptResp.json();
      systemPrompt = promptData.systemPrompt || "";
    }
  } catch (e) {
    console.error("Failed to fetch agent prompt:", e);
  }

  // Add SMS behaviour rules
  const nzTime = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
  const fullPrompt = systemPrompt + SMS_BEHAVIOUR + nzTime;

  // Call AI
  if (!apiKey) {
    return twimlResponse("This agent is temporarily unavailable. Please try again shortly.");
  }

  let aiReply = "Sorry, I couldn't process that. Please try again.";

  try {
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: fullPrompt },
          ...chatHistory,
          { role: "user", content: incomingBody },
        ],
        max_tokens: 500,
      }),
    });

    if (aiResp.ok) {
      const aiData = await aiResp.json();
      aiReply = aiData.choices?.[0]?.message?.content?.trim() || aiReply;
      if (aiReply.length > 1500) {
        aiReply = aiReply.substring(0, 1497) + "...";
      }
    }
  } catch (aiErr) {
    console.error("Agent SMS AI error:", aiErr);
  }

  // Log outbound
  await sb.from("agent_sms_messages").insert({
    user_id: userId,
    agent_id: agentId,
    phone_number: fromNumber,
    direction: "outbound",
    body: aiReply,
    status: "sent",
  });

  return twimlResponse(aiReply);
}

function twimlResponse(message: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`,
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/xml",
      },
    }
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
