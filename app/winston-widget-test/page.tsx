'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ChatBox = dynamic(() => import('../components/ChatBox'), { 
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      color: '#000',
      fontFamily: 'monospace'
    }}>
      Loading Winston...
    </div>
  )
});

function WinstonWidgetTestContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'default';

  // kb-title
  function getTitleFor(kb?: string) {
    switch ((kb || "default").toLowerCase()) {
      case "werule": return "WERULE";
      default: return "Winston Chat"; // exact current default string
    }
  }

  const title = getTitleFor(kb);
  const isWeRule = kb === 'werule';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Test Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Winston Widget Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          Testing the {isWeRule ? 'WERULE' : 'Portfolio'} widget in full-page mode
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">Current Configuration:</h2>
          <p className="text-blue-800">
            <strong>KB:</strong> {kb} | <strong>Title:</strong> {title} | <strong>Mode:</strong> Full-page test
          </p>
        </div>
      </div>

      {/* Widget Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Widget Preview: {title}
            </span>
          </div>
          <div style={{ height: '600px' }}>
            <ChatBox 
              isEmbedded={false} 
              kb={kb} 
              title={title}
              isStandalone={true}
            />
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Test Instructions:</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• <strong>Default:</strong> <a href="/winston-widget-test" className="underline">/winston-widget-test</a> (Portfolio mode)</li>
            <li>• <strong>WERULE:</strong> <a href="/winston-widget-test?kb=werule" className="underline">/winston-widget-test?kb=werule</a> (WERULE mode)</li>
            <li>• <strong>Embed URLs:</strong> Use <code className="bg-yellow-100 px-1 rounded">/winston-widget?kb=werule</code> for production</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function WinstonWidgetTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test page...</p>
        </div>
      </div>
    }>
      <WinstonWidgetTestContent />
    </Suspense>
  );
}
