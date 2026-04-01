import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * TNZ Webhook — handles delivery status updates from TNZ API.
 * TNZ posts delivery reports (Sent, Delivered, Failed, etc.) here
 * via the WebhookCallbackURL we set on outbound messages.
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    console.log("TNZ webhook payload:", JSON.stringify(payload));

    // TNZ delivery report fields
    const messageId = payload.MessageID || payload.messageId || payload.message_id;
    const status = payload.Status || payload.status;
    const destination = payload.Destination || payload.destination;

    if (!messageId) {
      console.log("No MessageID in payload — ignoring");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map TNZ status to our status enum
    const statusMap: Record<string, string> = {
      Sent: "sent",
      Delivered: "delivered",
      Read: "read",
      Failed: "failed",
      Expired: "failed",
      Rejected: "failed",
      Pending: "processing",
    };

    const mappedStatus = statusMap[status] || "sent";

    // Update message status by TNZ message ID
    const { error } = await sb
      .from("messaging_messages")
      .update({ status: mappedStatus })
      .eq("tnz_message_id", messageId);

    if (error) {
      console.error("Failed to update message status:", error);
    } else {
      console.log(`Updated message ${messageId} to status: ${mappedStatus}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TNZ webhook error:", err);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
