// src/hooks/useSnippets.ts
import { useState, useEffect, useCallback } from 'react';
import { snippetsApi, tagsApi, ApiError } from '@/lib/api';
import type { CreateSnippetInput, UpdateSnippetInput } from '@/types/snippet';
import type { SnippetWithTags } from '@/types/snippet-ui.types';

interface UseSnippetsReturn {
  snippets: SnippetWithTags[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSnippet: (input: CreateSnippetInput) => Promise<SnippetWithTags>;
  updateSnippet: (id: string, input: UpdateSnippetInput) => Promise<SnippetWithTags>;
  deleteSnippet: (id: string) => Promise<void>;
}

export function useSnippets(): UseSnippetsReturn {
  const [snippets, setSnippets] = useState<SnippetWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch snippet with its tags
  const fetchSnippetWithTags = async (snippetId: string): Promise<SnippetWithTags> => {
    try {
      const snippet = await snippetsApi.getById(snippetId);
      const tagsData = await tagsApi.getSnippetTags(snippetId);
      return {
        ...snippet,
        tags: tagsData.tags,
      };
    } catch (err) {
      console.error(`Failed to fetch tags for snippet ${snippetId}:`, err);
      // Return snippet without tags if tags fetch fails
      const snippet = await snippetsApi.getById(snippetId);
      return {
        ...snippet,
        tags: [],
      };
    }
  };

  // Fetch all snippets with their tags
  const fetchSnippets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all snippets
      const data = await snippetsApi.getAll();

      // Fetch tags for each snippet in parallel
      const snippetsWithTags = await Promise.all(
        data.snippets.map(async (snippet) => {
          try {
            const tagsData = await tagsApi.getSnippetTags(snippet.id);
            return {
              ...snippet,
              tags: tagsData.tags,
            };
          } catch (err) {
            console.error(`Failed to fetch tags for snippet ${snippet.id}:`, err);
            return {
              ...snippet,
              tags: [],
            };
          }
        })
      );

      setSnippets(snippetsWithTags);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);

        // If 401, redirect to login
        if (err.status === 401) {
          window.location.href = '/auth/login';
        }
      } else {
        setError('Failed to load snippets');
      }
      console.error('Error fetching snippets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Create snippet
  const createSnippet = useCallback(
    async (input: CreateSnippetInput): Promise<SnippetWithTags> => {
      try {
        const newSnippet = await snippetsApi.create(input);

        // Fetch with tags
        const snippetWithTags = await fetchSnippetWithTags(newSnippet.snippet.id);

        // Add to beginning of list
        setSnippets((prev) => [snippetWithTags, ...prev]);

        return snippetWithTags;
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }
        throw new Error('Failed to create snippet');
      }
    },
    []
  );

  // Update snippet
  const updateSnippet = useCallback(
    async (id: string, input: UpdateSnippetInput): Promise<SnippetWithTags> => {
      try {
        const updatedSnippet = await snippetsApi.update(id, input);

        // Fetch updated snippet with tags
        const snippetWithTags = await fetchSnippetWithTags(updatedSnippet.snippet.id);

        // Update in list
        setSnippets((prev) =>
          prev.map((s) => (s.id === id ? snippetWithTags : s))
        );

        return snippetWithTags;
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }
        throw new Error('Failed to update snippet');
      }
    },
    []
  );

  // Delete snippet
  const deleteSnippet = useCallback(async (id: string): Promise<void> => {
    try {
      await snippetsApi.delete(id);

      // Remove from list
      setSnippets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error('Failed to delete snippet');
    }
  }, []);

  return {
    snippets,
    isLoading,
    error,
    refetch: fetchSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
  };
}