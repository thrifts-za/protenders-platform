// Simple in-memory rate limiter suitable for dev and single-instance runtime.
// For production, replace with a shared store (e.g., Redis/Upstash).

type BucketKey = string;

type Entry = {
  count: number;
  resetAt: number; // epoch ms
};

const globalStore = globalThis as unknown as { __RATE_LIMIT_STORE?: Map<BucketKey, Entry> };
const store: Map<BucketKey, Entry> = globalStore.__RATE_LIMIT_STORE || new Map();
if (!globalStore.__RATE_LIMIT_STORE) globalStore.__RATE_LIMIT_STORE = store;

export interface RateLimitOptions {
  key: string; // unique key (e.g., ip:path-bucket)
  windowMs: number; // window in milliseconds
  max: number; // max requests per window
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number; // epoch ms
  limit: number;
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(opts.key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    store.set(opts.key, { count: 1, resetAt });
    return { limited: false, remaining: opts.max - 1, resetAt, limit: opts.max };
  }

  if (entry.count >= opts.max) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt, limit: opts.max };
  }

  entry.count += 1;
  store.set(opts.key, entry);
  return { limited: false, remaining: opts.max - entry.count, resetAt: entry.resetAt, limit: opts.max };
}

export function parseWindow(s: string | undefined, fallbackMs: number): number {
  if (!s) return fallbackMs;
  // supports m (minutes), s (seconds)
  const m = /^\s*(\d+)\s*([sm])\s*$/i.exec(s);
  if (!m) return fallbackMs;
  const val = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 'm') return val * 60_000;
  if (unit === 's') return val * 1_000;
  return fallbackMs;
}

