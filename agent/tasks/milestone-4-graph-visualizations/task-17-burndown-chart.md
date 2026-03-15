# Task 17: Burndown Chart View

**Status**: not_started
**Estimated Hours**: 3
**Milestone**: milestone_4
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)

---

## Objective

Create a terminal burndown chart showing cumulative task completion over time, matching the web visualizer's BurndownChart.tsx pattern.

## Steps

1. **Create `buildBurndownData` utility** in `src/lib/chart-utils.ts`
   - Collect all tasks from all milestones
   - Filter tasks with `completed_date` values
   - Sort unique completion dates chronologically
   - Build cumulative data points: `{date, completed, total, remaining}`
   - Include project `started` date as first point

2. **Create `BurndownChart.tsx` component** in `src/components/`
   - Render ASCII area/line chart using custom rendering (no external chart lib)
   - Y-axis: task count (0 to total)
   - X-axis: dates
   - Show completed line with filled area below
   - Show remaining line
   - Use green for completed, blue for remaining
   - Handle edge cases: no completed tasks, single data point

3. **Add 'burndown' to VIEW_ORDER** in `useNavigation.ts`
   - Add after 'blockers' in view order
   - Add label: 'Burndown'

4. **Wire into App.tsx routing**
   - Add case for 'burndown' view rendering BurndownChart
   - Pass `data` prop

5. **Update HelpBar** with burndown-specific keys

6. **Add tests** for `buildBurndownData`

## Expected Output

### Files Created
- `src/lib/chart-utils.ts` — shared chart data transformation utilities
- `src/components/BurndownChart.tsx` — burndown chart view component

### Files Modified
- `src/hooks/useNavigation.ts` — add 'burndown' view
- `src/app.tsx` — add burndown routing
- `src/components/HelpBar.tsx` — add burndown keys
- `src/components/Header.tsx` — view tab shows Burndown

## Verification
- [ ] BurndownChart renders with sample data
- [ ] buildBurndownData correctly accumulates completions
- [ ] View accessible via Tab navigation
- [ ] Edge case: no completed tasks shows empty chart message
- [ ] Typecheck passes
- [ ] Tests pass
