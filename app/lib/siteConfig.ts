export type SiteId = 'demo' | 'portfolio' | 'werule';

export function getSiteId(hostname: string): SiteId {
  const host = hostname.toLowerCase();
  
  // Demo host
  if (host === 'chat.winstonai.io') {
    return 'demo';
  }
  
  // Portfolio host from env
  const portfolioHost = process.env.NEXT_PUBLIC_PORTFOLIO_HOST?.toLowerCase();
  if (portfolioHost && host === portfolioHost) {
    return 'portfolio';
  }
  
  // WeRule hosts
  if (host === 'we-rule.com' || host === 'www.we-rule.com') {
    return 'werule';
  }
  
  // Default to demo for unknown hosts
  return 'demo';
}

export const copyBySite: Record<SiteId, { greeting: string; guide: string }> = {
  demo: {
    greeting: `Hi! I'm **Winston** — an embeddable AI chat widget for demos.
I'm connected to William Campbell's portfolio and the WeRule mentorship app.
Ask me about features, embedding, setup, or pricing. Ask "what does this widget do?" for a quick tour.`,
    guide: `**What each control does (top → bottom)**
• **Guide**: site-specific help about this project.
• **Assistant**: general AI chat; may pull info from the web if enabled.
• **Message area**: scrolls; tabs stay visible.
• **Mic (🎤)**: speak to Winston (speech → input).
• **Speaker (🔊)**: read the last assistant reply aloud.
• **Pen**: open long-form input/paste.
• **Clear History**: clears this conversation locally.
• **Input + Send**: type and send.

**Connected today**
• William Campbell's portfolio • WeRule mentorship app • public demo.`
  },
  portfolio: {
    greeting: `Hi! I'm Winston on William Campbell's portfolio. Ask about projects, roles, and how this widget embeds.`,
    guide: `Guide = site help • Assistant = general Q&A • 🎤 speaks-to-text • 🔊 reads replies • Pen for longer notes • Clear History resets locally.`
  },
  werule: {
    greeting: `Hi! I'm Winston for WeRule. Ask about mentorship flow, onboarding, scheduling, and integration options.`,
    guide: `Guide explains WeRule specifics • Assistant handles general Q&A • 🎤 speaks-to-text • 🔊 reads replies • Pen for longer notes • Clear History resets locally.`
  }
};
