// src/components/snippets/RecentSnippets.tsx

import { useNavigate } from "react-router-dom";
import { Clock, Book, FileText, Link as LinkIcon, List, Quote } from "lucide-react";
import type { SnippetWithTags } from "@/types/snippet-ui.types";
import { formatDistanceToNow } from "date-fns";
import { getSnippetAccent, getAccentBarStyle } from "@/lib/snippetColors";
import { getSnippetImageUrl } from "@/lib/defaultImages";
import "./RecentSnippets.css";

interface RecentSnippetsProps {
  snippets: SnippetWithTags[];
}

// Icon map for snippet types
const TYPE_ICONS = {
  note: FileText,
  quote: Quote,
  source: Book,
  summary: List,
  link: LinkIcon,
} as const;

export function RecentSnippets({ snippets }: RecentSnippetsProps) {
  const navigate = useNavigate();

  // Get 5 most recent
  const recentSnippets = snippets.slice(0, 5);

  if (recentSnippets.length === 0) {
    return null;
  }

  return (
    <div className="recent-snippets-section">
      <p className="recent-snippets-heading">Latest</p>
      
      <div className="recent-snippets-carousel">
        {recentSnippets.map((snippet) => {
          const TypeIcon = TYPE_ICONS[snippet.type];
          const typeColor = getSnippetAccent(snippet.type);
          const imageUrl = getSnippetImageUrl(snippet.metadata, snippet.type);
          const timeAgo = formatDistanceToNow(new Date(snippet.createdAt), {
            addSuffix: true,
          });

          return (
            <article
              key={snippet.id}
              className="recent-snippet-card-rectangle"
              onClick={() => navigate(`/snippets/${snippet.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/snippets/${snippet.id}`);
                }
              }}
            >
              {/* Accent bar */}
              <div
                className="recent-snippet-accent-bar"
                style={getAccentBarStyle(snippet.type, 0.8)}
                aria-hidden="true"
              />

              {/* Image - Left side square */}
              <div className="recent-snippet-image">
                <img src={imageUrl} alt="" loading="lazy" />
              </div>

              {/* Content - Right side */}
              <div className="recent-snippet-body">
                {/* Header: Icon + Time only */}
                <div className="recent-snippet-header">
                  <TypeIcon 
                    className="recent-snippet-type-icon" 
                    size={16}
                    style={{ color: typeColor }}
                  />
                  <span className="recent-snippet-time">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>

                {/* Text preview */}
                <p className="recent-snippet-text">
                  {snippet.content}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}