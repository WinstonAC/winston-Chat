'use client';

import ChatBox from '../app/components/ChatBox';
import Head from 'next/head';

export default function WinstonWidget() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            background: white;
            color: black;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          #__next {
            width: 100%;
            height: 100%;
          }
        `}</style>
      </Head>
      <main style={{ width: '100%', height: '100%' }}>
        <ChatBox isEmbedded={true} />
      </main>
    </>
  );
} 