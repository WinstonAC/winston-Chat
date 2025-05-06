import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const guidePrompt = `You are Winston, a friendly and knowledgeable guide for a portfolio website. Your role is to help visitors explore the work and answer questions about the projects. Keep responses concise, engaging, and focused on the portfolio content.`;

const assistantPrompt = `You are Winston, an AI assistant focused on helping users with product strategy and development. Provide clear, actionable advice while maintaining a friendly and professional tone.`;

// Rule-based intent classifier
function classifyIntent(message: string): "guide" | "assistant" {
  const guideKeywords = ["portfolio", "work", "project", "experience", "skills", "about"];
  const assistantKeywords = ["build", "create", "develop", "strategy", "product", "feature"];

  const lowerMessage = message.toLowerCase();
  const guideScore = guideKeywords.filter(word => lowerMessage.includes(word)).length;
  const assistantScore = assistantKeywords.filter(word => lowerMessage.includes(word)).length;

  return guideScore >= assistantScore ? "guide" : "assistant";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { message, mode } = await req.json();

    // Classify intent if mode is not specified
    const selectedMode = mode || classifyIntent(message);

    // Select appropriate system prompt
    const systemPrompt = selectedMode === 'guide' ? guidePrompt : assistantPrompt;

    // Log user message
    console.log('Chat Log:', {
      message,
      role: 'user',
      mode: selectedMode,
    });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response.';

    // Log assistant reply
    console.log('Chat Log:', {
      message: reply,
      role: 'assistant',
      mode: selectedMode,
    });

    return NextResponse.json({ reply, mode: selectedMode });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 
