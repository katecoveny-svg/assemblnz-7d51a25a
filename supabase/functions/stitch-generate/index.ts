import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODELS = [
  "google/gemini-3-pro-image-preview",
  "google/gemini-3.1-flash-image-preview",
  "google/gemini-2.5-flash-image",
];

async function generateImage(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Image gen: model=${model}, attempt=${attempt + 1}`);
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) throw new Error("Rate limited — try again shortly.");
          if (response.status === 402) throw new Error("AI credits exhausted.");
          console.error(`AI error [${response.status}]:`, errorText);
          continue;
        }

        const data = await response.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes("Rate limited") || msg.includes("credits exhausted")) throw e;
        console.error(`Attempt failed:`, e);
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, style, aspectRatio } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enhancedPrompt = `Create a professional, high-quality marketing visual: ${prompt}. Style: ${style || "modern, premium, commercial-grade"}. The design should look agency-produced with sophisticated colour palettes, clean composition, and crisp typography. Aspect ratio: ${aspectRatio || "1:1"}.`;

    const imageUrl = await generateImage(LOVABLE_API_KEY, enhancedPrompt);

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image generation failed. Please try again with a different prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl, source: "lovable-ai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("stitch-generate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("Rate limited") ? 429
      : errorMessage.includes("credits exhausted") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
