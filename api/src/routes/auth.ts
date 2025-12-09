import { Hono } from "hono";
import { auth } from "../lib/auth";

const router = new Hono();

// Better Auth handler - handles ALL auth requests
router.all("/*", async (c) => {
  return auth.handler(c.req.raw);
});

export default router;