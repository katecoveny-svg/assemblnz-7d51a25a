import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// HELM system prompt (condensed for SMS — concise, text-friendly responses)
const HELM_SMS_PROMPT = `You are HELM, a family life admin assistant for NZ families, communicating via text message (SMS).

RULES FOR SMS:
- Keep responses UNDER 300 characters when possible (SMS-friendly)
- Use short, punchy sentences — no fluff
- Use line breaks for lists, not bullets
- Never use markdown formatting
- Be warm but concise — like texting a super-organised friend
- Use NZ English (colour, organise, etc.)
- If asked about something complex, give the key answer first then offer "Reply MORE for details"
- For meal plans, give today's meals only unless asked for the week
- For reminders, confirm with the specific date/time
- For school dates, give the next upcoming one
- Sign off naturally (no "HELM" signature needed)

CAPABILITIES:
- Family schedule and calendar queries
- Meal planning and grocery suggestions (NZ supermarkets)
- School admin (NZ term dates 2026: T1 3 Feb-17 Apr, T2 5 May-4 Jul, T3 21 Jul-26 Sep, T4 13 Oct-16 Dec)
- Budget and bill reminders
- Quick reminders and to-do tracking
- Health appointment tracking
- NZ-specific info (ACC, school systems, local services)

When you detect a reminder request, extract the date/time and task clearly.
When you detect a meal planning request, consider NZ seasonal produce and supermarket pricing.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const sb = createClient(supabaseUrl, serviceKey);

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    // Twilio sends form-encoded POST for incoming SMS
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

    // === Handle opt-in / opt-out ===
    const upperBody = incomingBody.trim().toUpperCase();
    if (upperBody === "STOP" || upperBody === "UNSUBSCRIBE") {
      await sb
        .from("helm_sms_conversations")
        .update({ opted_in: false, updated_at: new Date().toISOString() })
        .eq("phone_number", fromNumber);

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>You've been unsubscribed from HELM. Text START to re-subscribe anytime.</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    if (upperBody === "START" || upperBody === "SUBSCRIBE") {
      await sb
        .from("helm_sms_conversations")
        .update({ opted_in: true, updated_at: new Date().toISOString() })
        .eq("phone_number", fromNumber);

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Welcome back to HELM! Your family assistant is ready. Text anything to get started.</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // === Look up or create conversation ===
    let { data: convo } = await sb
      .from("helm_sms_conversations")
      .select("*")
      .eq("phone_number", fromNumber)
      .single();

    if (!convo) {
      // New number — create unlinked conversation (will be linked when family adds the number)
      const { data: newConvo } = await sb
        .from("helm_sms_conversations")
        .insert({
          phone_number: fromNumber,
          display_name: fromNumber,
          verified: false,
          opted_in: true,
        })
        .select()
        .single();
      convo = newConvo;
    }

    if (!convo) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, something went wrong setting up your account. Please try again.</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // Check opt-in status
    if (!convo.opted_in) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // === Log inbound message ===
    await sb.from("helm_sms_messages").insert({
      conversation_id: convo.id,
      direction: "inbound",
      body: incomingBody,
      twilio_sid: messageSid,
      status: "received",
    });

    // === If not linked to a family, prompt setup ===
    if (!convo.family_id) {
      // Check if the message is a family link code
      const trimmedBody = incomingBody.trim();
      if (trimmedBody.length >= 4 && trimmedBody.length <= 20) {
        // Try to match an invite code
        const { data: invite } = await sb
          .from("family_invites")
          .select("family_id")
          .eq("code", trimmedBody)
          .is("used_by", null)
          .single();

        if (invite) {
          await sb
            .from("helm_sms_conversations")
            .update({
              family_id: invite.family_id,
              verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", convo.id);

          // Get family name
          const { data: family } = await sb
            .from("families")
            .select("name")
            .eq("id", invite.family_id)
            .single();

          const replyText = `Connected to ${family?.name || "your family"}! I'm HELM, your family assistant. Try:\n\n"What's for dinner?"\n"Remind me to pack lunches at 7am"\n"When does Term 2 start?"`;

          await sb.from("helm_sms_messages").insert({
            conversation_id: convo.id,
            direction: "outbound",
            body: replyText,
            status: "sent",
          });

          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(replyText)}</Message></Response>`,
            { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
          );
        }
      }

      const setupReply =
        "Kia ora! I'm HELM, your family assistant. To get started, text me your family invite code from the HELM dashboard at assembl.co.nz. Or ask your family admin to add your number in Settings.";

      await sb.from("helm_sms_messages").insert({
        conversation_id: convo.id,
        direction: "outbound",
        body: setupReply,
        status: "sent",
      });

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(setupReply)}</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // === Fetch conversation history for context (last 10 messages) ===
    const { data: recentMessages } = await sb
      .from("helm_sms_messages")
      .select("direction, body, created_at")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (recentMessages || [])
      .reverse()
      .map((m) => ({
        role: m.direction === "inbound" ? "user" : "assistant",
        content: m.body,
      }));

    // === Fetch family context ===
    let familyContext = "";
    if (convo.family_id) {
      const [familyRes, childrenRes] = await Promise.all([
        sb.from("families").select("name, nz_region").eq("id", convo.family_id).single(),
        sb.from("children").select("name, year_level, school").eq("family_id", convo.family_id),
      ]);

      if (familyRes.data) {
        familyContext += `\nFamily: ${familyRes.data.name}`;
        if (familyRes.data.nz_region) familyContext += ` (${familyRes.data.nz_region})`;
      }
      if (childrenRes.data?.length) {
        familyContext += `\nChildren: ${childrenRes.data.map((c) => `${c.name}${c.year_level ? ` (Year ${c.year_level})` : ""}${c.school ? ` at ${c.school}` : ""}`).join(", ")}`;
      }
    }

    const fullPrompt =
      HELM_SMS_PROMPT +
      (familyContext ? `\n\nFAMILY CONTEXT:${familyContext}` : "") +
      `\n\nCurrent date/time: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}`;

    // === Call AI ===
    if (!LOVABLE_API_KEY) {
      const fallback = "HELM is temporarily unavailable. Please try again shortly.";
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(fallback)}</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    let aiReply = "Sorry, I couldn't process that. Please try again.";

    try {
      const aiResp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
        }
      );

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        aiReply =
          aiData.choices?.[0]?.message?.content?.trim() || aiReply;
        // Truncate to SMS-friendly length (max 1600 chars for concatenated SMS)
        if (aiReply.length > 1500) {
          aiReply = aiReply.substring(0, 1497) + "...";
        }
      }
    } catch (aiErr) {
      console.error("HELM SMS AI error:", aiErr);
    }

    // === Log outbound message ===
    await sb.from("helm_sms_messages").insert({
      conversation_id: convo.id,
      direction: "outbound",
      body: aiReply,
      status: "sent",
    });

    // Update conversation timestamp
    await sb
      .from("helm_sms_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convo.id);

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(aiReply)}</Message></Response>`,
      { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("HELM SMS webhook error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Something went wrong. Please try again.</Message></Response>`,
      { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
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
