/**
 * Color system for snippet types
 * Provides consistent color mapping across the application
 */

export type SnippetType = 'note' | 'quote' | 'source' | 'summary' | 'link';

export interface SnippetColorConfig {
  accent: string;        // Hex color for accent bar and icons
  name: string;          // Tailwind color name for utility classes
  light: string;         // Light variant for backgrounds (optional)
  dark: string;          // Dark variant for text (optional)
}

/**
 * Color configuration for each snippet type
 * Based on semantic meaning and visual distinction
 */
export const snippetColors: Record<SnippetType, SnippetColorConfig> = {
  note: {
    accent: '#3B82F6',     // blue-500
    name: 'blue',
    light: '#EFF6FF',      // blue-50
    dark: '#1E3A8A'        // blue-900
  },
  quote: {
    accent: '#A855F7',     // purple-500
    name: 'purple',
    light: '#FAF5FF',      // purple-50
    dark: '#581C87'        // purple-900
  },
  source: {
    accent: '#10B981',     // emerald-500
    name: 'emerald',
    light: '#ECFDF5',      // emerald-50
    dark: '#064E3B'        // emerald-900
  },
  summary: {
    accent: '#F59E0B',     // amber-500
    name: 'amber',
    light: '#FFFBEB',      // amber-50
    dark: '#78350F'        // amber-900
  },
  link: {
    accent: '#6B7280',     // gray-500
    name: 'gray',
    light: '#F9FAFB',      // gray-50
    dark: '#1F2937'        // gray-900
  }
};

/**
 * Get accent color for a snippet type
 * @param type - The snippet type
 * @returns Hex color string
 */
export function getSnippetAccent(type: SnippetType): string {
  return snippetColors[type]?.accent || snippetColors.note.accent;
}

/**
 * Get Tailwind color name for a snippet type
 * Useful for dynamic class generation
 * @param type - The snippet type
 * @returns Tailwind color name (e.g., 'blue', 'purple')
 */
export function getSnippetColorName(type: SnippetType): string {
  return snippetColors[type]?.name || snippetColors.note.name;
}

/**
 * Get light background color for a snippet type
 * @param type - The snippet type
 * @returns Hex color string for light background
 */
export function getSnippetLightColor(type: SnippetType): string {
  return snippetColors[type]?.light || snippetColors.note.light;
}

/**
 * Get dark text color for a snippet type
 * @param type - The snippet type
 * @returns Hex color string for dark text
 */
export function getSnippetDarkColor(type: SnippetType): string {
  return snippetColors[type]?.dark || snippetColors.note.dark;
}

/**
 * Get all color properties for a snippet type
 * @param type - The snippet type
 * @returns Complete color configuration object
 */
export function getSnippetColors(type: SnippetType): SnippetColorConfig {
  return snippetColors[type] || snippetColors.note;
}

/**
 * Generate inline style object for accent bar
 * @param type - The snippet type
 * @param opacity - Opacity value (0-1), default 0.8
 * @returns React style object
 */
export function getAccentBarStyle(
  type: SnippetType, 
  opacity: number = 0.8
): React.CSSProperties {
  return {
    backgroundColor: getSnippetAccent(type),
    opacity: opacity
  };
}

/**
 * Generate Tailwind classes for colored elements
 * Note: Since we can't dynamically generate Tailwind classes that aren't in the safelist,
 * use inline styles or predefined class variants instead
 * @param type - The snippet type
 * @returns Object with class suggestions (use with caution)
 */
export function getSnippetTailwindClasses(type: SnippetType) {
  const colorName = getSnippetColorName(type);
  
  return {
    // These classes must be safelisted in tailwind.config.js
    text: `text-${colorName}-500`,
    bg: `bg-${colorName}-50`,
    border: `border-${colorName}-500`,
    hover: `hover:bg-${colorName}-100`,
    
    // Or use these for more reliable rendering
    textDark: `text-${colorName}-900`,
    bgLight: `bg-${colorName}-50`,
  };
}

/**
 * Check if a string is a valid snippet type
 * @param type - String to validate
 * @returns True if valid snippet type
 */
export function isValidSnippetType(type: string): type is SnippetType {
  return type in snippetColors;
}

/**
 * Get a contrasting text color (black or white) for a given background
 * @param hexColor - Hex color string (e.g., '#3B82F6')
 * @returns 'white' or 'black' for optimal contrast
 */
export function getContrastTextColor(hexColor: string): 'white' | 'black' {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Convert hex color to rgba
 * @param hex - Hex color string (e.g., '#3B82F6')
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Export type for convenience
export type { SnippetColorConfig } from './snippetColors';