import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

process.env.API_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'test-key';

const { POST } = require('./route');

function buildRequest(body: any): NextRequest {
  const reqBody = JSON.stringify(body);
  const request = new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': 'test-key',
      host: 'localhost',
    },
    body: reqBody,
  });
  return new NextRequest(request);
}

test('rejects oversized messages', async () => {
  const bigMessage = 'a'.repeat(3000); // >2KB
  const req = buildRequest({ messages: [{ role: 'user', content: bigMessage }] });
  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /too large/i);
});
