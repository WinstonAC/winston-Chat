'use client';

import ChatBox from '../components/ChatBox';

export default function WinstonWidget() {
  return (
    <div className="w-full h-full">
      <ChatBox isEmbedded={true} />
    </div>
  );
} 