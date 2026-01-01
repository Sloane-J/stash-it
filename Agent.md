# rules to follow, precedes all of your own objections if the clash with it:  I’m starting a new project using this tech stack I’m not yet familiar with. I’ll be coding experimentally but the project is going to be for production and figuring things out as I go, so treat every request as something that may need full commands, complete code outputs, and clear steps. Keep explanations concise unless I ask for deeper detail. Prioritize accuracy, best practices, and safe decisions over shortcuts. When something has risks, flag it. When something has multiple options, recommend the most stable and time-tested approach

# Research Notebook

A modern web app for researchers, students, and freelancers to save and organize research materials with intelligent tagging and distraction-free reading.

---

## What It Does

Save research snippets (quotes, notes, sources, summaries) and web articles in one place. Auto-tag everything. Read articles in clean reader mode. Organize by collections. Works offline as PWA.

**The twist:** Combines note-taking with read-later (like Pocket meets Notion for research).

---

## Core Features

### Save Anything Research-Related

- **Quotes** - Key excerpts from papers/books
- **Notes** - Your thoughts and ideas
- **Sources** - Citations and references
- **Summaries** - Condensed information
- **Links** - Articles auto-fetched with clean reading view

### Smart Organization

- **Auto-tagging** - AI extracts keywords when you save
- **Collections** - Group items by project/topic
- **Search** - Find anything across all content
- **Filters** - By type, tag, or collection

### Reading Experience

- **Reader mode** - Strip ads/clutter from articles
- **Highlights** - Select and save important passages
- **Offline access** - Everything available without internet
- **Reading time** - Estimated duration for articles

### Cloud Sync

- **Magic link auth** - No passwords
- **Multi-device** - Access from phone, tablet, laptop
- **Auto-save** - Never lose your work

---

## Architecture

```
User (Browser/PWA)
        ↓
    Honox App (Vercel Edge)
    ├── Frontend (Islands)
    └── API Routes
        ↓
    ┌───────┴────────┐
    ↓                ↓
Supabase Auth    Turso DB
(Magic Link)     (SQLite)
```

**Why this stack:**

- Honox = Full-stack framework with file-based routing
- Vercel = Global edge deployment, auto-scaling
- Turso = Fast serverless SQLite at the edge
- Supabase = Auth with magic links
- Bun = Fast package manager and runtime

---

## How Features Work

### Auto-Tagging

When you save content, client-side NLP analyzes the text and suggests relevant tags. You can accept, edit, or add more tags manually. Tags are used for filtering and search.

**Why client-side:** Fast, works offline, no API costs.

---

### Link Saving

Paste a URL → App fetches the page → Extracts article title, description, image, and readable content → Saves everything locally → You can read offline in clean reader mode.

**Tech:** Readability library strips ads/clutter, unfurl.js gets metadata.

---

### Reader Mode

Displays saved articles in distraction-free view with clean typography. No ads, no popups, no tracking. You can highlight text while reading.

**Benefit:** Faster than loading original site, works offline.

---

### Highlights

Select text in reader mode → Click highlight → Text saved with reference to article → View all highlights in one place or inline with article.

**Use case:** Mark key passages without copy-pasting to notes.

---

### Collections

Create folders like "Thesis Research" or "Client Project" → Add notes and articles → Items can be in multiple collections → Filter by collection to focus.

**Think:** Tags are topics, collections are projects.

---

### Search

Type query → Search across all snippet text, article content, tags, and highlights → Results ranked by relevance.

**Performance:** SQLite full-text search (FTS5) makes it instant.

---

### PWA Offline Support

Service worker caches app shell and saved content. Queue write operations when offline. Sync automatically when connection returns.

**User sees:** App works like native app, installs to home screen, never needs internet for saved content.

---

## Database Structure

```
users
  ↓
notes (snippets)
  ├── tags (many-to-many)
  └── collections (many-to-many)

articles (saved links)
  ├── highlights
  ├── tags (many-to-many)
  └── collections (many-to-many)
```

