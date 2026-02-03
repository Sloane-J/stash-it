// src/middleware/auth.ts

import { createMiddleware } from "hono/factory";
import { validateSession } from "../lib/auth";
import type { Env } from "../lib/db";

// Authentication middleware
export const requireAuth = createMiddleware<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>(async (c, next) => {
  // Read session ID from cookie
  const sessionId = c.req.cookie("auth_session") ?? null;

  // Validate session against database
  const session = await validateSession(c.env, sessionId);

  // No session or expired session
  if (!session) {
    return c.json({ error: "Unauthorized - Please sign in" }, 401);
  }

  // Make session data available to routes
  c.set("session", session);
  c.set("userId", session.userId);

  // Continue to the next middleware/handler
  await next();
});
