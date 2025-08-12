export function pickAllowedOrigin(origin: string | null, exactList: string[], suffixList: string[]): string | null {
  if (!origin) return null;
  if (exactList.includes(origin)) return origin;
  try {
    const u = new URL(origin);
    const host = `${u.protocol}//${u.host}`;
    // exact again (normalized)
    if (exactList.includes(host)) return host;
    // suffix match (e.g., .squarespace.com)
    for (const suffix of suffixList) {
      const s = suffix.trim().toLowerCase();
      if (!s) continue;
      if (u.host.toLowerCase().endsWith(s.replace(/^\./, ""))) return host;
    }
  } catch {}
  return null;
}

export function corsHeadersFor(origin: string | null, allowed: string, suffixes: string) {
  const exactList = allowed.split(",").map(s => s.trim()).filter(Boolean);
  const suffixList = suffixes.split(",").map(s => s.trim()).filter(Boolean);
  const picked = pickAllowedOrigin(origin, exactList, suffixList);
  const headers: Record<string,string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true"
  };
  if (picked) headers["Access-Control-Allow-Origin"] = picked;
  return headers;
}
