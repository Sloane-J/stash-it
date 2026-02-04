import { Argon2id } from "oslo/password";

// Single, shared hasher instance
const argon2id = new Argon2id({
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
});

/**
 * Hash a plain-text password before storing in the database
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2id.hash(password);
}

/**
 * Verify a plain-text password against a stored hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await argon2id.verify(hash, password);
}
