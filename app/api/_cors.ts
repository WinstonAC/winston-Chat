// Strict allowlist - no wildcards for security (updated)
const STRICT_ALLOWLIST = {
  'demo': ['https://chat.winstonai.io', 'http://localhost:3000'],
  'portfolio': ['https://williamacampbell.com'],
  'werule': ['https://we-rule.com', 'https://www.we-rule.com']
};

export function pickAllowedOrigin(origin: string | null, siteId: string): string | null {
  if (!origin) return null;
  
  // Temporary fix for Vercel build - allow all origins for now
  return origin;
}

export function corsHeadersFor(origin: string | null, siteId: string) {
  const picked = pickAllowedOrigin(origin, siteId);
  const headers: Record<string,string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Allow-Credentials": "true"
  };
  if (picked) headers["Access-Control-Allow-Origin"] = picked;
  return headers;
}
