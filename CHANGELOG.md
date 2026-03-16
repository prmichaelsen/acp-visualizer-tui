# Changelog

All notable changes to acp-visualizer-tui will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-16

### Added
- `@agent` mention detection with word-boundary regex (`/@agent\b/i`)
- `MentionText` component renders mentions in magenta bold
- Mention highlighting in ActivityLog, BlockersNextSteps, Dashboard, and KanbanBoard
- 11 unit tests for detection and segmentation logic

## [0.2.0] - 2026-03-16

### Added
- Burndown chart view with ASCII area chart showing cumulative task completion over time
- Estimate vs actual chart view comparing estimated hours against actual milestone duration
- Kanban board view with three status columns and milestone cards (h/l/j/k navigation)
- Gantt timeline view with horizontal bars positioned by date, month markers, and progress fill
- Dependency graph view with box-drawing character nodes and sequential/cross-milestone edges
- Flame chart view showing time allocation as stacked horizontal bars sized by estimated hours
- Priority pivot table view grouping tasks by priority field (P0-P3) from progress.yaml extra fields
- Shared chart-utils.ts with data transformation utilities for all chart views
- 7 new tests for flame chart and priority pivot data builders

### Changed
- Navigation expanded from 5 to 12 views (Tab/Shift+Tab cycles through all)
- Build size increased from 51KB to 101KB to support new visualizations

## [0.1.3] - 2026-03-15

### Added
- `e` hotkey in task tree view to expand/collapse all milestones
- Help bar updated to show expand all shortcut in tasks view

## [0.1.2] - 2026-03-15

### Fixed
- Parser now handles mismatched task keys and milestone IDs in progress.yaml
- Task key reconciliation via numeric extraction (e.g., `milestone_1` maps to milestone `M1`)
- Positional fallback for task keys that can't be matched numerically
- Unresolvable task keys are preserved instead of silently dropped

## [0.1.1] - 2026-03-14

### Fixed
- Add scrolling to detail views for overflow content
- Clear terminal on interactive mode startup for full-screen rendering
- Improve cursor visibility and navigation UX

## [0.1.0] - 2026-03-14

### Added
- Initial release
- Dashboard, milestone table, task tree, activity log, blockers views
- Milestone and task detail views with terminal markdown rendering
- Fuzzy search across milestones and tasks
- Keyboard navigation with vim-style bindings
- Watch mode for auto-refresh on file changes
- `--json` and `--no-color` output modes
