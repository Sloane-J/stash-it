// src/lib/auth.ts

import { eq } from "drizzle-orm";
import { getAuthDb } from "./db";
import type { Env } from "./db";
import { sessions } from "../../db/schema";

// How long a session should live (30 days)
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;

/**
 * Creates a new session for a user
 * - Generates a random session ID
 * - Stores it in the database with an expiry timestamp
 */
export const createSession = async (
  env: Env["Bindings"],
  userId: string,
) => {
  const db = getAuthDb(env);

  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_DURATION;

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return {
    sessionId,
    expiresAt,
  };
};

/**
 * Validates a session from a cookie value
 * - Checks if the session exists
 * - Ensures it has not expired
 */
export const validateSession = async (
  env: Env["Bindings"],
  sessionId: string | null,
) => {
  if (!sessionId) return null;

  const db = getAuthDb(env);

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    return null;
  }

  // Session expired
  if (session.expiresAt <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return session;
};

/**
 * Invalidates a session (logout)
 * - Deletes the session row from the database
 */
export const invalidateSession = async (
  env: Env["Bindings"],
  sessionId: string,
) => {
  const db = getAuthDb(env);

  await db.delete(sessions).where(eq(sessions.id, sessionId));
};
