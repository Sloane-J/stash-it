# MyStash

A modern web app for researchers, students, and freelancers to save and organize research materials with intelligent tagging and distraction-free reading.

---

## What It Does

Save research snippets (quotes, notes, sources, summaries) and web articles in one place. Auto-tag everything. Read articles in clean reader mode. Organize by collections. Works offline as PWA.

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
    Hono
    ├── Frontend (Islands)
    └── API Routes
        ↓
    ┌───────┴────────┐
    ↓                ↓
Lucia Auth    Cloudflare D1
              (SQLite)
```

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