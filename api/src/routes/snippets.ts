import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { snippets, snippetTags, tags } from "../../db/schema";
import { getAuthDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import type { Env } from "../lib/db";

const router = new Hono<{
  Bindings: Env["Bindings"];
  Variables: Env["Variables"];
}>();

// Generate unique ID (simple implementation)
const generateId = () =>
  `snip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// CREATE: Add new snippet
router.post("/", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");
    const authDb = getAuthDb(c.env);
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
      type,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: now,
      updatedAt: now,
    };

    await authDb.insert(snippets).values(newSnippet);

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
    const authDb = getAuthDb(c.env);

    const userSnippets = await authDb
      .select()
      .from(snippets)
      .orderBy(desc(snippets.createdAt))
      .all();

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
    const authDb = getAuthDb(c.env);
    const query = c.req.query("q");

    if (!query) {
      return c.json({ error: "Search query required" }, 400);
    }

    const results = await authDb
      .select()
      .from(snippets)
      .where(sql`${snippets.content} LIKE ${`%${query}%`}`)
      .orderBy(desc(snippets.createdAt))
      .all();

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
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("id");

    const snippet = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!snippet) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    const parsed = {
      ...snippet,
      metadata: snippet.metadata ? JSON.parse(snippet.metadata as string) : null,
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
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("id");
    const body = await c.req.json();

    // Check if snippet exists
    const existing = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!existing) {
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
    await authDb.update(snippets).set(updates).where(eq(snippets.id, snippetId));

    // Fetch updated snippet
    const updated = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    const parsed = {
      ...updated,
      metadata: updated!.metadata ? JSON.parse(updated!.metadata as string) : null,
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
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("id");

    // Check if snippet exists
    const existing = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!existing) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Delete snippet (cascade will handle related tags/images)
    await authDb.delete(snippets).where(eq(snippets.id, snippetId));

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
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("snippetId");
    const body = await c.req.json();

    const { tagId, tagName } = body;

    // Verify snippet exists
    const snippet = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!snippet) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    let finalTagId = tagId;

    // If tagName provided (new tag), create it
    if (tagName && !tagId) {
      const generateTagId = () =>
        `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTag = {
        id: generateTagId(),
        name: tagName.trim().toLowerCase(),
        createdAt: new Date(),
      };

      await authDb.insert(tags).values(newTag);
      finalTagId = newTag.id;
    }

    if (!finalTagId) {
      return c.json({ error: "Either tagId or tagName is required" }, 400);
    }

    // Verify tag exists
    const tag = await authDb
      .select()
      .from(tags)
      .where(eq(tags.id, finalTagId))
      .get();

    if (!tag) {
      return c.json({ error: "Tag not found" }, 404);
    }

    // Check if already linked
    const existing = await authDb
      .select()
      .from(snippetTags)
      .where(
        and(
          eq(snippetTags.snippetId, snippetId),
          eq(snippetTags.tagId, finalTagId),
        ),
      )
      .get();

    if (existing) {
      return c.json({ error: "Tag already added to snippet" }, 400);
    }

    // Link tag to snippet
    await authDb.insert(snippetTags).values({
      snippetId,
      tagId: finalTagId,
    });

    return c.json({
      success: true,
      message: "Tag added to snippet",
      tag: tag,
    });
  } catch (error) {
    console.error("Error adding tag to snippet:", error);
    return c.json({ error: "Failed to add tag to snippet" }, 500);
  }
});

// GET SNIPPET'S TAGS: Get all tags for a snippet
router.get("/:snippetId/tags", requireAuth, async (c) => {
  try {
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("snippetId");

    // Verify snippet exists
    const snippet = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!snippet) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Get all tags for this snippet
    const snippetTagsList = await authDb
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .innerJoin(snippetTags, eq(tags.id, snippetTags.tagId))
      .where(eq(snippetTags.snippetId, snippetId))
      .all();

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
    const authDb = getAuthDb(c.env);
    const snippetId = c.req.param("snippetId");
    const tagId = c.req.param("tagId");

    // Verify snippet exists
    const snippet = await authDb
      .select()
      .from(snippets)
      .where(eq(snippets.id, snippetId))
      .get();

    if (!snippet) {
      return c.json({ error: "Snippet not found" }, 404);
    }

    // Delete the link
    await authDb
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