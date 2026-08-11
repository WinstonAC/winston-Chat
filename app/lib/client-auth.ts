/** Client-side API key for /api/chat — must match server `API_KEY`. */
export function getClientApiKey(): string {
  return process.env.NEXT_PUBLIC_API_KEY?.trim() || '';
}

export function chatApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = getClientApiKey();
  if (key) headers['x-api-key'] = key;
  return headers;
}