**Design:** Flexible tagging + collections, links connect everything.

---

## Development Flow

### Setup

1. Create Honox project with Bun
2. Connect Turso database
3. Configure Supabase auth
4. Set environment variables
5. Run dev server

### Build Features

Each feature = Honox route + island component + API endpoint + database queries

Example: Save snippet

- Route: `app/routes/snippets/new.tsx`
- API: `app/routes/api/snippets.ts`
- Island: `app/islands/SnippetForm.tsx`

### Deploy

Push to GitHub → Vercel auto-deploys → Edge functions go live globally → Users see updates instantly.

---

## Monetization (Month 4+)

### Free Tier

- 50 saved items
- Basic auto-tagging
- 3 collections
- All core features

### Premium ($1.99/month or $29/year) -  not to be implemented now. to be done after the user feedback asks for it

- Unlimited items
- Advanced AI tagging (GPT-4) - maybe
- Unlimited collections
- Export to Markdown/Notion/Obsidian
- PDF annotation
- Priority support

**Implementation:** Stripe subscriptions, feature gates check `user.plan` in database.

---

## Timeline

**Week 1:** Auth, database, basic UI shell  
**Week 2:** Save snippets, save links, reader mode, auto-tagging  
**Week 3:** Collections, search, highlights, PWA setup → **Launch**

**Month 2-3:** User feedback, fixes, optimization  
**Month 4:** Add premium features, integrate Stripe → **Monetize**  
**Month 6+:** Browser extension, mobile app, integrations

---

## Success Metrics

**Launch:** App works, users can save/organize/search content  
**Month 3:** 1,000 active users  
**Month 6:** 5,000 users, 250 paying ($750/month)  
**Year 1:** 20,000 users, 1,000 paying ($3,000/month)

---

## Future Enhancements

- **Browser extension** - Save from any webpage
- **Mobile apps** - Native iOS/Android
- **Integrations** - Export to Notion, Obsidian, Roam
- **Team features** - Shared collections, collaboration
- **API access** - Build custom integrations

---

**Honox = Hono + Vite + File-based routing + Islands**

It's ONE framework, not separate pieces.

---

# Complete Project Blueprint

## Tech Stack

**Framework:**

- Honox (full-stack with islands)
- TypeScript

**UI:**

- shadcn/ui + Tailwind CSS
- TanStack Query

**Features:**

- natural.js (auto-tagging)
- @mozilla/readability (article extraction)
- unfurl.js (link previews)

**Database:**

- Turso (serverless SQLite)
- @libsql/client

**Auth:**

- Supabase Auth (magic link)

**Payments:**

- Stripe

**Deployment:**

- Vercel + PWA

---

## App Features

### MVP (Weeks 1-3)

**Research Tools:**

- Save snippets (5 types: quote, note, source, summary, link)
- Auto-tagging
- Collections
- Search/filter

**Read-Later:**

- Save links with preview
- Reader mode
- Highlights
- Mark as read

**Organization:**

- Tags (auto + manual)
- Collections
- Archive

**PWA:**

- Offline access
- Install prompt

---

## Build Timeline

### Week 1: Foundation

- Project setup (Honox + Turso + Supabase)
- Auth flow (magic link)
- Database schema
- Basic UI shell

### Week 2: Core Features

- Add snippet (all types)
- Save link + fetch metadata
- Reader mode
- List/display items
- Auto-tagging

### Week 3: Polish

- Search
- Filters
- Collections
- Highlights
- PWA setup
- **Launch**

---

## Post-Launch Roadmap

### Month 2-3: Growth

- User feedback
- Bug fixes
- Performance optimization
- Mobile UX improvements

### Month 4: Monetization Prep

- Build premium features:
    - Advanced AI tagging (GPT-4)
    - Export (Markdown, Notion, Obsidian)
    - PDF annotation
    - Unlimited storage
- Stripe integration
- Pricing page

