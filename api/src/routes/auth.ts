// src/routes/auth.ts
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { users, verificationTokens } from "../../db/schema";
import { createSession, invalidateSession } from "../lib/auth";
import { getAuthDb } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/password";
import { sendEmail } from "../lib/email";

const authRoutes = new Hono();

const SESSION_COOKIE_NAME = "auth_session";

// -----------------------------
// Sign up with email + password
// -----------------------------
authRoutes.post("/sign-up/email", async (c) => {
  const body = await c.req.json();
  const { email, password, name } = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).optional(),
    })
    .parse(body);

  const db = getAuthDb(c.env);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) return c.json({ error: "Email already in use" }, 400);

  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    email,
    password: hashedPassword,
    name,
  });

  // Generate verification token
  const token = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

  await db.insert(verificationTokens).values({
    id: crypto.randomUUID(),
    identifier: email,
    token,
    expiresAt,
  });

  // Send verification email
  const frontendUrl = c.env.FRONTEND_URL;
  await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: `<p>Hi ${name || email}, please verify your email by clicking the link below:</p>
           <a href="${frontendUrl}/verify?token=${token}">Verify Email</a>`,
  });

  return c.json({ message: "User created, verification email sent" }, 201);
});

// -----------------------------
// Email verification
// -----------------------------
authRoutes.get("/verify", async (c) => {
  const token = c.req.query("token");
  if (!token) return c.json({ error: "Token missing" }, 400);

  const db = getAuthDb(c.env);
  const record = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!record || record.expiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  // Mark user as verified
  await db
    .update(users)
    .set({ emailVerified: 1 })
    .where(eq(users.email, record.identifier));

  // Delete token
  await db.delete(verificationTokens).where(eq(verificationTokens.id, record.id));

  return c.json({ message: "Email verified successfully" });
});

// -----------------------------
// Forgot password
// -----------------------------
authRoutes.post("/forgot-password", async (c) => {
  const { email } = z.object({ email: z.string().email() }).parse(await c.req.json());
  const db = getAuthDb(c.env);

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return c.json({ message: "If that email exists, a reset link was sent" });

  // Generate reset token
  const token = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

  await db.insert(verificationTokens).values({
    id: crypto.randomUUID(),
    identifier: email,
    token,
    expiresAt,
  });

  // Send reset email
  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${c.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>`,
  });

  return c.json({ message: "If that email exists, a reset link was sent" });
});

// -----------------------------
// Reset password
// -----------------------------
authRoutes.post("/reset-password", async (c) => {
  const { token, password } = z
    .object({ token: z.string(), password: z.string().min(8) })
    .parse(await c.req.json());

  const db = getAuthDb(c.env);

  const record = await db.query.verificationTokens.findFirst({ where: eq(verificationTokens.token, token) });
  if (!record || record.expiresAt < Math.floor(Date.now() / 1000)) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  const hashedPassword = await hashPassword(password);

  await db.update(users).set({ password: hashedPassword }).where(eq(users.email, record.identifier));

  await db.delete(verificationTokens).where(eq(verificationTokens.id, record.id));

  return c.json({ message: "Password reset successfully" });
});

export default authRoutes;
