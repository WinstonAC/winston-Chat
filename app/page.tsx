'use client';

import WinstonChat from './components/WinstonChat';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-2">Welcome to Winston Chat</h1>
      <p className="mb-8">If you're seeing this, rendering works!</p>
      <WinstonChat />
    </main>
  );
}
