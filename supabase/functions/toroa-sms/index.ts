import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ── Intent keywords ── */
const INTENT_MAP: Record<string, string[]> = {
  newsletter: ["school", "newsletter", "action", "event", "due", "notice", "principal"],
  packing: ["packing", "pack", "trip", "activity", "luggage", "camping", "ski"],
  bus: ["bus", "transport", "at", "metlink", "arrive", "when", "train"],
  meals: ["meal", "food", "recipe", "shopping", "grocery", "dinner", "lunch", "fridge"],
  budget: ["budget", "spending", "money", "expense", "cost", "spend", "income"],
  calendar: ["calendar", "event", "appointment", "schedule", "add", "training", "practice"],
  homework: ["homework", "assignment", "essay", "due", "study", "project", "science", "maths"],
  help: ["help", "commands", "what can you do", "hi toroa", "hey toroa", "start"],
};

function classifyIntent(msg: string, hasMedia: boolean): string {
  if (hasMedia) return "newsletter"; // images default to newsletter parsing
  const lower = msg.toLowerCase();
  for (const [intent, words] of Object.entries(INTENT_MAP)) {
    if (words.some((w) => lower.includes(w))) return intent;
  }
  return "general";
}

/* ── Parse inbound from Twilio or Vonage ── */
interface InboundSms {
  from: string;
  to: string;
  body: string;
  messageId: string;
  provider: "twilio" | "vonage" | "tnz" | "direct";
  mediaUrl?: string;
  mediaType?: string;
  numMedia?: number;
}

async function parsePayload(req: Request): Promise<InboundSms> {
  const ct = req.headers.get("content-type") || "";

  // Twilio sends form-encoded
  if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    const numMedia = parseInt((form.get("NumMedia") as string) || "0", 10);
    return {
      from: (form.get("From") as string) || "",
      to: (form.get("To") as string) || "",
      body: (form.get("Body") as string) || "",
      messageId: (form.get("MessageSid") as string) || "",
      provider: "twilio",
      numMedia,
      mediaUrl: numMedia > 0 ? (form.get("MediaUrl0") as string) || undefined : undefined,
      mediaType: numMedia > 0 ? (form.get("MediaContentType0") as string) || undefined : undefined,
    };
  }

  // JSON — Vonage, TNZ, or direct API call
  const json = await req.json();

  // Vonage format
  if (json.msisdn) {
    return {
      from: json.msisdn.startsWith("+") ? json.msisdn : `+${json.msisdn}`,
      to: json.to || "",
      body: json.text || json.message || "",
      messageId: json.messageId || json["message-id"] || "",
      provider: "vonage",
    };
  }

  // TNZ format
  if (json.Sender || json.From) {
    return {
      from: json.Sender || json.From || json.from || "",
      to: json.Destination || json.To || json.to || "",
      body: json.Message || json.message || json.Body || json.body || "",
      messageId: json.MessageID || json.messageId || "",
      provider: "tnz",
    };
  }

  // Direct API call (our own format) — supports mediaUrl for testing
  return {
    from: json.from || json.phone || "",
    to: json.to || "",
    body: json.message || json.body || json.text || "",
    messageId: json.messageId || "",
    provider: "direct",
    mediaUrl: json.mediaUrl || json.imageUrl || undefined,
    mediaType: json.mediaType || "image/jpeg",
  };
}

/* ── Fetch media and convert to base64 for Gemini Vision ── */
async function fetchMediaAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    // Twilio media URLs require auth
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");

    const headers: Record<string, string> = {};
    if (url.includes("twilio.com") && accountSid && authToken) {
      headers["Authorization"] = `Basic ${btoa(`${accountSid}:${authToken}`)}`;
    }

    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      console.error(`Failed to fetch media: ${resp.status}`);
      return null;
    }

    const buffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mimeType = resp.headers.get("content-type") || "image/jpeg";

    return { base64, mimeType };
  } catch (err) {
    console.error("Media fetch error:", err);
    return null;
  }
}

