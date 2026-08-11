import { headers } from 'next/headers';
import { Suspense } from 'react';
import { isCommandCenterHost, parseHostHeader } from '../lib/host';
import WinstonWidgetContent from './WinstonWidgetContent';

function LoadingFallback() {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2" />
        <p className="text-sm">Loading Winston...</p>
      </div>
    </div>
  );
}

export default function WinstonWidgetPage() {
  const host = parseHostHeader(headers().get('host'));
  const commandCenterHost = isCommandCenterHost(host);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WinstonWidgetContent isCommandCenterHost={commandCenterHost} />
    </Suspense>
  );
}
