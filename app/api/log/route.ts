import { NextRequest, NextResponse } from 'next/server';

const MAX_BODY_LENGTH = 1024;
const MAX_MESSAGE_LENGTH = 500;
const MAX_USER_ID_LENGTH = 100;

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

    const message =
      typeof payload.message === 'string'
        ? payload.message.slice(0, MAX_MESSAGE_LENGTH)
        : undefined;
    const userId =
      typeof payload.userId === 'string'
        ? payload.userId.slice(0, MAX_USER_ID_LENGTH)
        : undefined;

    const data: Record<string, string> = {};
    if (message) data.message = message;
    if (userId) data.userId = userId;

    console.log('Chat Log:', data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Log error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
