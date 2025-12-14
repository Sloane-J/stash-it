// src/components/layout/PageHeader.tsx
import { Search, LayoutGrid, LayoutList } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  layout?: "stack" | "grid";
  onLayoutChange?: (layout: "stack" | "grid") => void;
}

export function PageHeader({
  layout = "stack",
  onLayoutChange,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLayoutToggle = () => {
    if (!onLayoutChange) return;
    
    const newLayout = layout === "stack" ? "grid" : "stack";
    console.log("Layout toggling from", layout, "to", newLayout);
    onLayoutChange(newLayout);
  };

  return (
    <header className="sticky top-0 z-40 bg-background pt-safe">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={handleSearchClick}
            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all duration-200"
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="text-base text-muted-foreground text-left flex-1">
              Search Stash It...
            </span>
          </button>

          {/* Layout Toggle Button */}
          <button
            onClick={handleLayoutToggle}
            disabled={!onLayoutChange}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-accent active:scale-[0.95] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Switch to ${layout === "stack" ? "grid" : "stack"} view`}
          >
            {layout === "stack" ? (
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            ) : (
              <LayoutList className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-card hover:border-primary/40 active:scale-[0.95] transition-all duration-200 overflow-hidden"
            aria-label="Open profile"
          >
            <img
              src="/images/female-avatar.svg"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}