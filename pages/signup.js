import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();
  const { gf } = router.query || {};
  const [form, setForm] = useState({ email: '', phone: '', instagram: '', ageConfirm: false, adultConsent: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.ageConfirm || !form.adultConsent) {
      alert('You must confirm age (18+) and consent to receive messages.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, girlfriend: gf || 'maya' })
    });
    if (res.ok) {
      router.push('/thank-you');
    } else {
      const txt = await res.text();
      alert('Signup failed: ' + txt);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Sign up for {gf || 'your girlfriend'}</h1>

        <label className="block mb-2">Email</label>
        <input type="email" required className="w-full border rounded p-2 mb-3" value={form.email} onChange={handleChange('email')} />

        <label className="block mb-2">Phone number (include country code)</label>
        <input type="tel" required className="w-full border rounded p-2 mb-3" value={form.phone} onChange={handleChange('phone')} />

        <label className="block mb-2">Instagram username (optional)</label>
        <input type="text" className="w-full border rounded p-2 mb-3" value={form.instagram} onChange={handleChange('instagram')} />

        <div className="mb-3">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={form.ageConfirm} onChange={handleChange('ageConfirm')} />
            <span>I confirm I am 18 years or older.</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={form.adultConsent} onChange={handleChange('adultConsent')} />
            <span>I consent to receive flirtatious/adult content messages from my selected AI girlfriend. (Can opt-out later.)</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-pink-500 text-white p-2 rounded">
          {loading ? 'Signing up...' : 'Create Account & Send Welcome'}
        </button>
      </form>
    </div>
  );
}
