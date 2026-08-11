export type AgentType =
  | 'general'
  | 'brand_architect'
  | 'mentorship_mapper'
  | 'revenue_architect'
  | 'scenecraft'
  | 'wellness_wizard'
  | 'mvp_builder'
  | 'money_advisor';

export interface AgentOption {
  id: AgentType;
  label: string;
  emoji: string;
  description: string;
}

/** UI metadata — system prompts live on Command Center (winstonai.io/api/agent/plan). */
export const AGENTS: AgentOption[] = [
  { id: 'general', label: 'Winston', emoji: '🧠', description: 'General assistant' },
  { id: 'brand_architect', label: 'Brand Architect', emoji: '🏛️', description: 'Brand strategy & creative direction' },
  { id: 'mentorship_mapper', label: 'Mentorship Mapper', emoji: '🗺️', description: 'Mentorship architecture & coaching' },
  { id: 'revenue_architect', label: 'Revenue Architect', emoji: '📈', description: 'Revenue strategy & growth' },
  { id: 'scenecraft', label: 'SceneCraft', emoji: '🎬', description: 'Visual content & video prompt direction' },
  { id: 'wellness_wizard', label: 'Wellness Wizard', emoji: '✨', description: 'Rituals, breathwork & wellness planning' },
  { id: 'mvp_builder', label: 'MVP Builder', emoji: '🚀', description: 'Lean product strategy & MVP scoping' },
  { id: 'money_advisor', label: 'Money Advisor', emoji: '💰', description: 'Finance, debt, investment & tax strategy' },
];

export const getAgent = (id: AgentType): AgentOption =>
  AGENTS.find((a) => a.id === id) ?? AGENTS[0];

export function parseAgentType(value: unknown): AgentType {
  const match = AGENTS.find((a) => a.id === value);
  return match?.id ?? 'general';
}
