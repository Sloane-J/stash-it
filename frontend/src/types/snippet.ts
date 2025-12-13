// ===================================
// SNIPPET TYPES
// ===================================

export type SnippetType = 'quote' | 'note' | 'source' | 'summary' | 'link';

export interface SnippetMetadata {
  // Quote-specific
  source?: string;
  author?: string;
  page?: number;
  
  // Link-specific
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  
  // Source-specific
  isbn?: string;
  doi?: string;
  citation?: string;
  
  // Summary-specific
  originalLength?: number;
  summarizedFrom?: string;
  
  // General
  [key: string]: any; // Allow custom metadata
}

export interface Snippet {
  id: string;
  userId: string;
  type: SnippetType;
  content: string;
  metadata: SnippetMetadata | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// API Response types
export interface SnippetResponse {
  snippet: Snippet;
}

export interface SnippetsListResponse {
  snippets: Snippet[];
  count: number;
}

export interface SnippetSearchResponse {
  snippets: Snippet[];
  count: number;
  query: string;
}

// ===================================
// TAG TYPES
// ===================================

export interface Tag {
  id: string;
  name: string;
  createdAt: string | Date;
  snippetCount?: number; // Only present in GET /tags
}

export interface TagResponse {
  success: boolean;
  tag: Tag;
}

export interface TagsListResponse {
  tags: Tag[];
  count: number;
}

export interface SnippetTagsResponse {
  snippetId: string;
  tags: Tag[];
  count: number;
}

export interface TaggedSnippetsResponse {
  tag: Tag;
  snippets: Snippet[];
  count: number;
}

// ===================================
// COLLECTION TYPES
// ===================================

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  snippetCount?: number; // Only present in GET /collections
}

export interface CollectionResponse {
  collection: Collection;
}

export interface CollectionsListResponse {
  collections: Collection[];
  count: number;
}

export interface CollectionSnippetsResponse {
  collection: Collection;
  snippets: Snippet[];
  count: number;
}

// ===================================
// IMAGE TYPES
// ===================================

export interface Image {
  id: string;
  userId: string;
  snippetId: string | null;
  imagekitFileId: string;
  imagekitUrl: string;
  fileSize: number;
  createdAt: string | Date;
  thumbnailUrl?: string; // Generated on frontend
}

export interface ImageUploadResponse {
  success: boolean;
  image: {
    id: string;
    url: string;
    thumbnailUrl: string;
    fileSize: number;
    imagekitFileId: string;
  };
}

export interface ImagesListResponse {
  images: Image[];
  stats: {
    count: number;
    totalBytes: number;
    totalMB: string;
  };
}

// ===================================
// TYPE GUARDS
// ===================================

export function isSnippetType(type: string): type is SnippetType {
  return ['quote', 'note', 'source', 'summary', 'link'].includes(type);
}

export function hasMetadata(snippet: Snippet): snippet is Snippet & { metadata: SnippetMetadata } {
  return snippet.metadata !== null;
}

// ===================================
// UTILITY TYPES
// ===================================

// For creating new snippets (without server-generated fields)
export type CreateSnippetInput = {
  type: SnippetType;
  content: string;
  metadata?: SnippetMetadata;
};

// For updating snippets (all fields optional except what's being updated)
export type UpdateSnippetInput = Partial<{
  type: SnippetType;
  content: string;
  metadata: SnippetMetadata;
}>;

// For creating new tags
export type CreateTagInput = {
  name: string;
};

// For creating new collections
export type CreateCollectionInput = {
  name: string;
  description?: string;
};

// For updating collections
export type UpdateCollectionInput = Partial<{
  name: string;
  description: string | null;
}>;

// ===================================
// SNIPPET TYPE METADATA
// ===================================

// Helper constants for snippet types
export const SNIPPET_TYPES: Record<SnippetType, { label: string; icon: string; color: string }> = {
  quote: {
    label: 'Quote',
    icon: 'Quote',
    color: 'var(--clr-quote)'
  },
  note: {
    label: 'Note',
    icon: 'FileText',
    color: 'var(--clr-note)'
  },
  source: {
    label: 'Source',
    icon: 'Book',
    color: 'var(--clr-source)'
  },
  summary: {
    label: 'Summary',
    icon: 'List',
    color: 'var(--clr-summary)'
  },
  link: {
    label: 'Link',
    icon: 'Link',
    color: 'var(--clr-link)'
  }
};

// ===================================
// ERROR TYPES
// ===================================

export interface ApiError {
  error: string;
  details?: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}