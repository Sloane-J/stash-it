import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import snippetRoutes from "./routes/snippets";
import tagRoutes from "./routes/tags";
import collectionRoutes from "./routes/collections";
import imageRoutes from "./routes/images";

const app = new Hono();

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

// Logger
app.use("/*", logger());

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Stash It API v1.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.route("/api/auth", authRoutes);
app.route("/api", userRoutes);
app.route("/api/snippets", snippetRoutes);
app.route("/api/tags", tagRoutes);
app.route("/api/collections", collectionRoutes);
app.route('/api/images', imageRoutes); // Add this

// Error handlers
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

// Start server
const port = process.env.PORT || 3000;
console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};