'use client';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
  const kb = searchParams?.get('kb') || process.env.NEXT_PUBLIC_DEFAULT_KB || 'default';

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Winston AI</h1>
            <nav className="flex space-x-1">
              <a href="#demo" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                About
              </a>
              <a href="#demo" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                Methodology
              </a>
              <a href="#demo" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                Contact
              </a>
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
            Actively used at <span className="font-semibold text-blue-600">WERULE.com</span>
          </p>
          <p className="text-lg text-gray-500">
            Get instant answers from your knowledge base with Winston AI
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
