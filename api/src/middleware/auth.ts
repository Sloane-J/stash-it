import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

// Type for authenticated context
type AuthVariables = {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
  };
};

// Authentication middleware - protects routes
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    // If no session, return 401
    if (!session || !session.user) {
      return c.json({ error: "Unauthorized - Please sign in" }, 401);
    }

    // Add user info to context for use in routes
    c.set("userId", session.user.id);
    c.set("user", {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified,
    });

    // Continue to the next middleware/handler
    await next();
  },
);
