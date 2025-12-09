import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'turso',  
  dbCredentials: {
    url: 'file:data/stashit-local.db',  
  }
} satisfies Config