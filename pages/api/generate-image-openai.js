export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          output_format: "url",
          aspect_ratio: "1:1",
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Stability API error:", errText);
      return res.status(500).json({ error: "Image generation failed" });
    }

    const data = await response.json();
    const imageUrl = data?.image ?? null;

    if (!imageUrl) {
      return res.status(500).json({ error: "No image returned" });
    }

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}

