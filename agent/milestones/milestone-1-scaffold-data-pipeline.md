# Milestone 1: Project Scaffold & Data Pipeline

**Goal**: Set up the Ink project with TypeScript, CLI entry point, YAML parsing, and watch mode — everything needed before building views
**Duration**: 1 week
**Dependencies**: None
**Status**: Not Started
**Priority**: P0

---

## Overview

This milestone establishes the foundational infrastructure for the TUI visualizer. It creates a working CLI tool that can read and parse `progress.yaml` files, re-parse on file changes, and output structured data. No visual views yet — this is the data layer and project skeleton that all views will build upon.

By the end of this milestone, `npx acp-visualizer-tui ./agent/progress.yaml --json` should output parsed, normalized data, and `--watch` should re-output on file changes.

---

## Deliverables

### 1. Project Structure
- npm package with TypeScript, Ink, React
- CLI entry point with argument parsing (meow or yargs)
- Build system (tsup or similar for CLI bundling)
- tsconfig.json, package.json with bin entry

### 2. Data Model & YAML Parsing
- TypeScript interfaces matching web visualizer (ProgressData, Milestone, Task, etc.)
- YAML parsing with "extract known, preserve unknown" strategy
- Status normalization, key alias resolution, computed fields
- ExtraFields passthrough for agent-added properties

### 3. CLI & File Loading
- Path argument (default: `./agent/progress.yaml`)
- `--json` flag for machine-readable output
- `--no-color` flag
- `--watch` flag for auto-refresh
- `--view` flag (parsed but not yet functional)
- Graceful error handling for missing/invalid files

### 4. Watch Mode
- fs.watch-based file monitoring
- Re-parse and re-render on progress.yaml changes
- Debounce rapid changes

---

## Success Criteria

- [ ] `npm run build` compiles without errors
- [ ] `npx acp-visualizer-tui ./agent/progress.yaml --json` outputs valid JSON
- [ ] Parsed data includes all milestones, tasks, recent_work, next_steps
- [ ] Unknown YAML fields preserved in `extra` properties
- [ ] Status variants ("done", "active", "wip") normalized correctly
- [ ] `--watch` re-outputs when file changes
- [ ] `--no-color` strips ANSI codes
- [ ] Missing file shows helpful error message (not crash)
- [ ] Unit tests pass for YAML parsing

---

## Key Files to Create

```
acp-visualizer-tui/
├── package.json
├── tsconfig.json
├── tsup.config.ts           # or equivalent bundler config
├── src/
│   ├── cli.tsx              # CLI entry point (argument parsing + Ink render)
│   ├── app.tsx              # Root Ink app (placeholder)
│   ├── lib/
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── yaml-loader.ts   # YAML parsing & normalization
│   │   └── colors.ts        # Color token definitions
│   ├── hooks/
│   │   ├── useProgressData.ts  # Load and parse progress.yaml
│   │   └── useWatchMode.ts     # fs.watch auto-refresh hook
│   └── index.ts             # Package entry
└── tests/
    └── yaml-loader.test.ts  # Parsing unit tests
```

---

## Tasks

1. [Task 1: Initialize Project & Dependencies](../tasks/milestone-1-scaffold-data-pipeline/task-1-initialize-project.md) - npm init, TypeScript, Ink, CLI tooling
2. [Task 2: Data Model & YAML Parsing](../tasks/milestone-1-scaffold-data-pipeline/task-2-data-model-yaml-parsing.md) - Types, parser, normalization, tests
3. [Task 3: CLI Entry Point & File Loading](../tasks/milestone-1-scaffold-data-pipeline/task-3-cli-entry-point.md) - Argument parsing, file reading, --json/--no-color
4. [Task 4: Watch Mode](../tasks/milestone-1-scaffold-data-pipeline/task-4-watch-mode.md) - fs.watch auto-refresh with debounce

---

## Testing Requirements

- [ ] Unit tests for YAML parsing (valid, partial, malformed, empty)
- [ ] Unit tests for status normalization and key alias resolution
- [ ] Integration test: parse real progress.yaml files from ACP projects
- [ ] CLI smoke test: --json flag outputs valid JSON

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Ink version incompatibility with React 18 | High | Low | Pin versions, test early |
| fs.watch unreliable on some platforms | Medium | Medium | Add polling fallback option |
| Large progress.yaml parsing performance | Low | Low | Files are typically <100KB |

---

**Next Milestone**: [Milestone 2: Dashboard Views & Interaction](milestone-2-dashboard-views-interaction.md)
**Blockers**: None
**Notes**: Data model should match web visualizer's `local.data-model-yaml-parsing.md` as closely as possible
