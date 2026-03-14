# Task 14: Task Detail View

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Task Detail](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Task 13 (milestone detail view, breadcrumb, navigation stack)
**Status**: Not Started

---

## Objective

Create a full-screen task detail view with metadata header, rendered markdown content, and prev/next sibling navigation. Reuses Breadcrumb, MarkdownRenderer, and navigation patterns from Task 13.

---

## Steps

### 1. Create TaskDetail Component (`src/components/TaskDetail.tsx`)

Layout:
```
Milestones > M1 - Project Scaffold > Task 2: Data Model & YAML Parsing

┌─ Metadata ────────────────────────────────┐
│ Status: ● Completed                        │
│ Est: 3 hours   Completed: 2026-03-14      │
│ Milestone: M1 - Project Scaffold (link)    │
│ Notes: Core data layer for all views       │
└────────────────────────────────────────────┘

[Rendered markdown content from task doc]

┌─ Navigation ──────────────────────────────┐
│ ← Task 1: Initialize Project              │
│ → Task 3: CLI Entry Point                 │
└────────────────────────────────────────────┘
```

### 2. Data Loading

- Receive task id from navigation
- Look up task in ProgressData (search all milestone task arrays)
- Determine parent milestone
- Use `resolveTaskFile` to get file path
- Call `loadMarkdownFile` to read content
- Find prev/next siblings in same milestone's task array

### 3. Sibling Navigation

- `[` key: navigate to previous task (if exists)
- `]` key: navigate to next task (if exists)
- Show prev/next task names at bottom
- Disabled (dimmed) if at first/last task

### 4. Navigation Integration

- Enter on task in tree/milestone detail → push task detail onto stack
- Backspace/Escape → pop back to previous view
- Breadcrumb shows full path: Milestones > M1 > Task N

### 5. Handle Missing Markdown

- Show metadata header (from progress.yaml data)
- Show "No task document found at `{path}`" in content area

---

## Verification

- [ ] Enter on task opens task detail view
- [ ] Breadcrumb shows milestone > task path
- [ ] Metadata header shows status, hours, dates, parent milestone
- [ ] Markdown content renders correctly
- [ ] `[`/`]` navigates to prev/next sibling
- [ ] Sibling nav disabled at boundaries
- [ ] Backspace returns to previous view
- [ ] Missing markdown shows fallback message
- [ ] j/k scrolls content

---

**Next Task**: [Task 15: Activity Log & Blockers Views](task-15-activity-blockers-views.md)
