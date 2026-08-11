import type { AgentType } from './agents';

export type CommandCenterAppliedAction = {
  type: string;
  label: string;
  success: boolean;
  detail?: string;
};

export type CommandCenterPlanResult = {
  reply: string;
  applied?: CommandCenterAppliedAction[];
  agent_type?: AgentType;
};

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

function commandCenterBaseUrl(): string {
  const raw =
    process.env.COMMAND_CENTER_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_COMMAND_CENTER_API_URL?.trim() ||
    'https://www.winstonai.io';
  return raw.replace(/\/$/, '');
}

export async function callCommandCenterPlan(params: {
  message: string;
  agent_type?: AgentType;
  history?: HistoryMessage[];
}): Promise<CommandCenterPlanResult> {
  const apiKey = process.env.AGENT_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'AGENT_API_KEY is not configured. Set it in winston-chat Vercel env to match Command Center.'
    );
  }

  const url = `${commandCenterBaseUrl()}/api/agent/plan`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      message: params.message,
      agent_type: params.agent_type ?? 'general',
      history: params.history ?? [],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? `Command Center plan failed (${response.status})`);
  }

  return {
    reply: payload.reply ?? '',
    applied: payload.applied ?? [],
    agent_type: payload.agent_type,
  };
}

export function isCommandCenterKb(kb: string): boolean {
  return kb.toLowerCase() === 'commandcenter';
}
