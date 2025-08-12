'use client';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const ChatBox = dynamic(() => import('./components/ChatBox'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400">
      Loading Winston...
    </div>
  )
});

function HomeContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'winstonchat';
  const [activePanel, setActivePanel] = useState<'about' | 'methodology' | null>(null);

  const openPanel = (panel: 'about' | 'methodology') => {
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleContact = () => {
    window.location.href = 'mailto:cylondigital@example.com';
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Winston AI</h1>
            <nav className="flex space-x-1">
              <button
                onClick={() => openPanel('about')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                About
              </button>
              <button
                onClick={() => openPanel('methodology')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                Methodology
              </button>
              <button
                onClick={handleContact}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Knowledge Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Get instant answers from your knowledge base with Winston AI
          </p>
          <p className="text-lg text-gray-500">
            Intelligent, responsive, and always ready to help
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          {/* Chat Card */}
          <div className="w-full h-[620px] sm:w-[520px] sm:h-[720px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="h-full">
              <ChatBox isEmbedded={true} kb={kb} title="Winston Chat" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Powered by <span className="font-semibold">Cylon Digital</span>
          </p>
        </div>
      </footer>

      {/* About Panel */}
      {activePanel === 'about' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">About Winston AI</h3>
              <button
                onClick={closePanel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">About Winston Chat AI</h4>
              <p className="text-gray-600 mb-4">
                Winston Chat AI is an enterprise-grade embeddable chatbot that turns static websites into dynamic, conversational experiences. Built with React, Next.js, and OpenAI, it powers intelligent user engagement, navigation assistance, and customer support.
              </p>
              <p className="text-gray-600 mb-4">
                Designed for portfolios, SaaS products, e-commerce, and enterprise platforms, Winston Chat AI makes websites interactive, accessible, and more engaging — without disrupting the existing design.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Panel */}
      {activePanel === 'methodology' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Our Methodology</h3>
              <button
                onClick={closePanel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Our Methodology</h4>
              <p className="text-gray-600 mb-4">
                Winston Chat AI is engineered around three pillars:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">1.</span>
                  <div>
                    <span className="font-semibold text-gray-900">Context-Aware Design</span> – Every conversation adapts to the site it lives on, ensuring relevant, brand-aligned responses.
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">2.</span>
                  <div>
                    <span className="font-semibold text-gray-900">Seamless Integration</span> – One-line embed with secure CORS and CSP settings, optimized for performance, accessibility, and mobile-first design.
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">3.</span>
                  <div>
                    <span className="font-semibold text-gray-900">Scalable Architecture</span> – Stateless serverless backend with OpenAI integration, multi-persona support, and customizable branding, so it works for a single portfolio or an enterprise-scale deployment.
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                We combine product strategy, UX thinking, and full-stack engineering to create an assistant that's not just functional, but a natural extension of the host website.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
