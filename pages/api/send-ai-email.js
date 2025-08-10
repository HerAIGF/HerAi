import nodemailer from 'nodemailer';

async function generateEmailContent(name) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a warm AI girlfriend named Luna.',
        },
        {
          role: 'user',
          content: `Write a welcome email to a new user named ${name}, making it friendly and personal.`,
        },
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No content generated from OpenAI');
  }
  return data.choices[0].message.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing email or name' });
  }

  try {
    const emailContent = await generateEmailContent(name);

    // Create transporter with Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465
      auth: {
        user: process.env.SMTP_USER, // your Gmail email
        pass: process.env.SMTP_PASS, // your Gmail app password
      },
    });

    await transporter.sendMail({
      from: `"Luna - Your AI Girlfriend" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to your AI Girlfriend experience!',
      html: `<p>${emailContent}</p>`,
      text: emailContent,
    });

    res.status(200).json({ message: 'AI welcome email sent via Gmail SMTP!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: error.message });
  }
}
