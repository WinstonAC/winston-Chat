import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { systemPromptFor } from '../../lib/prompts';
import { getSiteId, copyBySite } from '../../lib/siteConfig';
import { isHelpIntent } from '../../lib/intents';
import { stripCitations } from '../../lib/sanitize';
import { getChunks, buildContextBlock, hasConfidentRetrieval, MIN_SCORE } from '../../lib/retrieval';
import { corsHeadersFor } from '../_cors';
import { authenticate, getClientIdentifier, rateLimit } from '../_auth';

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
    const host = req.headers.get('host') || '';
    const siteId = getSiteId(host);
    // Handle CORS with new helper
    const origin = req.headers.get('origin');
    const corsHeaders = corsHeadersFor(
      origin,
      process.env.ALLOWED_ORIGINS || "",
      process.env.ALLOWED_SUFFIXES || ""
    );

    const identifier = getClientIdentifier(req);
    if (!authenticate(req)) {
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 401, headers: corsHeaders }
      );
    }
    if (!rateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { messages, mode, kb } = await req.json();
    
    // Map siteId to KB name
    const kbBySite = { demo: 'winstonchat', portfolio: 'william', werule: 'werule' };
    const defaultKb = kbBySite[siteId] || 'winstonchat';
    const selectedKb = (kb || defaultKb).toLowerCase();
    
    console.log(`[KB Selection] Host: ${host}, SiteId: ${siteId}, Selected KB: ${selectedKb}`);
    
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
    
    // Help intents are now handled client-side by the tour system
    // Removed server-side help intent detection to allow client-side tour
    
    // Classify intent if mode is not specified
    const selectedMode = mode || classifyIntent(lastMessage);

    // MODE-BASED LOGIC: Guide uses KB, Assistant uses web search
    if (selectedMode === 'assistant') {
      // Assistant mode: Use web search for real-time information
      const systemPrompt = `You are Winston, a helpful AI assistant. You can help with general questions and provide current information by searching the web. You have access to real-time web search capabilities to find up-to-date information. Be helpful, informative, and conversational. When users ask about current events, recent news, or real-time information, use your web search capabilities to provide accurate, current answers.`;
      
      // Log assistant mode
      console.log('Chat Log:', {
        message: lastMessage,
        role: 'user',
        mode: selectedMode,
        kb: 'N/A (Assistant mode)',
        contextChunks: 0,
        confidentChunks: 0,
        systemPrompt: 'Assistant mode - web search enabled'
      });

      // Get response from OpenAI for assistant mode with web search
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Use GPT-4o which supports web search
        messages: [
          { role: 'system', content: systemPrompt },
          ...validMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
        ],
        tools: [
          {
            type: 'web_search'
          }
        ],
        tool_choice: 'auto', // Let the model decide when to use web search
        temperature: 0.7, // More creative for general assistance
        top_p: 0.9,
        presence_penalty: 0,
        frequency_penalty: 0,
      });

      const reply = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response.';
      
      return NextResponse.json({
        reply,
        mode: selectedMode,
        chunksUsed: 0,
        confidentRetrieval: false
      }, { headers: corsHeaders });
    }

    // Guide mode: Use knowledge base (existing logic)
    // Get relevant chunks from knowledge base
    const chunks = await getChunks(selectedKb, lastMessage, 5);
    const hasConfidentChunks = hasConfidentRetrieval(chunks);

    // Select appropriate system prompt based on kb parameter
    let systemPrompt = systemPromptFor(selectedKb, selectedMode);

    // Add context and citation policy if we have confident chunks
    if (hasConfidentChunks) {
      const contextBlock = buildContextBlock(chunks);
      
      console.log(`[Context Debug] KB: ${selectedKb}, Query: "${lastMessage}"`);
      console.log(`[Context Debug] Chunks: ${chunks.length}, Context length: ${contextBlock.length}`);
      console.log(`[Context Debug] Context preview: ${contextBlock.substring(0, 200)}...`);
      
      // Different citation policies for different KBs
      if (selectedKb === 'werule') {
        // WeRule: Natural conversation, no citations
        systemPrompt += `\n\nCONTEXT:\n${contextBlock}\n\nANSWER POLICY:\n- Use the provided context to give natural, conversational responses about WERULE.\n- Be warm, encouraging, and helpful.\n- No citations or formal formatting needed - just natural conversation.\n- Focus on helping users understand our mentorship programs and how to get involved.`;
      } else {
        // Other KBs: Formal citations required
        systemPrompt += `\n\nCONTEXT:\n${contextBlock}\n\nANSWER POLICY:\n- Use ONLY the provided KB context when possible.\n- ALWAYS cite inline like [1], [2] and include a short "Sources:" list of the cited urls at the end.\n- If the user asks something outside the KB or retrieval confidence is low, say so briefly and ask a clarifying question. Do not generate generic best-practice lists without context.\n- Be concise, specific, and product-aware. No platitudes.\n- CRITICAL: Your response MUST include citations [1], [2], etc. or it will be rejected.\n\nEXAMPLE FORMAT:\nHeijo is a browser-based wellness tool [1] designed to help remote workers prevent burnout [2].\n\nSources:\n[1] https://williamacampbell.com/heijo\n[2] https://williamacampbell.com/work\n\nIMPORTANT: The Context above contains information about Heijo. Use it to answer questions about Heijo.`;
      }
    } else {
      // Low confidence retrieval - still try to provide helpful response
      console.log(`[Low Confidence] KB: ${selectedKb}, Query: "${lastMessage}", Chunks: ${chunks.length}`);
      
      // For portfolio queries, provide a helpful response even without confident chunks
      if (selectedKb === 'william' && (lastMessage.toLowerCase().includes('portfolio') || lastMessage.toLowerCase().includes('project'))) {
        const portfolioResponse = {
          reply: `I can help you learn about William Campbell's portfolio! He's a Product Strategist, Project Manager, and Developer who helps purpose-driven companies ship ideas that matter.

**Recent Projects:**
• **HeyChat** - Custom messaging platform for creator communities (React/Node.js)
• **WeRule** - Mentorship platform for NYC Government/Women.NYC (5,000+ users)
• **Amber Joy Rava** - Spiritual brand ecosystem & business strategy
• **Nexome** - Health tech genomics startup (Founding Product Manager)
• **Sacra Cosmetics** - UK skincare brand digital transformation (14-month project)
• **Adaptlantis** - Berlin change management consultancy website
• **Lengoo** - AI translation platform (4x user growth, 2x ARR)

**Key Expertise:**
• Product Strategy & Roadmapping
• Project Management & Agile Development  
• Full-Stack Development
• UX/UI Design
• Technical Consulting
• Startup & Product Launch

What specific project would you like to know more about?`,
          mode: selectedMode,
          chunksUsed: 0,
          confidentRetrieval: false
        };
        
        return NextResponse.json(portfolioResponse, { headers: corsHeaders });
      }
      
      // Default low confidence response
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
    
    // Only apply guardrail for substantive queries, not conversational ones
    const isConversationalQuery = lastMessage.toLowerCase().match(/^(hello|hi|hey|what|how|who|when|where|why)$/);
    
    if (!hasCitations && hasConfidentChunks && !isConversationalQuery) {
      // Retry with stronger instruction if no citations for substantive queries
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
      
      // If still no citations, return low confidence message (skip for WeRule)
      if (selectedKb !== 'werule' && !/\[\d+\]/.test(reply)) {
        console.log(`[No Citations] AI response: "${reply}"`);
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

    const cleanedReply = stripCitations(reply);

    return NextResponse.json({ 
      reply: cleanedReply, 
      mode: selectedMode,
      chunksUsed: chunks.length,
      confidentRetrieval: hasConfidentChunks
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      {
        status: 500,
        headers: corsHeadersFor(
          req.headers.get('origin'),
          process.env.ALLOWED_ORIGINS || "",
          process.env.ALLOWED_SUFFIXES || ""
        ),
      }
    );
  }
}
