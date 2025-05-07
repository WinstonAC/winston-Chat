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
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { messages, mode } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Validate messages format and content
    const validMessages = messages.filter(msg => 
      msg && 
      typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string' && 
      msg.content.trim() !== ''
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages found' },
        { status: 400 }
      );
    }

    const lastMessage = validMessages[validMessages.length - 1].content;
    
    // Classify intent if mode is not specified
    const selectedMode = mode || classifyIntent(lastMessage);

    // Select appropriate system prompt
    const systemPrompt = selectedMode === 'guide' ? guidePrompt : assistantPrompt;

    // Log user message
    console.log('Chat Log:', {
      message: lastMessage,
      role: 'user',
      mode: selectedMode,
    });

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...validMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openAIMessages,
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
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
