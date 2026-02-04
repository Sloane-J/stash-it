import { createMiddleware } from "hono/factory";
import type { Env } from "../lib/db";

/**
 * Simple in-memory rate limiter for auth endpoints.
 * Designed to slow down brute-force login attempts.
 *
 * NOTE:
 * - This is per-worker memory (resets on deploy / cold start)
 * - Good baseline protection
 * - Can be replaced later with KV / Durable Objects for stronger guarantees
 */

type AttemptRecord = {
  count: number;
  lastAttempt: number;
};

const attempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 1000 * 60 * 10; // 10 minutes
const BLOCK_MS = 1000 * 60 * 15; // 15 minutes

export const rateLimitAuth = createMiddleware<{
  Bindings: Env["Bindings"];
}>(async (c, next) => {
  const ip =
    c.req.header("CF-Connecting-IP") ??
    c.req.header("X-Forwarded-For") ??
    "unknown";

  const now = Date.now();
  const record = attempts.get(ip);

  if (record) {
    // Still blocked
    if (record.count >= MAX_ATTEMPTS) {
      const timeSinceLast = now - record.lastAttempt;

      if (timeSinceLast < BLOCK_MS) {
        return c.json(
          { error: "Too many attempts. Please try again later." },
          429,
        );
      }

      // Reset after block window
      attempts.delete(ip);
    }

    // Reset window if expired
    if (now - record.lastAttempt > WINDOW_MS) {
      attempts.delete(ip);
    }
  }

  // Track attempt AFTER request finishes
  try {
    await next();
  } finally {
    // Only count failed auth attempts
    if (c.res.status === 401) {
      const existing = attempts.get(ip);

      if (!existing) {
        attempts.set(ip, { count: 1, lastAttempt: now });
      } else {
        existing.count += 1;
        existing.lastAttempt = now;
      }
    }
  }
});
