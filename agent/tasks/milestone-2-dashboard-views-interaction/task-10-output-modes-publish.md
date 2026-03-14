# Task 10: Output Modes & npm Publish

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - CLI Interface](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: Tasks 5-9 (all views and navigation complete)
**Status**: Not Started

---

## Objective

Finalize `--json` and `--no-color` output modes, configure package.json for npm publishing, and verify `npx acp-visualizer-tui` works end-to-end.

---

## Steps

### 1. Finalize JSON Output Mode

- `--json`: parse progress.yaml, print full ProgressData as formatted JSON, exit
- `--json --watch`: re-output JSON on each file change (newline-delimited)
- Ensure no Ink rendering in JSON mode (pure stdout)

### 2. Finalize No-Color Mode

- `--no-color`: set `FORCE_COLOR=0` before Ink render
- Verify all StatusBadge and ProgressBar components degrade gracefully
- Strip ANSI codes from all output

### 3. Configure npm Publishing

Update package.json:
- `bin`: `{ "acp-visualizer-tui": "./dist/cli.js" }`
- `files`: `["dist"]` (only publish built output)
- `engines`: `{ "node": ">=18" }`
- `keywords`: appropriate for discoverability
- Verify `npm pack` produces correct tarball

### 4. End-to-End Testing

- `npx . ./agent/progress.yaml` launches interactive mode
- `npx . --json` outputs JSON
- `npx . --no-color` renders without colors
- `npx . --watch` watches for changes
- `npx . --help` shows usage
- `npx . nonexistent.yaml` shows error

### 5. Update README

- Quick start: `npx acp-visualizer-tui`
- Usage examples
- Keyboard shortcuts reference
- Screenshots (optional, can be added later)

---

## Verification

- [ ] `--json` outputs valid JSON and exits
- [ ] `--json --watch` re-outputs on changes
- [ ] `--no-color` strips all ANSI codes
- [ ] `npm pack` produces valid tarball
- [ ] `npx .` launches interactive TUI
- [ ] All CLI flags documented in `--help`
- [ ] README updated with usage instructions
- [ ] Build output in `dist/` is self-contained

---

**Next Task**: [Task 11: Markdown Loading Service](../milestone-3-detail-views-enhanced/task-11-markdown-loading.md)
**Notes**: This task completes the P0 MVP. The tool is shippable after this.
