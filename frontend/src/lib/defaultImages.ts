// src/lib/defaultImages.ts
import { Book, FileText, Link as LinkIcon, List, Quote } from "lucide-react";
import { getSnippetAccent } from "./snippetColors";

type SnippetType = 'note' | 'quote' | 'source' | 'summary' | 'link';

/**
 * Icon map for each snippet type
 */
const SNIPPET_ICONS = {
  note: FileText,
  quote: Quote,
  source: Book,
  summary: List,
  link: LinkIcon,
} as const;

/**
 * Generate SVG data URL for default snippet image
 * @param type - Snippet type
 * @returns SVG data URL that can be used as image src
 */
export function getDefaultSnippetImage(type: SnippetType): string {
  const color = getSnippetAccent(type);
  const IconComponent = SNIPPET_ICONS[type];
  
  // Get icon path from lucide-react component
  // This is a simplified approach - we'll create a clean SVG
  const iconPaths: Record<SnippetType, string> = {
    note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
    source: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20 M4 19.5V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13',
    summary: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  };

  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with gradient -->
      <defs>
        <linearGradient id="grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.2" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad-${type})"/>
      
      <!-- Icon centered -->
      <g transform="translate(200, 200)">
        <g transform="scale(4) translate(-12, -12)">
          <path d="${iconPaths[type]}" 
                stroke="${color}" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                fill="none"/>
        </g>
      </g>
    </svg>
  `;

  // Convert to data URL
  const encoded = encodeURIComponent(svg.trim());
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Get image URL for snippet (user image or default)
 * @param metadata - Snippet metadata object
 * @param type - Snippet type
 * @returns Image URL (user's or default)
 */
export function getSnippetImageUrl(
  metadata: Record<string, any> | null | undefined,
  type: SnippetType
): string {
  // Check for user-provided image
  const userImage = metadata?.image || metadata?.favicon;
  
  if (userImage) {
    return userImage;
  }
  
  // Return default image
  return getDefaultSnippetImage(type);
}

/**
 * Check if snippet has a user-provided image
 * @param metadata - Snippet metadata object
 * @returns True if user image exists
 */
export function hasUserImage(metadata: Record<string, any> | null | undefined): boolean {
  return Boolean(metadata?.image || metadata?.favicon);
}