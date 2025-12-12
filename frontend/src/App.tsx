// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/auth/LoginPage';
import './App.css';

// Placeholder for main app (we'll build this next)
function MainApp() {
  const handleSignOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="app">
      <div className="app-layout">
        <main className="main-content">
          <div className="content-wrapper">
            <div className="max-w-2xl mx-auto py-12 space-y-6">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome to Stash It!
                </h1>
                <p className="text-lg text-muted-foreground">
                  You're successfully signed in
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  What's Next?
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>We'll build the Bottom Navigation next</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Then create your first snippet card</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Add search, collections, and more!</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSignOut}
                  className="text-sm text-destructive hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-session`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(!!data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="loading-spinner mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Authenticated - show protected content
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        
        {/* Main App Routes (Protected) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;