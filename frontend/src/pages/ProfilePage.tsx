import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ProfilePage() {
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/welcome";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
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

      {/* Theme Toggle Button */}
      <div className="text-center mt-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-sm text-foreground hover:underline"
        >
          {theme === "dark" ? <Sun /> : <Moon />} Toggle Theme
        </button>
      </div>
    </div>
  );
}
