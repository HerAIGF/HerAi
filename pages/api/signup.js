import { supabaseAdmin } from '../../lib/supabaseClient';
import Twilio from 'twilio';

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const GIRLFRIEND_PRESETS = {
  maya: {
    name: 'Maya',
    welcome: (firstName = '') =>
      `Hey — it’s Maya 😘. So happy you chose me. Text me anytime — I’m here.`,
  },
  luna: {
    name: 'Luna',
    welcome: () =>
      `Hey, Luna here 🌙. Can’t wait to get to know you.`,
  },
  aria: {
    name: 'Aria',
    welcome: () =>
      `Hi — it's Aria 💕. I hope your day was lovely. Talk soon?`,
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const {
    email,
    phone,
    instagram,
    girlfriend,
    ageConfirm,
    adultConsent,
    prompt // may be missing
  } = req.body || {};

  // Basic validation
  if (!email || !phone) {
    return res.status(400).send('Missing email or phone');
  }
  if (!ageConfirm || !adultConsent) {
    return res.status(400).send('Age and consent required');
  }

  const gfKey = girlfriend || 'maya';
  const gf = GIRLFRIEND_PRESETS[gfKey] || GIRLFRIEND_PRESETS.maya;

  // If prompt missing, use default welcome
  const finalPrompt =
    prompt && prompt.trim().length > 0
      ? prompt
      : gf.welcome();

  try {
    // 1) Insert user data into Supabase
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          phone,
          instagram: instagram || null,
          girlfriend: gfKey,
          adult_consent: adultConsent,
          created_at: new Date(),
          prompt: finalPrompt // store the actual message sent
        }
      ]);

    if (insertError) {
      console.error('Supabase insert error', insertError);
      // continue anyway
    }

    // 2) Send Twilio SMS welcome message
    try {
      await twilioClient.messages.create({
        from: FROM_NUMBER,
        to: phone,
        body: finalPrompt
      });
    } catch (smsErr) {
      console.error('Twilio send error:', smsErr);
    }

    // 3) Store SMS message record
    const { error: msgInsertError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          user_phone: phone,
          girlfriend: gfKey,
          direction: 'outbound',
          channel: 'sms',
          content: finalPrompt,
          created_at: new Date()
        }
      ]);

    if (msgInsertError) {
      console.error('Supabase message insert error', msgInsertError);
    }

    // 4) Call AI email sender API to send welcome email
    try {
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-ai-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: gf.name })
        }
      );

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error('AI email send failed:', errText);
      }
    } catch (emailErr) {
      console.error('Error calling AI email sender:', emailErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).send('Internal server error');
  }
}
