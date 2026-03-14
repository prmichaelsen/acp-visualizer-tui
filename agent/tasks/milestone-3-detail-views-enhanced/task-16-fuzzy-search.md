# Task 16: Fuzzy Search

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Search](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Tasks 13-14 (detail views exist for navigation targets)
**Status**: Not Started

---

## Objective

Implement fuzzy search across milestones, tasks, and notes using fuse.js. `/` key opens search input, results shown in a grouped list, Enter navigates to selected result.

---

## Steps

### 1. Install fuse.js

```bash
npm install fuse.js
```

### 2. Create Search Hook (`src/hooks/useSearch.ts`)

- Build fuse.js index from ProgressData on load/refresh
- Index fields: milestone names, task names, task notes, work entry descriptions
- Configure: threshold 0.4, weight name > notes > extra
- Return: `{ query, setQuery, results, isSearching }`

### 3. Create Search Input

- `/` key activates search mode
- Text input at top of screen (use ink-text-input or raw useInput)
- Escape cancels search
- Enter with empty query cancels search
- Real-time results as user types

### 4. Create SearchResults Component (`src/components/SearchResults.tsx`)

Layout:
```
Search: data model_

┌─ Milestones (1 result) ──────────────────┐
│ > M1 - Project Scaffold & Data Pipeline   │
└───────────────────────────────────────────┘

┌─ Tasks (2 results) ──────────────────────┐
│   Task 2: Data Model & YAML Parsing       │
│   Task 12: Terminal Markdown Renderer      │
└───────────────────────────────────────────┘
```

- Results grouped by type (milestones, tasks)
- j/k navigates results
- Enter on result navigates to detail view
- Escape returns to previous view

### 5. Integration

- Search available from any view (global `/` key)
- Search results replace current view temporarily
- Navigating to a result pushes detail view onto stack
- Back from detail returns to search results

---

## Verification

- [ ] `/` opens search input
- [ ] Typing shows real-time fuzzy results
- [ ] Results grouped by type (milestones, tasks)
- [ ] j/k navigates results
- [ ] Enter on milestone result opens milestone detail
- [ ] Enter on task result opens task detail
- [ ] Escape cancels search and returns to previous view
- [ ] Empty query shows no results
- [ ] Search works across milestone names, task names, notes
- [ ] fuse.js index rebuilds on data refresh

---

**Notes**: This completes M3 and all P1 features. The TUI is now a full project exploration tool.
