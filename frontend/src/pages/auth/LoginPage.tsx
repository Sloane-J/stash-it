// src/pages/auth/LoginPage.tsx

import * as lucideReact from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
		<AuthLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="text-center">
					<h2 className="text-xl font-semibold text-foreground">
						{mode === "signin"
							? "Sign in to your account"
							: "Create your account"}
					</h2>
					<p className="text-sm text-muted-foreground mt-2">
						{mode === "signin"
							? "Welcome back! Enter your credentials to continue"
							: "Start organizing your research today"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Email Input */}
					<div className="space-y-2">
						<Label
							htmlFor="email"
							className="text-sm font-medium text-foreground"
						>
							Email address
						</Label>
						<div className="relative">
							<lucideReact.Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
								className="pl-10 h-12 touch-target bg-background border-input text-foreground placeholder:text-muted-foreground"
								aria-describedby={error ? "auth-error" : undefined}
							/>
						</div>
					</div>

					{/* Password Input */}
					<div className="space-y-2">
						<Label
							htmlFor="password"
							className="text-sm font-medium text-foreground"
						>
							Password
						</Label>
						<div className="relative">
							<lucideReact.Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
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
								className="pl-10 pr-10 h-12 touch-target bg-background border-input text-foreground placeholder:text-muted-foreground"
								minLength={6}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<lucideReact.EyeOff className="h-4 w-4" />
								) : (
									<lucideReact.Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{mode === "signup" &&
							password.length > 0 &&
							password.length < 6 && (
								<p className="text-xs text-muted-foreground">
									Password must be at least 6 characters
								</p>
							)}
					</div>

					{/* Error Message */}
					{error && (
						<div
							id="auth-error"
							className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
							role="alert"
						>
							{error}
						</div>
					)}

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={!canSubmit}
						className="w-full h-12 touch-target text-base font-semibold"
					>
						{isLoading ? (
							<>
								<lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{mode === "signin" ? "Signing in..." : "Creating account..."}
							</>
						) : mode === "signin" ? (
							"Sign In"
						) : (
							"Create Account"
						)}
					</Button>
				</form>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border"></div>
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
							{mode === "signin"
								? "New to Stash It?"
								: "Already have an account?"}
						</span>
					</div>
				</div>

				{/* Toggle Mode Button */}
				<Button
					type="button"
					variant="outline"
					onClick={toggleMode}
					className="w-full h-10 text-sm"
				>
					{mode === "signin" ? "Create an account" : "Sign in instead"}
				</Button>

				{/* Forgot Password Link (only show in sign-in mode) */}
				{mode === "signin" && (
					<div className="text-center">
						<button
							type="button"
							className="text-sm text-primary hover:underline"
							onClick={() => {
								// TODO: Implement forgot password flow
								alert("Forgot password feature coming soon!");
							}}
						>
							Forgot your password?
						</button>
					</div>
				)}
			</div>
		</AuthLayout>
	);
}
