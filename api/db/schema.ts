import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ============================================
// BETTER AUTH TABLES
// ============================================

// Users table - managed by Better Auth
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Sessions table - managed by Better Auth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
}))

// Accounts table - for social login providers (GitHub, Google, etc.)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(), // Provider's user ID
  providerId: text('provider_id').notNull(), // 'github', 'google', etc.
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  password: text('password'), // For email/password auth (hashed)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('accounts_user_id_idx').on(table.userId),
  providerAccountIdx: index('accounts_provider_account_idx').on(table.providerId, table.accountId),
}))

// Verification tokens - for email verification and password reset
export const verificationTokens = sqliteTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // Email or user ID
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  identifierIdx: index('verification_tokens_identifier_idx').on(table.identifier),
}))

// ============================================
// APPLICATION TABLES
// ============================================

// Snippets table - stores all research content
export const snippets = sqliteTable('snippets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'quote' | 'note' | 'source' | 'summary' | 'link'
  content: text('content').notNull(),
  metadata: text('metadata', { mode: 'json' }), // Flexible JSON field for type-specific data
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('snippets_user_id_idx').on(table.userId),
  typeIdx: index('snippets_type_idx').on(table.type),
  createdAtIdx: index('snippets_created_at_idx').on(table.createdAt),
}))

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('tags_user_id_idx').on(table.userId),
  nameIdx: index('tags_name_idx').on(table.name),
}))

// Snippet-Tags junction table (many-to-many)
export const snippetTags = sqliteTable('snippet_tags', {
  snippetId: text('snippet_id').notNull().references(() => snippets.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.snippetId, table.tagId] }),
  snippetIdIdx: index('snippet_tags_snippet_id_idx').on(table.snippetId),
  tagIdIdx: index('snippet_tags_tag_id_idx').on(table.tagId),
}))

// Collections table
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('collections_user_id_idx').on(table.userId),
}))

// Snippet-Collections junction table (many-to-many)
export const snippetCollections = sqliteTable('snippet_collections', {
  snippetId: text('snippet_id').notNull().references(() => snippets.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.snippetId, table.collectionId] }),
  snippetIdIdx: index('snippet_collections_snippet_id_idx').on(table.snippetId),
  collectionIdIdx: index('snippet_collections_collection_id_idx').on(table.collectionId),
}))

// Images table - stores metadata for ImageKit uploads
export const images = sqliteTable('images', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  snippetId: text('snippet_id').references(() => snippets.id, { onDelete: 'cascade' }),
  imagekitFileId: text('imagekit_file_id').notNull(), // ImageKit file ID
  imagekitUrl: text('imagekit_url').notNull(), // Public URL
  fileSize: integer('file_size').notNull(), // In bytes
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('images_user_id_idx').on(table.userId),
  snippetIdIdx: index('images_snippet_id_idx').on(table.snippetId),
}))