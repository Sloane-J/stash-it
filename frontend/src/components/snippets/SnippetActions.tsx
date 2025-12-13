// src/components/snippets/SnippetActions.tsx
import { useEffect, useRef, useState } from 'react';
import { Edit, FolderPlus, Copy, Trash2 } from 'lucide-react';
import type { SnippetWithTags } from '@/types/snippet-ui.types';
import './SnippetActions.css';

interface SnippetActionsProps {
  snippet: SnippetWithTags;
  onEdit?: (snippet: SnippetWithTags) => void;
  onDelete?: (snippetId: string) => void;
  onAddToCollection?: (snippetId: string) => void;
  onDuplicate?: (snippet: SnippetWithTags) => void;
  onClose: () => void;
}

export function SnippetActions({
  snippet,
  onEdit,
  onDelete,
  onAddToCollection,
  onDuplicate,
  onClose
}: SnippetActionsProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleEdit = () => {
    onEdit?.(snippet);
    onClose();
  };

  const handleAddToCollection = () => {
    onAddToCollection?.(snippet.id);
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate?.(snippet);
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete?.(snippet.id);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div ref={menuRef} className="snippet-actions-menu snippet-actions-confirm">
        <p className="snippet-actions-confirm-text">
          Delete this snippet?
        </p>
        <div className="snippet-actions-confirm-buttons">
          <button
            className="snippet-actions-confirm-button snippet-actions-confirm-cancel"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="snippet-actions-confirm-button snippet-actions-confirm-delete"
            onClick={confirmDelete}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="snippet-actions-menu" role="menu">
      {onEdit && (
        <button
          className="snippet-actions-item"
          onClick={handleEdit}
          role="menuitem"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
      )}

      {onAddToCollection && (
        <button
          className="snippet-actions-item"
          onClick={handleAddToCollection}
          role="menuitem"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add to Collection</span>
        </button>
      )}

      {onDuplicate && (
        <button
          className="snippet-actions-item"
          onClick={handleDuplicate}
          role="menuitem"
        >
          <Copy className="w-4 h-4" />
          <span>Duplicate</span>
        </button>
      )}

      {onDelete && (
        <>
          <div className="snippet-actions-divider" />
          <button
            className="snippet-actions-item snippet-actions-item-danger"
            onClick={handleDelete}
            role="menuitem"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
}