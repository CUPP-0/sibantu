const buckets = new Map();
let requestsSinceCleanup = 0;

export function checkRateLimit(key, { limit = 8, windowMs = 60_000 } = {}) {
  const now = Date.now();
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 256) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    requestsSinceCleanup = 0;
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}
