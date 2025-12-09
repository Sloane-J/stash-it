import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { db } from '../lib/db'
import { collections, snippetCollections, snippets } from '../../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

const router = new Hono()

// Generate unique ID
const generateId = () => `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// CREATE: Add new collection
router.post('/', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const body = await c.req.json()

    const { name, description } = body

    if (!name || name.trim() === '') {
      return c.json({ error: 'Collection name is required' }, 400)
    }

    // Create collection
    const now = new Date()
    const newCollection = {
      id: generateId(),
      userId,
      name: name.trim(),
      description: description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(collections).values(newCollection)

    return c.json({
      success: true,
      collection: newCollection,
    }, 201)
  } catch (error) {
    console.error('Error creating collection:', error)
    return c.json({ error: 'Failed to create collection' }, 500)
  }
})

// READ: Get all user's collections with snippet count
router.get('/', requireAuth, async (c) => {
  try {
    const userId = c.var.userId

    // Get all collections with count of snippets in each
    const userCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
        snippetCount: sql<number>`count(${snippetCollections.snippetId})`,
      })
      .from(collections)
      .leftJoin(snippetCollections, eq(collections.id, snippetCollections.collectionId))
      .where(eq(collections.userId, userId))
      .groupBy(collections.id)
      .orderBy(desc(collections.createdAt))

    return c.json({
      collections: userCollections,
      count: userCollections.length,
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.json({ error: 'Failed to fetch collections' }, 500)
  }
})

// READ: Get single collection
router.get('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('id')

    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!collection.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    return c.json({ collection: collection[0] })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return c.json({ error: 'Failed to fetch collection' }, 500)
  }
})

// UPDATE: Edit collection
router.put('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('id')
    const body = await c.req.json()

    // Check ownership
    const existing = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!existing.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.description !== undefined) updates.description = body.description?.trim() || null

    // Update collection
    await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, collectionId))

    // Fetch updated collection
    const updated = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1)

    return c.json({
      success: true,
      collection: updated[0],
    })
  } catch (error) {
    console.error('Error updating collection:', error)
    return c.json({ error: 'Failed to update collection' }, 500)
  }
})

// DELETE: Remove collection
router.delete('/:id', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('id')

    // Check ownership
    const existing = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!existing.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Delete collection (cascade will remove from snippet_collections junction)
    await db.delete(collections).where(eq(collections.id, collectionId))

    return c.json({
      success: true,
      message: 'Collection deleted',
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return c.json({ error: 'Failed to delete collection' }, 500)
  }
})

// ADD SNIPPET TO COLLECTION
router.post('/:collectionId/snippets', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('collectionId')
    const body = await c.req.json()

    const { snippetId } = body

    if (!snippetId) {
      return c.json({ error: 'snippetId is required' }, 400)
    }

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!collection.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Verify snippet ownership
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

    // Check if already in collection
    const existing = await db
      .select()
      .from(snippetCollections)
      .where(and(
        eq(snippetCollections.collectionId, collectionId),
        eq(snippetCollections.snippetId, snippetId)
      ))
      .limit(1)

    if (existing.length > 0) {
      return c.json({ error: 'Snippet already in collection' }, 400)
    }

    // Add snippet to collection
    await db.insert(snippetCollections).values({
      collectionId,
      snippetId,
    })

    return c.json({
      success: true,
      message: 'Snippet added to collection',
    })
  } catch (error) {
    console.error('Error adding snippet to collection:', error)
    return c.json({ error: 'Failed to add snippet to collection' }, 500)
  }
})

// GET COLLECTION'S SNIPPETS
router.get('/:collectionId/snippets', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('collectionId')

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!collection.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Get all snippets in this collection
    const collectionSnippets = await db
      .select({
        id: snippets.id,
        userId: snippets.userId,
        type: snippets.type,
        content: snippets.content,
        metadata: snippets.metadata,
        createdAt: snippets.createdAt,
        updatedAt: snippets.updatedAt,
      })
      .from(snippets)
      .innerJoin(snippetCollections, eq(snippets.id, snippetCollections.snippetId))
      .where(and(
        eq(snippetCollections.collectionId, collectionId),
        eq(snippets.userId, userId)
      ))
      .orderBy(desc(snippets.createdAt))

    // Parse metadata
    const parsed = collectionSnippets.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }))

    return c.json({
      collection: collection[0],
      snippets: parsed,
      count: parsed.length,
    })
  } catch (error) {
    console.error('Error fetching collection snippets:', error)
    return c.json({ error: 'Failed to fetch collection snippets' }, 500)
  }
})

// REMOVE SNIPPET FROM COLLECTION
router.delete('/:collectionId/snippets/:snippetId', requireAuth, async (c) => {
  try {
    const userId = c.var.userId
    const collectionId = c.req.param('collectionId')
    const snippetId = c.req.param('snippetId')

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, userId)
      ))
      .limit(1)

    if (!collection.length) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Remove snippet from collection
    await db
      .delete(snippetCollections)
      .where(and(
        eq(snippetCollections.collectionId, collectionId),
        eq(snippetCollections.snippetId, snippetId)
      ))

    return c.json({
      success: true,
      message: 'Snippet removed from collection',
    })
  } catch (error) {
    console.error('Error removing snippet from collection:', error)
    return c.json({ error: 'Failed to remove snippet from collection' }, 500)
  }
})

export default router