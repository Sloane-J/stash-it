// src/components/layout/PageHeader.tsx

import { Search, LayoutGrid, LayoutList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PageHeader() {
  const navigate = useNavigate();
  // Layout state: 'list' (horizontal cards) or 'grid' (side-by-side cards)
  const [layout, setLayout] = useState<"list" | "grid">("list");

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLayoutToggle = () => {
    setLayout(layout === "list" ? "grid" : "list");
    // TODO: Pass layout state to parent component in next step
    console.log("Layout toggled to:", layout === "list" ? "grid" : "list");
  };

  return (
    <header className="sticky top-0 z-40 bg-background pt-safe">
      {/* Header Container */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Curved Search Bar - Pill Shape */}
          <button
            onClick={handleSearchClick}
            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 active:scale-[0.98] transition-all duration-200"
            aria-label="Open search"
          >
            {/* Search Icon */}
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            {/* Placeholder Text */}
            <span className="text-base text-muted-foreground text-left flex-1">
              Search Stash It...
            </span>
          </button>

          {/* Layout Toggle Icon - Shows OPPOSITE of current layout */}
          <button
            onClick={handleLayoutToggle}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-accent active:scale-[0.95] transition-all duration-200"
            aria-label={`Switch to ${layout === "list" ? "grid" : "list"} view`}
          >
            {/* Show Grid icon when in List view (switch TO grid) */}
            {/* Show List icon when in Grid view (switch TO list) */}
            {layout === "list" ? (
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            ) : (
              <LayoutList className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={handleProfileClick}
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-card hover:border-primary/40 active:scale-[0.95] transition-all duration-200 overflow-hidden"
            aria-label="Open profile"
          >
            {/* Placeholder avatar - Replace with actual user image */}
            <img
              src="/images/avatar-placeholder.svg"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}