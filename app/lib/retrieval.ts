import fs from 'fs';
import path from 'path';

// Minimum confidence score for retrieval
export const MIN_SCORE = 0.22;

export interface Chunk {
  url: string;
  title: string;
  text: string;
  score: number;
}

// Simple keyword matching for scoring
function calculateScore(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(Boolean);
  const textLower = text.toLowerCase();
  
  let score = 0;
  for (const word of queryWords) {
    if (word.length > 2 && textLower.includes(word)) {
      score += 1;
    }
  }
  
  // Normalize to 0-1 range
  return Math.min(score / queryWords.length, 1.0);
}

// Enhanced retrieval with confidence scoring
export async function getChunks(kb: string, query: string, topN: number = 5): Promise<Chunk[]> {
  try {
    // Read chunks file directly
    const chunksPath = path.join(process.cwd(), 'client-data', `${kb}-chunks.json`);
    
    if (!fs.existsSync(chunksPath)) {
      console.log(`[Retrieval] No chunks file found for KB: ${kb}`);
      return [];
    }
    
    const chunksData = JSON.parse(fs.readFileSync(chunksPath, 'utf8'));
    
    if (!Array.isArray(chunksData)) {
      console.log(`[Retrieval] Invalid chunks data for KB: ${kb}`);
      return [];
    }
    
    // Transform and score chunks
    const chunks: Chunk[] = chunksData.map((chunk: any, index: number) => {
      // Extract title from URL or use a default
      const urlParts = chunk.url.split('/');
      const title = urlParts[urlParts.length - 1] || 'Page';
      
      // Calculate relevance score
      const score = calculateScore(query, chunk.text);
      
      return {
        url: chunk.url,
        title: title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' '),
        text: chunk.text,
        score: score
      };
    });

    // Sort by score and take top N
    const sortedChunks = chunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    // Filter by minimum confidence score
    const confidentChunks = sortedChunks.filter(chunk => chunk.score >= MIN_SCORE);
    
    // Log retrieval results for debugging
    console.log(`[Retrieval] KB: ${kb}, Query: "${query}", Found: ${chunks.length}, Confident: ${confidentChunks.length}`);
    
    return confidentChunks;
  } catch (error) {
    console.error(`[Retrieval Error] KB: ${kb}, Query: "${query}"`, error);
    return [];
  }
}

// Build context block for OpenAI
export function buildContextBlock(chunks: Chunk[]): string {
  if (!chunks || chunks.length === 0) {
    return "No relevant context found.";
  }

  const contextLines = chunks.map((chunk, index) => {
    return `[${index + 1}] ${chunk.title} — ${chunk.url}\n${chunk.text}`;
  });

  return contextLines.join('\n\n');
}

// Check if retrieval has sufficient confidence
export function hasConfidentRetrieval(chunks: Chunk[]): boolean {
  return chunks.length > 0 && chunks.some(chunk => chunk.score >= MIN_SCORE);
}
