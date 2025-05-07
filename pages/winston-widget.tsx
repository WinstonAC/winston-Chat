'use client';

import ChatBox from '../app/components/ChatBox';

export default function WinstonWidget() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: monospace, sans-serif;
            background: #fff;
            color: #000;
          }
          * { 
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          ::placeholder { 
            color: #333;
            opacity: 1;
          }
          input, button, textarea { 
            font-family: inherit;
            color: inherit;
          }
          #__next {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        `}} />
      </head>
      <body>
        <ChatBox isEmbedded={true} />
      </body>
    </html>
  );
} 