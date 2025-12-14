// src/components/snippets/TypeBadge.tsx
import { Book, FileText, Link, List, Quote } from "lucide-react";
import { SNIPPET_TYPES, type SnippetType } from "@/types/snippet";
import { getSnippetAccent } from "@/lib/snippetColors";
import "./TypeBadge.css";

interface TypeBadgeProps {
  type: SnippetType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const ICON_MAP = {
  quote: Quote,
  note: FileText,
  source: Book,
  summary: List,
  link: Link,
};

export function TypeBadge({
  type,
  size = "md",
  showLabel = true,
}: TypeBadgeProps) {
  const typeInfo = SNIPPET_TYPES[type];
  const Icon = ICON_MAP[type];
  
  // Get color from unified color system
  const accentColor = getSnippetAccent(type);

  // Size classes
  const sizeClasses = {
    sm: "type-badge-sm",
    md: "type-badge-md",
    lg: "type-badge-lg",
  };

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation>
<span
      className={`type-badge ${sizeClasses[size]}`}
      style={
        {
          "--badge-color": accentColor,
          backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          color: accentColor,
        } as React.CSSProperties
      }
      aria-label={`${typeInfo.label} snippet`}
    >
      <Icon className="type-badge-icon" />
      {showLabel && (
        <span className="type-badge-label">{typeInfo.label.toUpperCase()}</span>
      )}
    </span>
  );
}