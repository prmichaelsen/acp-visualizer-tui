# Task 4: Watch Mode

**Milestone**: [M1 - Project Scaffold & Data Pipeline](../../milestones/milestone-1-scaffold-data-pipeline.md)
**Design Reference**: [TUI Requirements - Watch Mode](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: Task 3 (CLI and file loading work)
**Status**: Not Started

---

## Objective

Implement fs.watch-based auto-refresh that re-parses progress.yaml when it changes on disk, updating the Ink component tree while preserving navigation state.

---

## Context

Watch mode is critical for the "live dashboard" use case — agents modify progress.yaml as they work, and the TUI should reflect changes in real time. The `--watch` / `-w` flag enables this. Changes should be debounced (multiple rapid writes → single re-parse).

---

## Steps

### 1. Create Watch Hook (`src/hooks/useWatchMode.ts`)

- Accept: file path, enabled flag, callback
- Use `fs.watch()` on the file path
- Debounce with 300ms delay (rapid agent writes)
- On change: call reload callback
- Clean up watcher on unmount
- Handle watch errors (file deleted, permissions)

### 2. Integrate with useProgressData

Update `useProgressData` hook:
- Accept `watch: boolean` flag
- If watch enabled, use `useWatchMode` to trigger `reload()`
- On reload: re-read file, re-parse, update state
- Preserve existing data during reload (don't flash empty state)

### 3. Handle Edge Cases

- File deleted while watching: show error, keep last known data
- File recreated: resume watching, re-parse
- Permission errors: show warning, keep watching
- Very rapid changes: debounce ensures single re-parse

### 4. Visual Indicator

- Show subtle "refreshed" indicator when data reloads (e.g., brief flash or timestamp)
- In JSON mode with watch: re-output full JSON on each change

---

## Verification

- [ ] `--watch` flag triggers fs.watch on progress.yaml
- [ ] Editing progress.yaml triggers re-parse and re-render
- [ ] Rapid edits debounced (not multiple re-parses)
- [ ] File deletion shows error but doesn't crash
- [ ] Navigation state preserved on refresh (current view, scroll position)
- [ ] `--json --watch` re-outputs JSON on each change
- [ ] Watcher cleaned up on quit

---

**Next Task**: [Task 5: App Shell & Layout](../milestone-2-dashboard-views-interaction/task-5-app-shell-layout.md)
