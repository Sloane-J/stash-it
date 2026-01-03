import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { Env } from "../lib/db";

// Authentication middleware - protects routes
export const requireAuth = createMiddleware<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>(async (c, next) => {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  // If no session, return 401
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized - Please sign in" }, 401);
  }

  // Add user info to context for use in routes
  // TypeScript now validates these against Env["Variables"]
  c.set("userId", session.user.id);
  c.set("user", {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    emailVerified: session.user.emailVerified,
  });

  // TODO: Add userDbBinding lookup here later
  // This will query AUTH_DB to find which D1 database belongs to this user
  // c.set("userDbBinding", `USER_DB_${session.user.id}`);

  // Continue to the next middleware/handler
  await next();
});