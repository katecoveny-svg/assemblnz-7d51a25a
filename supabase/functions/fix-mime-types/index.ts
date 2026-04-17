// Re-uploads every object in the video-assets bucket with the correct
// Content-Type header so Safari and other strict browsers play them.
// Invoke once via curl, then it can be deleted.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const bucket = "video-assets";
  const results: Array<{ path: string; ok: boolean; mime: string; error?: string }> = [];

  async function walk(prefix = "") {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    for (const item of data ?? []) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders have no metadata
      if (!item.id && !(item as { metadata?: unknown }).metadata) {
        await walk(fullPath);
        continue;
      }
      const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
      const mime = MIME_BY_EXT[ext];
      if (!mime) continue;
      try {
        const { data: blob, error: dlErr } = await supabase.storage.from(bucket).download(fullPath);
        if (dlErr || !blob) throw dlErr ?? new Error("no blob");
        const buf = await blob.arrayBuffer();
        const { error: upErr } = await supabase.storage.from(bucket).upload(fullPath, buf, {
          contentType: mime,
          upsert: true,
        });
        if (upErr) throw upErr;
        results.push({ path: fullPath, ok: true, mime });
      } catch (e) {
        results.push({ path: fullPath, ok: false, mime, error: (e as Error).message });
      }
    }
  }

  try {
    await walk("");
    return new Response(JSON.stringify({ count: results.length, results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
