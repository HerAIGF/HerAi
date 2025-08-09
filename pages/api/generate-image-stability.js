// pages/api/generate-image-stability.js

export default async function handler(req, res) {
  console.log("Using Stability API key:", !!process.env.STABILITY_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

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
          output_format: "png",
          aspect_ratio: "1:1",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Stability AI response:", data);

    const imageBase64 = data.artifacts && data.artifacts[0] && data.artifacts[0].base64;

    if (!imageBase64) {
      throw new Error("No image data found in Stability API response");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
}
