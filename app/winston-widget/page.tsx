'use client';

import ChatBox from '../components/ChatBox';
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
    <div
      style={{
        margin: 0,
        padding: 0,
        background: '#fff',
        color: '#000',
        fontFamily: 'monospace',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        maxHeight: '600px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <ChatBox isEmbedded={true} kb={kb} title={title} />
    </div>
  );
}

export default function WinstonWidgetPage() {
  return (
    <Suspense fallback={
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
    }>
      <WinstonWidgetContent />
    </Suspense>
  );
} 