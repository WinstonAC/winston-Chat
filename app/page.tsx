'use client';
import dynamic from 'next/dynamic';
import ChatLauncher from './components/ChatLauncher';

const WinstonChat = dynamic(() => import('@/components/WinstonChat'), { ssr: false, loading: () => <div className="text-gray-400">Loading chat...</div>, });

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Winston Chat</h1>
        <p className="text-lg mb-8">
          Click the chat button in the bottom right to start a conversation with Winston.
        </p>
      </div>
      <ChatLauncher />
    </main>
  );
}
