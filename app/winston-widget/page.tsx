'use client';

import ChatWidget from '../components/ChatWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function WinstonWidgetContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'winstonchat';

  // kb-title
  function getTitleFor(kb?: string) {
    switch ((kb || "winstonchat").toLowerCase()) {
      case "werule": return "WERULE";
      case "william": return "William Campbell";
      case "winstonchat": return "Winston Chat";
      default: return "Winston Chat";
    }
  }

  const title = getTitleFor(kb);

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        <ChatWidget isStandalone kb={kb} title={title} />
      </div>
    </div>
  );
}

export default function WinstonWidgetPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm">Loading Winston...</p>
        </div>
      </div>
    }>
      <WinstonWidgetContent />
    </Suspense>
  );
} 
