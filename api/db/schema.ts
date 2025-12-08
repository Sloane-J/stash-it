import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Users table (matches Supabase auth users)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Supabase user ID
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

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