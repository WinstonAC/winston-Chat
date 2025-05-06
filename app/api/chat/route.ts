import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const guidePrompt = `You are Winston, a friendly, helpful tour assistant for William Campbell's portfolio. Greet users warmly, answer questions about the site, and guide them to relevant projects or sections. Keep replies concise (1–2 short paragraphs).`;

const assistantPrompt = `You're Winston — short, smart, helpful. Answer clearly in 2–3 sentences. Keep it chill.`;

// Simple rule-based intent classifier
function classifyIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('project') || lower.includes('portfolio') || lower.includes('about') || lower.includes('work')) {
    return 'portfolio_navigation';
  }
  if (lower.includes('product') || lower.includes('strategy') || lower.includes('startup') || lower.includes('launch')) {
    return 'product_strategy';
  }
  if (lower.includes('ai') || lower.includes('gpt') || lower.includes('openai')) {
    return 'ai_questions';
  }
  return 'general';
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();
    const systemPrompt = mode === 'guide' ? guidePrompt : assistantPrompt;

    // Classify the last user message
    const userMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const intent = userMessage ? classifyIntent(userMessage.content) : 'general';

    // Log the last user message if it exists
    if (userMessage) {
      console.log('User message:', {
        message: userMessage.content,
        role: 'user',
        mode,
        timestamp: new Date().toISOString(),
        intent,
      });
    }

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    const reply = chatResponse.choices[0].message.content;

    // Log the assistant's reply
    console.log('Assistant reply:', {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      mode,
      intent,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    return NextResponse.json({ reply: 'Sorry, Winston had trouble responding.' }, { status: 500 });
  }
} 
