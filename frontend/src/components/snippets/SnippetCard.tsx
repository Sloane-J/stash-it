// src/components/snippets/SnippetCard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MoreVertical,
  Book,
  FileText,
  Link as LinkIcon,
  List,
  Quote,
} from "lucide-react";
import type { SnippetWithTags } from "@/types/snippet-ui.types";
import type { LucideIcon } from "lucide-react";
import { SnippetActions } from "./SnippetActions";
import { formatDistanceToNow } from "date-fns";
import { getAccentBarStyle, getSnippetAccent } from "@/lib/snippetColors";
import { getSnippetImageUrl } from "@/lib/defaultImages";
import "./SnippetCard.css";

interface SnippetCardProps {
  snippet: SnippetWithTags;
  onEdit?: (snippet: SnippetWithTags) => void;
  onDelete?: (snippetId: string) => void;
  onAddToCollection?: (snippetId: string) => void;
  onDuplicate?: (snippet: SnippetWithTags) => void;
}

// Strongly typed icon map
const TYPE_ICONS: Record<SnippetWithTags["type"], LucideIcon> = {
  note: FileText,
  quote: Quote,
  source: Book,
  summary: List,
  link: LinkIcon,
};

export function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onAddToCollection,
  onDuplicate,
}: SnippetCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const TypeIcon = TYPE_ICONS[snippet.type];
  const typeColor = getSnippetAccent(snippet.type);

  const imageUrl = getSnippetImageUrl(snippet.metadata, snippet.type);

  const timeAgo = formatDistanceToNow(new Date(snippet.createdAt), {
    addSuffix: true,
  });

  const visibleTags = snippet.tags?.slice(0, 2) || [];
  const remainingTags = Math.max((snippet.tags?.length || 0) - 2, 0);

  const getMetadataText = () => {
    const meta = snippet.metadata;
    if (!meta) return null;

    switch (snippet.type) {
      case "quote":
        return meta.source || null;
      case "source":
        return meta.author || null;
      case "link":
        try {
          return meta.url ? new URL(meta.url).hostname : null;
        } catch {
          return null;
        }
      case "summary":
        return meta.summarizedFrom || null;
      default:
        return null;
    }
  };

  const metadataText = getMetadataText();

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(
        ".snippet-actions-trigger, .snippet-actions, .snippet-tags"
      )
    ) {
      return;
    }
    navigate(`/snippets/${snippet.id}`);
  };

  const handleTagClick = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    navigate(`/tags/${tagId}`);
  };

  return (
    <article
      className="snippet-card-rectangle group"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick(e as any)}
      aria-label={`${snippet.type} snippet`}
    >
      {/* Accent bar */}
      <div
        className="snippet-card-accent-bar"
        style={getAccentBarStyle(snippet.type, 0.8)}
        aria-hidden="true"
      />

      {/* Image */}
      {imageUrl && (
        <div className="snippet-card-image-square">
          <img src={imageUrl} alt="" loading="lazy" />
        </div>
      )}

      {/* Body */}
      <div className="snippet-card-body">
        {/* Header */}
        <div className="snippet-card-header">
          <div className="snippet-card-header-left">
            <TypeIcon
              className="snippet-type-icon"
              size={18}
              style={{ color: typeColor }}
            />

            <span className="snippet-timestamp">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>

            {metadataText && (
              <>
                <span className="metadata-separator">•</span>
                <span className="snippet-metadata-inline">
                  {metadataText}
                </span>
              </>
            )}
          </div>

          <button
            className="snippet-actions-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((v) => !v);
            }}
            aria-label="Snippet actions"
            aria-expanded={showActions}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <SnippetActions
              snippet={snippet}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToCollection={onAddToCollection}
              onDuplicate={onDuplicate}
              onClose={() => setShowActions(false)}
            />
          )}
        </div>

        {/* Content */}
        <div className="snippet-card-content">
          <p className="snippet-card-text">{snippet.content}</p>
        </div>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="snippet-tags snippet-card-tags">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="snippet-tag"
                onClick={(e) => handleTagClick(e, tag.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTagClick(e as any, tag.id);
                  }
                }}
              >
                #{tag.name}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="snippet-tag-more">+{remainingTags}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
