"use client";
import { useState } from 'react';
import ChatWidget from "./ChatWidget";

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-black font-mono border border-black px-2 py-1 hover:bg-gray-100"
      >
        {isOpen ? 'Close ✖' : '💬 Winston'}
      </button>
      {isOpen && <ChatWidget onClose={() => setIsOpen(false)} />}
    </div>
  );
} 