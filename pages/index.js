import { useEffect, useState } from 'react';
import Link from 'next/link';

const GIRLFRIENDS_STATIC = [
  { id: 'maya', name: 'Maya', bio: 'Warm, witty, loves sci-fi.', prompt: 'Portrait of a warm, witty young woman in sci-fi style' },
  { id: 'luna', name: 'Luna', bio: 'Playful, adventurous, beach lover.', prompt: 'Portrait of a playful, adventurous young woman on the beach' },
  { id: 'aria', name: 'Aria', bio: 'Sweet, caring, great listener.', prompt: 'Portrait of a sweet, caring young woman, soft lighting' }
];

export default function Home() {
  const [girlfriends, setGirlfriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const updated = await Promise.all(
          GIRLFRIENDS_STATIC.map(async (gf) => {
            try {
              const res = await fetch('/api/generate-image-stability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: gf.prompt }),
              });
              const data = await res.json();
              return {
                ...gf,
                avatar: data.imageUrl || '/avatars/default.jpg',
              };
            } catch {
              return {
                ...gf,
                avatar: '/avatars/default.jpg',
              };
            }
          })
        );
        setGirlfriends(updated);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Generating your AI girlfriends...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold">Choose your AI Girlfriend</h1>
        <p className="text-gray-600 mt-2">Tap a profile then sign up — she’ll text you a welcome message.</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {girlfriends.map(g => (
          <Link key={g.id} href={`/signup?gf=${g.id}`} legacyBehavior>
            <a className="block bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
              <div className="h-48 bg-pink-50 rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src={g.avatar}
                  alt={g.name}
                  className="object-cover h-full w-full"
                  onError={(e) => (e.target.src = '/avatars/default.jpg')}
                />
              </div>
              <h2 className="text-2xl font-semibold mt-4">{g.name}</h2>
              <p className="text-gray-600 mt-2">{g.bio}</p>
              <div className="mt-4 inline-block bg-pink-500 text-white px-4 py-2 rounded">
                Select {g.name}
              </div>
            </a>
          </Link>
        ))}
      </main>
    </div>
  );
}
