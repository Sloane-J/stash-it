import { FolderOpen as FolderIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export function CollectionsPage() {
  const [collections] = useState([]);

  const handleCreateCollection = () => {
    alert("Create collection feature coming soon!");
  };

  if (collections.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyState
          icon={FolderIcon}
          title="No collections yet"
          description="Collections help you organize related snippets together. Create a collection for each project, research topic, or area of interest."
          actionLabel="Create Collection"
          onAction={handleCreateCollection}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-lg text-muted-foreground">
            Your collections will appear here
          </p>
        </div>
      </div>
    </>
  );
}
