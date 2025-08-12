import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { systemPromptFor } from '../../lib/prompts';
import { getChunks, buildContextBlock, hasConfidentRetrieval, MIN_SCORE } from '../../lib/retrieval';
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

// Validate KB exists
function validateKB(kb: string): boolean {
  const validKBs = ['winstonchat', 'werule', 'william'];
  return validKBs.includes(kb.toLowerCase());
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

    const { messages, mode, kb = 'winstonchat' } = await req.json();
    
    // Support environment-based default KB, fallback to winstonchat
    const envDefault = process.env.DEFAULT_KB?.toLowerCase() || 'winstonchat';
    const selectedKb = (kb || envDefault).toLowerCase();
    
    // Validate KB exists
    if (!validateKB(selectedKb)) {
      return NextResponse.json(
        { error: `Invalid knowledge base: ${selectedKb}. Valid options: winstonchat, werule, william` },
        { status: 400, headers: corsHeaders }
      );
    }
    
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

    // Get relevant chunks from knowledge base
    const chunks = await getChunks(selectedKb, lastMessage, 5);
    const hasConfidentChunks = hasConfidentRetrieval(chunks);

    // Select appropriate system prompt based on kb parameter
    let systemPrompt = systemPromptFor(selectedKb, selectedMode);

    // Add context and citation policy if we have confident chunks
    if (hasConfidentChunks) {
      const contextBlock = buildContextBlock(chunks);
      
      systemPrompt += `\n\nCONTEXT:\n${contextBlock}\n\nANSWER POLICY:\n- Use ONLY the provided KB context when possible.\n- Cite inline like [1], [2] and include a short "Sources:" list of the cited urls at the end.\n- If the user asks something outside the KB or retrieval confidence is low, say so briefly and ask a clarifying question. Do not generate generic best-practice lists without context.\n- Be concise, specific, and product-aware. No platitudes.`;
    } else {
      // Low confidence retrieval - ask clarifying question
      const lowConfidenceResponse = {
        reply: `Hi! I'm Winston, your AI assistant. I can help you with questions about Winston Chat AI, WeRule mentorship, or portfolio projects. What would you like to know?`,
        mode: selectedMode,
        switchMode: 'assistant',
        lowConfidence: true
      };
      
      return NextResponse.json(lowConfidenceResponse, { headers: corsHeaders });
    }

    // Log user message and system prompt
    console.log('Chat Log:', {
      message: lastMessage,
      role: 'user',
      mode: selectedMode,
      kb: selectedKb,
      contextChunks: chunks.length,
      confidentChunks: chunks.filter(c => c.score >= MIN_SCORE).length,
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

    // Get response from OpenAI with optimized parameters
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openAIMessages,
      temperature: 0.3,
      top_p: 0.9,
      presence_penalty: 0,
      frequency_penalty: 0,
    });

    let reply = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response.';

    // Check if response has citations (guardrail against generic filler)
    const hasCitations = /\[\d+\]/.test(reply);
    
    if (!hasCitations && hasConfidentChunks) {
      // Retry with stronger instruction if no citations
      console.log('[Guardrail] No citations found, retrying with stronger instruction');
      
      const strongerPrompt = systemPrompt + '\n\nCRITICAL: No general best-practice lists. Use KB context or ask clarifying question.';
      
      const retryMessages = [
        { role: 'system' as const, content: strongerPrompt },
        ...validMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];
      
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: retryMessages,
        temperature: 0.3,
        top_p: 0.9,
        presence_penalty: 0,
        frequency_penalty: 0,
      });
      
      reply = retryCompletion.choices[0]?.message?.content || reply;
      
      // If still no citations, return low confidence message
      if (!/\[\d+\]/.test(reply)) {
        reply = `I don't have a confident match for that in this knowledge base. Do you want to ask about Winston Chat (features, embedding, pricing, setup), or should I switch to general assistant mode for broader guidance?`;
      }
    }

    // Log assistant reply
    console.log('Chat Log:', {
      message: reply,
      role: 'assistant',
      mode: selectedMode,
      hasCitations: /\[\d+\]/.test(reply),
      chunksUsed: chunks.length
    });

    return NextResponse.json({ 
      reply, 
      mode: selectedMode,
      chunksUsed: chunks.length,
      confidentRetrieval: hasConfidentChunks
    }, { headers: corsHeaders });
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
