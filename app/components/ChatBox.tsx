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
  onClose?: () => void;
  isEmbedded?: boolean;
};

// Project links for portfolio navigation
const projectLinks = [
  {
    keywords: ['product', 'strategy', 'roadmap', 'consulting'],
    name: 'Product Strategy',
    href: '#product-strategy',
  },
  {
    keywords: ['development', 'code', 'tech', 'software', 'fullstack'],
    name: 'Development',
    href: '#development',
  },
  {
    keywords: ['design', 'ux', 'ui', 'interface'],
    name: 'UX/UI Design',
    href: '#design',
  },
  {
    keywords: ['management', 'agile', 'project', 'leadership'],
    name: 'Project Management',
    href: '#management',
  },
  {
    keywords: ['startup', 'launch', 'product', 'venture'],
    name: 'Startup & Launch',
    href: '#startup',
  },
  {
    keywords: ['contact', 'hire', 'collaborate', 'freelance', 'consult'],
    name: 'Work Together',
    href: '#contact',
  }
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

export default function ChatBox({ onClose, isEmbedded = false }: ChatBoxProps) {
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

    // Always send a valid mode
    const validMode = mode === 'guide' || mode === 'assistant' ? mode : 'guide';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode: validMode }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❗API Error:', res.status, data.error);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `⚠️ ${data.error || `Something went wrong (Error ${res.status})`}. Please try again shortly.`,
          },
        ]);
        return;
      }

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
    <div 
      className={`w-full h-full max-w-full font-mono text-sm tracking-tight ${isEmbedded ? '' : 'border border-black'} p-0 flex flex-col`} 
      style={{ 
        borderRadius: 0,
        backgroundColor: '#fff',
        color: '#000',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* Header with mascot and close button */}
      {!isEmbedded && (
        <div className="flex items-center justify-between border-b border-black p-3">
          <div className="flex items-center gap-2">
            <img src="/winston-mascot.svg" alt="Winston mascot" className="w-6 h-6 mr-2" onError={e => { e.currentTarget.style.display = 'none'; }} />
            <span className="font-bold text-black text-base">Hi, I'm Winston</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-black text-lg font-bold px-3 py-1 hover:bg-black hover:text-white transition border border-black"
              aria-label="Close chat"
              style={{ borderRadius: 0 }}
            >
              ×
            </button>
          )}
        </div>
      )}
      {/* Mode Toggle with tooltips */}
      <div className="flex gap-2 p-3 border-b border-black">
        <div className="group relative">
          <button
            title="Explore the portfolio with Winston as your guide."
            aria-label="Guide mode"
            className={`px-4 py-2 border border-black text-sm font-medium transition ${mode === 'guide' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
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
            className={`px-4 py-2 border border-black text-sm font-medium transition ${mode === 'assistant' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
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
      <div 
        className="flex-1 overflow-y-auto p-3" 
        style={{ 
          borderRadius: 0,
          backgroundColor: '#fff',
          minHeight: '200px'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <p className="text-sm">Start a conversation with Winston!</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`my-2 text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}
              style={{
                color: '#000',
                backgroundColor: '#fff'
              }}
            >
              <div className={`inline-block max-w-[80%] p-2 border border-black ${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Clear History Button */}
      <div className="flex justify-end px-3 py-2 border-t border-black">
        <button
          onClick={() => setMessages([])}
          className="text-xs text-black hover:text-red-600 transition"
          style={{
            backgroundColor: '#fff'
          }}
        >
          Clear History
        </button>
      </div>
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center px-3 py-3 gap-2 border-t border-black"
        style={{
          backgroundColor: '#fff'
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border-none p-2 text-sm outline-none font-mono bg-white text-black placeholder-gray-500 min-w-0"
          style={{
            borderRadius: 0,
            maxWidth: '100%',
            width: '100%'
          }}
          disabled={loading}
        />
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`p-2 border border-black transition flex-shrink-0 ${listening ? 'bg-black text-white animate-pulse' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          title={listening ? 'Stop voice input' : 'Start voice input'}
          disabled={loading}
          style={{ 
            borderRadius: 0
          }}
        >
          🎤
        </button>
        <button
          type="submit"
          className="p-2 border border-black bg-white text-black hover:bg-black hover:text-white transition font-medium flex-shrink-0"
          disabled={loading}
          aria-label="Send message"
          style={{ 
            borderRadius: 0
          }}
        >
          🖊
        </button>
      </form>
      {/* Project suggestion follow-up */}
      {projectSuggestion && (
        <div 
          className="p-3 border-t border-black bg-gray-50" 
          style={{ 
            borderRadius: 0,
            backgroundColor: '#f9f9f9',
            color: '#000'
          }}
        >
          <span className="text-sm">Want to see how I tackled this in <a href={projectSuggestion.href} className="underline font-semibold" style={{ color: '#000' }}>{projectSuggestion.name}</a>?</span>
        </div>
      )}
    </div>
  );
} 