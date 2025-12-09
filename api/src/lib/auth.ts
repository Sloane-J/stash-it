import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "./db";
import * as schema from "../../db/schema"; // CHANGED: ../../db/

// Initialize Resend for sending emails
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  // Database adapter - connects Better Auth to your Drizzle database
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verificationTokens,
    },
  }),

  // Email configuration for verification and password reset
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: user.email,
        subject: "Reset your password - Stash It",
        html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });
    },
  },

  // Allow requests from your frontend
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean),

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session daily
  },
});

// Type exports for use in routes
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
