import { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '60');

export function getClientIdentifier(req: NextRequest): string {
  return (
    req.headers.get('x-api-key') ||
    req.headers.get('x-forwarded-for') ||
    req.ip ||
    'unknown'
  );
}

export function authenticate(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  const expected = process.env.API_KEY;
  if (!expected) return false;
  return apiKey === expected;
}

export function rateLimit(id: string): boolean {
  const now = Date.now();
  const record = requests.get(id);
  if (!record || now - record.windowStart > WINDOW_MS) {
    requests.set(id, { count: 1, windowStart: now });
    return true;
  }
  if (record.count < MAX_REQUESTS) {
    record.count++;
    return true;
  }
  console.warn(`Rate limit exceeded for ${id}`);
  return false;
}

