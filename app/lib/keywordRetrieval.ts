// Enhanced keyword retrieval with SEO boosts for WeRule
// Maintains graceful fallbacks for missing data

// Cache for chunks
const chunksCache: Record<string, { url: string; text: string }[]> = {};

// Cache for SEO config
type SEOConfig = {
  priorityPages: { url: string; weight: number }[];
  pillars: { name: string; keywords: string[] }[];
  intents: Record<string, { keywords: string[]; urls: string[] }>;
  brand?: any;
};
const seoCache: Record<string, SEOConfig | null> = {};

// Safe JSON reading function
function safeReadJSON<T>(p: string): T | null {
  try { 
    return JSON.parse(require('fs').readFileSync(p, "utf8")) as T; 
  } catch { 
    return null; 
  }
}

// Load chunks from client data files
export function loadChunks(kb: string): { url: string; text: string }[] {
  if (!chunksCache[kb]) {
    try {
      const path = require('path');
      const p = path.join(process.cwd(), "client-data", `${kb}-chunks.json`);
      chunksCache[kb] = require('fs').existsSync(p) ? (safeReadJSON(p) as any[]) || [] : [];
    } catch (error) {
      console.warn(`Failed to load chunks for kb: ${kb}`, error);
      chunksCache[kb] = [];
    }
  }
  return chunksCache[kb];
}

// Load SEO configuration
function loadSEO(kb: string): SEOConfig | null {
  if (!(kb in seoCache)) {
    try {
      const path = require('path');
      const p = path.join(process.cwd(), "client-data", `${kb}-seo.json`);
      seoCache[kb] = require('fs').existsSync(p) ? safeReadJSON<SEOConfig>(p) : null;
    } catch (error) {
      console.warn(`Failed to load SEO config for kb: ${kb}`, error);
      seoCache[kb] = null;
    }
  }
  return seoCache[kb];
}

// Tokenize text for scoring
function tokenizeLower(s: string): string[] {
  return (s || "").toLowerCase().split(/\W+/).filter(Boolean);
}

// Base overlap scoring
function baseOverlapScore(queryTokens: string[], text: string): number {
  const t = text.toLowerCase();
  let score = 0;
  for (const q of queryTokens) {
    if (t.includes(q)) score++;
  }
  return score;
}

// Boost from priority pages
function boostFromPriority(url: string, seo: SEOConfig | null): number {
  if (!seo?.priorityPages) return 0;
  const hit = seo.priorityPages.find(p => url.startsWith(p.url));
  return hit ? hit.weight : 0;
}

// Boost from pillar keywords
function boostFromPillars(queryTokens: string[], text: string, seo: SEOConfig | null): number {
  if (!seo?.pillars) return 0;
  const t = text.toLowerCase();
  let score = 0;
  for (const pillar of seo.pillars) {
    for (const kw of pillar.keywords) {
      const k = kw.toLowerCase();
      if (t.includes(k) || queryTokens.includes(k)) score += 1;
    }
  }
  return Math.min(score, 5); // cap at 5
}

// Detect user intent
function detectIntent(queryTokens: string[], seo: SEOConfig | null): string | null {
  if (!seo?.intents) return null;
  for (const [intent, cfg] of Object.entries(seo.intents)) {
    for (const kw of cfg.keywords) {
      const k = kw.toLowerCase();
      if (queryTokens.includes(k)) return intent;
    }
  }
  return null;
}

// Boost from intent detection
function boostFromIntent(intent: string | null, url: string, text: string, seo: SEOConfig | null): number {
  if (!intent || !seo?.intents?.[intent]) return 0;
  const targets = seo.intents[intent].urls || [];
  // Prefer target URLs strongly; small bonus if text looks relevant
  const urlBoost = targets.some(u => url.startsWith(u)) ? 3.0 : 0;
  const textBoost = text.toLowerCase().includes(intent) ? 0.5 : 0;
  return urlBoost + textBoost;
}

// Enhanced keyword retrieval with SEO scoring
export function retrieveKeyword(kb: string, query: string, k: number = 6): Array<{url: string, text: string}> {
  const chunks = loadChunks(kb);
  const seo = loadSEO(kb);
  const qTokens = tokenizeLower(query);

  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Score chunks with multiple boost factors
  const scored = chunks.map(chunk => {
    const base = baseOverlapScore(qTokens, chunk.text);
    const bPriority = boostFromPriority(chunk.url, seo);
    const bPillars = boostFromPillars(qTokens, chunk.text, seo);
    const intent = detectIntent(qTokens, seo);
    const bIntent = boostFromIntent(intent, chunk.url, chunk.text, seo);
    const score = base + bPriority + bPillars + bIntent;
    
    return { ...chunk, score };
  });

  // If nothing matches, return top few priority pages so the bot can still cite
  const withPositives = scored.filter(x => x.score > 0);
  const finalList = (withPositives.length ? withPositives : scored)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  // Debug: log top URLs and scores for WeRule requests
  if (kb === 'werule') {
    console.debug("[weRule-retrieval]", query, finalList.map(f => ({ url: f.url, score: f.score })));
  }

  return finalList.map(({ url, text }) => ({ url, text }));
}