### Month 6: Premium Launch

- Announce paid tier ($2.99/mo, $29/year)
- Grandfather early users (optional)
- Start charging new signups

---

## App Name Ideas

1. **SourceStack** - developer-friendly

2. **StashIt** - casual, quick

Design: 
index.css file: @import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  /* ===================================
     SHADCN/UI SEMANTIC VARIABLES (LIGHT MODE)
     Mapped to Stash It color system
     =================================== */
  --radius: 0.625rem;
  
  /* Backgrounds - White/Light Gray */
  --background: oklch(100% 0 0); /* #ffffff */
  --foreground: oklch(20% 0 0); /* Near black text */
  
  /* Cards - Light gray elevated surfaces */
  --card: oklch(97% 0 0); /* #f5f5f5 */
  --card-foreground: oklch(20% 0 0);
  
  /* Popovers */
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(20% 0 0);
  
  /* Primary - Your purple (#6366f1) */
  --primary: oklch(62% 0.22 275); /* #6366f1 */
  --primary-foreground: oklch(100% 0 0); /* White text on purple */
  
  /* Secondary - Light gray surfaces */
  --secondary: oklch(95% 0 0); /* #f0f0f0 */
  --secondary-foreground: oklch(20% 0 0);
  
  /* Muted - Subtle backgrounds */
  --muted: oklch(96% 0 0); /* #f5f5f5 */
  --muted-foreground: oklch(50% 0 0); /* Mid-gray text */
  
  /* Accent - Slightly darker than muted */
  --accent: oklch(94% 0 0);
  --accent-foreground: oklch(20% 0 0);
  
  /* Destructive - Your danger red (#d94a4a) */
  --destructive: oklch(60% 0.19 25); /* #d94a4a */
  --destructive-foreground: oklch(100% 0 0);
  
  /* Borders & Inputs */
  --border: oklch(88% 0 0); /* #e0e0e0 */
  --input: oklch(88% 0 0);
  --ring: oklch(62% 0.22 275); /* Primary color for focus rings */
  
  /* Charts - Keep original values */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  
  /* Sidebar - Light mode */
  --sidebar: oklch(98% 0 0); /* Very light gray */
  --sidebar-foreground: oklch(20% 0 0);
  --sidebar-primary: oklch(62% 0.22 275); /* Your purple */
  --sidebar-primary-foreground: oklch(100% 0 0);
  --sidebar-accent: oklch(95% 0 0);
  --sidebar-accent-foreground: oklch(20% 0 0);
  --sidebar-border: oklch(90% 0 0);
  --sidebar-ring: oklch(62% 0.22 275);

  /* ===================================
     STASH IT CUSTOM VARIABLES
     These are used throughout the app
     =================================== */

  /* Absolute Colors */
  --clr-dark-a0: #000000;
  --clr-light-a0: #ffffff;

  /* Primary Colors (Indigo/Purple) - HEX for easy reference */
  --clr-primary-a0: #6366f1;
  --clr-primary-a10: #7976f3;
  --clr-primary-a20: #8d86f5;
  --clr-primary-a30: #9f96f7;
  --clr-primary-a40: #b0a7f9;
  --clr-primary-a50: #c1b8fb;

  /* Surface Colors - Light Mode (inverted from dark) */
  --clr-surface-a0: #ffffff;
  --clr-surface-a10: #f5f5f5;
  --clr-surface-a20: #e8e8e8;
  --clr-surface-a30: #d1d1d1;
  --clr-surface-a40: #b0b0b0;
  --clr-surface-a50: #8b8b8b;

  /* Tonal Surface Colors - Light Mode */
  --clr-surface-tonal-a0: #f8f7fc;
  --clr-surface-tonal-a10: #efedfa;
  --clr-surface-tonal-a20: #e3e1f0;
  --clr-surface-tonal-a30: #d0cee0;
  --clr-surface-tonal-a40: #b8b6c8;
  --clr-surface-tonal-a50: #9d9baa;

  /* Semantic Colors (same in both modes) */
  --clr-success-a0: #22946e;
  --clr-success-a10: #47d5a6;
  --clr-success-a20: #9ae8ce;

  --clr-warning-a0: #a87a2a;
  --clr-warning-a10: #d7ac61;
  --clr-warning-a20: #ecd7b2;

  --clr-danger-a0: #9c2121;
  --clr-danger-a10: #d94a4a;
  --clr-danger-a20: #eb9e9e;

  --clr-info-a0: #21498a;
  --clr-info-a10: #4077d1;
  --clr-info-a20: #92b2e5;

  /* Snippet Type Colors (HEX - same in both modes) */
  --clr-quote: #c1b8fb;
  --clr-note: #92b2e5;
  --clr-source: #9ae8ce;
  --clr-summary: #ecd7b2;
  --clr-link: #4077d1;

  /* Text Colors - Light Mode */
  --text-primary: rgba(0, 0, 0, 0.90);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --text-tertiary: rgba(0, 0, 0, 0.45);
  --text-disabled: rgba(0, 0, 0, 0.25);

  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Typography Scale */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Icon Sizes */
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;

  /* Touch Targets */
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;

  /* Layout Spacing (Mobile First) */
  --container-padding: var(--space-4);
  --card-padding: var(--space-4);
  --card-gap: var(--space-3);
  --section-gap: var(--space-8);

  /* Safe Area Insets */
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);

  /* Animation Timing */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.dark {
  /* ===================================
     SHADCN/UI SEMANTIC VARIABLES (DARK MODE)
     Mapped to Stash It color system
     =================================== */
  
  /* Backgrounds - Your dark surfaces */
  --background: oklch(14% 0 0); /* #121212 */
  --foreground: oklch(98% 0 0); /* Near white text */
  
  /* Cards - Elevated dark surfaces */
  --card: oklch(20% 0 0); /* #282828 */
  --card-foreground: oklch(98% 0 0);
  
  /* Popovers */
  --popover: oklch(20% 0 0);
  --popover-foreground: oklch(98% 0 0);
  
  /* Primary - Your purple, slightly brighter for dark mode */
  --primary: oklch(68% 0.22 275); /* Lighter purple for dark bg */
  --primary-foreground: oklch(14% 0 0); /* Dark text on bright purple */
  
  /* Secondary - Mid-dark gray */
  --secondary: oklch(30% 0 0); /* #3f3f3f area */
  --secondary-foreground: oklch(98% 0 0);
  
  /* Muted - Subtle dark backgrounds */
  --muted: oklch(30% 0 0);
  --muted-foreground: oklch(70% 0 0); /* Light gray text */
  
  /* Accent - Tonal surfaces */
  --accent: oklch(28% 0.02 275); /* Hint of purple */
  --accent-foreground: oklch(98% 0 0);
  
  /* Destructive - Your danger red, adjusted for dark mode */
  --destructive: oklch(62% 0.19 25); /* #d94a4a */
  --destructive-foreground: oklch(98% 0 0);
  
  /* Borders & Inputs - Subtle on dark */
  --border: oklch(100% 0 0 / 10%); /* 10% white */
  --input: oklch(100% 0 0 / 15%); /* 15% white */
  --ring: oklch(68% 0.22 275); /* Primary for focus rings */
  
  /* Charts - Your specified values */
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  
  /* Sidebar - Dark mode */
  --sidebar: oklch(20% 0 0);
  --sidebar-foreground: oklch(98% 0 0);
  --sidebar-primary: oklch(68% 0.22 275);
  --sidebar-primary-foreground: oklch(98% 0 0);
  --sidebar-accent: oklch(30% 0 0);
  --sidebar-accent-foreground: oklch(98% 0 0);
  --sidebar-border: oklch(100% 0 0 / 10%);
  --sidebar-ring: oklch(68% 0.22 275);

  /* Surface Colors - Dark Mode (your original values) */
  --clr-surface-a0: #121212;
  --clr-surface-a10: #282828;
  --clr-surface-a20: #3f3f3f;
  --clr-surface-a30: #575757;
  --clr-surface-a40: #717171;
  --clr-surface-a50: #8b8b8b;

  /* Tonal Surface Colors - Dark Mode (your original values) */
  --clr-surface-tonal-a0: #1c1a25;
  --clr-surface-tonal-a10: #312f39;
  --clr-surface-tonal-a20: #47454f;
  --clr-surface-tonal-a30: #5f5d66;
  --clr-surface-tonal-a40: #78767e;
  --clr-surface-tonal-a50: #919096;

  /* Text Colors - Dark Mode (your original values) */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary: rgba(255, 255, 255, 0.50);
  --text-disabled: rgba(255, 255, 255, 0.30);
}

