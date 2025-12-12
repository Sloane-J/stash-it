// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/auth/LoginPage';
import { BottomNav } from '@/components/layout/BottomNav';
import './App.css';

// Placeholder pages for each route
function HomePage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Home
        </h1>
        <p className="text-lg text-muted-foreground">
          Snippets will appear here
        </p>
      </div>
    </div>
  );
}

function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Search
        </h1>
        <p className="text-lg text-muted-foreground">
          Search your snippets
        </p>
      </div>
    </div>
  );
}

function CreatePage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Create Snippet
        </h1>
        <p className="text-lg text-muted-foreground">
          Create form coming soon
        </p>
      </div>
    </div>
  );
}

function CollectionsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Collections
        </h1>
        <p className="text-lg text-muted-foreground">
          Your collections will appear here
        </p>
      </div>
    </div>
  );
}

function ProfilePage() {
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
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Settings and account info
        </p>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleSignOut}
          className="text-sm text-destructive hover:underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Main app layout with bottom navigation
function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <div className="app-layout">
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation - only shows on mobile */}
        <BottomNav />
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
        
        {/* Main App Routes (Protected) - All wrapped in MainAppLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainAppLayout>
                <HomePage />
              </MainAppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <MainAppLayout>
                <SearchPage />
              </MainAppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <MainAppLayout>
                <CreatePage />
              </MainAppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <MainAppLayout>
                <CollectionsPage />
              </MainAppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainAppLayout>
                <ProfilePage />
              </MainAppLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;