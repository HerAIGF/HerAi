import { supabaseAdmin } from '../../lib/supabaseClient';
import Twilio from 'twilio';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const GIRLFRIEND_PRESETS = {
  maya: {
    name: 'Maya',
    // basic non-explicit default welcome. Replace later with LLM-generated text & moderation.
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

  // Basic server-side validation
  if (!email || !phone) return res.status(400).send('Missing email or phone');
  if (!ageConfirm || !adultConsent) return res.status(400).send('Age and consent required');

  const gfKey = girlfriend || 'maya';
  const gf = GIRLFRIEND_PRESETS[gfKey] || GIRLFRIEND_PRESETS.maya;

  try {
    // 1) Insert into Supabase table `users` (create table SQL below)
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
      // continue — we still try to send SMS, but surface the DB error
    }

    // 2) Send Twilio SMS (basic text)
    const smsBody = gf.welcome();

    // Twilio: send SMS
    await twilioClient.messages.create({
      from: FROM_NUMBER,
      to: phone,
      body: smsBody
    });

    // Optionally: store the message in a `messages` table
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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).send('Internal server error');
  }
}
