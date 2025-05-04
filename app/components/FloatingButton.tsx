'use client';

import { useState, useEffect } from 'react';
import ChatBox from './ChatBox';

export default function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center group"
        aria-label="Chat with Winston"
      >
        <img src="/winston-mascot.svg" alt="Winston" className="w-10 h-10 rounded-full" />
        <span className="sr-only">Chat with Winston</span>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Chat with Winston
        </div>
      </button>
      {isOpen && <ChatBox onClose={() => setIsOpen(false)} />}
    </>
  );
} 