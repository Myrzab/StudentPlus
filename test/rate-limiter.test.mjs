import assert from "node:assert/strict";
import test from "node:test";
import {
  createBlobRateLimiter,
  createMemoryRateLimiter,
  RATE_LIMIT_COOLDOWN_MS,
  RATE_LIMIT_WINDOW_MS,
} from "../js/rate-limiter.mjs";

test("allows two requests, then blocks the IP for one hour", () => {
  const checkRateLimit = createMemoryRateLimiter();
  const ip = "192.0.2.1";
  const now = 10_000;

  assert.equal(checkRateLimit(ip, now).allowed, true);
  assert.equal(checkRateLimit(ip, now + 100).allowed, true);

  const limited = checkRateLimit(ip, now + 200);
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, RATE_LIMIT_COOLDOWN_MS / 1_000);

  const stillLimited = checkRateLimit(ip, now + 1_000);
  assert.equal(stillLimited.allowed, false);
  assert.equal(
    stillLimited.retryAfterSeconds,
    Math.ceil((RATE_LIMIT_COOLDOWN_MS - 800) / 1_000)
  );

  assert.equal(
    checkRateLimit(ip, now + 200 + RATE_LIMIT_COOLDOWN_MS).allowed,
    true
  );
});

test("expires requests outside the one-second sliding window", () => {
  const checkRateLimit = createMemoryRateLimiter();
  const ip = "192.0.2.2";
  const now = 20_000;

  assert.equal(checkRateLimit(ip, now).allowed, true);
  assert.equal(checkRateLimit(ip, now + 1).allowed, true);
  assert.equal(
    checkRateLimit(ip, now + RATE_LIMIT_WINDOW_MS).allowed,
    true
  );
});

test("keeps rate limits independent for each IP", () => {
  const checkRateLimit = createMemoryRateLimiter();

  assert.equal(checkRateLimit("192.0.2.3", 30_000).allowed, true);
  assert.equal(checkRateLimit("192.0.2.3", 30_001).allowed, true);
  assert.equal(checkRateLimit("192.0.2.3", 30_002).allowed, false);
  assert.equal(checkRateLimit("192.0.2.4", 30_002).allowed, true);
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
    Array.from({ length: 3 }, () => checkRateLimit("192.0.2.5", 40_000))
  );

  assert.equal(results.filter((result) => result.allowed).length, 2);
  assert.equal(results.filter((result) => !result.allowed).length, 1);
});
