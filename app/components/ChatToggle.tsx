"use client";
import { useState, useRef, useEffect } from "react";
import ChatBox from "./ChatBox";
import Image from "next/image";

export default function WinstonChat() {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Close on click outside or ESC
  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent | KeyboardEvent) {
      if (
        e instanceof KeyboardEvent && e.key === "Escape"
      ) {
        setIsOpen(false);
      } else if (
        e instanceof MouseEvent &&
        chatRef.current &&
        !chatRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [isOpen]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 p-2 z-50 rounded-full border border-black bg-white shadow-md flex items-center justify-center transition-all"
        aria-label={isOpen ? "Close Chat" : "Toggle Chat"}
      >
        <Image
          src="/winston.svg"
          alt="Chat with Winston"
          width={32}
          height={32}
          className="w-8 h-8"
          draggable={false}
        />
      </button>
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-16 right-4 left-4 w-auto max-w-sm max-h-[75vh] overflow-y-auto z-50 bg-white border border-black font-serif p-4 shadow-xl animate-slide-in flex flex-col"
          style={{ borderRadius: 0 }}
        >
          <ChatBox onClose={() => setIsOpen(false)} />
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
} 