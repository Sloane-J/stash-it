// src/components/auth/AuthLayout.tsx
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-background via-background to-primary/5 px-6 py-8">
      {/* Logo/Icon Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 border-border bg-card overflow-hidden">
          <img
            src="/images/logo.svg"
            alt="Stash It Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Auth Form - Flat Design */}
      <div className="w-full max-w-md">
        {children}
        
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Free • 100 snippets • No credit card required
        </p>
      </div>
    </div>
  );
}