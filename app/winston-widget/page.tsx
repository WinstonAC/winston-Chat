'use client';

import ChatBox from '../components/ChatBox';

export default function WinstonWidget() {
  return (
    <html>
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: white;
            color: black;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
      </head>
      <body>
        <ChatBox isEmbedded={true} />
      </body>
    </html>
  );
} 