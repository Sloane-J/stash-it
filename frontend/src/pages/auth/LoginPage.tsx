// src/pages/auth/LoginPage.tsx

import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { signIn, signUp } from "@/lib/auth-client";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        // Sign in using Better Auth SDK
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          throw new Error(result.error.message || "Sign in failed");
        }
      } else {
        // Sign up using Better Auth SDK
        const result = await signUp.email({
          email,
          password,
          name: email.split("@")[0], // Auto-generate name from email
        });

        if (result.error) {
          throw new Error(result.error.message || "Sign up failed");
        }
      }

      // Success! Better Auth sets session cookie automatically
      // Redirect to main app
      navigate("/", { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit =
    email &&
    password &&
    isValidEmail(email) &&
    password.length >= 6 &&
    !isLoading;

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
  };

  return (
    <AuthLayout
      title={mode === "signin" ? "Sign In" : "Create Account"}
      description={
        mode === "signin"
          ? "Welcome back! Enter your credentials to continue"
          : "Start organizing your research today"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-describedby={error ? "auth-error" : undefined}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              placeholder={
                mode === "signin"
                  ? "Enter your password"
                  : "Create a password (min 6 characters)"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              minLength={6}
              className="w-full pl-11 pr-11 py-3 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {mode === "signup" && password.length > 0 && password.length < 6 && (
            <p className="text-xs text-muted-foreground px-4">
              Password must be at least 6 characters
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="auth-error"
            className="p-3 rounded-full bg-destructive/10 border border-destructive/20"
            role="alert"
          >
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 px-6 rounded-full bg-primary text-primary-foreground font-medium text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "signin" ? "Signing in..." : "Creating account..."}
            </span>
          ) : mode === "signin" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>

        {/* Forgot Password (Sign In Only) */}
        {mode === "signin" && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline font-medium"
              onClick={() => {
                // TODO: Implement forgot password flow
                alert("Forgot password feature coming soon!");
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gradient-to-br from-background via-background to-primary/5 px-3 text-muted-foreground">
              {mode === "signin"
                ? "New to Stash It?"
                : "Already have an account?"}
            </span>
          </div>
        </div>

        {/* Toggle Mode Button */}
        <button
          type="button"
          onClick={toggleMode}
          className="w-full py-3 px-6 rounded-full border border-border text-foreground font-medium text-base hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {mode === "signin" ? "Create an account" : "Sign in instead"}
        </button>
      </form>
    </AuthLayout>
  );
}
