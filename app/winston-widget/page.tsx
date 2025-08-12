'use client';

import dynamic from 'next/dynamic';

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

export default function WinstonWidgetPage() {
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
      <ChatBox isEmbedded={true} />
    </div>
  );
} 