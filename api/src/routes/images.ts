// api/src/routes/images.ts
import { Hono } from 'hono';
import { imagekit, IMAGE_CONFIG } from '../lib/imagekit';
import { db } from '../lib/db';
import { images, snippets } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { randomUUID } from 'crypto';

const app = new Hono();

// Apply auth to ALL image routes
app.use('/*', requireAuth);

/**
 * POST /api/images/upload
 * Upload image to ImageKit
 * 
 * Body (multipart/form-data):
 * - file: Image file (required)
 * - snippetId: ID of snippet to attach to (optional)
 */
app.post('/upload', async (c) => {
  try {
    const userId = c.get('userId'); // From auth middleware
    
    // Get multipart form data
    const body = await c.req.parseBody();
    const file = body.file as File;
    const snippetId = body.snippetId as string | undefined;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return c.json({ 
        error: `Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')}` 
      }, 400);
    }
    
    // Validate file size
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = (IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
      return c.json({ 
        error: `File too large. Max size: ${maxSizeMB}MB` 
      }, 400);
    }
    
    // If snippetId provided, verify user owns it
    if (snippetId) {
      const snippet = await db
        .select()
        .from(snippets)
        .where(and(
          eq(snippets.id, snippetId),
          eq(snippets.userId, userId)
        ))
        .limit(1);
      
      if (!snippet.length) {
        return c.json({ error: 'Snippet not found' }, 404);
      }
      
      // Check image limit per snippet (max 3)
      const existingImages = await db
        .select()
        .from(images)
        .where(eq(images.snippetId, snippetId));
      
      if (existingImages.length >= 3) {
        return c.json({ 
          error: 'Maximum 3 images per snippet' 
        }, 400);
      }
    }
    
    // Convert file to buffer for ImageKit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${timestamp}_${randomStr}${extension}`;
    
    // Upload to ImageKit
    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: `${IMAGE_CONFIG.FOLDER_PREFIX}/${userId}`,
      tags: ['user-upload', userId],
      transformation: {
        pre: 'w-1200,h-1200,fo-auto', // Auto-resize to max 1200x1200
        post: [
          {
            type: 'transformation',
            value: 'q-80,f-webp' // Convert to WebP, 80% quality
          }
        ]
      }
    });
    
    // Save to database (matching YOUR schema)
    const [imageRecord] = await db
      .insert(images)
      .values({
        id: randomUUID(),
        userId: userId,
        snippetId: snippetId || null,
        imagekitFileId: uploadResult.fileId,
        imagekitUrl: uploadResult.url,
        fileSize: uploadResult.size,
        createdAt: new Date()
      })
      .returning();
    
    // Generate thumbnail URL
    const thumbnailUrl = imagekit.url({
      path: uploadResult.filePath,
      transformation: [{
        width: '200',
        height: '200',
        cropMode: 'at_max'
      }]
    });
    
    return c.json({
      success: true,
      image: {
        id: imageRecord.id,
        url: imageRecord.imagekitUrl,
        thumbnailUrl: thumbnailUrl,
        fileSize: imageRecord.fileSize,
        imagekitFileId: imageRecord.imagekitFileId
      }
    }, 201);
    
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /api/images/:id
 * Delete image from ImageKit and database
 */
app.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const imageId = c.req.param('id');
    
    // Get image record
    const [image] = await db
      .select()
      .from(images)
      .where(and(
        eq(images.id, imageId),
        eq(images.userId, userId)
      ))
      .limit(1);
    
    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    // Delete from ImageKit
    try {
      await imagekit.deleteFile(image.imagekitFileId);
    } catch (error) {
      console.error('ImageKit delete failed:', error);
    }
    
    // Delete from database
    await db
      .delete(images)
      .where(eq(images.id, imageId));
    
    return c.json({ 
      success: true,
      message: 'Image deleted'
    });
    
  } catch (error) {
    console.error('Image delete error:', error);
    return c.json({ 
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/images/:id
 * Get image details
 */
app.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const imageId = c.req.param('id');
    
    const [image] = await db
      .select()
      .from(images)
      .where(and(
        eq(images.id, imageId),
        eq(images.userId, userId)
      ))
      .limit(1);
    
    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    // Generate thumbnail URL
    const thumbnailUrl = imagekit.url({
      path: image.imagekitUrl,
      transformation: [{
        width: '200',
        height: '200',
        cropMode: 'at_max'
      }]
    });
    
    return c.json({ 
      image: {
        ...image,
        thumbnailUrl
      }
    });
    
  } catch (error) {
    console.error('Get image error:', error);
    return c.json({ 
      error: 'Failed to get image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /api/images
 * List all user's images
 */
app.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    
    const userImages = await db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(images.createdAt);
    
    // Calculate total storage used
    const totalStorage = userImages.reduce((sum, img) => sum + img.fileSize, 0);
    
    // Add thumbnail URLs to each image
    const imagesWithThumbnails = userImages.map(img => ({
      ...img,
      thumbnailUrl: imagekit.url({
        path: img.imagekitUrl,
        transformation: [{
          width: '200',
          height: '200',
          cropMode: 'at_max'
        }]
      })
    }));
    
    return c.json({ 
      images: imagesWithThumbnails,
      stats: {
        count: userImages.length,
        totalBytes: totalStorage,
        totalMB: (totalStorage / (1024 * 1024)).toFixed(2)
      }
    });
    
  } catch (error) {
    console.error('List images error:', error);
    return c.json({ 
      error: 'Failed to list images',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
