// api/src/lib/imagekit.ts
import ImageKit from 'imagekit';

// Validate required environment variables
const requiredEnvVars = [
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize ImageKit instance following official docs
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

// Configuration constants for your app
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 1.5 * 1024 * 1024, // 1.5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  FOLDER_PREFIX: 'stash-it' // Base folder in ImageKit
} as const;