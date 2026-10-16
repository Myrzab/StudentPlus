import assert from "node:assert/strict";
import test from "node:test";
import {
  createBlobRateLimiter,
  createMemoryRateLimiter,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "../js/rate-limiter.mjs";

test("allows ten requests per IP, then blocks until the oldest request expires", () => {
  const checkRateLimit = createMemoryRateLimiter();
  const ip = "192.0.2.1";
  const now = 10_000;

  assert.equal(RATE_LIMIT_MAX_REQUESTS, 10);
  assert.equal(RATE_LIMIT_WINDOW_MS, 24 * 60 * 60 * 1_000);

  for (let request = 0; request < RATE_LIMIT_MAX_REQUESTS; request += 1) {
    assert.equal(checkRateLimit(ip, now + request * 100).allowed, true);
  }

  const limited = checkRateLimit(ip, now + RATE_LIMIT_MAX_REQUESTS * 100);
  assert.equal(limited.allowed, false);
  assert.equal(
    limited.retryAfterSeconds,
    Math.ceil((RATE_LIMIT_WINDOW_MS - RATE_LIMIT_MAX_REQUESTS * 100) / 1_000)
  );

  const stillLimited = checkRateLimit(ip, now + 60 * 60 * 1_000);
  assert.equal(stillLimited.allowed, false);
  assert.equal(
    stillLimited.retryAfterSeconds,
    Math.ceil((RATE_LIMIT_WINDOW_MS - 60 * 60 * 1_000) / 1_000)
  );

  assert.equal(
    checkRateLimit(ip, now + RATE_LIMIT_WINDOW_MS).allowed,
    true
  );
});

test("keeps rate limits independent for each IP", () => {
  const checkRateLimit = createMemoryRateLimiter();

  for (let request = 0; request < RATE_LIMIT_MAX_REQUESTS; request += 1) {
    assert.equal(checkRateLimit("192.0.2.3", 30_000 + request).allowed, true);
  }

  assert.equal(checkRateLimit("192.0.2.3", 30_010).allowed, false);
  assert.equal(checkRateLimit("192.0.2.4", 30_010).allowed, true);
});

test("atomically counts parallel requests in persistent storage", async () => {
  const records = new Map();
  const store = {
    async getWithMetadata(key) {
      const record = records.get(key);

      return record
        ? {
            data: structuredClone(record.data),
            etag: record.etag,
          }
        : null;
    },
    async setJSON(key, data, conditions) {
      const current = records.get(key);

      if (conditions.onlyIfNew && current) {
        return { modified: false };
      }

      if (conditions.onlyIfMatch && conditions.onlyIfMatch !== current?.etag) {
        return { modified: false };
      }

      records.set(key, {
        data: structuredClone(data),
        etag: String(Number(current?.etag || 0) + 1),
      });

      return { modified: true };
    },
  };

  const checkRateLimit = createBlobRateLimiter(store);
  const results = await Promise.all(
    Array.from({ length: RATE_LIMIT_MAX_REQUESTS + 1 }, () =>
      checkRateLimit("192.0.2.5", 40_000)
    )
  );

  assert.equal(
    results.filter((result) => result.allowed).length,
    RATE_LIMIT_MAX_REQUESTS
  );
  assert.equal(results.filter((result) => !result.allowed).length, 1);
});
