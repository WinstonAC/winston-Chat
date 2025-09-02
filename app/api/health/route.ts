import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authenticate, getClientIdentifier, rateLimit } from '../_auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req: NextRequest) {
  try {
    if (!authenticate(req)) {
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 401 }
      );
    }

    const id = getClientIdentifier(req);
    if (!rateLimit(id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    // Test OpenAI connection with a simple completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Hello, can you hear me?' }
      ],
      max_tokens: 10
    });

    return NextResponse.json({ 
      status: 'ok',
      message: 'OpenAI API connection successful',
      response: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { status: 'error', message: 'OpenAI API connection failed' },
      { status: 500 }
    );
  }
}
