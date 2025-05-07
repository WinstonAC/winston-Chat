import type { NextPage } from 'next';
import ChatBox from '../app/components/ChatBox';

const WinstonWidget: NextPage = () => {
  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      width: '100%',
      height: '100%',
      background: '#ffffff',
      color: '#000000',
      fontFamily: 'monospace, sans-serif'
    }}>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        * {
          box-sizing: border-box;
        }
        ::placeholder {
          color: #333;
        }
        input, textarea, button {
          font-family: inherit;
          color: inherit;
          background: inherit;
        }
      `}</style>
      <ChatBox isEmbedded={true} />
    </div>
  );
};

export default WinstonWidget; 