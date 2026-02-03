// src/index.ts

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth } from "./lib/auth";
import type { Env } from "./lib/db";
import collectionRoutes from "./routes/collections";
import imageRoutes from "./routes/images";
import snippetRoutes from "./routes/snippets";
import tagRoutes from "./routes/tags";
import userRoutes from "./routes/user";

// Create Hono app with proper typing
const app = new Hono<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>();

// --- Middleware ---

// CORS
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/*", logger());

// CSRF protection middleware
app.use("/*", async (c, next) => {
  const method = c.req.method;

  // Only protect state-changing requests
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    const origin = c.req.header("Origin");
    const frontendUrl = c.env.FRONTEND_URL;

    if (!origin || !frontendUrl || origin !== frontendUrl) {
      return c.json({ error: "Invalid request origin" }, 403);
    }
  }

  await next();
});

// --- Routes ---

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Stash It API v1.0",
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || "development",
  });
});

// Auth routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Application routes
app.route("/api", userRoutes);
app.route("/api/snippets", snippetRoutes);
app.route("/api/tags", tagRoutes);
app.route("/api/collections", collectionRoutes);
app.route("/api/images", imageRoutes);

// --- Error Handling ---
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: err.message,
    },
    500,
  );
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
