'use client';

import ChatWidget from '../components/ChatWidget';
import { useSearchParams } from 'next/navigation';
import type { CSSProperties } from 'react';

type Props = {
  isCommandCenterHost: boolean;
};

function getTitleFor(kb?: string) {
  switch ((kb || 'winstonchat').toLowerCase()) {
    case 'werule':
      return 'WERULE';
    case 'william':
      return 'William Campbell';
    case 'winstonchat':
      return 'Winston Chat';
    case 'commandcenter':
      return 'Winston';
    default:
      return 'Winston Chat';
  }
}

export default function WinstonWidgetContent({ isCommandCenterHost }: Props) {
  const searchParams = useSearchParams();
  const kbParam = searchParams?.get('kb');
  const embedded = searchParams?.get('embedded') === 'true';
  const debug = searchParams?.get('debug') === '1';
  const minHParam = searchParams?.get('minH');
  const vhParam = searchParams?.get('vh');

  const kb =
    kbParam || (isCommandCenterHost ? 'commandcenter' : 'winstonchat');
  const title = getTitleFor(kb);
  const commandCenterMode = kb.toLowerCase() === 'commandcenter';

  if (embedded) {
    const minH = minHParam ? Number(minHParam) : null;
    const vh = vhParam ? Number(vhParam) : null;
    const style: CSSProperties = {};
    if (Number.isFinite(minH) && (minH as number) > 0) {
      style.minHeight = `${minH}px`;
    } else if (Number.isFinite(vh) && (vh as number) > 0) {
      style.minHeight = `${vh}vh`;
    }

    return (
      <>
        <style jsx global>{`
          html,
          body {
            height: 100%;
            margin: 0;
          }
        `}</style>
        <div className="w-full h-full" style={style}>
          <ChatWidget
            isStandalone={commandCenterMode}
            isEmbedded={!commandCenterMode}
            debug={debug}
            kb={kb}
            title={title}
          />
        </div>
      </>
    );
  }

  if (commandCenterMode) {
    return (
      <main className="h-[100dvh] w-full bg-white">
        <ChatWidget
          isStandalone={true}
          isEmbedded={false}
          kb="commandcenter"
          title="Winston"
        />
      </main>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        <ChatWidget
          isStandalone={true}
          isEmbedded={false}
          debug={false}
          kb={kb}
          title={title}
        />
      </div>
    </div>
  );
}
