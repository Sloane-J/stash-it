// src/components/snippets/SnippetCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MoreVertical } from "lucide-react";
import type { SnippetWithTags } from "@/types/snippet-ui.types";
import { TypeBadge } from "./TypeBadge";
import { SnippetActions } from "./SnippetActions";
import { formatDistanceToNow } from "date-fns";
import { getAccentBarStyle } from "@/lib/snippetColors";
import './SnippetCard.css';

interface SnippetCardProps {
  snippet: SnippetWithTags;
  layout?: 'stack' | 'grid'; // Layout mode prop for future grid view
  onEdit?: (snippet: SnippetWithTags) => void;
  onDelete?: (snippetId: string) => void;
  onAddToCollection?: (snippetId: string) => void;
  onDuplicate?: (snippet: SnippetWithTags) => void;
}

export function SnippetCard({
  snippet,
  layout = 'stack', // Default to stack view
  onEdit,
  onDelete,
  onAddToCollection,
  onDuplicate,
}: SnippetCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(snippet.createdAt), {
    addSuffix: true,
  });

  // Get first 3 tags
  const visibleTags = snippet.tags?.slice(0, 3) || [];
  const remainingTags = (snippet.tags?.length || 0) - 3;

  // Extract image from metadata if exists
  const imageUrl = snippet.metadata?.favicon;

  // Get metadata display text
  const getMetadataText = () => {
    const meta = snippet.metadata;
    if (!meta) return null;

    switch (snippet.type) {
      case "quote":
        return meta.source && meta.page
          ? `${meta.source} • Page ${meta.page}`
          : meta.source || null;
      case "source":
        return meta.author || meta.citation || null;
      case "link":
        return meta.url ? new URL(meta.url).hostname : null;
      case "summary":
        return meta.summarizedFrom || null;
      default:
        return null;
    }
  };

  const metadataText = getMetadataText();

  // Handle card click (navigate to detail view)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking actions menu or tags
    if ((e.target as HTMLElement).closest(".snippet-actions, .snippet-tags")) {
      return;
    }
    navigate(`/snippets/${snippet.id}`);
  };

  // Handle tag click
  const handleTagClick = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    navigate(`/tags/${tagId}`);
  };

  return (
    <article
      className={`snippet-card snippet-card--${layout} group`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick(e as any)}
      aria-label={`${snippet.type} snippet`}
    >
      {/* Colored accent bar on right edge */}
      <div 
        className="snippet-card-accent-bar"
        style={getAccentBarStyle(snippet.type, 0.8)}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="snippet-card-header">
        <div className="snippet-card-header-left">
          <TypeBadge type={snippet.type} />
          <span className="snippet-timestamp">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo}
          </span>
        </div>

        <button
          className="snippet-actions-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          aria-label="Snippet actions"
          aria-expanded={showActions}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Actions dropdown */}
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

      {/* Content with truncation */}
      <div 
        className={`snippet-card-content snippet-card-content--${layout}`}
        data-type={snippet.type}
      >
        <p className="snippet-card-text">{snippet.content}</p>
      </div>

      {/* Image preview (if exists) */}
      {imageUrl && (
        <div className={`snippet-card-image snippet-card-image--${layout}`}>
          <img src={imageUrl} alt="" loading="lazy" />
          {/* Dark gradient overlay */}
          <div className="snippet-card-image-overlay" />
        </div>
      )}

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
                if (e.key === 'Enter') {
                  handleTagClick(e as any, tag.id);
                }
              }}
            >
              #{tag.name}
            </span>
          ))}
          {remainingTags > 0 && (
            <span className="snippet-tag-more">+{remainingTags} more</span>
          )}
        </div>
      )}

      {/* Metadata footer */}
      {metadataText && (
        <div className="snippet-card-footer">
          <p className="snippet-metadata">{metadataText}</p>
        </div>
      )}
    </article>
  );
}