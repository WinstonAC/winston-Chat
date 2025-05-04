'use client';

import WinstonChat from './components/WinstonChat';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-2">Welcome to Winston Chat</h1>
      <p className="mb-8 text-sm text-gray-600">Your portfolio guide and product assistant, powered by Winston.</p>
      <WinstonChat />
    </div>
  );
}
