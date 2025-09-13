'use client';

import ChatWidget from '../components/ChatWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function EmbedContent() {
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
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-2">
      <div className="w-full max-w-3xl h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden">
        <ChatWidget isEmbedded={true} kb={kb} title={title} />
      </div>
    </div>
  );
}

export default function Embed() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Winston...</p>
        </div>
      </div>
    }>
      <EmbedContent />
    </Suspense>
  );
}
