import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const guidePrompt = `You are Winston, a friendly and knowledgeable guide for William Campbell's portfolio website. 

ABOUT WILLIAM CAMPBELL:
William Campbell is a talented developer and creator who builds innovative projects. His portfolio showcases his work in web development, AI integration, and creative coding.

PORTFOLIO CONTENT:
- This is William Campbell's personal portfolio website
- The site features various projects and work examples
- William specializes in modern web development and AI technologies
- The portfolio demonstrates his skills in React, Next.js, TypeScript, and other modern web technologies

YOUR ROLE:
- Help visitors explore William's work and projects
- Answer questions about his skills, experience, and projects
- Guide users to relevant sections of the portfolio
- Keep responses concise, engaging, and focused on William's actual work
- Be friendly and professional
- If asked about specific projects, provide information about what William has built

IMPORTANT: Always refer to William Campbell specifically, not generic portfolio content. Focus on his actual work and experience.`;

const assistantPrompt = `You are Winston, an AI assistant integrated into William Campbell's portfolio website. You provide product strategy and development advice while maintaining William's professional perspective.

ABOUT WILLIAM:
William Campbell is a developer with experience in modern web technologies, AI integration, and product development. He has worked on various projects involving React, Next.js, TypeScript, and AI technologies.

YOUR ROLE:
- Provide clear, actionable advice on product strategy and development
- Draw from William's experience when relevant
- Maintain a friendly and professional tone
- Keep responses concise and practical
- Occasionally reference William's expertise and projects when appropriate
- Focus on modern web development, AI integration, and product building

IMPORTANT: While you can provide general advice, you're part of William's portfolio and should maintain his professional perspective.`;

// Rule-based intent classifier
function classifyIntent(message: string): "guide" | "assistant" {
  const guideKeywords = ["portfolio", "work", "project", "experience", "skills", "about", "william", "campbell"];
  const assistantKeywords = ["build", "create", "develop", "strategy", "product", "feature", "advice", "help"];

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

    // Log user message and system prompt
    console.log('Chat Log:', {
      message: lastMessage,
      role: 'user',
      mode: selectedMode,
      systemPrompt: systemPrompt.slice(0, 80) + '...'
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
