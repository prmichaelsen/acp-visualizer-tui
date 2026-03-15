# Task 21: Dependency Graph View

**Status**: not_started
**Estimated Hours**: 4
**Milestone**: milestone_4
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)

---

## Objective

Create a dependency graph view using dagre for layout and box-drawing characters for rendering, matching the web visualizer's DependencyGraph.tsx pattern.

## Steps

1. **Install dagre** — `npm install dagre @types/dagre`

2. **Add `buildDependencyGraph` to `src/lib/chart-utils.ts`**
   - Create dagre graph with rankdir='TB' (top-to-bottom)
   - Add tasks as nodes with label, status, milestone
   - Infer edges:
     - Sequential within milestones: Task N → Task N+1
     - Cross-milestone: Last task of milestone N → First task of milestone N+1
   - Run `dagre.layout(g)` for positioning
   - Return nodes with (x, y, width, height) and edges with points

3. **Create `DependencyGraph.tsx` component** in `src/components/`
   - Render nodes as bordered boxes using box-drawing chars: `┌─┐ │ │ └─┘`
   - Status-colored borders (green/blue/gray)
   - Render edges as lines using `│ ─ ┌ └ ┐ ┘ ├ ┤ ┬ ┴ → ↓`
   - Place nodes on a character grid based on dagre positions
   - Scroll support for large graphs (j/k to scroll viewport)
   - Node labels truncated to fit box width
   - Legend showing status colors

4. **Character grid rendering approach**
   - Create 2D char array sized to graph bounds
   - Plot nodes as box-drawing rectangles
   - Plot edges as line segments between nodes
   - Convert grid to string output
   - Wrap in Ink `<Text>` component

5. **Add 'graph' to VIEW_ORDER** in `useNavigation.ts`

6. **Wire into App.tsx** routing

7. **Update HelpBar** with graph-specific keys (j/k scroll)

## Expected Output

### Files Created
- `src/components/DependencyGraph.tsx`

### Files Modified
- `src/lib/chart-utils.ts` — add buildDependencyGraph
- `src/hooks/useNavigation.ts` — add 'graph' view
- `src/app.tsx` — add graph routing
- `src/components/HelpBar.tsx`
- `package.json` — add dagre dependency

## Verification
- [ ] dagre installed and importable
- [ ] Graph layout produces valid positions
- [ ] Nodes render as bordered boxes with labels
- [ ] Edges render as lines connecting nodes
- [ ] Status colors applied to nodes
- [ ] Scrolling works for large graphs
- [ ] Typecheck passes
