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

/** Slightly under winston-chat Vercel maxDuration so the route returns a JSON error, not a platform 504. */
const BRIDGE_REQUEST_TIMEOUT_MS = 115_000;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BRIDGE_REQUEST_TIMEOUT_MS);
  try {
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
      signal: controller.signal,
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
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Command Center timed out after ~2 minutes. LM Studio on your Mac may still be thinking — wait and try again, or check the tunnel is running.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function isCommandCenterKb(kb: string): boolean {
  return kb.toLowerCase() === 'commandcenter';
}
