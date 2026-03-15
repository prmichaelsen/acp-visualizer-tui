# Task 18: Estimate vs Actual Chart

**Status**: not_started
**Estimated Hours**: 2
**Milestone**: milestone_4
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)

---

## Objective

Create a horizontal bar chart comparing estimated vs actual hours per milestone, matching the web visualizer's EstimateChart.tsx pattern.

## Steps

1. **Add `buildEstimateData` to `src/lib/chart-utils.ts`**
   - Map milestones to `{name, estimated, actual, status}`
   - Estimated: sum of `task.estimated_hours` for tasks in milestone
   - Actual: calculated from `milestone.started` to `milestone.completed` (6 hrs/day)
   - Truncate long milestone names (>25 chars)

2. **Create `EstimateChart.tsx` component** in `src/components/`
   - Horizontal bar chart with two bars per milestone
   - Blue bar for estimated, green/red bar for actual
   - Red when actual > estimated, green when under
   - Show hour values at end of bars
   - Legend at bottom
   - Scale bars to fit terminal width

3. **Add 'estimates' to VIEW_ORDER** in `useNavigation.ts`

4. **Wire into App.tsx** routing

5. **Update HelpBar**

## Expected Output

### Files Created
- `src/components/EstimateChart.tsx`

### Files Modified
- `src/lib/chart-utils.ts` — add buildEstimateData
- `src/hooks/useNavigation.ts` — add 'estimates' view
- `src/app.tsx` — add estimates routing
- `src/components/HelpBar.tsx`

## Verification
- [ ] Horizontal bars render correctly
- [ ] Red/green coloring based on over/under estimate
- [ ] Handles milestones without dates gracefully
- [ ] View accessible via Tab
- [ ] Typecheck passes
