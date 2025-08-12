"use client";
import { useEffect, useRef, useState } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { getTooltip } from '../lib/tooltips';
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
    <line x1="2" y1="15" x2="4" y2="15" />
    <line x1="2" y1="9" x2="4" y2="9" />
  </svg>
);

type Mode = 'guide' | 'assistant';
type Message = { role: 'user' | 'assistant'; content: string };

type ChatBoxProps = {
  onClose?: () => void;
  isEmbedded?: boolean;
  kb?: string;
  title?: string;
  isStandalone?: boolean;
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

export default function ChatBox({ onClose, isEmbedded = false, kb = 'default', title = 'Winston', isStandalone = false }: ChatBoxProps) {
  // Auto-detect if we're in standalone mode (not embedded)
  const isStandaloneMode = isStandalone || !isEmbedded;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('guide');
  const [showInfo, setShowInfo] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { startListening, stopListening, listening } = useSpeechToText();

  // Text-to-speech function
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to use a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  // Update isListening when the hook changes
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        body: JSON.stringify({ messages: newMessages, mode: validMode, kb }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❗API Error:', res.status, data.error);
        const errorMessage = `⚠️ ${data.error || `Something went wrong (Error ${res.status})`}. Please try again shortly.`;
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: errorMessage,
          },
        ]);
        return;
      }

      const aiResponse = data.reply;
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: aiResponse },
      ]);

      // Speak the AI response if user was using voice input
      if (isListening || transcript) {
        speak(aiResponse);
      }
    } catch (err) {
      console.error('❌ Unhandled fetch error:', err);
      const errorMessage = `❌ Couldn't connect to Winston. Check your connection and try again.`;
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: errorMessage,
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
      className={`w-full h-full max-w-full font-mono text-sm tracking-tight flex flex-col ${isEmbedded ? '' : 'border border-black'}`}
      style={{ 
        borderRadius: 0,
        backgroundColor: '#fff',
        color: '#000',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Header with mascot and close button */}
      {isStandaloneMode && (
        <div className="flex items-center justify-between border-b border-black p-3 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/winston-mascot.svg" alt="Winston mascot" className="w-6 h-6 mr-2" onError={e => { e.currentTarget.style.display = 'none'; }} />
            {/* kb-title */}
            <span className="font-bold text-black text-base">Hi, I'm {title}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-black text-lg font-bold px-3 py-1 hover:bg-black hover:text-white transition border border-black"
              aria-label={getTooltip('close')}
              title={getTooltip('close')}
              style={{ borderRadius: 0 }}
            >
              ×
            </button>
          )}
        </div>
      )}
      {/* Mode Toggle - no tooltips */}
      <div className="flex gap-2 p-3 border-b border-black flex-shrink-0 bg-white">
        <button
          aria-label={getTooltip('guide')}
          title={getTooltip('guide')}
          className={`px-4 py-2 border border-black text-sm font-medium transition ${mode === 'guide' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          onClick={() => setMode('guide')}
          style={{ borderRadius: 0 }}
        >
          Guide
        </button>
        <button
          aria-label={getTooltip('assistant')}
          title={getTooltip('assistant')}
          className={`px-4 py-2 border border-black text-sm font-medium transition ${mode === 'assistant' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          onClick={() => setMode('assistant')}
          style={{ borderRadius: 0 }}
        >
          Assistant
        </button>
      </div>
      {/* Messages Area - flex-1 to fill available space */}
      <div 
        className="flex-1 overflow-y-auto p-3 bg-white" 
        style={{ 
          borderRadius: 0
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
              className={`my-3 text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}
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
      <div className="flex justify-end px-3 py-2 border-t border-black flex-shrink-0 bg-white">
        <button
          onClick={() => setMessages([])}
          className="text-xs text-black hover:text-red-600 transition"
          title={getTooltip('clearHistory')}
          aria-label={getTooltip('clearHistory')}
        >
          Clear History
        </button>
      </div>
      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 border-t border-black flex-shrink-0 bg-white"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderRadius: 0 }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          style={{ borderRadius: 0 }}
          title={getTooltip('send')}
          aria-label={getTooltip('send')}
        >
          Send
        </button>
      </form>
      {/* Control Buttons - flex-shrink-0 to prevent shrinking */}
      <div className="flex gap-2 p-3 border-t border-black flex-shrink-0 bg-white">
        <button
          onClick={toggleListening}
          className={`p-2 border border-black transition ${isListening ? 'bg-red-600 text-white' : 'hover:bg-black hover:text-white'}`}
          title={isListening ? getTooltip('mic', 'stop') : getTooltip('mic', 'start')}
          aria-label={isListening ? getTooltip('mic', 'stop') : getTooltip('mic', 'start')}
          style={{ borderRadius: 0 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => setInput('')}
          className="p-2 border border-black hover:bg-black hover:text-white transition"
          title={getTooltip('clear')}
          aria-label={getTooltip('clear')}
          style={{ borderRadius: 0 }}
        >
          🖊
        </button>
      </div>
      {/* Project suggestion follow-up */}
      {projectSuggestion && (
        <div 
          className="p-3 border-t border-black bg-gray-50 flex-shrink-0" 
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