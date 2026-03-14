# Task 6: Dashboard View

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - Views](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Task 5 (app shell exists)
**Status**: Not Started

---

## Objective

Build the default dashboard view showing project overview: metadata, overall progress bar, current milestone, milestone status summary, and next steps.

---

## Steps

### 1. Create ProgressBar Component (`src/components/ProgressBar.tsx`)

- ASCII progress bar: `[████████░░░░░░░░] 52%`
- Configurable width, label, color
- Green fill for high %, blue for mid, gray for low

### 2. Create StatusBadge Component (`src/components/StatusBadge.tsx`)

- Colored text: `● Completed` (green), `● In Progress` (blue), `○ Not Started` (gray)
- Compact mode: just the dot

### 3. Create Dashboard Component (`src/components/Dashboard.tsx`)

Layout:
```
┌─ Project ─────────────────────────────┐
│ acp-visualizer-tui v0.1.0             │
│ Status: ● In Progress                 │
│ Started: 2026-03-14                   │
│ Progress: [████████░░░░░░] 52%        │
│ Current: M2 - Dashboard Views         │
├─ Milestones ──────────────────────────┤
│ ● Completed: 1  ● In Progress: 1     │
│ ○ Not Started: 1                      │
├─ Next Steps ──────────────────────────┤
│ 1. Complete task-5: App Shell         │
│ 2. Build milestone table view         │
│ 3. Implement keyboard navigation      │
└───────────────────────────────────────┘
```

- Use Ink `<Box>` with borders (borderStyle)
- Section headers bold
- Data values in default color

### 4. Wire into App Shell

- Dashboard is the default view
- Receives ProgressData as prop
- Handles empty data gracefully (no milestones yet)

---

## Verification

- [ ] Dashboard renders project metadata correctly
- [ ] Progress bar shows correct percentage with color
- [ ] Status badge shows correct status with color
- [ ] Milestone summary counts are correct
- [ ] Next steps list renders
- [ ] Empty data (no milestones) doesn't crash
- [ ] Layout fits 80-column terminal

---

**Next Task**: [Task 7: Milestone Table](task-7-milestone-table.md)
