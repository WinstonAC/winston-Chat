'use client';

import ChatWidget from '../components/ChatWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { CSSProperties } from 'react';

function WinstonWidgetContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'winstonchat';
  const embedded = searchParams?.get('embedded') === 'true';
  const debug = searchParams?.get('debug') === '1';
  const minHParam = searchParams?.get('minH');
  const vhParam = searchParams?.get('vh');

  // kb-title
  function getTitleFor(kb?: string) {
    switch ((kb || "winstonchat").toLowerCase()) {
      case "werule": return "WERULE";
      case "william": return "William Campbell";
      case "winstonchat": return "Winston Chat";
      case "commandcenter": return "Winston";
      default: return "Winston Chat";
    }
  }

  const title = getTitleFor(kb);

  // Embedded mode: render a 100%-height page so the widget can fill the iframe.
  // Standalone mode keeps the existing centered card layout.
  if (embedded) {
    const minH = minHParam ? Number(minHParam) : null;
    const vh = vhParam ? Number(vhParam) : null;
    const style: CSSProperties = {};
    if (Number.isFinite(minH) && (minH as number) > 0) {
      style.minHeight = `${minH}px`;
    } else if (Number.isFinite(vh) && (vh as number) > 0) {
      style.minHeight = `${vh}vh`;
    }

    return (
      <>
        <style jsx global>{`
          html,
          body {
            height: 100%;
            margin: 0;
          }
        `}</style>
        <div className="w-full h-full" style={style}>
          <ChatWidget
            isStandalone={false}
            isEmbedded={true}
            debug={debug}
            kb={kb}
            title={title}
          />
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        <ChatWidget isStandalone={!embedded} isEmbedded={embedded} debug={embedded && debug} kb={kb} title={title} />
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
