// src/components/auth/AuthLayout.tsx

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10 border border-primary/20">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Stash It
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-2">
          Your micro research notebook
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Free • 100 snippets • No credit card required
        </p>
      </div>
    </div>
  );
}