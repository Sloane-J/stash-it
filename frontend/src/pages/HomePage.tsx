// src/pages/HomePage.tsx
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import { RecentSnippets } from "@/components/snippets/RecentSnippets";
import { useSnippets } from "@/hooks/useSnippets";
import "./HomePage.css";

type SnippetIdOnly = {
  id: string;
};

export function HomePage() {
  const navigate = useNavigate();
  const { snippets = [], isLoading, error, deleteSnippet } = useSnippets();

  // Layout state
  const [layout, setLayout] = useState<"stack" | "grid">("stack");

  const handleCreateSnippet = () => {
    navigate("/create");
  };

  const handleEdit = (snippet: SnippetIdOnly) => {
    navigate(`/snippets/${snippet.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this snippet?"
    );
    if (!confirmed) return;

    try {
      await deleteSnippet(id);
    } catch (err) {
      alert("Failed to delete snippet");
      console.error(err);
    }
  };

  const handleAddToCollection = () => {
    alert("Add to collection feature coming soon!");
  };

  const handleDuplicate = () => {
    alert("Duplicate feature coming soon!");
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageHeader layout={layout} onLayoutChange={setLayout} />
        <div className="max-w-5xl mx-auto py-8">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto" />
            <p className="text-sm text-muted-foreground">
              Loading your snippets...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageHeader layout={layout} onLayoutChange={setLayout} />
        <div className="max-w-5xl mx-auto py-8">
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">
              Failed to load snippets
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (snippets.length === 0) {
    return (
      <>
        <PageHeader layout={layout} onLayoutChange={setLayout} />
        <EmptyState
          icon={FileText}
          title="No snippets yet"
          description="Create your first snippet to start organizing your research. Save quotes, notes, sources, summaries, and links all in one place."
          actionLabel="Create Snippet"
          onAction={handleCreateSnippet}
        />
      </>
    );
  }

  // Normal state
  return (
    <>
      <PageHeader layout={layout} onLayoutChange={setLayout} />
      <div className="max-w-5xl mx-auto py-6 space-y-6">

        {/* Recent snippets carousel */}
        <RecentSnippets snippets={snippets} />

        {/* Main snippets grid */}
        <p class="main-snippet-header">Your Snippets</p>
        <div className={`snippet-grid snippet-grid--${layout}`}>
          {snippets.slice(5).map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToCollection={handleAddToCollection}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      </div>
    </>
  );
}
