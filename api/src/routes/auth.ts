import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import type { Env } from "../lib/db";

// Auth routes with proper typing
const authRoutes = new Hono<{ 
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>();

// Better Auth handler - handles all auth endpoints
// POST /api/auth/sign-in/email
// POST /api/auth/sign-up/email
// POST /api/auth/sign-out
// GET  /api/auth/callback/google
// GET  /api/auth/session
// etc.
authRoutes.on(["POST", "GET"], "/*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

export default authRoutes;