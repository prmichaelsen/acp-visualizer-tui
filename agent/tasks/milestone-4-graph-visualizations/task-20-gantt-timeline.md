# Task 20: Gantt Timeline View

**Status**: not_started
**Estimated Hours**: 3
**Milestone**: milestone_4
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)

---

## Objective

Create a Gantt-style timeline view showing milestone durations as horizontal bars, matching the web visualizer's MilestoneGantt.tsx pattern.

## Steps

1. **Add date utilities to `src/lib/chart-utils.ts`**
   - `parseDate(str)` — parse date string
   - `daysBetween(a, b)` — calculate day difference
   - `formatShortDate(d)` — format as "Mar 14"

2. **Create `GanttChart.tsx` component** in `src/components/`
   - Left column: milestone names (fixed width ~25 chars)
   - Right area: horizontal timeline
   - Date axis header with month labels
   - Each milestone row shows:
     - Horizontal bar positioned by start/end date
     - Bar colored by status (green/blue/gray)
     - Inner fill showing progress percentage
   - Handle missing dates:
     - No completed: use current date or estimated_weeks
     - No started: skip or show placeholder
   - Scale: full width = min(started) to max(completed/current)

3. **Add 'gantt' to VIEW_ORDER** in `useNavigation.ts`

4. **Wire into App.tsx** routing

5. **j/k navigation** between milestone rows, Enter to open detail

6. **Update HelpBar**

## Expected Output

### Files Created
- `src/components/GanttChart.tsx`

### Files Modified
- `src/lib/chart-utils.ts` — add date utilities
- `src/hooks/useNavigation.ts` — add 'gantt' view
- `src/app.tsx` — add gantt routing
- `src/components/HelpBar.tsx`

## Verification
- [ ] Timeline bars render proportionally
- [ ] Bars positioned correctly by date
- [ ] Status colors applied
- [ ] Progress fill visible within bars
- [ ] Missing dates handled gracefully
- [ ] j/k navigation works
- [ ] Enter opens milestone detail
- [ ] Typecheck passes
