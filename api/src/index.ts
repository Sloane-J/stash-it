import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// CORS - allows frontend to call API
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"], // Update with your frontend URL
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Logger - logs all requests to console
app.use("/*", logger());

// Health check - confirms server is running
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Stash It API v1.0",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
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

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Start server
const port = process.env.PORT || 3000;
console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
