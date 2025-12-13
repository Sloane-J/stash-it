import { Book, FileText, Link, List, Quote } from "lucide-react";
import { SNIPPET_TYPES, type SnippetType } from "@/types/snippet";
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

  // Size classes
  const sizeClasses = {
    sm: "type-badge-sm",
    md: "type-badge-md",
    lg: "type-badge-lg",
  };

  return (
    <span
      className={`type-badge ${sizeClasses[size]}`}
      style={
        {
          "--badge-color": typeInfo.color,
          backgroundColor: `color-mix(in srgb, ${typeInfo.color} 15%, transparent)`,
          color: typeInfo.color,
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
