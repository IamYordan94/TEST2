import crypto from 'crypto';

export function hmacSHA256Hex(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function signMatchPayload(input: {
  userId: string;
  mode: 'endless' | 'duel';
  value: number;
  seed: string;
  endAtMs: number;
}, secret: string): string {
  const payload = `${input.userId}|${input.mode}|${input.value}|${input.seed}|${input.endAtMs}`;
  return hmacSHA256Hex(secret, payload);
}

export function verifyMatchSignature(input: {
  userId: string;
  mode: 'endless' | 'duel';
  value: number;
  seed: string;
  endAtMs: number;
  signature: string;
}, secret: string): boolean {
  const expected = signMatchPayload(input, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
}

