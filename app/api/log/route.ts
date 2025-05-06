import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Chat Log:', data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Log error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 