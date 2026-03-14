# Task 9: Keyboard Navigation & Filtering

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - Keyboard Navigation](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Tasks 5-8 (all views exist)
**Status**: Not Started

---

## Objective

Implement the complete keyboard navigation system and status filter that works across all views. Centralize key handling so views receive navigation events consistently.

---

## Steps

### 1. Create Filter Hook (`src/hooks/useFilter.ts`)

- Track active filter: `'all' | 'in_progress' | 'completed' | 'not_started'`
- `f` key cycles: all → in_progress → completed → not_started → all
- Provide filter function: `(status: Status) => boolean`
- Filter state displayed in header

### 2. Centralize Key Handling in App

Use Ink's `useInput` hook in app.tsx:
- Global keys (always active): Tab, Shift+Tab, q, r, ?, f
- View keys (passed to active view): j, k, arrows, Enter, Space, s
- Prevent key conflicts between global and view handlers

### 3. Implement Help Overlay

- `?` toggles help overlay
- Show all keyboard shortcuts grouped by context
- Any key dismisses overlay
- Rendered as overlay on top of current view

### 4. Wire Navigation State to All Views

- Dashboard: scrollable next steps (j/k)
- Milestone table: row selection (j/k), sort (s), expand (Enter)
- Task tree: cursor navigation (j/k), expand/collapse (Enter/Space)
- All views: filter (f) affects displayed data

### 5. Preserve State on View Switch

- Each view maintains its own cursor/scroll position
- Switching views and back restores position
- Filter state is global (persists across views)

---

## Verification

- [ ] Tab/Shift+Tab cycles between all views
- [ ] q exits the app
- [ ] r triggers manual refresh
- [ ] ? shows help overlay, any key dismisses
- [ ] f cycles status filter
- [ ] Filter indicator shown in header
- [ ] j/k navigates within each view
- [ ] View-specific keys work (s for sort in table, Enter for expand in tree)
- [ ] Navigation state preserved on view switch
- [ ] No key conflicts between global and view handlers

---

**Next Task**: [Task 10: Output Modes & npm Publish](task-10-output-modes-publish.md)
