import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";

const router = new Hono();

// Get current authenticated user
// The requireAuth middleware runs first, so we know user is authenticated
router.get("/me", requireAuth, (c) => {
  // Access user from context (set by middleware)
  const user = c.var.user;

  return c.json({
    user: user,
  });
});

export default router;
