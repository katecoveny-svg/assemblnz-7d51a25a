import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Send — manually send SMS or WhatsApp via TNZ API.
 * Used by the admin dashboard for manual takeover replies.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tnzBase = Deno.env.get("TNZ_API_BASE") || "https://api.tnz.co.nz/api/v3.00";
    const tnzToken = Deno.env.get("TNZ_AUTH_TOKEN");

    if (!tnzToken) {
      return new Response(JSON.stringify({ error: "TNZ_AUTH_TOKEN not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { channel, to, message, conversationId } = await req.json();

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'message'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = channel === "whatsapp" ? "whatsapp" : "sms";
    const ref = `assembl-manual-${crypto.randomUUID()}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tnz-webhook`;

    const tnzResp = await fetch(`${tnzBase}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tnzToken}`,
      },
      body: JSON.stringify({
        MessageData: {
          Message: message,
          Destinations: [{ Recipient: to }],
          WebhookCallbackURL: webhookUrl,
          WebhookCallbackFormat: "JSON",
          Reference: ref,
          ...(endpoint === "sms" ? { SendMode: "Normal" } : {}),
        },
      }),
    });

    const tnzData = await tnzResp.json();

    // Log outbound message
    if (conversationId) {
      await sb.from("messaging_messages").insert({
        conversation_id: conversationId,
        tnz_message_id: tnzData.MessageID || null,
        direction: "outbound",
        to_number: to,
        body: message,
        channel: channel || "sms",
        status: tnzData.Result === "Success" ? "sent" : "failed",
        agent_used: "manual",
        tnz_reference: ref,
      });
    }

    return new Response(JSON.stringify({ ok: tnzData.Result === "Success", messageId: tnzData.MessageID }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ send error:", err);
    return new Response(JSON.stringify({ error: "Send failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
