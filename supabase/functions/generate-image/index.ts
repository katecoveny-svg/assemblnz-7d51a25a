import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function attemptImageGeneration(apiKey: string, imagePrompt: string): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: imagePrompt,
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Rate limited — please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted — please top up in workspace settings.");
    }
    throw new Error(`Image generation failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  console.log("API response keys:", JSON.stringify(Object.keys(data)));
  console.log("Choices count:", data.choices?.length);
  if (data.choices?.[0]?.message) {
    const msg = data.choices[0].message;
    console.log("Message keys:", JSON.stringify(Object.keys(msg)));
    console.log("Has images:", !!msg.images, "Images count:", msg.images?.length);
  }

  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt, platform, contentType, topic, agentContext } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imagePrompt = `Generate an image. Create a professional, eye-catching social media graphic for ${platform?.replace(/_/g, " ") || "social media"}. 
Content type: ${contentType?.replace(/_/g, " ") || "general"}.
${topic ? `Topic: ${topic}.` : ""}
${agentContext || ""}
Style: Modern, clean, professional with bold typography. Use vibrant colours on a dark or branded background. 
The image should be scroll-stopping and suitable for a NZ business audience.
Specific visual direction: ${prompt}
IMPORTANT: Generate an actual image, not text. Make text in the image legible and prominent.`;

    // Try up to 2 times
    let imageUrl: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      console.log(`Image generation attempt ${attempt + 1}`);
      imageUrl = await attemptImageGeneration(LOVABLE_API_KEY, imagePrompt);
      if (imageUrl) break;
      if (attempt === 0) {
        console.log("No image in response, retrying...");
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "The AI model did not return an image. Please try again with a simpler prompt." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
