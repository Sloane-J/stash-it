import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '../lib/db'
import { snippets } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

const router = new Hono()

// Generate unique ID (simple implementation)
const generateId = () => `snip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// CREATE: Add new snippet
router.post('/', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const body = await c.req.json()

    // Validate required fields
    const { type, content, metadata } = body
    
    if (!type || !content) {
      return c.json({ error: 'Type and content are required' }, 400)
    }

    // Validate type
    const validTypes = ['quote', 'note', 'source', 'summary', 'link']
    if (!validTypes.includes(type)) {
      return c.json({ error: `Type must be one of: ${validTypes.join(', ')}` }, 400)
    }

    // Create snippet
    const now = new Date()
    const newSnippet = {
      id: generateId(),
      userId,
      type,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(snippets).values(newSnippet)

    return c.json({
      success: true,
      snippet: {
        ...newSnippet,
        metadata: metadata || null,
      },
    }, 201)
  } catch (error) {
    console.error('Error creating snippet:', error)
    return c.json({ error: 'Failed to create snippet' }, 500)
  }
})

// READ: Get all user's snippets
router.get('/', requireAuth, async (c) => {
  try {
    const userId = c.var.userId

    const userSnippets = await db
      .select()
      .from(snippets)
      .where(eq(snippets.userId, userId))
      .orderBy(desc(snippets.createdAt))

    // Parse metadata JSON
    const parsed = userSnippets.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }))

    return c.json({
      snippets: parsed,
      count: parsed.length,
    })
  } catch (error) {
    console.error('Error fetching snippets:', error)
    return c.json({ error: 'Failed to fetch snippets' }, 500)
  }
})

// SEARCH: Search snippets by content (MUST BE BEFORE /:id route!)
router.get('/search', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const query = c.req.query('q')

    if (!query) {
      return c.json({ error: 'Search query required' }, 400)
    }

    const results = await db
      .select()
      .from(snippets)
      .where(and(
        eq(snippets.userId, userId),
        sql`${snippets.content} LIKE ${`%${query}%`}`
      ))
      .orderBy(desc(snippets.createdAt))

    const parsed = results.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }))

    return c.json({
      snippets: parsed,
      count: parsed.length,
      query,
    })
  } catch (error) {
    console.error('Error searching snippets:', error)
    return c.json({ error: 'Failed to search snippets' }, 500)
  }
})

// READ: Get single snippet
router.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const snippetId = c.req.param('id')

    const snippet = await db
      .select()
      .from(snippets)
      .where(and(
        eq(snippets.id, snippetId),
        eq(snippets.userId, userId)
      ))
      .limit(1)

    if (!snippet.length) {
      return c.json({ error: 'Snippet not found' }, 404)
    }

    const parsed = {
      ...snippet[0],
      metadata: snippet[0].metadata ? JSON.parse(snippet[0].metadata as string) : null,
    }

    return c.json({ snippet: parsed })
  } catch (error) {
    console.error('Error fetching snippet:', error)
    return c.json({ error: 'Failed to fetch snippet' }, 500)
  }
})

// UPDATE: Edit snippet
router.put('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const snippetId = c.req.param('id')
    const body = await c.req.json()

    // Check ownership
    const existing = await db
      .select()
      .from(snippets)
      .where(and(
        eq(snippets.id, snippetId),
        eq(snippets.userId, userId)
      ))
      .limit(1)

    if (!existing.length) {
      return c.json({ error: 'Snippet not found' }, 404)
    }

    // Build update object (only update provided fields)
    const updates: any = {
      updatedAt: new Date(),
    }

    if (body.content !== undefined) updates.content = body.content
    if (body.type !== undefined) {
      const validTypes = ['quote', 'note', 'source', 'summary', 'link']
      if (!validTypes.includes(body.type)) {
        return c.json({ error: `Type must be one of: ${validTypes.join(', ')}` }, 400)
      }
      updates.type = body.type
    }
    if (body.metadata !== undefined) {
      updates.metadata = JSON.stringify(body.metadata)
    }

    // Update snippet
    await db
      .update(snippets)
      .set(updates)
      .where(eq(snippets.id, snippetId))

    // Fetch updated snippet
    const updated = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .limit(1)

    const parsed = {
      ...updated[0],
      metadata: updated[0].metadata ? JSON.parse(updated[0].metadata as string) : null,
    }

    return c.json({
      success: true,
      snippet: parsed,
    })
  } catch (error) {
    console.error('Error updating snippet:', error)
    return c.json({ error: 'Failed to update snippet' }, 500)
  }
})

// DELETE: Remove snippet
router.delete('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const snippetId = c.req.param('id')

    // Check ownership before deleting
    const existing = await db
      .select()
      .from(snippets)
      .where(and(
        eq(snippets.id, snippetId),
        eq(snippets.userId, userId)
      ))
      .limit(1)

    if (!existing.length) {
      return c.json({ error: 'Snippet not found' }, 404)
    }

    // Delete snippet (cascade will handle related tags/images)
    await db
      .delete(snippets)
      .where(eq(snippets.id, snippetId))

    return c.json({
      success: true,
      message: 'Snippet deleted',
    })
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return c.json({ error: 'Failed to delete snippet' }, 500)
  }
})

export default router