/* Responsive Typography Adjustments */
@media (min-width: 768px) {
  :root {
    --text-base: 1.0625rem;  /* 17px */
    --text-lg: 1.25rem;      /* 20px */
    --text-xl: 1.5rem;       /* 24px */
    --text-2xl: 1.875rem;    /* 30px */

    /* Tablet spacing adjustments */
    --container-padding: var(--space-6);
    --card-padding: var(--space-5);
    --card-gap: var(--space-4);
    --section-gap: var(--space-10);
  }
}

@media (min-width: 1024px) {
  :root {
    /* Desktop spacing adjustments */
    --container-padding: var(--space-8);
    --card-padding: var(--space-6);
    --card-gap: var(--space-6);
    --section-gap: var(--space-12);
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Global box-sizing */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Remove default margins */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  ol,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  /* Improve text rendering */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    text-rendering: optimizeLegibility;
  }

  /* Make images responsive */
  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  /* Remove built-in form typography */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Avoid text overflow */
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    overflow-wrap: break-word;
  }

  /* Improve line wrapping */
  p {
    text-wrap: pretty;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    text-wrap: balance;
  }

  /* Focus visible styles */
  :focus-visible {
    outline: 2px solid var(--clr-primary-a0);
    outline-offset: 2px;
  }

  /* Scrollbar styles (webkit) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--clr-surface-a0);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--clr-surface-a30);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--clr-surface-a40);
  }
}

/* Utility Classes */
@layer utilities {
  /* Typography utilities */
  .text-balance {
    text-wrap: balance;
  }

  .text-pretty {
    text-wrap: pretty;
  }

  /* Safe area utilities */
  .pt-safe {
    padding-top: var(--safe-area-top);
  }

  .pb-safe {
    padding-bottom: var(--safe-area-bottom);
  }

  /* Touch target utilities */
  .touch-target {
    min-width: var(--touch-target-min);
    min-height: var(--touch-target-min);
  }

  .touch-target-comfortable {
    min-width: var(--touch-target-comfortable);
    min-height: var(--touch-target-comfortable);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}


App.css 

/* ===================================
   APP.CSS - STASH IT
   Application-level layout and structure
   =================================== */

/* ===================================
   MAIN APP CONTAINER
   =================================== */

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
  color: var(--foreground);
  position: relative;
}

