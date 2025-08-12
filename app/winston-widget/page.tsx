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

function WinstonWidgetContent() {
  const searchParams = useSearchParams();
  const kb = searchParams?.get('kb') || 'default';

  // kb-title
  function getTitleFor(kb?: string) {
    switch ((kb || "default").toLowerCase()) {
      case "werule": return "WERULE";
      case "william": return "William Campbell";
      default: return "Winston Chat"; // exact current default string
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