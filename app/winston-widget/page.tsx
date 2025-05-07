'use client';

import dynamic from 'next/dynamic';
import Head from 'next/head';

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
    <>
      <Head>
        <title>Winston Chat Widget</title>
        <meta name="description" content="Chat with Winston - Your AI Assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div
        style={{
          margin: 0,
          padding: 0,
          background: '#fff',
          color: '#000',
          fontFamily: 'monospace',
          width: '100%',
          height: '100vh',
          minHeight: '400px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <ChatBox isEmbedded={true} />
      </div>
    </>
  );
} 