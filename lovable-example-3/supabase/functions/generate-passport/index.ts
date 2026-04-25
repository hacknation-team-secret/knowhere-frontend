// Generates a personal Knowhere passport image using Lovable AI.
// Input: { name: string }  Output: { imageUrl: string } (data URL)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    const safeName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim().slice(0, 40)
        : "wanderer";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const prompt = `A fictional personal city passport card — NOT a government document.
Travel scrapbook meets premium mobile app aesthetic.

Brand wordmark: "know·here" set in a warm editorial serif (Fraunces-like), large.
Subtitle directly under the wordmark, smaller clean sans-serif: "universal passport".
Owner line near the lower portion, clean sans-serif: "belongs to ${safeName}".
All three text elements must be clearly legible, sharp, evenly spaced, no spelling mistakes, no extra words, no duplicated text.

Visual direction:
- Softly rounded rectangle card on a warm off-white paper background (#F7F2E8).
- Layered paper feel with subtle drop shadow under the card.
- Tactile paper texture and very soft film grain.
- Decorative travel passport stamps in muted ocean teal (#2F7F86), stamp coral (#C45A43), moss green (#556B3E), sunlit gold (#D8A84F) — placed at gentle angles, not too many, never covering the text.
- A few empty dashed circles waiting for future stamps.
- Tiny route lines and dotted travel paths winding across blank corners.
- A small star or compass mark as a quiet accent.
- A faux ticket-stub detail along one edge with perforated dots.
- Generous breathing room around the wordmark and the owner name.
- Color palette: warm off-white paper, deep ink (#1D1B16), ocean teal, stamp coral, sunlit gold, moss green — used sparingly.

Mood: elegant, sunlit, collected, personal, hand-assembled.

Strictly avoid: official passport seals, government emblems, national flags, country names, nationality, date of birth, passport numbers, MRZ machine-readable lines, legal fields, barcodes, QR codes, anything resembling a real identity document, generic wallet card styling, corporate SaaS visuals, neon, gradients, 3D rendering, photorealistic faces, photographs of people.

Composition: a single passport card centered in the frame, the card occupies about 85% of the canvas, square aspect.`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      },
    );

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("AI gateway error", aiResp.status, text);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Lovable workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await aiResp.json();
    const imageUrl: string | undefined =
      data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No image returned" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-passport error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
