// -----------------------------
// User Type
// -----------------------------
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  password?: string | null; // hashed password
  databaseId?: string | null;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

// -----------------------------
// Session Type
// -----------------------------
export interface Session {
  id: string;          // session ID
  userId: string;      // foreign key to User.id
  expiresAt: number;   // Unix timestamp
  user: User;          // full user object attached
}

// -----------------------------
// Optional: Account Type (for OAuth)
// -----------------------------
export interface Account {
  id: string;
  userId: string;
  accountId: string;   // provider's user ID
  providerId: string;  // e.g., 'google', 'github'
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  expiresAt?: number | null;
  password?: string | null; // for email/password OAuth fallback
  createdAt: number;
  updatedAt: number;
}

// -----------------------------
// Optional: Verification Token Type
// -----------------------------
export interface VerificationToken {
  id: string;
  identifier: string;  // email or user ID
  token: string;
  expiresAt: number;   // Unix timestamp
  createdAt: number;   // Unix timestamp
}
