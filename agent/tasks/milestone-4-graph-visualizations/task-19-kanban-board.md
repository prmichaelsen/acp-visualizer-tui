# Task 19: Kanban Board View

**Status**: not_started
**Estimated Hours**: 3
**Milestone**: milestone_4
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)

---

## Objective

Create a kanban board view with status columns showing milestone cards, matching the web visualizer's MilestoneKanban.tsx pattern.

## Steps

1. **Create `KanbanBoard.tsx` component** in `src/components/`
   - Three columns: Not Started | In Progress | Completed
   - Each column shows milestone cards in that status
   - Cards show: milestone name, progress bar, task count (completed/total), notes
   - Column headers with status color coding
   - Columns laid out side-by-side using Ink `<Box flexDirection="row">`
   - Each column gets ~1/3 of terminal width
   - Scrollable if many milestones in a column

2. **Card component** (inline or extracted)
   - Bordered box with milestone name
   - ProgressBar component reuse
   - Task count: "3/5 tasks"
   - Truncate notes to 1 line

3. **Add 'kanban' to VIEW_ORDER** in `useNavigation.ts`

4. **Wire into App.tsx** routing

5. **Keyboard navigation**
   - j/k to move between cards within column
   - h/l or left/right to move between columns
   - Enter to open milestone detail

6. **Update HelpBar** with kanban-specific keys

## Expected Output

### Files Created
- `src/components/KanbanBoard.tsx`

### Files Modified
- `src/hooks/useNavigation.ts` — add 'kanban' view
- `src/app.tsx` — add kanban routing
- `src/components/HelpBar.tsx` — add kanban keys

## Verification
- [ ] Three columns render side-by-side
- [ ] Milestones grouped by status
- [ ] Cards show name, progress, task count
- [ ] h/l navigation between columns works
- [ ] j/k navigation within columns works
- [ ] Enter opens milestone detail
- [ ] Empty columns show placeholder
- [ ] Typecheck passes
