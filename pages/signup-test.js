import { useState } from 'react';

const GIRLFRIEND_OPTIONS = [
  { key: 'maya', label: 'Maya' },
  { key: 'luna', label: 'Luna' },
  { key: 'aria', label: 'Aria' },
];

export default function SignupTest() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    instagram: '',
    girlfriend: 'maya',
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

  async function handleSub
