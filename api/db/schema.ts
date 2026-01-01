import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// PER-USER DATABASE SCHEMA
// ============================================
// NOTE: This schema is for EACH user's individual database
// Auth tables (users, sessions, accounts) remain in a SEPARATE shared database
// ============================================

// Snippets table - stores all research content
// NO userId - entire database belongs to one user
export const snippets = sqliteTable(
  "snippets",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(), // 'quote' | 'note' | 'source' | 'summary' | 'link'
    content: text("content").notNull(),
    metadata: text("metadata", { mode: "json" }), // Flexible JSON field for type-specific data
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    typeIdx: index("snippets_type_idx").on(table.type),
    createdAtIdx: index("snippets_created_at_idx").on(table.createdAt),
  }),
);

// Tags table - NO userId
export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(), // Unique per user's database
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    nameIdx: index("tags_name_idx").on(table.name),
  }),
);

// Snippet-Tags junction table (many-to-many)
export const snippetTags = sqliteTable(
  "snippet_tags",
  {
    snippetId: text("snippet_id")
      .notNull()
      .references(() => snippets.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.snippetId, table.tagId] }),
    snippetIdIdx: index("snippet_tags_snippet_id_idx").on(table.snippetId),
    tagIdIdx: index("snippet_tags_tag_id_idx").on(table.tagId),
  }),
);

// Collections table - NO userId
export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
);

// Snippet-Collections junction table (many-to-many)
export const snippetCollections = sqliteTable(
  "snippet_collections",
  {
    snippetId: text("snippet_id")
      .notNull()
      .references(() => snippets.id, { onDelete: "cascade" }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.snippetId, table.collectionId] }),
    snippetIdIdx: index("snippet_collections_snippet_id_idx").on(
      table.snippetId,
    ),
    collectionIdIdx: index("snippet_collections_collection_id_idx").on(
      table.collectionId,
    ),
  }),
);

// Images table - stores metadata for ImageKit uploads
// NO userId
export const images = sqliteTable(
  "images",
  {
    id: text("id").primaryKey(),
    snippetId: text("snippet_id").references(() => snippets.id, {
      onDelete: "cascade",
    }),
    imagekitFileId: text("imagekit_file_id").notNull(), // ImageKit file ID
    imagekitUrl: text("imagekit_url").notNull(), // Public URL
    fileSize: integer("file_size").notNull(), // In bytes
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    snippetIdIdx: index("images_snippet_id_idx").on(table.snippetId),
  }),
);

// ============================================
// AUTH SCHEMA (SEPARATE SHARED DATABASE)
// ============================================
// These tables will be in a DIFFERENT database called "stashit-auth"
// Keep them here for reference, but they won't be in user databases
// ============================================

// Users table - managed by Better Auth (SHARED DATABASE ONLY)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  name: text("name"),
  password: text("password"), // Hashed password for email/password auth
  databaseId: text("database_id"), // NEW: References user's D1 database ID
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Sessions table - managed by Better Auth (SHARED DATABASE ONLY)
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

// Accounts table - for social login providers (SHARED DATABASE ONLY)
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(), // Provider's user ID
    providerId: text("provider_id").notNull(), // 'github', 'google', etc.
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    password: text("password"), // For email/password auth (hashed)
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
    providerAccountIdx: index("accounts_provider_account_idx").on(
      table.providerId,
      table.accountId,
    ),
  }),
);

// Verification tokens - for email verification (SHARED DATABASE ONLY)
export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // Email or user ID
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    identifierIdx: index("verification_tokens_identifier_idx").on(
      table.identifier,
    ),
  }),
);