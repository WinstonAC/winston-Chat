import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { systemPromptFor } from '../../lib/prompts';
import { retrieveKeyword } from '../../lib/keywordRetrieval';
import { corsHeadersFor } from '../_cors';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CORS helper function (legacy - keeping for backward compatibility)
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // If no origin or same-origin, allow it
  if (!origin || origin === 'null') {
    return {};
  }
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      // Handle wildcard domains like *.squarespace.com
      const allowedDomain = allowed.replace('*.', '');
      return origin.endsWith(allowedDomain);
    }
    return allowed === origin;
  });
  
  if (isAllowed) {
    console.log(`CORS: Allowing origin: ${origin}`);
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    };
  }
  
  console.log(`CORS: Blocking origin: ${origin}`);
  return {};
}

// Rule-based intent classifier
function classifyIntent(message: string): "guide" | "assistant" {
  const guideKeywords = ["portfolio", "work", "project", "experience", "skills", "about", "william", "campbell"];
  const assistantKeywords = ["build", "create", "develop", "strategy", "product", "feature", "advice", "help"];

  const lowerMessage = message.toLowerCase();
  const guideScore = guideKeywords.filter(word => lowerMessage.includes(word)).length;
  const assistantScore = assistantKeywords.filter(word => lowerMessage.includes(word)).length;

  return guideScore >= assistantScore ? "guide" : "assistant";
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsHeaders = corsHeadersFor(
    origin, 
    process.env.ALLOWED_ORIGINS || "", 
    process.env.ALLOWED_SUFFIXES || ""
  );
  
  // Log the picked origin for debugging
  if (origin) {
    console.log(`CORS OPTIONS: Origin ${origin} -> ${corsHeaders['Access-Control-Allow-Origin'] || 'BLOCKED'}`);
  }
  
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Handle CORS with new helper
    const origin = req.headers.get('origin');
    const corsHeaders = corsHeadersFor(
      origin, 
      process.env.ALLOWED_ORIGINS || "", 
      process.env.ALLOWED_SUFFIXES || ""
    );
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { messages, mode, kb = 'default' } = await req.json();
    
    // Support environment-based default KB
    const envDefault = process.env.DEFAULT_KB?.toLowerCase() || 'default';
    const selectedKb = (kb || envDefault).toLowerCase();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    const lastMessage = validMessages[validMessages.length - 1].content;
    
    // Classify intent if mode is not specified
    const selectedMode = mode || classifyIntent(lastMessage);

    // Select appropriate system prompt based on kb parameter
    let systemPrompt = systemPromptFor(selectedKb, selectedMode);

    // Add context for WeRule knowledge base
    if (selectedKb === 'werule') {
      const retrievedChunks = retrieveKeyword('werule', lastMessage, 6);
      
      if (retrievedChunks.length > 0) {
        const contextBlock = retrievedChunks
          .map((chunk, index) => `[${index + 1}] ${chunk.url}\n${chunk.text}`)
          .join('\n\n');
        
        systemPrompt += `\n\nCONTEXT:\n${contextBlock}\n\nWhen using this context in your response, cite the relevant URL(s) using [1], [2], etc.`;
      } else {
        systemPrompt += '\n\n(no context available)';
      }
    }

    // Log user message and system prompt
    console.log('Chat Log:', {
      message: lastMessage,
      role: 'user',
      mode: selectedMode,
      kb: selectedKb,
      contextChunks: selectedKb === 'werule' ? retrieveKeyword('werule', lastMessage, 6).length : 0,
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

    return NextResponse.json({ reply, mode: selectedMode }, { headers: corsHeaders });
  } catch (error) {
    console.error('Chat API Error:', error);
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeadersFor(req.headers.get('origin'), process.env.ALLOWED_ORIGINS || "", process.env.ALLOWED_SUFFIXES || "") }
    );
  }
} 
