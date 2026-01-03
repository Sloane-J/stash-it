import { createMiddleware } from "hono/factory";
import { createAuth } from "../lib/auth";
import type { Env } from "../lib/db";

// Authentication middleware - protects routes
export const requireAuth = createMiddleware<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>(async (c, next) => {
  // Create Better Auth instance with current environment
  const auth = createAuth(c.env);

  // Better Auth reads the cookie/header automatically from headers
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  // If no session, return 401
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized - Please sign in" }, 401);
  }

  // Add user info to context for use in routes
  c.set("userId", session.user.id);
  c.set("user", session.user); // Full user object for type safety

  // TODO: Add userDbBinding lookup here later
  // This will query AUTH_DB to find which D1 database belongs to this user
  // const authDb = getAuthDb(c.env);
  // const userRecord = await authDb.query.users.findFirst({
  //   where: eq(schema.users.id, session.user.id)
  // });
  // c.set("userDbBinding", userRecord?.databaseId || "");

  // Continue to the next middleware/handler
  await next();
});