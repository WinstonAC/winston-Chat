'use client';

import ChatBox from '../components/ChatBox';

export default function WinstonWidgetPage() {
  return (
    <html>
      <head>
        <title>Winston Chat Widget</title>
        <meta charSet="UTF-8" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: monospace, sans-serif;
            box-sizing: border-box;
          }

          *, *::before, *::after {
            box-sizing: inherit;
          }

          ::placeholder {
            color: #333;
          }

          input, textarea, button {
            font-family: inherit;
            color: inherit;
            background: inherit;
          }

          /* Prevent any inherited scroll padding or styles */
          html {
            overflow: hidden;
          }
        `}</style>
      </head>
      <body>
        <div style={{ padding: 0, margin: 0 }}>
          <ChatBox isEmbedded={true} />
        </div>
      </body>
    </html>
  );
} 