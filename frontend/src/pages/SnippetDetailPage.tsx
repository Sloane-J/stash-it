// src/pages/SnippetDetailPage.tsx

import type { SnippetWithTags } from "@/types/snippet-ui.types";
import { ChevronLeft, Heart, MoreHorizontal, Edit, Trash2, Copy, Share2, FolderPlus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SnippetDetailPage.css";

export function SnippetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [snippet, setSnippet] = useState<SnippetWithTags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Handler functions
  const handleDelete = async () => {
    setShowOptionsMenu(false);
    if (!window.confirm("Delete this snippet?")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/snippets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        navigate("/");
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleEdit = () => {
    setShowOptionsMenu(false);
    setIsEditing(true);
    // TODO: Implement inline editing
  };

  const handleAddToCollection = () => {
    setShowOptionsMenu(false);
    // TODO: Open collection modal
    alert("Add to collection feature coming soon!");
  };

  const handleDuplicate = () => {
    setShowOptionsMenu(false);
    alert("Duplicate feature coming soon!");
  };

  const handleShare = () => {
    setShowOptionsMenu(false);
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  // Fetch snippet data
  useEffect(() => {
    if (!id) {
      setError("Invalid snippet id");
      setIsLoading(false);
      return;
    }

    const fetchSnippet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/snippets/${id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }

        const data = await response.json();
        setSnippet(data.snippet);
      } catch (err) {
        console.error("Error fetching snippet:", err);
        setError(err instanceof Error ? err.message : "Failed to load snippet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="snippet-detail-loading">
        <div className="loading-spinner" />
        <p>Loading snippet...</p>
      </div>
    );
  }

  // Error state
  if (error || !snippet) {
    return (
      <div className="snippet-detail-error">
        <p className="error-message">Failed to load snippet</p>
        {error && <p className="error-details">{error}</p>}
        <button onClick={() => navigate("/")} className="btn-secondary">
          Back to Home
        </button>
      </div>
    );
  }

  // Safe metadata access
  const metadata = snippet.metadata ?? {};
  const hasImage = Boolean(metadata.favicon || metadata.image);

  // Get snippet type color
  const getTypeColor = (type: string) => {
    const colors = {
      quote: "var(--clr-quote)",
      note: "var(--clr-note)",
      source: "var(--clr-source)",
      summary: "var(--clr-summary)",
      link: "var(--clr-link)",
    };
    return colors[type as keyof typeof colors] || "var(--clr-primary-a0)";
  };

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: API call to update favorite status
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get type-specific metadata for left column
  const getLeftMetadata = () => {
    switch (snippet.type) {
      case "quote":
        return (
          <>
            {metadata.source && (
              <div className="metadata-item">
                <span className="metadata-label">Source</span>
                <span className="metadata-value">{metadata.source}</span>
              </div>
            )}
            {metadata.author && (
              <div className="metadata-item">
                <span className="metadata-label">Author</span>
                <span className="metadata-value">{metadata.author}</span>
              </div>
            )}
            {metadata.page && (
              <div className="metadata-item">
                <span className="metadata-label">Page</span>
                <span className="metadata-value">{metadata.page}</span>
              </div>
            )}
          </>
        );

      case "note":
        return (
          <>
            {metadata.topic && (
              <div className="metadata-item">
                <span className="metadata-label">Topic</span>
                <span className="metadata-value">{metadata.topic}</span>
              </div>
            )}
          </>
        );

      case "source":
        return (
          <>
            {metadata.author && (
              <div className="metadata-item">
                <span className="metadata-label">Author</span>
                <span className="metadata-value">{metadata.author}</span>
              </div>
            )}
            {metadata.title && (
              <div className="metadata-item">
                <span className="metadata-label">Title</span>
                <span className="metadata-value">{metadata.title}</span>
              </div>
            )}
            {metadata.year && (
              <div className="metadata-item">
                <span className="metadata-label">Year</span>
                <span className="metadata-value">{metadata.year}</span>
              </div>
            )}
            {metadata.citation && (
              <div className="metadata-item">
                <span className="metadata-label">Citation</span>
                <span className="metadata-value">{metadata.citation}</span>
              </div>
            )}
          </>
        );

      case "summary":
        return (
          <>
            {metadata.originalSource && (
              <div className="metadata-item">
                <span className="metadata-label">Summarized From</span>
                <span className="metadata-value">
                  {metadata.originalSource}
                </span>
              </div>
            )}
            {metadata.originalLength && (
              <div className="metadata-item">
                <span className="metadata-label">Original Length</span>
                <span className="metadata-value">
                  {metadata.originalLength}
                </span>
              </div>
            )}
          </>
        );

      case "link":
        return (
          <>
            {metadata.url && (
              <div className="metadata-item">
                <span className="metadata-label">URL</span>
                <a
                  href={metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="metadata-value metadata-link"
                >
                  {new URL(metadata.url).hostname}
                </a>
              </div>
            )}
            {metadata.siteName && (
              <div className="metadata-item">
                <span className="metadata-label">Site</span>
                <span className="metadata-value">{metadata.siteName}</span>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="snippet-detail-page">
      {/* SECTION 1: Header */}
      <div className="snippet-detail-header">
        {hasImage ? (
          <div
            className="snippet-detail-header-image"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%), url(${metadata.image || metadata.favicon})`,
            }}
          >
            {/* Header Icons - Overlay on Image */}
            <div className="snippet-detail-header-icons">
              {/* Back Button - Top Left */}
              <button
                className="icon-button icon-button-back"
                onClick={() => navigate("/")}
                aria-label="Go back"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Options Menu - Top Right */}
              <div className="options-menu-container" ref={optionsMenuRef}>
                <button
                  className="icon-button icon-button-options"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  aria-label="More options"
                >
                  <MoreHorizontal size={24} />
                </button>

                {/* Dropdown Menu */}
                {showOptionsMenu && (
                  <div className="options-dropdown">
                    <button className="dropdown-item" onClick={handleEdit}>
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                    <button className="dropdown-item" onClick={handleAddToCollection}>
                      <FolderPlus size={18} />
                      <span>Add to Collection</span>
                    </button>
                    <button className="dropdown-item" onClick={handleDuplicate}>
                      <Copy size={18} />
                      <span>Duplicate</span>
                    </button>
                    <button className="dropdown-item" onClick={handleShare}>
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item--danger" onClick={handleDelete}>
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Favorite Button - Bottom Right */}
              <button
                className={`icon-button icon-button-favorite ${isFavorite ? "is-favorite" : ""}`}
                onClick={handleToggleFavorite}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="snippet-detail-header-solid"
            style={{ backgroundColor: getTypeColor(snippet.type) + "1A" }}
          >
            {/* Header Icons - On Solid Background */}
            <div className="snippet-detail-header-icons">
              {/* Back Button */}
              <button
                className="icon-button icon-button-back"
                onClick={() => navigate("/")}
                aria-label="Go back"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Options Menu */}
              <div className="options-menu-container" ref={optionsMenuRef}>
                <button
                  className="icon-button icon-button-options"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  aria-label="More options"
                >
                  <MoreHorizontal size={24} />
                </button>

                {/* Dropdown Menu */}
                {showOptionsMenu && (
                  <div className="options-dropdown">
                    <button className="dropdown-item" onClick={handleEdit}>
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                    <button className="dropdown-item" onClick={handleAddToCollection}>
                      <FolderPlus size={18} />
                      <span>Add to Collection</span>
                    </button>
                    <button className="dropdown-item" onClick={handleDuplicate}>
                      <Copy size={18} />
                      <span>Duplicate</span>
                    </button>
                    <button className="dropdown-item" onClick={handleShare}>
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item--danger" onClick={handleDelete}>
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Favorite Button */}
              <button
                className={`icon-button icon-button-favorite ${isFavorite ? "is-favorite" : ""}`}
                onClick={handleToggleFavorite}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Type Icon and Label */}
            <div className="snippet-detail-header-type">
              <span className="type-label">{snippet.type.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Centered content container */}
      <div className="snippet-detail-container">
        {/* SECTION 2: Metadata */}
        <div className="snippet-detail-metadata">
          <div className="metadata-grid">
            {/* Left Column - Type-specific metadata */}
            <div className="metadata-column metadata-left">
              {getLeftMetadata()}
            </div>

            {/* Right Column - Universal metadata */}
            <div className="metadata-column metadata-right">
              <div className="metadata-item">
                <span className="metadata-label">Created</span>
                <span className="metadata-value">
                  {formatDate(snippet.created_at)}
                </span>
              </div>

              <div className="metadata-item">
                <span className="metadata-label">Type</span>
                <span
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(snippet.type) }}
                >
                  {snippet.type}
                </span>
              </div>

              {snippet.updated_at &&
                snippet.updated_at !== snippet.created_at && (
                  <div className="metadata-item">
                    <span className="metadata-label">Last Edited</span>
                    <span className="metadata-value">
                      {formatDate(snippet.updated_at)}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Content */}
        <div className="snippet-detail-content" data-type={snippet.type}>
          {snippet.content}
        </div>

        {/* SECTION 4: Tags */}
        <div className="snippet-detail-tags">
          <h3 className="tags-heading">Tags</h3>
          <div className="tags-list">
            {snippet.tags?.map((tag) => (
              <button
                key={tag.id}
                className="tag-pill"
                onClick={() => navigate(`/tags/${tag.id}`)}
              >
                #{tag.name}
              </button>
            ))}
            <button className="tag-add-button">+ Add Tag</button>
          </div>
        </div>
      </div>
    </div>
  );
}