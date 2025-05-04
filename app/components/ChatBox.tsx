'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import Image from 'next/image';

// Inline SVG icons for Info and Brain/Cpu (Lucide style)
const InfoIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className + " w-5 h-5"}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const CpuIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className + " w-5 h-5"}
    aria-hidden="true"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="15" y1="2" x2="15" y2="4" />
    <line x1="9" y1="2" x2="9" y2="4" />
    <line x1="15" y1="20" x2="15" y2="22" />
    <line x1="9" y1="20" x2="9" y2="22" />
    <line x1="20" y1="15" x2="22" y2="15" />
    <line x1="20" y1="9" x2="22" y2="9" />
    <line x1="2" y1="15" x2="4" y2="15" />
    <line x1="2" y1="9" x2="4" y2="9" />
  </svg>
);

type Mode = 'guide' | 'assistant';
type Message = { role: 'user' | 'assistant'; content: string };

type ChatBoxProps = {
  onClose: () => void;
};

// Simple rule-based portfolio matcher for demo
const projectLinks = [
  {
    keywords: ['saas', 'startup', 'product', 'launch'],
    name: 'Acme SaaS Platform',
    href: '#acme-saas',
  },
  {
    keywords: ['podcast', 'audio', 'media'],
    name: 'Podcast Builder',
    href: '#podcast-builder',
  },
  {
    keywords: ['ai', 'gpt', 'openai', 'chatbot'],
    name: 'AI Chatbot',
    href: '#ai-chatbot',
  },
];

function getProjectSuggestion(text: string) {
  for (const project of projectLinks) {
    for (const keyword of project.keywords) {
      if (text.toLowerCase().includes(keyword)) {
        return project;
      }
    }
  }
  return null;
}

export default function ChatBox({ onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('winston_chat_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('guide');
  const [loading, setLoading] = useState(false);
  const { transcript, listening, startListening, stopListening } = useSpeechToText();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('winston_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❗API Error:', res.status, errorText);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `⚠️ Something went wrong (Error ${res.status}). Please try again shortly.`,
          },
        ]);
        return;
      }

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: data.reply },
      ]);
    } catch (err) {
      console.error('❌ Unhandled fetch error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `❌ Couldn't connect to Winston. Check your connection and try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Find the last assistant message and see if it matches a project
  const lastAssistantMsg = messages.length > 0 && messages[messages.length - 1].role === 'assistant'
    ? messages[messages.length - 1].content
    : null;
  const projectSuggestion =
    mode === 'assistant' && lastAssistantMsg ? getProjectSuggestion(lastAssistantMsg) : null;

  return (
    <div className="w-full max-w-full font-mono text-sm tracking-tight border border-black p-0 bg-white" style={{ borderRadius: 0 }}>
      {/* Header with mascot and close button */}
      <div className="flex items-center justify-between border-b border-black p-0 mb-2">
        <div className="flex items-center gap-2 p-2">
          <img src="/winston-mascot.svg" alt="Winston mascot" className="w-6 h-6 mr-2" onError={e => { e.currentTarget.style.display = 'none'; }} />
          <span className="font-bold">Hi, I'm Winston</span>
        </div>
        <button
          onClick={onClose}
          className="text-black text-lg font-bold px-4 py-2 hover:bg-black hover:text-white transition border-l border-black h-full"
          aria-label="Close chat"
          style={{ borderRadius: 0 }}
        >
          ×
        </button>
      </div>
      {/* Mode Toggle with tooltips */}
      <div className="flex gap-2 mb-4 px-2">
        <div className="group relative">
          <button
            title="Explore the portfolio with Winston as your guide."
            aria-label="Guide mode"
            className={`px-3 py-1 border border-black ${mode === 'guide' ? 'bg-black text-white' : 'bg-white text-black'} hover:bg-black hover:text-white transition`}
            onClick={() => setMode('guide')}
            style={{ borderRadius: 0 }}
          >
            Guide
          </button>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-black whitespace-nowrap">
            Explore the portfolio with Winston as your guide.
          </span>
        </div>
        <div className="group relative">
          <button
            title="Ask product and dev questions."
            aria-label="Assistant mode"
            className={`px-3 py-1 border border-black ${mode === 'assistant' ? 'bg-black text-white' : 'bg-white text-black'} hover:bg-black hover:text-white transition`}
            onClick={() => setMode('assistant')}
            style={{ borderRadius: 0 }}
          >
            Assistant
          </button>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-2 py-1 bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-black whitespace-nowrap">
            Ask product and dev questions.
          </span>
        </div>
      </div>
      <div className="h-[220px] overflow-y-auto border-t border-b border-black py-2 px-2 mb-2" style={{ borderRadius: 0 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-1 text-sm ${m.role === 'user' ? 'text-right font-semibold' : 'text-left'}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Clear History Button */}
      <div className="flex justify-end px-2">
        <button
          onClick={() => setMessages([])}
          className="text-xs text-gray-400 hover:text-red-500 mt-2"
        >
          Clear History
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-black px-2 py-2 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full border-none p-1 text-sm outline-none font-mono bg-white"
          disabled={loading}
          style={{ borderRadius: 0 }}
        />
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`rounded-full p-2 border border-black ml-2 ${listening ? 'bg-black text-white animate-pulse' : 'bg-white text-black'} transition`}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          title={listening ? 'Stop voice input' : 'Start voice input'}
          disabled={loading}
          style={{ borderRadius: '9999px' }}
        >
          🎤
        </button>
        <button
          type="submit"
          className="ml-2 text-sm font-bold p-2 border border-black hover:bg-black hover:text-white transition"
          disabled={loading}
          aria-label="Send message"
          style={{ borderRadius: 0 }}
        >
          🖊
        </button>
      </form>
      {/* Project suggestion follow-up */}
      {projectSuggestion && (
        <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 border border-black" style={{ borderRadius: 0 }}>
          Want to see how I tackled this in <a href={projectSuggestion.href} className="underline font-semibold">{projectSuggestion.name}</a>?
        </div>
      )}
    </div>
  );
} 