/* ===================================
   LAYOUT WRAPPER
   Changes structure based on screen size
   =================================== */

.app-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ===================================
   HEADER (Mobile & Desktop)
   =================================== */

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 56px;
  border-bottom: 1px solid var(--border);
  background: var(--background);
  backdrop-filter: blur(8px);
  /* Safe area for notched phones */
  padding-top: var(--safe-area-top);
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--space-4);
  max-width: 100%;
}

/* Desktop header adjustments */
@media (min-width: 1024px) {
  .app-header-inner {
    padding: 0 var(--space-6);
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
  }
}

/* ===================================
   SIDEBAR (Desktop Only)
   =================================== */

.sidebar {
  display: none; /* Hidden on mobile */
  background: var(--sidebar);
  border-right: 1px solid var(--sidebar-border);
  overflow-y: auto;
  overflow-x: hidden;
}

@media (min-width: 1024px) {
  .app-layout {
    flex-direction: row;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    width: 240px;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
  }

  /* Sidebar scrollbar styling */
  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: var(--clr-surface-a30);
    border-radius: 3px;
  }
}

/* ===================================
   MAIN CONTENT AREA
   =================================== */

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /* Space for bottom navigation on mobile */
  padding-bottom: calc(64px + var(--safe-area-bottom));
}

/* Remove bottom padding on desktop (no bottom nav) */
@media (min-width: 1024px) {
  .main-content {
    padding-bottom: 0;
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
  }
}

