import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const sb = createClient(supabaseUrl, serviceKey);

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate — require service role or admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, agent_id, message } = body;

    if (!to || !agent_id || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, agent_id, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up Twilio number for this agent
    const { data: phoneMapping } = await sb
      .from("sms_phone_numbers")
      .select("*")
      .eq("agent_id", agent_id)
      .eq("is_active", true)
      .single();

    if (!phoneMapping) {
      return new Response(
        JSON.stringify({ error: `No active Twilio number found for agent: ${agent_id}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${twilioAuth}`,
      },
      body: new URLSearchParams({
        To: to,
        From: phoneMapping.twilio_number,
        Body: message.substring(0, 1600),
      }),
    });

    const smsData = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error("Twilio send error:", smsData);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or create conversation
    const { data: existing } = await sb
      .from("sms_conversations")
      .select("id")
      .eq("phone_number", to)
      .eq("agent_id", agent_id)
      .single();

    let conversationId: string;
    if (existing) {
      conversationId = existing.id;
      await sb.from("sms_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      const { data: created } = await sb
        .from("sms_conversations")
        .insert({
          phone_number: to,
          agent_id: agent_id,
          sms_phone_number_id: phoneMapping.id,
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      conversationId = created!.id;
    }

    // Store outbound message
    await sb.from("sms_messages").insert({
      conversation_id: conversationId,
      direction: "outbound",
      body: message.substring(0, 1600),
      twilio_sid: smsData.sid,
      status: smsData.status || "sent",
    });

    return new Response(
      JSON.stringify({ success: true, sid: smsData.sid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SMS send error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
