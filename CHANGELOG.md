# Changelog

All notable changes to acp-visualizer-tui will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
