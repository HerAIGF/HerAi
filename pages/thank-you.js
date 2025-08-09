import Link from 'next/link';
export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white max-w-lg p-8 rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold mb-4">All set — check your phone!</h1>
        <p className="text-gray-700 mb-4">Your girlfriend has just been asked to text you. You should receive a message within a minute.</p>
        <Link href="/" legacyBehavior><a className="text-pink-600 underline">Back to home</a></Link>
      </div>
    </div>
  );
}
