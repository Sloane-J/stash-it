// src/middleware/auth.ts

import { createMiddleware } from "hono/factory";
import { validateSession, extendSessionCookie } from "../lib/auth";
import type { Env } from "../lib/db";
import type { Session, User } from "../lib/types";

const SESSION_COOKIE_NAME = "auth_session";

// Authentication middleware with session persistence (Step 10)
export const requireAuth = createMiddleware<{
	Bindings: Env["Bindings"];
	Variables: Env["Variables"] & {
		user: User;
		session: Session;
	};
}>(async (c, next) => {
	// Read session ID from cookie
	const sessionId = c.req.cookie(SESSION_COOKIE_NAME) ?? null;

	// Validate session against database
	const session = await validateSession(c.env, sessionId);

	// No session or expired session
	if (!session) {
		// Clear the cookie
		c.header(
			"Set-Cookie",
			`${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; ${
				c.env.NODE_ENV === "production" ? "Secure;" : ""
			}`,
		);
		return c.json({ error: "Unauthorized - Please sign in" }, 401);
	}

	// Attach user & session to context
	c.set("session", session);
	c.set("user", session.user); // full user object
	c.set("userId", session.user.id); // optional shorthand

	// --- Step 10: Extend cookie if session is fresh ---
	if (session.fresh) {
		const expiresAt = session.expiresAt;
		c.header(
			"Set-Cookie",
			`${SESSION_COOKIE_NAME}=${session.id}; HttpOnly; Path=/; SameSite=Lax; ${
				c.env.NODE_ENV === "production" ? "Secure;" : ""
			} Expires=${new Date(expiresAt).toUTCString()}`,
		);
	}

	// Continue to the next middleware/handler
	await next();
});