/* Content wrapper with padding */
.content-wrapper {
  padding: var(--container-padding);
  min-height: 100%;
}

/* ===================================
   BOTTOM NAVIGATION (Mobile/Tablet Only)
   =================================== */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: calc(64px + var(--safe-area-bottom));
  background: var(--card);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(12px);
  /* Safe area for home indicator */
  padding-bottom: var(--safe-area-bottom);
}

/* Hide bottom nav on desktop */
@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}

/* ===================================
   GRID LAYOUTS
   Responsive grid for snippet cards
   =================================== */

.snippet-grid {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .snippet-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--card-gap);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .snippet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop XL: 4 columns (optional) */
@media (min-width: 1920px) {
  .snippet-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ===================================
   PAGE TRANSITIONS
   Smooth transitions between views
   =================================== */

.page-transition-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}

.page-transition-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-transition-exit-active {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity var(--duration-base) var(--ease-in),
              transform var(--duration-base) var(--ease-in);
}

/* ===================================
   MODAL/OVERLAY ANIMATIONS
   =================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-overlay-enter {
  opacity: 0;
}

.modal-overlay-enter-active {
  opacity: 1;
  transition: opacity var(--duration-base) var(--ease-out);
}

.modal-overlay-exit {
  opacity: 1;
}

.modal-overlay-exit-active {
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-in);
}

/* Mobile: Full-screen modal slides up */
.modal-mobile {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--background);
  display: flex;
  flex-direction: column;
  /* Safe area spacing */
  padding-top: var(--safe-area-top);
}

.modal-mobile-enter {
  transform: translateY(100%);
}

.modal-mobile-enter-active {
  transform: translateY(0);
  transition: transform var(--duration-slow) var(--ease-out);
}

.modal-mobile-exit {
  transform: translateY(0);
}

.modal-mobile-exit-active {
  transform: translateY(100%);
  transition: transform var(--duration-base) var(--ease-in);
}

/* Desktop: Centered modal scales in */
.modal-desktop {
  background: var(--card);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-desktop-enter {
  opacity: 0;
  transform: scale(0.95);
}

.modal-desktop-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.modal-desktop-exit {
  opacity: 1;
  transform: scale(1);
}

.modal-desktop-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--duration-base) var(--ease-in),
              transform var(--duration-base) var(--ease-in);
}

/* ===================================
   SLIDE-OUT PANEL (Desktop)
   Right panel for create/edit forms
   =================================== */

.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 600px;
  max-width: 100%;
  z-index: 150;
  background: var(--card);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
}

.slide-panel-enter {
  transform: translateX(100%);
}

.slide-panel-enter-active {
  transform: translateX(0);
  transition: transform var(--duration-slow) var(--ease-out);
}

.slide-panel-exit {
  transform: translateX(0);
}

.slide-panel-exit-active {
  transform: translateX(100%);
  transition: transform var(--duration-base) var(--ease-in);
}

/* ===================================
   TOAST NOTIFICATIONS
   =================================== */

.toast-container {
  position: fixed;
  z-index: 300;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  /* Mobile: Top center */
  top: calc(var(--safe-area-top) + var(--space-4));
  left: var(--space-4);
  right: var(--space-4);
}

