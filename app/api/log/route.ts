import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, role, mode } = await req.json();

    const log = {
      message,
      role,
      mode,
      timestamp: new Date().toISOString(),
      source: 'winston-chat',
    };

    // ✅ For now, just log to the server console
    console.log('[🧠 Winston Log]', JSON.stringify(log, null, 2));

    // Optional: save to DB, Notion, Supabase, etc. later

    return NextResponse.json({ status: 'logged' });
  } catch (err) {
    console.error('❌ Logging Error:', err);
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
} 