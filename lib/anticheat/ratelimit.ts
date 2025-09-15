type Bucket = { tokens: number; resetAt: number };

const store = new Map<string, Bucket>();

export function rateLimit(key: string, max = 10, windowMs = 60_000): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    store.set(key, { tokens: max - 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.tokens <= 0) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.tokens -= 1;
  return { ok: true };
}

