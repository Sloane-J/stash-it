import type { Snippet, Tag, Collection, Image } from './snippet';

/**
 * Snippet with populated tags for display in UI
 */
export interface SnippetWithTags extends Snippet {
  tags?: Tag[];
}

/**
 * Snippet with populated collections for display in UI
 */
export interface SnippetWithCollections extends Snippet {
  collections?: Collection[];
}

/**
 * Snippet with populated images for display in UI
 */
export interface SnippetWithImages extends Snippet {
  images?: Image[];
}

/**
 * Fully populated snippet with all relationships
 */
export interface SnippetComplete extends Snippet {
  tags?: Tag[];
  collections?: Collection[];
  images?: Image[];
}

/**
 * Collection with populated snippets
 */
export interface CollectionWithSnippets extends Collection {
  snippets: Snippet[];
}

/**
 * Tag with populated snippets
 */
export interface TagWithSnippets extends Tag {
  snippets: Snippet[];
}