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

// Snippets table
export const snippets = sqliteTable(
  "snippets",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    content: text("content").notNull(),
    metadata: text("metadata", { mode: "json" }),
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

// Tags table
export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    nameIdx: index("tags_name_idx").on(table.name),
  }),
);

// Snippet-Tags junction table
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

// Collections table
export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Snippet-Collections junction table
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

// Images table
export const images = sqliteTable(
  "images",
  {
    id: text("id").primaryKey(),
    snippetId: text("snippet_id").references(() => snippets.id, {
      onDelete: "cascade",
    }),
    imagekitFileId: text("imagekit_file_id").notNull(),
    imagekitUrl: text("imagekit_url").notNull(),
    fileSize: integer("file_size").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    snippetIdIdx: index("images_snippet_id_idx").on(table.snippetId),
  }),
);

// ============================================
// AUTH / IDENTITY SCHEMA (Lucia-style)
// ============================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  name: text("name"),
  password: text("password"),
  databaseId: text("database_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

// OAuth accounts (optional)
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    password: text("password"),
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

// ============================================
// EMAIL VERIFICATION & PASSWORD RESET
// ============================================

export const emailVerificationTokens = sqliteTable(
  "email_verification_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("email_verification_user_id_idx").on(table.userId),
  }),
);

export const passwordResetTokens = sqliteTable(
  "password_reset_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("password_reset_user_id_idx").on(table.userId),
  }),
);
