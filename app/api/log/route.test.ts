import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePayload } from './route';

test('rejects empty payload', () => {
  assert.throws(() => validatePayload({}), /Invalid payload/);
});

test('rejects payload with wrong types', () => {
  assert.throws(() => validatePayload({ message: 123 }), /Invalid payload/);
});

test('rejects payload with extra fields', () => {
  assert.throws(() => validatePayload({ message: 'hi', extra: 'nope' }), /Invalid payload/);
});

test('sanitizes control characters', () => {
  const result = validatePayload({ message: 'hi\nthere', userId: 'user\t1' });
  assert.equal(result.message, 'hi there');
  assert.equal(result.userId, 'user 1');
});
