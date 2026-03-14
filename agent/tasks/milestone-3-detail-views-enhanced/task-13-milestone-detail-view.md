# Task 13: Milestone Detail View

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Milestone Detail](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Tasks 11-12 (markdown loading + renderer)
**Status**: Not Started

---

## Objective

Create a full-screen milestone detail view that shows metadata header, rendered markdown content, and a task list. Triggered by pressing Enter on a milestone in the table or tree view.

---

## Steps

### 1. Create Breadcrumb Component (`src/components/Breadcrumb.tsx`)

- Accept path items: `[{ label, id? }]`
- Render: `Milestones > M1 - Project Scaffold`
- Dim color for separator, bold for current (last) item

### 2. Create MilestoneDetail Component (`src/components/MilestoneDetail.tsx`)

Layout:
```
Milestones > M1 - Project Scaffold & Data Pipeline

┌─ Metadata ────────────────────────────────┐
│ Status: ● Completed   Progress: [████] 100% │
│ Started: 2026-03-14   Est: 1 week          │
│ Tasks: 4/4 completed                       │
│ Notes: Foundation milestone...              │
└────────────────────────────────────────────┘

[Rendered markdown content from milestone doc]

┌─ Tasks ───────────────────────────────────┐
│ ✓ Task 1: Initialize Project              │
│ ✓ Task 2: Data Model & YAML Parsing       │
│ ✓ Task 3: CLI Entry Point                 │
│ ✓ Task 4: Watch Mode                      │
└────────────────────────────────────────────┘
```

### 3. Data Loading

- Receive milestone id from navigation
- Look up milestone in ProgressData
- Call `resolveMilestoneFile` to find markdown
- Call `loadMarkdownFile` to read content
- Get tasks for this milestone from ProgressData

### 4. Navigation Integration

- Enter on milestone in table/tree → push detail view onto navigation stack
- Backspace/Escape → pop back to previous view
- Enter on task in task list → navigate to task detail (Task 14)
- j/k scrolls markdown content

### 5. Handle Missing Markdown

- Show metadata header (always available from progress.yaml)
- Show "No milestone document found" in content area
- Task list still renders

---

## Verification

- [ ] Enter on milestone opens detail view
- [ ] Breadcrumb shows correct path
- [ ] Metadata header shows status, progress, dates, task count
- [ ] Markdown content renders correctly
- [ ] Task list shows all tasks for milestone with status dots
- [ ] Backspace/Escape returns to list view
- [ ] Missing markdown shows fallback message (not crash)
- [ ] j/k scrolls content
- [ ] Enter on task in list navigates to task detail

---

**Next Task**: [Task 14: Task Detail View](task-14-task-detail-view.md)
