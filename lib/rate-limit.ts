/** In-memory sliding window; suitable for single-node dev/small deploys. Use Redis for multi-instance. */

const buckets = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;

export function consumeSubmitRateToken(key: string): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.windowStart > WINDOW_MS) {
    b = { count: 0, windowStart: now };
    buckets.set(key, b);
  }
  b.count += 1;
  return b.count <= MAX_PER_WINDOW;
}
