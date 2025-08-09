import Link from 'next/link';

const GIRLFRIENDS = [
  { id: 'maya', name: 'Maya', bio: 'Warm, witty, loves sci-fi.', avatar: '/avatars/maya.jpg' },
  { id: 'luna', name: 'Luna', bio: 'Playful, adventurous, beach lover.', avatar: '/avatars/luna.jpg' },
  { id: 'aria', name: 'Aria', bio: 'Sweet, caring, great listener.', avatar: '/avatars/aria.jpg' }
];

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold">Choose your AI Girlfriend</h1>
        <p className="text-gray-600 mt-2">Tap a profile then sign up — she’ll text you a welcome message.</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {GIRLFRIENDS.map(g => (
          <Link key={g.id} href={`/signup?gf=${g.id}`} legacyBehavior>
            <a className="block bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
              <div className="h-48 bg-pink-50 rounded-md flex items-center justify-center overflow-hidden">
                {/* Replace with Image component & real avatars later */}
                <img src={g.avatar} alt={g.name} className="object-cover h-full w-full" />
              </div>
              <h2 className="text-2xl font-semibold mt-4">{g.name}</h2>
              <p className="text-gray-600 mt-2">{g.bio}</p>
              <div className="mt-4 inline-block bg-pink-500 text-white px-4 py-2 rounded">Select {g.name}</div>
            </a>
          </Link>
        ))}
      </main>
    </div>
  );
}
