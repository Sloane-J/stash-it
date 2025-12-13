// src/pages/HomePage.tsx

import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import { useSnippets } from "@/hooks/useSnippets";

export function HomePage() {
  const navigate = useNavigate();
  const { snippets, isLoading, error, deleteSnippet } = useSnippets();

  const handleCreateSnippet = () => {
    navigate("/create");
  };

  const handleEdit = (snippet: any) => {
    navigate(`/snippets/${snippet.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      try {
        await deleteSnippet(id);
      } catch (err) {
        alert("Failed to delete snippet");
        console.error(err);
      }
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
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center space-y-4">
          <div className="loading-spinner mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading your snippets...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">
            Failed to load snippets
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (snippets.length === 0) {
    return (
      <>
        <PageHeader />
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
      <PageHeader />

      <div className="max-w-5xl mx-auto py-6 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Your Snippets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {snippets.length}{" "}
            {snippets.length === 1 ? "snippet" : "snippets"}
          </p>
        </div>

        {/* Snippets grid */}
        <div className="snippet-grid">
          {snippets.map((snippet) => (
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
