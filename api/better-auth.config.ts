import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

// This file is ONLY used by Better Auth CLI to generate schema
// It won't run in Workers runtime

const mockDb = drizzle({} as any, { schema });

export const auth = betterAuth({
	database: drizzleAdapter(mockDb, {
		provider: "sqlite",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verificationTokens,
		},
	}),
	baseURL: "http://localhost:8787",
	secret: "temp-secret-for-cli-only",
	emailAndPassword: {
		enabled: true,
	},
});
