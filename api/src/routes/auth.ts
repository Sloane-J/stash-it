import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { users } from "../../db/schema";
import { createSession, invalidateSession } from "../lib/auth";
import type { Env } from "../lib/db";
import { getAuthDb } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/password"; // assume you already have these

const authRoutes = new Hono<{
	Bindings: Env["Bindings"];
	Variables: Env["Variables"];
}>();

const SESSION_COOKIE_NAME = "auth_session";

// -----------------------------
// Sign in with email + password
// -----------------------------
authRoutes.post("/sign-in/email", async (c) => {
	const { email, password } = await c.req.json<{
		email: string;
		password: string;
	}>();

	const db = getAuthDb(c.env);

	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!user || !user.password) {
		return c.json({ error: "Invalid credentials" }, 401);
	}

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) {
		return c.json({ error: "Invalid credentials" }, 401);
	}

	const { sessionId, expiresAt } = await createSession(c.env, user.id);

	c.header(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Path=/; SameSite=Lax; ${
			c.env.NODE_ENV === "production" ? "Secure;" : ""
		} Expires=${new Date(expiresAt).toUTCString()}`,
	);

	return c.json({
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
		},
	});
});

// -----------------------------
// Sign up with email + password
// -----------------------------
authRoutes.post("/sign-up/email", async (c) => {
	const { email, password, name } = await c.req.json<{
		email: string;
		password: string;
		name?: string;
	}>();

	const db = getAuthDb(c.env);

	const existing = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (existing) {
		return c.json({ error: "Email already in use" }, 400);
	}

	const hashedPassword = await hashPassword(password);
	const userId = crypto.randomUUID();

	await db.insert(users).values({
		id: userId,
		email,
		password: hashedPassword,
		name,
	});

	const { sessionId, expiresAt } = await createSession(c.env, userId);

	c.header(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Path=/; SameSite=Lax; ${
			c.env.NODE_ENV === "production" ? "Secure;" : ""
		} Expires=${new Date(expiresAt).toUTCString()}`,
	);

	return c.json({
		user: {
			id: userId,
			email,
			name,
		},
	});
});

// -----------------------------
// Sign out
// -----------------------------
authRoutes.post("/sign-out", async (c) => {
	const sessionId = c.req.cookie(SESSION_COOKIE_NAME);

	if (sessionId) {
		await invalidateSession(c.env, sessionId);
	}

	c.header(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; ${
			c.env.NODE_ENV === "production" ? "Secure;" : ""
		}`,
	);

	return c.json({ success: true });
});

export default authRoutes;