/* ── Send SMS via TNZ ── */
async function sendSms(to: string, message: string): Promise<void> {
  const token = Deno.env.get("TNZ_AUTH_TOKEN");
  const base = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v2.02";
  const from = Deno.env.get("TNZ_FROM_NUMBER") || "TOROA";
  if (!token) { console.warn("TNZ_AUTH_TOKEN not set — SMS not sent"); return; }

  try {
    await fetch(`${base}/send/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${token}` },
      body: JSON.stringify({
        MessageData: {
          Message: message,
          Destinations: [{ Recipient: to }],
          Reference: `toroa-${Date.now()}`,
          FromNumber: from,
        },
      }),
    });
  } catch (err) { console.error("SMS send error:", err); }
}

/* ── System prompt by intent ── */
function systemPromptForIntent(intent: string): string {
  const base = `You are Tōroa, an SMS-first AI family navigator for New Zealand whānau. You are warm, helpful, and concise. Use te reo Māori naturally. Use NZ English. Keep responses UNDER 1500 characters. Use emoji sparingly for visual appeal. Always provide actionable next steps. Current NZ date/time: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}`;

  const extras: Record<string, string> = {
    newsletter: `\n\nYou are parsing a school newsletter or notice — it may be sent as text OR as a photo/image. Extract: school name, action items (with dates, costs), deadlines. Format as a concise summary with ✓ header, 📋 action count, 📅 nearest deadline, 💰 total cost, then list items. If the image is hard to read, say so and ask the user to resend a clearer photo.`,
    packing: `\n\nYou are creating a packing list. Categorise items: 👕 Clothing, 👟 Footwear, 🧴 Toiletries, 🎒 Gear. Add NZ-specific items (sunscreen SPF50+). Estimate cost range from NZ retailers (Kathmandu, Macpac, Warehouse).`,
    bus: `\n\nYou help with NZ public transport. Reference Auckland Transport (AT), Metlink (Wellington), or local services. Give next departure times if possible. Always suggest checking the AT/Metlink app for live updates.`,
    meals: `\n\nYou create family meal plans. Consider NZ seasonal produce, Kiwi favourites, dietary requirements. Provide a shopping list with estimated costs from NZ supermarkets (Countdown, New World, Pak'nSave). Format: 🍽️ header, days, budget, prep time. If the user sends a fridge photo, identify visible items and build a meal plan from them.`,
    budget: `\n\nYou help NZ families with budgeting. Reference NZ costs (power, groceries, petrol). Use NZD. Be encouraging and practical. Suggest NZ-specific savings (FamilyBoost, WFF, community programmes).`,
    calendar: `\n\nYou manage family calendars. Confirm event details: title, date, time, location. Format: 📅 Event Added! with details. Check for conflicts. Use NZ date format (DD/MM/YYYY).`,
    homework: `\n\nYou help track homework and school assignments. Be encouraging. Break large tasks into steps. Estimate time needed. Track due dates. Format with subject and status.`,
    help: `\n\nThe user needs help. List what you can do: 📧 Parse school newsletters (text OR photo!), 🎒 Packing lists, 🚌 Bus times, 🍽️ Meal planning (send a fridge photo!), 💰 Budget tracking, 📅 Calendar management, 📚 Homework tracking. Be warm and welcoming.`,
    general: `\n\nAnswer general family life questions with NZ-specific knowledge. Reference local resources, government programmes (FamilyBoost, WINZ, Plunket), and community services.`,
  };

  return base + (extras[intent] || extras.general);
}

/* ── Build multimodal messages for Gemini ── */
function buildMessages(
  systemPrompt: string,
  chatHistory: Array<{ role: string; content: string }>,
  userText: string,
  mediaData: { base64: string; mimeType: string } | null,
) {
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
  ];

  if (mediaData) {
    // Gemini multimodal: send image + text as content array
    const userContent: any[] = [
      {
        type: "image_url",
        image_url: {
          url: `data:${mediaData.mimeType};base64,${mediaData.base64}`,
        },
      },
    ];
    if (userText) {
      userContent.unshift({ type: "text", text: userText || "Please parse this school newsletter or notice and extract action items, dates, and costs." });
    } else {
      userContent.unshift({ type: "text", text: "Please parse this school newsletter or notice and extract action items, dates, and costs." });
    }
    messages.push({ role: "user", content: userContent });
  } else {
    messages.push({ role: "user", content: userText });
  }

  return messages;
}

