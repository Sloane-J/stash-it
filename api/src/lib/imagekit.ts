import ImageKit from 'imagekit';
import type { Env } from './db';

/**
 * Configuration constants for image processing
 */
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 1.5 * 1024 * 1024, // 1.5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  FOLDER_PREFIX: 'stash-it' // Base folder in your ImageKit media library
} as const;

/**
 * Factory function to initialize ImageKit with request-specific environment variables.
 * In Cloudflare Workers, variables are attached to the 'env' object, not process.env.
 */
export const getImageKit = (env: Env["Bindings"]) => {
  if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("Missing ImageKit configuration. Check your wrangler.toml or .dev.vars");
  }

  return new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT
  });
};