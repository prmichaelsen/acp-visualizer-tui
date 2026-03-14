# Task 7: Milestone Table

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - Milestone Table](../../design/local.tui-requirements.md)
**Estimated Time**: 4 hours
**Dependencies**: Task 6 (StatusBadge, ProgressBar exist)
**Status**: Not Started

---

## Objective

Build a sortable milestone table view with columns for name, status, progress, task counts, dates, and estimates. Navigable via j/k with column sorting via `s`.

---

## Steps

### 1. Create MilestoneTable Component (`src/components/MilestoneTable.tsx`)

Columns:
| Column | Width | Content |
|--------|-------|---------|
| Name | flex | Milestone name (truncated if needed) |
| Status | 12 | StatusBadge |
| Progress | 8 | `XX%` |
| Tasks | 7 | `3/5` |
| Started | 10 | Date or `-` |
| Est. | 8 | `2 wks` |

### 2. Implement Table Rendering

- Header row: bold, with sort indicator (▲/▼) on active column
- Data rows: alternating dim/normal for readability (optional)
- Selected row: inverse or highlight background
- Scroll when rows exceed terminal height (track scroll offset)

### 3. Implement Sorting

- `s` key cycles sort column: name → status → progress → tasks → started → est
- Each column toggleable ascending/descending
- Default: sort by status (in_progress first), then name

### 4. Implement Row Selection

- j/k or arrows move selection
- Selected row highlighted
- Enter on row will open detail view (M3 — for now, no-op)

### 5. Integrate Filter

- Accept filter state from parent
- Filter milestones by status before rendering
- Show filter indicator in header

---

## Verification

- [ ] Table renders all milestones with correct column data
- [ ] Column headers show with sort indicator
- [ ] `s` cycles sort column, data re-sorts
- [ ] j/k moves row selection
- [ ] Selected row visually highlighted
- [ ] Scrolling works when milestones exceed terminal height
- [ ] Status filter correctly hides/shows milestones
- [ ] Empty milestones shows "No milestones" message
- [ ] Fits 80-column terminal (columns truncate gracefully)

---

**Next Task**: [Task 8: Task Tree](task-8-task-tree.md)