/* ── Main handler ── */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const sms = await parsePayload(req);

    if (!sms.from || (!sms.body && !sms.mediaUrl)) {
      return new Response(JSON.stringify({ error: "Invalid SMS payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Find or create family
    let { data: family } = await sb
      .from("toroa_families")
      .select("*")
      .eq("primary_phone", sms.from)
      .single();

    if (!family) {
      const { data: newFamily } = await sb
        .from("toroa_families")
        .insert({
          primary_phone: sms.from,
          status: "trial",
          plan: "starter",
          messages_remaining: 10,
          monthly_sms_limit: 100,
          sms_used_this_month: 0,
        })
        .select()
        .single();
      family = newFamily;
    }

    if (!family) {
      return new Response(JSON.stringify({ error: "Failed to create family" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check SMS allowance
    if (family.status === "trial" && (family.messages_remaining ?? 0) <= 0) {
      const msg = "Kia ora! You've used your free trial messages. Subscribe to keep using Tōroa → https://assembl.co.nz/toroa";
      await sendSms(sms.from, msg);
      return new Response(JSON.stringify({ status: "trial_expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For paid plans, check monthly limit
    if (family.status === "active" && family.plan !== "plus") {
      const limit = family.monthly_sms_limit || 100;
      const used = family.sms_used_this_month || 0;
      if (used >= limit) {
        await sendSms(sms.from, `You've hit your ${limit} SMS limit this month. Upgrade your plan for more → https://assembl.co.nz/toroa`);
        return new Response(JSON.stringify({ status: "limit_reached" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Fetch media if present (Vision AI)
    let mediaData: { base64: string; mimeType: string } | null = null;
    const hasMedia = !!(sms.mediaUrl || (sms.numMedia && sms.numMedia > 0));

    if (sms.mediaUrl) {
      mediaData = await fetchMediaAsBase64(sms.mediaUrl);
    }

    // 4. Classify intent (media defaults to newsletter)
    const intent = classifyIntent(sms.body || "", hasMedia);

    // 5. Get conversation history
    const { data: history } = await sb
      .from("toroa_conversations")
      .select("direction, message, response")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (history || []).reverse().flatMap((msg: any) => {
      const msgs = [{ role: "user" as const, content: msg.message }];
      if (msg.response) msgs.push({ role: "assistant" as const, content: msg.response });
      return msgs;
    });

    // 6. Call AI (Gemini with Vision for images)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use Gemini 2.5 Flash for text, Gemini 2.5 Pro for vision (better OCR)
    const model = mediaData ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    const messages = buildMessages(
      systemPromptForIntent(intent),
      chatHistory,
      sms.body || "",
      mediaData,
    );

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        await sendSms(sms.from, "Kia ora! Tōroa's a bit busy right now. Try again in a minute 🌊");
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiResult = await aiResp.json();
    const replyText = aiResult.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again?";
    const tokensUsed = (aiResult.usage?.total_tokens) || 0;

    // Truncate for SMS
    const finalReply = replyText.length > 1500 ? replyText.substring(0, 1497) + "..." : replyText;

    // 7. Send reply
    await sendSms(sms.from, finalReply);

    // 8. Log conversation
    await sb.from("toroa_conversations").insert({
      family_id: family.id,
      direction: "incoming",
      phone: sms.from,
      message: sms.body || (hasMedia ? "[Image sent]" : ""),
      intent,
      response: finalReply,
      tokens_used: tokensUsed,
    });

    // 9. Update usage counters
    const updates: Record<string, any> = {
      sms_used_this_month: (family.sms_used_this_month || 0) + 1,
    };
    if (family.status === "trial") {
      updates.messages_remaining = Math.max(0, (family.messages_remaining || 0) - 1);
    }
    await sb.from("toroa_families").update(updates).eq("id", family.id);

    return new Response(
      JSON.stringify({ success: true, messageId: sms.messageId, intent, vision: !!mediaData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("toroa-sms error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
