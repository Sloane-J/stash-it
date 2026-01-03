import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { getAuthDb } from '../lib/db'
import { tags, snippetTags, snippets } from '../../db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import type { Env } from '../lib/db'

const router = new Hono<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>()

// Generate unique ID
const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// CREATE: Add new tag
router.post('/', requireAuth, async (c) => {
  try {
    const authDb = getAuthDb(c.env)
    const body = await c.req.json()

    const { name } = body

    if (!name || name.trim() === '') {
      return c.json({ error: 'Tag name is required' }, 400)
    }

    // Check if tag already exists (by name)
    const existing = await authDb
      .select()
      .from(tags)
      .where(eq(tags.name, name.trim().toLowerCase()))
      .get()

    if (existing) {
      return c.json({ error: 'Tag already exists' }, 400)
    }

    // Create tag
    const newTag = {
      id: generateId(),
      name: name.trim().toLowerCase(),
      createdAt: new Date(),
    }

    await authDb.insert(tags).values(newTag)

    return c.json({
      success: true,
      tag: newTag,
    }, 201)
  } catch (error) {
    console.error('Error creating tag:', error)
    return c.json({ error: 'Failed to create tag' }, 500)
  }
})

// READ: Get all tags with snippet count
router.get('/', requireAuth, async (c) => {
  try {
    const authDb = getAuthDb(c.env)

    // Get all tags with count of snippets using each tag
    const userTags = await authDb
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
        snippetCount: sql<number>`count(${snippetTags.snippetId})`,
      })
      .from(tags)
      .leftJoin(snippetTags, eq(tags.id, snippetTags.tagId))
      .groupBy(tags.id)
      .orderBy(tags.name)
      .all()

    return c.json({
      tags: userTags,
      count: userTags.length,
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return c.json({ error: 'Failed to fetch tags' }, 500)
  }
})

// GET SNIPPETS BY TAG: Get all snippets with a specific tag
router.get('/:tagId/snippets', requireAuth, async (c) => {
  try {
    const authDb = getAuthDb(c.env)
    const tagId = c.req.param('tagId')

    // Verify tag exists
    const tag = await authDb
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .get()

    if (!tag) {
      return c.json({ error: 'Tag not found' }, 404)
    }

    // Get all snippets with this tag
    const taggedSnippets = await authDb
      .select({
        id: snippets.id,
        type: snippets.type,
        content: snippets.content,
        metadata: snippets.metadata,
        createdAt: snippets.createdAt,
        updatedAt: snippets.updatedAt,
      })
      .from(snippets)
      .innerJoin(snippetTags, eq(snippets.id, snippetTags.snippetId))
      .where(eq(snippetTags.tagId, tagId))
      .orderBy(desc(snippets.createdAt))
      .all()

    // Parse metadata
    const parsed = taggedSnippets.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }))

    return c.json({
      tag: tag,
      snippets: parsed,
      count: parsed.length,
    })
  } catch (error) {
    console.error('Error fetching snippets by tag:', error)
    return c.json({ error: 'Failed to fetch snippets by tag' }, 500)
  }
})

// DELETE: Remove tag
router.delete('/:id', requireAuth, async (c) => {
  try {
    const authDb = getAuthDb(c.env)
    const tagId = c.req.param('id')

    // Check if tag exists
    const existing = await authDb
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .get()

    if (!existing) {
      return c.json({ error: 'Tag not found' }, 404)
    }

    // Delete tag (cascade will remove from snippet_tags junction table)
    await authDb.delete(tags).where(eq(tags.id, tagId))

    return c.json({
      success: true,
      message: 'Tag deleted',
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return c.json({ error: 'Failed to delete tag' }, 500)
  }
})

export default router