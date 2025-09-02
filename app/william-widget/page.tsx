'use client';

import ChatWidget from '../components/ChatWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function WilliamWidgetContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'william';

  // kb-title
  function getTitleFor(kb?: string) {
    switch ((kb || "william").toLowerCase()) {
      case "werule": return "WERULE";
      case "william": return "William Campbell";
      case "winstonchat": return "Winston Chat";
      default: return "William Campbell";
    }
  }

  const title = getTitleFor(kb);

  return (
    <div className="w-full h-full min-h-screen bg-white text-black flex flex-col overflow-hidden">
      <ChatWidget isEmbedded={true} kb={kb} title={title} />
    </div>
  );
}

export default function WilliamWidgetPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full min-h-screen bg-white text-black flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm">Loading William...</p>
        </div>
      </div>
    }>
      <WilliamWidgetContent />
    </Suspense>
  );
}
