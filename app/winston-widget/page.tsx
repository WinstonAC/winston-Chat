'use client';

import ChatBox from '../components/ChatBox';

export default function WinstonWidget() {
  return (
    <div className="w-full h-full bg-white" style={{ margin: 0, padding: 0 }}>
      <ChatBox isEmbedded={true} />
    </div>
  );
} 