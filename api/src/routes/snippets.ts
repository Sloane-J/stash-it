import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { db } from "../lib/db";
import { snippets } from "../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { snippets, tags, snippetTags } from "../../db/schema";

const router = new Hono();

// Generate unique ID (simple implementation)
const generateId = () =>
  `snip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// CREATE: Add new snippet
router.post("/", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const body = await c.req.json();

    // Validate required fields
    const { type, content, metadata } = body;

    if (!type || !content) {
      return c.json({ error: "Type and content are required" }, 400);
    }

    // Validate type
    const validTypes = ["quote", "note", "source", "summary", "link"];
    if (!validTypes.includes(type)) {
      return c.json(
        { error: `Type must be one of: ${validTypes.join(", ")}` },
        400,
      );
    }

    // Create snippet
    const now = new Date();
    const newSnippet = {
      id: generateId(),
      userId,
      type,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(snippets).values(newSnippet);

    return c.json(
      {
        success: true,
        snippet: {
          ...newSnippet,
          metadata: metadata || null,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Error creating snippet:", error);
    return c.json({ error: "Failed to create snippet" }, 500);
  }
});

// READ: Get all user's snippets
router.get("/", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;

    const userSnippets = await db
      .select()
      .from(snippets)
      .where(eq(snippets.userId, userId))
      .orderBy(desc(snippets.createdAt));

    // Parse metadata JSON
    const parsed = userSnippets.map((s) => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }));

    return c.json({
      snippets: parsed,
      count: parsed.length,
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return c.json({ error: "Failed to fetch snippets" }, 500);
  }
});

// SEARCH: Search snippets by content (MUST BE BEFORE /:id route!)
router.get("/search", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const query = c.req.query("q");

    if (!query) {
      return c.json({ error: "Search query required" }, 400);
    }

    const results = await db
      .select()
      .from(snippets)
      .where(
        and(
          eq(snippets.userId, userId),
          sql`${snippets.content} LIKE ${`%${query}%`}`,
        ),
      )
      .orderBy(desc(snippets.createdAt));

    const parsed = results.map((s) => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata as string) : null,
    }));

    return c.json({
      snippets: parsed,
      count: parsed.length,
      query,
    });
  } catch (error) {
    console.error("Error searching snippets:", error);
    return c.json({ error: "Failed to search snippets" }, 500);
  }
});

// READ: Get single snippet
router.get("/:id", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("id");

    const snippet = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!snippet.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    const parsed = {
      ...snippet[0],
      metadata: snippet[0].metadata
        ? JSON.parse(snippet[0].metadata as string)
        : null,
    };

    return c.json({ snippet: parsed });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return c.json({ error: "Failed to fetch snippet" }, 500);
  }
});

// UPDATE: Edit snippet
router.put("/:id", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("id");
    const body = await c.req.json();

    // Check ownership
    const existing = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!existing.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Build update object (only update provided fields)
    const updates: any = {
      updatedAt: new Date(),
    };

    if (body.content !== undefined) updates.content = body.content;
    if (body.type !== undefined) {
      const validTypes = ["quote", "note", "source", "summary", "link"];
      if (!validTypes.includes(body.type)) {
        return c.json(
          { error: `Type must be one of: ${validTypes.join(", ")}` },
          400,
        );
      }
      updates.type = body.type;
    }
    if (body.metadata !== undefined) {
      updates.metadata = JSON.stringify(body.metadata);
    }

    // Update snippet
    await db.update(snippets).set(updates).where(eq(snippets.id, snippetId));

    // Fetch updated snippet
    const updated = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .limit(1);

    const parsed = {
      ...updated[0],
      metadata: updated[0].metadata
        ? JSON.parse(updated[0].metadata as string)
        : null,
    };

    return c.json({
      success: true,
      snippet: parsed,
    });
  } catch (error) {
    console.error("Error updating snippet:", error);
    return c.json({ error: "Failed to update snippet" }, 500);
  }
});

// DELETE: Remove snippet
router.delete("/:id", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("id");

    // Check ownership before deleting
    const existing = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!existing.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Delete snippet (cascade will handle related tags/images)
    await db.delete(snippets).where(eq(snippets.id, snippetId));

    return c.json({
      success: true,
      message: "Snippet deleted",
    });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return c.json({ error: "Failed to delete snippet" }, 500);
  }
});

// ADD TAG TO SNIPPET: Link tag to snippet
router.post("/:snippetId/tags", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("snippetId");
    const body = await c.req.json();

    const { tagId, tagName } = body;

    // Verify snippet ownership
    const snippet = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!snippet.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    let finalTagId = tagId;

    // If tagName provided (new tag), create it
    if (tagName && !tagId) {
      const generateTagId = () =>
        `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTag = {
        id: generateTagId(),
        userId,
        name: tagName.trim().toLowerCase(),
        createdAt: new Date(),
      };

      await db.insert(tags).values(newTag);
      finalTagId = newTag.id;
    }

    if (!finalTagId) {
      return c.json({ error: "Either tagId or tagName is required" }, 400);
    }

    // Verify tag ownership
    const tag = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, finalTagId), eq(tags.userId, userId)))
      .limit(1);

    if (!tag.length) {
      return c.json({ error: "Tag not found" }, 404);
    }

    // Check if already linked
    const existing = await db
      .select()
      .from(snippetTags)
      .where(
        and(
          eq(snippetTags.snippetId, snippetId),
          eq(snippetTags.tagId, finalTagId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Tag already added to snippet" }, 400);
    }

    // Link tag to snippet
    await db.insert(snippetTags).values({
      snippetId,
      tagId: finalTagId,
    });

    return c.json({
      success: true,
      message: "Tag added to snippet",
      tag: tag[0],
    });
  } catch (error) {
    console.error("Error adding tag to snippet:", error);
    return c.json({ error: "Failed to add tag to snippet" }, 500);
  }
});

// GET SNIPPET'S TAGS: Get all tags for a snippet
router.get("/:snippetId/tags", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("snippetId");

    // Verify snippet ownership
    const snippet = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!snippet.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Get all tags for this snippet
    const snippetTagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .innerJoin(snippetTags, eq(tags.id, snippetTags.tagId))
      .where(eq(snippetTags.snippetId, snippetId));

    return c.json({
      snippetId,
      tags: snippetTagsList,
      count: snippetTagsList.length,
    });
  } catch (error) {
    console.error("Error fetching snippet tags:", error);
    return c.json({ error: "Failed to fetch snippet tags" }, 500);
  }
});

// REMOVE TAG FROM SNIPPET: Unlink tag from snippet
router.delete("/:snippetId/tags/:tagId", requireAuth, async (c) => {
  try {
    const userId = c.var.userId;
    const snippetId = c.req.param("snippetId");
    const tagId = c.req.param("tagId");

    // Verify snippet ownership
    const snippet = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1);

    if (!snippet.length) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Delete the link
    await db
      .delete(snippetTags)
      .where(
        and(eq(snippetTags.snippetId, snippetId), eq(snippetTags.tagId, tagId)),
      );

    return c.json({
      success: true,
      message: "Tag removed from snippet",
    });
  } catch (error) {
    console.error("Error removing tag from snippet:", error);
    return c.json({ error: "Failed to remove tag from snippet" }, 500);
  }
});

export default router;
