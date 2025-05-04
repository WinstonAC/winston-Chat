'use client';
import dynamic from 'next/dynamic';

const WinstonChat = dynamic(() => import('@/components/WinstonChat'), { ssr: false, loading: () => <div className="text-gray-400">Loading chat...</div>, });

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Winston Chat</h1>
      <p className="text-gray-500 mb-6">If you're seeing this, rendering works!</p>
      <WinstonChat />
    </main>
  );
}
