import { Hono } from "hono";
import type { Env } from "../lib/db";
import { requireAuth } from "../middleware/auth";

// Pass Env type for full TypeScript support
const router = new Hono<{
	Bindings: Env["Bindings"];
	Variables: Env["Variables"];
}>();

// Get current authenticated user
// The requireAuth middleware runs first, so we know user is authenticated
router.get("/me", requireAuth, (c) => {
	// c.var.user is now fully typed! No red squiggly lines
	const user = c.var.user;

	return c.json({
		user: user,
	});
});

export default router;
