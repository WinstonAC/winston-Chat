'use client';

import ChatBox from '../app/components/ChatBox';

export default function WinstonWidget() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
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
      </head>
      <body>
        <ChatBox isEmbedded={true} />
      </body>
    </html>
  );
} 