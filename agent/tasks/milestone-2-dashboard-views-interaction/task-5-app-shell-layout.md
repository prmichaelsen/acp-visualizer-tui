# Task 5: App Shell & Layout

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - Architecture](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Task 4 (M1 complete)
**Status**: Not Started

---

## Objective

Build the full-screen Ink app shell with header bar, content area, help bar, and view routing. This is the container that all views render inside.

---

## Context

The app uses a full-screen layout with three sections: header (project name, view tabs, filter state), main content (view-specific), and help bar (keyboard shortcuts for current context). Views are switched via Tab/Shift+Tab. The `useNavigation` hook manages which view is active.

---

## Steps

### 1. Create Navigation Hook (`src/hooks/useNavigation.ts`)

- Track current view: `'dashboard' | 'milestones' | 'tasks' | 'activity' | 'blockers'`
- Track view stack for detail view back-navigation (M3)
- Tab/Shift+Tab to cycle views
- Support `--view` flag for initial view

### 2. Create Header Component (`src/components/Header.tsx`)

- Project name and version (left)
- View tabs with active indicator (center)
- Filter state indicator (right)
- Use Ink's `<Box>` with `flexDirection="row"` and `justifyContent="space-between"`

### 3. Create Help Bar Component (`src/components/HelpBar.tsx`)

- Bottom row showing context-sensitive keyboard shortcuts
- Format: `Tab:Switch View  j/k:Navigate  Enter:Expand  f:Filter  q:Quit  ?:Help`
- Update based on current view

### 4. Create Color Tokens (`src/lib/colors.ts`)

- Status colors: green (completed), blue/cyan (in_progress), gray (not_started), red (blockers)
- UI colors: bold white (headers), dim (secondary text)
- Graceful fallback for 16-color terminals (use chalk level detection)

### 5. Wire Up App Shell (`src/app.tsx`)

- Full-screen layout: `<Box flexDirection="column" height="100%">`
- Header at top
- Content area: render active view component (placeholders for now)
- Help bar at bottom
- Pass data and navigation state to children

### 6. Handle Terminal Resize

- Re-render on terminal resize
- Use Ink's `useStdout()` for dimensions

---

## Verification

- [ ] Full-screen layout fills terminal
- [ ] Header shows project name and view tabs
- [ ] Tab cycles between views (placeholder content ok)
- [ ] Help bar shows keyboard shortcuts
- [ ] Active view tab is highlighted
- [ ] q exits cleanly
- [ ] Terminal resize doesn't break layout

---

**Next Task**: [Task 6: Dashboard View](task-6-dashboard-view.md)
