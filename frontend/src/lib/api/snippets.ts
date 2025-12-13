
// ========================================
// src/lib/api/snippets.ts
// ========================================

import type {
  CreateSnippetInput,
  SnippetResponse,
  SnippetsListResponse,
  SuccessResponse,
  UpdateSnippetInput,
} from '@/types/snippet';
import { apiClient } from './client';

export const snippetsApi = {
  // Get all snippets
  getAll: () => {
    return apiClient.get<SnippetsListResponse>('/api/snippets');
  },

  // Get single snippet by ID
  getById: (id: string) => {
    return apiClient.get<SnippetResponse>(`/api/snippets/${id}`).then(res => res.snippet);
  },

  // Create new snippet
  create: (data: CreateSnippetInput) => {
    return apiClient.post<SnippetResponse>('/api/snippets', data);
  },

  // Update snippet
  update: (id: string, data: UpdateSnippetInput) => {
    return apiClient.put<SnippetResponse>(`/api/snippets/${id}`, data);
  },

  // Delete snippet
  delete: (id: string) => {
    return apiClient.delete<SuccessResponse>(`/api/snippets/${id}`);
  },

  // Search snippets
  search: (query: string) => {
    return apiClient.get<SnippetsListResponse>(
      `/api/snippets/search?q=${encodeURIComponent(query)}`
    );
  },
};