/* Desktop: Top right */
@media (min-width: 1024px) {
  .toast-container {
    left: auto;
    right: var(--space-6);
    width: 400px;
  }
}

.toast {
  pointer-events: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--space-4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.toast-enter {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.toast-exit {
  opacity: 1;
  transform: translateY(0);
}

.toast-exit-active {
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity var(--duration-base) var(--ease-in),
              transform var(--duration-base) var(--ease-in);
}

/* Toast variants */
.toast-success {
  border-left: 4px solid var(--clr-success-a10);
}

.toast-error {
  border-left: 4px solid var(--clr-danger-a10);
}

.toast-info {
  border-left: 4px solid var(--clr-info-a10);
}

.toast-warning {
  border-left: 4px solid var(--clr-warning-a10);
}

/* ===================================
   LOADING STATES
   =================================== */

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--muted);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  opacity: 0.9;
  z-index: 10;
}

/* ===================================
   SKELETON LOADERS
   =================================== */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 0%,
    var(--clr-surface-a20) 50%,
    var(--muted) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Skeleton variants */
.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-title {
  height: 1.5em;
  width: 60%;
  margin-bottom: 1em;
}

.skeleton-card {
  height: 200px;
  border-radius: 12px;
}

/* ===================================
   PULL-TO-REFRESH INDICATOR (Mobile)
   =================================== */

.pull-to-refresh {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-base) var(--ease-out);
}

.pull-to-refresh.active {
  transform: translateY(60px);
}

/* ===================================
   SWIPE ACTIONS (Mobile)
   =================================== */

.swipe-container {
  position: relative;
  overflow: hidden;
}

.swipe-content {
  transition: transform var(--duration-base) var(--ease-out);
  position: relative;
  z-index: 1;
  background: var(--card);
}

.swipe-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  gap: var(--space-2);
}

.swipe-actions-left {
  left: 0;
  background: var(--clr-success-a10);
  color: var(--clr-dark-a0);
}

.swipe-actions-right {
  right: 0;
  background: var(--clr-danger-a10);
  color: var(--clr-light-a0);
}

/* ===================================
   EMPTY STATES
   =================================== */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  min-height: 400px;
}

.empty-state-icon {
  width: var(--space-16);
  height: var(--space-16);
  margin-bottom: var(--space-6);
  opacity: 0.4;
  color: var(--muted-foreground);
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
  color: var(--foreground);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--muted-foreground);
  max-width: 400px;
  margin-bottom: var(--space-6);
}

/* ===================================
   FILTER CHIPS (Horizontal Scroll)
   =================================== */

.filter-chips {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-3) var(--container-padding);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  /* Scroll snap for better UX */
  scroll-snap-type: x mandatory;
}

.filter-chips::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.filter-chip {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* ===================================
   BACKDROP BLUR SUPPORT
   =================================== */

@supports (backdrop-filter: blur(8px)) {
  .app-header,
  .bottom-nav {
    background: var(--background) / 80%;
    backdrop-filter: blur(8px);
  }
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(8px)) {
  .app-header,
  .bottom-nav {
    background: var(--background);
  }
}

/* ===================================
   PRINT STYLES (Optional)
   =================================== */

@media print {
  .app-header,
  .bottom-nav,
  .sidebar {
    display: none;
  }

  .main-content {
    padding: 0;
    max-width: 100%;
  }

  .snippet-grid {
    display: block;
  }
}

/* ===================================
   ACCESSIBILITY IMPROVEMENTS
   =================================== */

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 1000;
}

.skip-link:focus {
  top: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .app-header,
  .bottom-nav,
  .sidebar {
    border-width: 2px;
  }

  .snippet-grid > * {
    border: 2px solid var(--border);
  }
}

/* ===================================
   UTILITY CLASSES
   =================================== */

/* Container with max-width */
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Prevent scrolling when modal is open */
.no-scroll {
  overflow: hidden;
}

/* Content fade-in on load */
.fade-in {
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}