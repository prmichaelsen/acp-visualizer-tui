# Milestone 2: Dashboard Views & Interaction

**Goal**: Build all P0 visual views (dashboard, milestone table, task tree) with keyboard navigation, status filtering, and output modes
**Duration**: 2 weeks
**Dependencies**: M1 - Project Scaffold & Data Pipeline
**Status**: Not Started
**Priority**: P0

---

## Overview

This milestone transforms the CLI tool from a JSON-output utility into a full-screen interactive TUI. Users will be able to view project status at a glance, browse milestones in a sortable table, explore tasks in an expandable tree, and navigate between views with keyboard shortcuts. Status filtering and output modes complete the P0 feature set.

By the end of this milestone, the tool is a fully functional, publishable MVP.

---

## Deliverables

### 1. App Shell & Layout
- Full-screen Ink layout with header, content area, and help bar
- View switching via Tab/Shift+Tab
- Header showing project name, current view name, filter state

### 2. Dashboard View
- Project metadata (name, version, status, start date)
- Overall progress bar
- Current milestone indicator
- Milestone count by status (completed/in-progress/not-started)
- Next steps list

### 3. Milestone Table View
- Columns: name, status, progress %, tasks (completed/total), started, est. weeks
- Sortable by any column (cycle with `s` key)
- Status badges with color coding
- Scrollable when milestones exceed terminal height

### 4. Task Tree View
- Expandable milestone nodes
- Task items with status dots, file path, notes
- Expand/collapse via Enter/Space
- Navigate with arrow keys / j/k

### 5. Keyboard Navigation & Filtering
- Global: Tab (switch view), q (quit), r (refresh), ? (help)
- List: j/k/arrows (navigate), Enter/Space (expand)
- Filter: f (cycle status filter: all → in_progress → completed → not_started)

### 6. Output Modes & Publish
- `--json` outputs parsed ProgressData as JSON (non-interactive)
- `--no-color` strips all ANSI formatting
- package.json bin entry configured
- npm publish ready

---

## Success Criteria

- [ ] Full-screen TUI renders without visual glitches
- [ ] Dashboard shows correct project metadata and progress
- [ ] Milestone table displays all milestones with correct data
- [ ] Table columns sortable via keyboard
- [ ] Task tree expands/collapses correctly
- [ ] Tab switches between dashboard/milestones/tasks views
- [ ] Status filter cycles and correctly filters milestones/tasks
- [ ] j/k/arrows navigate within views
- [ ] q exits cleanly
- [ ] r triggers manual refresh
- [ ] ? shows help overlay
- [ ] `--json` and `--no-color` work correctly
- [ ] `npx acp-visualizer-tui` launches successfully
- [ ] Watch mode preserves navigation state on refresh

---

## Key Files to Create

```
src/
├── app.tsx                     # Full app with view routing
├── components/
│   ├── Header.tsx              # Top bar: project name, view tabs, filter
│   ├── HelpBar.tsx             # Bottom bar: keyboard shortcuts
│   ├── Dashboard.tsx           # Overview view
│   ├── MilestoneTable.tsx      # Sortable table view
│   ├── TaskTree.tsx            # Expandable tree view
│   ├── StatusBadge.tsx         # Color-coded status text
│   └── ProgressBar.tsx         # ASCII progress bar
├── hooks/
│   ├── useNavigation.ts        # View switching, list navigation state
│   └── useFilter.ts            # Status filter state
└── lib/
    └── colors.ts               # Updated with full color token set
```

---

## Tasks

1. [Task 5: App Shell & Layout](../tasks/milestone-2-dashboard-views-interaction/task-5-app-shell-layout.md) - Full-screen layout, header, help bar, view routing
2. [Task 6: Dashboard View](../tasks/milestone-2-dashboard-views-interaction/task-6-dashboard-view.md) - Project overview with progress bars and metadata
3. [Task 7: Milestone Table](../tasks/milestone-2-dashboard-views-interaction/task-7-milestone-table.md) - Sortable table with status badges
4. [Task 8: Task Tree](../tasks/milestone-2-dashboard-views-interaction/task-8-task-tree.md) - Expandable milestone → task hierarchy
5. [Task 9: Keyboard Navigation & Filtering](../tasks/milestone-2-dashboard-views-interaction/task-9-keyboard-navigation-filtering.md) - Global keys, list nav, status filter
6. [Task 10: Output Modes & npm Publish](../tasks/milestone-2-dashboard-views-interaction/task-10-output-modes-publish.md) - --json, --no-color, bin entry, publish

---

## Testing Requirements

- [ ] Component tests for each view using ink-testing-library
- [ ] Snapshot tests for known data → expected output
- [ ] Keyboard navigation integration tests
- [ ] Filter state tests
- [ ] Real progress.yaml rendering tests

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Ink table layout breaking on narrow terminals | Medium | Medium | Test at 80-col minimum, add graceful truncation |
| Keyboard conflicts between views | Medium | Low | Centralized key handler with view-aware routing |
| Performance with large milestone/task lists | Low | Low | Virtualize if needed (defer to P2) |

---

**Next Milestone**: [Milestone 3: Detail Views & Enhanced Features](milestone-3-detail-views-enhanced.md)
**Blockers**: None
**Notes**: This milestone produces the shippable MVP — all P0 features complete
