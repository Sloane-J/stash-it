
// ========================================
// src/lib/api/tags.ts
// ========================================

import { apiClient } from './client';
import type {
  TagsListResponse,
  TagResponse,
  SnippetTagsResponse,
  TaggedSnippetsResponse,
  CreateTagInput,
} from '@/types/snippet';

export const tagsApi = {
  // Get all tags
  getAll: () => {
    return apiClient.get<TagsListResponse>('/api/tags');
  },

  // Get single tag
  getById: (id: string) => {
    return apiClient.get<TagResponse>(`/api/tags/${id}`).then(res => res.tag);
  },

  // Create new tag
  create: (data: CreateTagInput) => {
    return apiClient.post<TagResponse>('/api/tags', data);
  },

  // Delete tag
  delete: (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/api/tags/${id}`);
  },

  // Get tags for a snippet
  getSnippetTags: (snippetId: string) => {
    return apiClient.get<SnippetTagsResponse>(`/api/snippets/${snippetId}/tags`);
  },

  // Add tag to snippet
  addToSnippet: (snippetId: string, tagId: string) => {
    return apiClient.post<{ success: boolean }>(
      `/api/snippets/${snippetId}/tags/${tagId}`
    );
  },

  // Remove tag from snippet
  removeFromSnippet: (snippetId: string, tagId: string) => {
    return apiClient.delete<{ success: boolean }>(
      `/api/snippets/${snippetId}/tags/${tagId}`
    );
  },

  // Get all snippets with a specific tag
  getTaggedSnippets: (tagId: string) => {
    return apiClient.get<TaggedSnippetsResponse>(`/api/tags/${tagId}/snippets`);
  },

  // Auto-generate tags from text
  autoGenerate: (text: string) => {
    return apiClient.post<{ tags: string[] }>('/api/tags/auto', { text });
  },
};