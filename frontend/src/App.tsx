// src/App.tsx

import * as reactRouterDom from "react-router-dom";
import * as BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "@/components/theme-provider";
import { useSession } from "@/lib/auth-client";
import { LoginPage } from "@/pages/auth/LoginPage";
import * as SplashPage from "@/pages/auth/SplashPage";
import { CollectionsPage } from "@/pages/CollectionsPage";
import { CreatePage } from "@/pages/CreatePage";
import { HomePage } from "@/pages/HomePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SearchPage } from "@/pages/SearchPage";
import "./App.css";

// ===================================
// MAIN APP LAYOUT
// ===================================
function MainAppLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="app">
			<div className="app-layout">
				<main className="main-content">
					<div className="content-wrapper">{children}</div>
				</main>

				{/* Bottom Navigation - shows on mobile/tablet, hidden on desktop */}
				<BottomNav.BottomNav />
			</div>
		</div>
	);
}

// ===================================
// PROTECTED ROUTE
// ===================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession();

	// Loading state - Better Auth is checking session
	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<div className="loading-spinner mx-auto" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Not authenticated - redirect to splash page
	if (!session) {
		return <reactRouterDom.Navigate to="/welcome" replace />;
	}

	// Authenticated - show protected content
	return <>{children}</>;
}

// ===================================
// PUBLIC ROUTE (for auth pages)
// Redirects to home if already logged in
// ===================================
function PublicRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession();

	// Loading state
	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<div className="loading-spinner mx-auto" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Already authenticated - redirect to home
	if (session) {
		return <reactRouterDom.Navigate to="/" replace />;
	}

	// Not authenticated - show public page
	return <>{children}</>;
}

// ===================================
// MAIN APP COMPONENT
// ===================================
function App() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="stash-it-theme">
			<reactRouterDom.BrowserRouter>
				<reactRouterDom.Routes>
					{/* Public Routes - Splash & Auth */}
					<reactRouterDom.Route
						path="/welcome"
						element={
							<PublicRoute>
								<SplashPage.SplashPage />
							</PublicRoute>
						}
					/>
					<reactRouterDom.Route
						path="/auth/login"
						element={
							<PublicRoute>
								<LoginPage />
							</PublicRoute>
						}
					/>

					{/* Main App Routes (Protected) */}
					<reactRouterDom.Route
						path="/"
						element={
							<ProtectedRoute>
								<MainAppLayout>
									<HomePage />
								</MainAppLayout>
							</ProtectedRoute>
						}
					/>

					<reactRouterDom.Route
						path="/search"
						element={
							<ProtectedRoute>
								<MainAppLayout>
									<SearchPage />
								</MainAppLayout>
							</ProtectedRoute>
						}
					/>

					<reactRouterDom.Route
						path="/create"
						element={
							<ProtectedRoute>
								<MainAppLayout>
									<CreatePage />
								</MainAppLayout>
							</ProtectedRoute>
						}
					/>

					<reactRouterDom.Route
						path="/collections"
						element={
							<ProtectedRoute>
								<MainAppLayout>
									<CollectionsPage />
								</MainAppLayout>
							</ProtectedRoute>
						}
					/>

					<reactRouterDom.Route
						path="/profile"
						element={
							<ProtectedRoute>
								<MainAppLayout>
									<ProfilePage />
								</MainAppLayout>
							</ProtectedRoute>
						}
					/>

					{/* Catch all - redirect to welcome (splash) */}
					<reactRouterDom.Route
						path="*"
						element={<reactRouterDom.Navigate to="/welcome" replace />}
					/>
				</reactRouterDom.Routes>
			</reactRouterDom.BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
