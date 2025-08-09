// pages/api/generate-image-openai.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1", // DALL·E 3 model
        prompt,
        size: "512x512",
        response_format: "b64_json" // base64 encoded image
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error("No image data returned from OpenAI API");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Image generation failed" });
  }
}
