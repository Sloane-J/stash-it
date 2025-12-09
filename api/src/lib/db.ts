import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../../db/schema";

// Create LibSQL client (works with local SQLite files)
const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/stashit-local.db",
  // authToken not needed for local file
});

// Initialize Drizzle with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };
