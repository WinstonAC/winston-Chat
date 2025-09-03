"use client";
import { useEffect, useRef, useState } from 'react';
import { stripCitations } from '../lib/sanitize';
import { useSTT } from '../hooks/useSTT';
import { useTTS } from '../hooks/useTTS';
import { getTooltip } from '../lib/tooltips';
import { TOUR_STEPS, TOUR_INTRO, getConnectedLine, TourStepId } from '../lib/tour';
import { isHelpIntent } from '../lib/intents';
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

const MicIcon = ({ className = "" }) => (
  <svg
    className={className + " w-4 h-4"}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
  </svg>
);

// Chips component for interactive tour
function Chips({ options, onPick }: { options: string[]; onPick: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map(o => (
        <button 
          key={o} 
          onClick={() => onPick(o)} 
          className="text-xs px-2 py-1 border border-black rounded-full text-black hover:bg-black hover:text-white transition"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

type Mode = 'guide' | 'assistant';
type Message = { role: 'user' | 'assistant'; content: string; showChips?: boolean; chips?: string[]; };

type ChatWidgetProps = {
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

export default function ChatWidget({ onClose, isEmbedded = false, kb = 'default', title = 'Winston', isStandalone = false }: ChatWidgetProps) {
  // Auto-detect if we're in standalone mode (not embedded)
  const isStandaloneMode = isStandalone || !isEmbedded;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('guide');
  const [showInfo, setShowInfo] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening } = useSTT();
  const { isSpeaking, speak, stop: stopSpeaking } = useTTS();

  // Check for speech recognition support
  const hasSpeechRecognition = typeof window !== 'undefined' && 
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Iframe resize functionality - only for embedded mode
  useEffect(() => {
    if (!isEmbedded || typeof window === 'undefined') return;

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    if (!isInIframe) return;

    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeout: NodeJS.Timeout | null = null;

    const sendHeightToParent = (height: number) => {
      try {
        window.parent.postMessage({
          type: 'winston-chat-resize',
          height: height,
          source: 'winston-chat-widget'
        }, '*');
      } catch (error) {
        console.warn('Failed to send height to parent:', error);
      }
    };

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Debounce resize events
      resizeTimeout = setTimeout(() => {
        const entry = entries[0];
        if (entry && chatContainerRef.current) {
          const height = entry.contentRect.height;
          sendHeightToParent(height);
        }
      }, 100);
    };

    // Initialize ResizeObserver
    if (chatContainerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(chatContainerRef.current);
    }

    // Send initial height
    if (chatContainerRef.current) {
      const initialHeight = chatContainerRef.current.offsetHeight;
      sendHeightToParent(initialHeight);
    }

    // Cleanup
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [isEmbedded, messages, input]);



  const toggleListening = () => {
    if (!hasSpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening();
      setVoiceError(null);
    } else {
      try {
        startListening();
        setVoiceError(null);
      } catch (error) {
        setVoiceError('Failed to start voice recognition');
      }
    }
  };



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

    const userInput = input.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Check for help intent and show tour intro
    if (isHelpIntent(userInput)) {
      const tourIntroMessage = {
        role: 'assistant' as const,
        content: `${TOUR_INTRO}\n\n${getConnectedLine(kb)}`,
        showChips: true,
        chips: ['Start tour', 'Skip', 'Guide', 'Assistant']
      };
      setMessages([...newMessages, tourIntroMessage]);
      setLoading(false);
      return;
    }

    // Always send a valid mode
    const validMode = mode === 'guide' || mode === 'assistant' ? mode : 'guide';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'dev-key-123' // TODO: Replace with secure API key management in production
        },
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Tour handlers
  const handleChipClick = (chip: string) => {
    if (chip === 'Start tour') {
      setTourActive(true);
      setTourIndex(0);
      const step = TOUR_STEPS[0];
      const stepMessage = {
        role: 'assistant' as const,
        content: `${step.title}\n\n${step.body}`,
        showChips: true,
        chips: step.ctas || []
      };
      setMessages(prev => [...prev, stepMessage]);
    } else if (chip === 'Skip') {
      setTourActive(false);
      setTourIndex(0);
    } else if (chip === 'Guide') {
      setMode('guide');
    } else if (chip === 'Assistant') {
      setMode('assistant');
    } else if (chip === 'Next') {
      const nextIndex = tourIndex + 1;
      if (nextIndex < TOUR_STEPS.length) {
        setTourIndex(nextIndex);
        const step = TOUR_STEPS[nextIndex];
        const stepMessage = {
          role: 'assistant' as const,
          content: `${step.title}\n\n${step.body}`,
          showChips: true,
          chips: step.ctas || []
        };
        setMessages(prev => [...prev, stepMessage]);
      }
    } else if (chip === 'Back') {
      const prevIndex = tourIndex - 1;
      if (prevIndex >= 0) {
        setTourIndex(prevIndex);
        const step = TOUR_STEPS[prevIndex];
        const stepMessage = {
          role: 'assistant' as const,
          content: `${step.title}\n\n${step.body}`,
          showChips: true,
          chips: step.ctas || []
        };
        setMessages(prev => [...prev, stepMessage]);
      }
    } else if (chip === 'Try mic') {
      toggleListening();
    } else if (chip === 'Play last reply') {
      const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
      if (lastAssistantMessage) {
        if (isSpeaking) {
          stopSpeaking();
        } else {
          speak(lastAssistantMessage.content);
        }
      }
    } else if (chip === 'Done') {
      setTourActive(false);
      setTourIndex(0);
    } else if (chip === 'Ask something') {
      setTourActive(false);
      setTourIndex(0);
      const inputElement = document.querySelector('input[name="prompt"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    } else if (chip === 'Restart tour') {
      setTourIndex(0);
      const step = TOUR_STEPS[0];
      const stepMessage = {
        role: 'assistant' as const,
        content: `${step.title}\n\n${step.body}`,
        showChips: true,
        chips: step.ctas || []
      };
      setMessages(prev => [...prev, stepMessage]);
    }
  };

  return (
    <div 
      ref={chatContainerRef}
      className={`w-full h-auto min-h-[300px] font-mono text-sm tracking-tight flex flex-col ${isEmbedded ? '' : 'border border-black'} sm:text-base`}
      style={{ scrollbarGutter: 'stable both-edges' }}
      data-component="ChatWidget"
    >
      {/* Header with mascot and close button */}
      {isStandaloneMode && (
        <div className="flex items-center justify-between border-b border-black p-3 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/winston-mascot.svg" alt="Winston mascot" className="w-6 h-6 mr-2" onError={e => { e.currentTarget.style.display = 'none'; }} />
            {/* kb-title */}
            <span className="font-bold text-black text-base">Hi, I&apos;m {title}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-black text-lg font-bold px-3 py-1 hover:bg-black hover:text-white transition border border-black rounded-none"
              aria-label={getTooltip('close')}
              title={getTooltip('close')}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Header with Guide/Assistant tabs */}
      <div className="flex gap-1 sm:gap-2 p-2 sm:p-3 border-b border-black flex-shrink-0 bg-white sticky top-0 z-10" data-pane="header">
        <button
          aria-label={getTooltip('guide')}
          title={getTooltip('guide')}
          className={`px-2 sm:px-4 py-2 border border-black text-xs sm:text-sm font-medium transition rounded-none ${mode === 'guide' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          onClick={() => setMode('guide')}
        >
          Guide
        </button>
        <button
          aria-label={getTooltip('assistant')}
          title={getTooltip('assistant')}
          className={`px-2 sm:px-4 py-2 border border-black text-xs sm:text-sm font-medium transition rounded-none ${mode === 'assistant' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          onClick={() => setMode('assistant')}
        >
          Assistant
        </button>
      </div>
      
      {/* User Education Message */}
      {messages.length === 0 && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
          <p><strong>Guide:</strong> Get site-specific help and information</p>
        </div>
      )}

      {/* Messages Area - scrollable with proper styling */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 md:px-5 bg-white" 
        role="log"
        aria-live="polite"
        style={{ scrollbarGutter: 'stable both-edges' }}
        data-pane="messages"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-600">
            <div>
              <p className="text-sm mb-2">Start a conversation with Winston!</p>
              {kb === 'william' && (
                <p className="text-xs text-gray-500">
                  Welcome to William&apos;s Portfolio! Ask me about my projects, skills, or experience.
                </p>
              )}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`my-3 text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block max-w-[85%] sm:max-w-[78%] md:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 border border-black whitespace-pre-wrap break-words ${
                  m.role === 'user' 
                    ? 'bg-black text-white mr-2' 
                    : 'bg-white text-black ml-2'
                }`}
                style={{ minWidth: '12px' }} // Ensure no bubble gets closer than 12px to edge
              >
                {m.role === 'assistant' ? stripCitations(m.content) : m.content}
              </div>
              {m.showChips && m.chips && (
                <div className="ml-2 mt-1">
                  <Chips options={m.chips} onPick={handleChipClick} />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Error Alert */}
      {voiceError && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-200 text-red-800 text-sm">
          {voiceError}
        </div>
      )}

      {/* Clear History Button */}
      <div className="flex justify-end px-4 py-3 flex-shrink-0 bg-white">
        <button
          onClick={() => setMessages([])}
          className="text-sm font-bold text-gray-900 hover:text-red-600 transition underline"
          title={getTooltip('clearHistory')}
          aria-label={getTooltip('clearHistory')}
        >
          Clear History
        </button>
      </div>

      {/* Input Composer */}
      <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-4 flex-shrink-0 bg-white border-t border-black" data-pane="composer">
        <input
          name="prompt"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything..."
          className="flex-1 min-w-0 px-2 sm:px-3 py-2 border border-black text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 border border-black transition rounded-none ${isListening ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          title={isListening ? getTooltip('mic', 'stop') : getTooltip('mic', 'start')}
          aria-label={isListening ? getTooltip('mic', 'stop') : getTooltip('mic', 'start')}
          disabled={!hasSpeechRecognition}
        >
          <MicIcon />
        </button>
        <button
          type="button"
          onClick={() => {
            const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
            if (lastAssistantMessage) {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                speak(lastAssistantMessage.content);
              }
            } else {
              alert('No assistant message to read aloud');
            }
          }}
          className={`p-2 border border-black transition rounded-none ${isSpeaking ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          title={isSpeaking ? 'Stop reading' : 'Read last response aloud'}
          aria-label={isSpeaking ? 'Stop reading' : 'Read last response aloud'}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="px-2 sm:px-4 py-2 bg-black text-white text-xs sm:text-sm font-medium hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition rounded-none border border-gray-300"
          title={getTooltip('send')}
          aria-label={getTooltip('send')}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
