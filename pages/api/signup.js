import { supabaseAdmin } from '../../lib/supabaseClient';
import Twilio from 'twilio';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const GIRLFRIEND_PRESETS = {
  maya: {
    name: 'Maya',
    welcome: (firstName = '') => `Hey — it’s Maya 😘. So happy you chose me. Text me anytime — I’m here.`,
  },
  luna: {
    name: 'Luna',
    welcome: () => `Hey, Luna here 🌙. Can’t wait to get to know you.`,
  },
  aria: {
    name: 'Aria',
    welcome: () => `Hi — it's Aria 💕. I hope your day was lovely. Talk soon?`,
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email, phone, instagram, girlfriend, ageConfirm, adultConsent } = req.body || {};

  if (!email || !phone) return res.status(400).send('Missing email or phone');
  if (!ageConfirm || !adultConsent) return res.status(400).send('Age and consent required');

  const gfKey = girlfriend || 'maya';
  const gf = GIRLFRIEND_PRESETS[gfKey] || GIRLFRIEND_PRESETS.maya;

  try {
    // 1) Insert user data into Supabase
    const insert = await supabaseAdmin.from('users').insert([
      {
        email,
        phone,
        instagram,
        girlfriend: gfKey,
        adult_consent: adultConsent,
        created_at: new Date()
      }
    ]);

    if (insert.error) {
      console.error('Supabase insert error', insert.error);
      // we continue despite DB error to still send SMS and email
    }

    // 2) Send Twilio SMS welcome message
    const smsBody = gf.welcome();

    await twilioClient.messages.create({
      from: FROM_NUMBER,
      to: phone,
      body: smsBody
    });

    // 3) Store SMS message record
    await supabaseAdmin.from('messages').insert([
      {
        user_phone: phone,
        girlfriend: gfKey,
        direction: 'outbound',
        channel: 'sms',
        content: smsBody,
        created_at: new Date()
      }
    ]);

    // 4) Call AI email sender API to send welcome email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-ai-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: gf.name }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error('AI email send failed:', errText);
        // Do not fail whole request due to email error
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
