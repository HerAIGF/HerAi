import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512",
      response_format: "url",
    });
    const imageUrl = response.data.data[0].url;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
