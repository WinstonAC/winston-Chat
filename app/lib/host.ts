export function parseHostHeader(host: string | null): string {
  return (host ?? '').split(':')[0].toLowerCase();
}

export function isCommandCenterHost(hostname: string): boolean {
  return parseHostHeader(hostname) === 'chat.winstonai.io';
}
