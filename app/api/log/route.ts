import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_LENGTH = 1024;
const MAX_MESSAGE_LENGTH = 500;
const MAX_USER_ID_LENGTH = 100;

function sanitize(str: string): string {
  return str.replace(/[\u0000-\u001F\u007F]+/g, ' ');
}

export function validatePayload(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid payload');
  }
  const allowed = ['message', 'userId'];
  for (const key of Object.keys(payload)) {
    if (!allowed.includes(key)) throw new Error('Invalid payload');
  }
  const { message, userId } = payload as {
    message?: unknown;
    userId?: unknown;
  };
  if (message === undefined && userId === undefined)
    throw new Error('Invalid payload');
  if (message !== undefined && typeof message !== 'string')
    throw new Error('Invalid payload');
  if (userId !== undefined && typeof userId !== 'string')
    throw new Error('Invalid payload');

  const data: Record<string, string> = {};
  if (typeof message === 'string')
    data.message = sanitize(message).slice(0, MAX_MESSAGE_LENGTH);
  if (typeof userId === 'string')
    data.userId = sanitize(userId).slice(0, MAX_USER_ID_LENGTH);
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.API_AUTH_TOKEN}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    let data: Record<string, string>;
    try {
      data = validatePayload(payload);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    console.log('Chat Log:', data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Log error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
