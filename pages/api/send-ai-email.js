import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.0.0";

serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Generate AI welcome message
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Write a short, sweet, and flirty welcome email to a new user.",
        },
      ],
    });

    const aiMessage = completion.choices[0].message.content;

    // Send email via Supabase email API (SMTP must be configured in your Supabase project)
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/send_email`,
      {
        method: "POST",
        headers: {
          apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "💌 Your AI Girlfriend Says Hi",
          html: `<p>${aiMessage}</p>`,
          text: aiMessage,
          from: Deno.env.get("FROM_EMAIL") || "", // your verified sender email
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent!" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
