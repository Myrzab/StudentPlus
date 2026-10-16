import { createHash } from "node:crypto";

export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const RATE_LIMIT_MAX_REQUESTS = 10;

export function evaluateRateLimit(state, now = Date.now()) {
  if (state?.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.blockedUntil - now) / 1_000),
      state,
    };
  }

  const timestamps = (state?.timestamps || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1_000
      ),
      state: { timestamps, blockedUntil: 0 },
    };
  }

  timestamps.push(now);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    state: { timestamps, blockedUntil: 0 },
  };
}

export function createMemoryRateLimiter() {
  const clients = new Map();
  let lastPrunedAt = 0;

  return (ip, now = Date.now()) => {
    if (!ip) {
      throw new Error("A client IP address is required for rate limiting.");
    }

    if (now - lastPrunedAt >= RATE_LIMIT_WINDOW_MS) {
      for (const [clientIp, state] of clients) {
        const isBlocked = state.blockedUntil > now;
        const hasRecentRequests = state.timestamps.some(
          (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
        );

        if (!isBlocked && !hasRecentRequests) {
          clients.delete(clientIp);
        }
      }

      lastPrunedAt = now;
    }

    const result = evaluateRateLimit(clients.get(ip), now);
    clients.set(ip, result.state);
    return result;
  };
}

export function createBlobRateLimiter(store) {
  return async (ip, now = Date.now()) => {
    if (!ip) {
      throw new Error("A client IP address is required for rate limiting.");
    }

    const key = createHash("sha256").update(ip).digest("hex");

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const current = await store.getWithMetadata(key, { type: "json" });
      const result = evaluateRateLimit(current?.data, now);

      if (!result.allowed && current) {
        return result;
      }

      if (current && !current.etag) {
        throw new Error("Rate limit state is missing its storage version.");
      }

      const write = await store.setJSON(key, result.state, current
        ? { onlyIfMatch: current.etag }
        : { onlyIfNew: true });

      if (write.modified) {
        return result;
      }
    }

    throw new Error("Could not update rate limit state after repeated conflicts.");
  };
}
