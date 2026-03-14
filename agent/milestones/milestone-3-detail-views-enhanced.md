# Milestone 3: Detail Views & Enhanced Features

**Goal**: Add milestone/task detail views with terminal markdown rendering, plus activity log, blockers view, and fuzzy search
**Duration**: 2 weeks
**Dependencies**: M2 - Dashboard Views & Interaction
**Status**: Not Started
**Priority**: P1

---

## Overview

This milestone adds drill-down capability — users can press Enter on any milestone or task to see its full documentation rendered as terminal markdown. It also adds the remaining views (activity log, blockers/next steps) and fuzzy search. These features elevate the TUI from a status dashboard to a full project exploration tool.

The detail view architecture mirrors the web visualizer's M3 (milestone-task-detail-views), adapted for terminal rendering.

---

## Deliverables

### 1. Markdown Infrastructure
- Terminal markdown renderer (marked + marked-terminal or equivalent)
- Markdown file loader (resolve milestone/task files from filesystem)
- Milestone file resolution (scan `agent/milestones/` for matching files)
- Task file resolution (use `task.file` field)

### 2. Milestone Detail View
- Full-screen view replacing list view on Enter
- Breadcrumb: `Milestones > M1 - Name`
- Metadata header: status, progress bar, dates, task count, est. weeks
- Rendered markdown body from milestone document
- Task list at bottom with status dots

### 3. Task Detail View
- Full-screen view on Enter from task tree or milestone detail
- Breadcrumb: `Milestones > M1 - Name > Task 1: Name`
- Metadata header: status, estimated hours, completed date, parent milestone
- Rendered markdown body from task document
- Prev/next sibling navigation (`[`/`]` keys)

### 4. Activity Log & Blockers Views
- Activity log: recent_work entries with date, description, bullet items
- Blockers & next steps: current_blockers (red) and next_steps list
- Both accessible via Tab navigation

### 5. Fuzzy Search
- `/` key opens search input
- Fuzzy search across milestone names, task names, notes
- Search results view with grouped results
- Enter to navigate to result

---

## Success Criteria

- [ ] Enter on milestone in table/tree opens detail view
- [ ] Enter on task in tree opens task detail view
- [ ] Backspace/Escape returns to previous list view
- [ ] Markdown renders with headers, code blocks, lists, tables in terminal
- [ ] Milestone file resolution finds correct file by scanning directory
- [ ] Task file resolution uses task.file field correctly
- [ ] Missing markdown shows "No document found" (not crash)
- [ ] `[`/`]` navigates to prev/next sibling task
- [ ] Breadcrumb shows correct navigation path
- [ ] Activity log displays recent_work entries
- [ ] Blockers view shows current_blockers and next_steps
- [ ] `/` opens search, results are relevant
- [ ] All new views accessible via Tab navigation

---

## Key Files to Create

```
src/
├── components/
│   ├── MilestoneDetail.tsx     # Milestone detail view
│   ├── TaskDetail.tsx          # Task detail view
│   ├── MarkdownRenderer.tsx    # Terminal markdown rendering
│   ├── Breadcrumb.tsx          # Navigation breadcrumb
│   ├── ActivityLog.tsx         # Recent work view
│   ├── BlockersNextSteps.tsx   # Blockers & next steps view
│   └── SearchResults.tsx       # Search results view
├── hooks/
│   └── useSearch.ts            # Fuzzy search state
└── lib/
    └── markdown-loader.ts      # File resolution & loading
```

---

## Tasks

1. [Task 11: Markdown Loading Service](../tasks/milestone-3-detail-views-enhanced/task-11-markdown-loading.md) - File resolution for milestones/tasks, loading from filesystem
2. [Task 12: Terminal Markdown Renderer](../tasks/milestone-3-detail-views-enhanced/task-12-markdown-renderer.md) - marked + marked-terminal rendering component
3. [Task 13: Milestone Detail View](../tasks/milestone-3-detail-views-enhanced/task-13-milestone-detail-view.md) - Full-screen detail with metadata, markdown, task list
4. [Task 14: Task Detail View](../tasks/milestone-3-detail-views-enhanced/task-14-task-detail-view.md) - Full-screen detail with metadata, markdown, sibling nav
5. [Task 15: Activity Log & Blockers Views](../tasks/milestone-3-detail-views-enhanced/task-15-activity-blockers-views.md) - Recent work and blockers/next steps views
6. [Task 16: Fuzzy Search](../tasks/milestone-3-detail-views-enhanced/task-16-fuzzy-search.md) - fuse.js search with results view

---

## Testing Requirements

- [ ] Markdown rendering tests (headers, code, lists, tables)
- [ ] File resolution tests (milestone scan, task.file lookup)
- [ ] Detail view navigation tests (enter, back, sibling)
- [ ] Search relevance tests
- [ ] Missing file graceful fallback tests

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| marked-terminal rendering quality | Medium | Medium | Evaluate alternatives (cli-markdown), build custom if needed |
| Large markdown files in terminal | Medium | Low | Add scrolling, truncate at reasonable length |
| Search performance with many entities | Low | Low | fuse.js handles thousands of entries well |

---

**Next Milestone**: None planned (P2 features: multi-project support)
**Blockers**: None
**Notes**: Detail view architecture mirrors web visualizer's M3. Markdown rendering is the key technical risk — evaluate library options early in Task 12.
