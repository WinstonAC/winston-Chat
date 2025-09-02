import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickAllowedOrigin } from './_cors';

test('allows exact domain match', () => {
  const origin = 'https://squarespace.com';
  const result = pickAllowedOrigin(origin, [], ['.squarespace.com']);
  assert.equal(result, origin);
});

test('allows subdomain match with preceding dot', () => {
  const origin = 'https://foo.squarespace.com';
  const result = pickAllowedOrigin(origin, [], ['.squarespace.com']);
  assert.equal(result, origin);
});

test('rejects malicious suffix match without dot boundary', () => {
  const origin = 'https://malicious-squarespace.com';
  const result = pickAllowedOrigin(origin, [], ['.squarespace.com']);
  assert.equal(result, null);
});
