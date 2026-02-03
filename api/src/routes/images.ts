import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { images, snippets } from "../../db/schema";
import type { Env } from "../lib/db";
import { getAuthDb } from "../lib/db";
import { getImageKit, IMAGE_CONFIG } from "../lib/imagekit";
import { requireAuth } from "../middleware/auth";

const app = new Hono<{
	Bindings: Env["Bindings"];
	Variables: Env["Variables"];
}>();

// Apply authentication middleware to all routes
app.use("/*", requireAuth);

/**
 * POST /api/images/upload
 * Uploads a file to ImageKit and saves metadata to D1
 */
app.post("/upload", async (c) => {
	try {
		const userId = c.get("userId");
		const authDb = getAuthDb(c.env);
		const ik = getImageKit(c.env);

		const body = await c.req.parseBody();
		const file = body.file as File;
		const snippetId = body.snippetId as string | undefined;

		if (!file || !(file instanceof File)) {
			return c.json({ error: "No valid file provided" }, 400);
		}

		// Validation
		if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
			return c.json(
				{
					error: `Invalid type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(", ")}`,
				},
				400,
			);
		}

		if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
			const maxMB = (IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
			return c.json({ error: `File too large (Max ${maxMB}MB)` }, 400);
		}

		// If snippetId provided, verify ownership (will implement per-user DB later)
		if (snippetId) {
			const snippet = await authDb
				.select()
				.from(snippets)
				.where(eq(snippets.id, snippetId))
				.get();

			if (!snippet) {
				return c.json({ error: "Snippet not found" }, 404);
			}

			// Check image limit per snippet (max 3)
			const existingImages = await authDb
				.select()
				.from(images)
				.where(eq(images.snippetId, snippetId))
				.all();

			if (existingImages.length >= 3) {
				return c.json({ error: "Maximum 3 images per snippet" }, 400);
			}
		}

		// Process file for ImageKit
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const extension = file.name.substring(file.name.lastIndexOf("."));
		const fileName = `${Date.now()}_${crypto.randomUUID().substring(0, 8)}${extension}`;

		// Upload to ImageKit
		const uploadResult = await ik.upload({
			file: buffer,
			fileName: fileName,
			folder: `${IMAGE_CONFIG.FOLDER_PREFIX}/${userId}`,
			useUniqueFileName: true,
			transformation: {
				pre: "w-1200,h-1200,fo-auto",
				post: [{ type: "transformation", value: "q-80,f-webp" }],
			},
		});

		// Save record to D1
		const [imageRecord] = await authDb
			.insert(images)
			.values({
				id: crypto.randomUUID(),
				snippetId: snippetId || null,
				imagekitFileId: uploadResult.fileId,
				imagekitUrl: uploadResult.url,
				fileSize: uploadResult.size,
				createdAt: new Date(),
			})
			.returning();

		return c.json(
			{
				success: true,
				image: {
					...imageRecord,
					thumbnailUrl: ik.url({
						path: uploadResult.filePath,
						transformation: [{ width: "200", height: "200" }],
					}),
				},
			},
			201,
		);
	} catch (error) {
		console.error("Upload Error:", error);
		return c.json(
			{
				error: "Upload failed",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

/**
 * DELETE /api/images/:id
 * Delete image from ImageKit and database
 */
app.delete("/:id", async (c) => {
	try {
		const userId = c.get("userId");
		const imageId = c.req.param("id");
		const authDb = getAuthDb(c.env);
		const ik = getImageKit(c.env);

		const image = await authDb
			.select()
			.from(images)
			.where(eq(images.id, imageId))
			.get();

		if (!image) {
			return c.json({ error: "Image not found" }, 404);
		}

		// Delete from ImageKit (catch errors silently if already deleted)
		try {
			await ik.deleteFile(image.imagekitFileId);
		} catch (error) {
			console.error("ImageKit delete failed (may already be deleted):", error);
		}

		// Delete from database
		await authDb.delete(images).where(eq(images.id, imageId));

		return c.json({ success: true, message: "Image deleted" });
	} catch (error) {
		console.error("Delete Error:", error);
		return c.json({ error: "Delete failed" }, 500);
	}
});

/**
 * GET /api/images/:id
 * Get single image details
 */
app.get("/:id", async (c) => {
	try {
		const userId = c.get("userId");
		const imageId = c.req.param("id");
		const authDb = getAuthDb(c.env);
		const ik = getImageKit(c.env);

		const image = await authDb
			.select()
			.from(images)
			.where(eq(images.id, imageId))
			.get();

		if (!image) {
			return c.json({ error: "Image not found" }, 404);
		}

		return c.json({
			image: {
				...image,
				thumbnailUrl: ik.url({
					path: image.imagekitUrl,
					transformation: [{ width: "200", height: "200" }],
				}),
			},
		});
	} catch (error) {
		console.error("Get Image Error:", error);
		return c.json({ error: "Failed to get image" }, 500);
	}
});

/**
 * GET /api/images
 * List all user's images
 */
app.get("/", async (c) => {
	try {
		const userId = c.get("userId");
		const authDb = getAuthDb(c.env);
		const ik = getImageKit(c.env);

		const userImages = await authDb
			.select()
			.from(images)
			.orderBy(desc(images.createdAt))
			.all();

		// Calculate total storage used
		const totalStorage = userImages.reduce((sum, img) => sum + img.fileSize, 0);

		const imagesWithThumbs = userImages.map((img) => ({
			...img,
			thumbnailUrl: ik.url({
				path: img.imagekitUrl,
				transformation: [{ width: "200", height: "200" }],
			}),
		}));

		return c.json({
			images: imagesWithThumbs,
			stats: {
				count: userImages.length,
				totalBytes: totalStorage,
				totalMB: (totalStorage / (1024 * 1024)).toFixed(2),
			},
		});
	} catch (error) {
		console.error("List Images Error:", error);
		return c.json({ error: "Failed to list images" }, 500);
	}
});

export default app;
