import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

// Type for Cloudflare Worker environment bindings and context variables
export type Env = {
  Bindings: {
    AUTH_DB: D1Database;  // Shared auth database
    DB: D1Database;       // Template database (for creating new user DBs)
    // ImageKit credentials
    IMAGEKIT_PUBLIC_KEY: string;
    IMAGEKIT_PRIVATE_KEY: string;
    IMAGEKIT_URL_ENDPOINT: string;
    // Other environment variables
    NODE_ENV: string;
    // User databases accessed dynamically
    [key: string]: any;
  };
  Variables: {
    user: {
      id: string;
      email: string;
      name: string | null;
      emailVerified: boolean;
    };
    userId: string;
    userDbBinding: string;  // The D1 binding name for this user's database
  };
};

// Create database instance for AUTH_DB (shared)
export function getAuthDb(env: Env["Bindings"]) {
  return drizzle(env.AUTH_DB, { schema });
}

// Create database instance for user's database
// The binding name will be something like "USER_DB_xyz123"
export function getUserDb(env: Env["Bindings"], dbBinding: string) {
  const userDatabase = env[dbBinding] as D1Database;
  if (!userDatabase) {
    throw new Error(`Database binding "${dbBinding}" not found`);
  }
  return drizzle(userDatabase, { schema });
}

// Export schema for use in queries
export { schema };