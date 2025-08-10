import { useState } from 'react';

const GIRLFRIEND_OPTIONS = [
  { key: 'maya', label: 'Maya', prompt: 'You are Maya, a flirty, playful AI girlfriend.' },
  { key: 'luna', label: 'Luna', prompt: 'You are Luna, a romantic, dreamy AI girlfriend.' },
  { key: 'aria', label: 'Aria', prompt: 'You are Aria, a confident, adventurous AI girlfriend.' },
];

export default function SignupTest() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    instagram: '',
    girlfriend: GIRLFRIEND_OPTIONS[0].key,
    ageConfirm: false,
    adultConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!formData.email || !formData.phone) {
      setError('Email and phone are required.');
      return;
    }
    if (!formData.ageConfirm || !formData.adultConsent) {
      setError('You must confirm your age and consent.');
      return;
    }

    // Get prompt for selected girlfriend
    const girlfriendObj = GIRLFRIEND_OPTIONS.find(g => g.key === formData.girlfriend);
    const prompt = girlfriendObj ? girlfriendObj.prompt : '';

    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prompt, // ✅ Send the required prompt
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Signup failed');
      }

      setMessage('Signup successful! You should receive an SMS and a welcome email soon.');
      setFormData({
        email: '',
        phone: '',
        instagram: '',
        girlfriend: GIRLFRIEND_OPTIONS[0].key,
        ageConfirm: false,
        adultConsent: false,
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Signup Test</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email*:<br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
        </label>

        <label>
          Phone*:<br />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+1234567890"
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
        </label>

        <label>
          Instagram (optional):<br />
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="Your Instagram handle"
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
        </label>

        <label>
          Choose your AI Girlfriend*:<br />
          <select
            name="girlfriend"
            value={formData.girlfriend}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          >
            {GIRLFRIEND_OPTIONS.map(gf => (
              <option key={gf.key} value={gf.key}>{gf.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <input
            type="checkbox"
            name="ageConfirm"
            checked={formData.ageConfirm}
            onChange={handleChange}
            required
          /> I confirm I am 18 or older
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <input
            type="checkbox"
            name="adultConsent"
            checked={formData.adultConsent}
            onChange={handleChange}
            required
          /> I consent to receive messages as described
        </label>

        <button type="submit" disabled={loading} style={{ padding: '10px 16px', fontSize: 16 }}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      {message && <p style={{ color: 'green', marginTop: 16 }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
    </div>
  );
}
