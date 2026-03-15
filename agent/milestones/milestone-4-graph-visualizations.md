# Milestone 4: Graph Visualizations

**Status**: not_started
**Started**: —
**Estimated Weeks**: 2
**Tasks**: 0/6

---

## Overview

Port the web visualizer's graph/chart components to terminal-compatible equivalents using ASCII rendering, box-drawing characters, and Ink's layout system. Adds 5 new views: burndown chart, estimate vs actual, kanban board, gantt timeline, and dependency graph.

## Goals

- Burndown chart showing task completion over time (ASCII area chart)
- Estimate vs actual hours comparison (horizontal bar chart)
- Kanban board with status columns (Ink Box layout)
- Gantt timeline with date-positioned bars (ASCII horizontal bars)
- Dependency graph with dagre layout (box-drawing characters)
- Integrate all new views into existing navigation system

## Dependencies

- Milestone 3 complete (all existing views working)
- New npm dependencies: dagre (graph layout)

## Design Reference

- [TUI Requirements](../design/local.tui-requirements.md)
- Web visualizer components audited: BurndownChart.tsx, EstimateChart.tsx, MilestoneKanban.tsx, MilestoneGantt.tsx, DependencyGraph.tsx
