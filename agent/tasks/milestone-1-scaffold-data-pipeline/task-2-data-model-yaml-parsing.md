# Task 2: Data Model & YAML Parsing

**Milestone**: [M1 - Project Scaffold & Data Pipeline](../../milestones/milestone-1-scaffold-data-pipeline.md)
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md), Web Visualizer `local.data-model-yaml-parsing.md`
**Estimated Time**: 3 hours
**Dependencies**: Task 1 (project initialized)
**Status**: Not Started

---

## Objective

Implement the TypeScript data model interfaces and YAML parsing pipeline that converts raw progress.yaml into strongly-typed, normalized ProgressData. This is the core data layer all views depend on.

---

## Context

ACP progress.yaml files are maintained by AI agents, not schema-validated tooling. The parser must handle missing fields, variant key names, unknown properties, and status aliases. The approach is "extract known, preserve unknown" — agent-added fields are captured in `extra` properties, never discarded.

The data model matches the web visualizer's interfaces from `local.data-model-yaml-parsing.md`.

---

## Steps

### 1. Create Type Definitions (`src/lib/types.ts`)

Define interfaces:
- `Status` type: `'completed' | 'in_progress' | 'not_started'`
- `ProgressData`: top-level container
- `ProjectMetadata`: name, version, status, started, description, extra
- `Milestone`: id, name, status, progress, dates, task counts, extra
- `Task`: id, name, status, milestone_id, file, estimated_hours, extra
- `WorkEntry`: date, description, items, extra
- `DocumentationStats`, `ProgressSummary`
- `ExtraFields = Record<string, unknown>`

### 2. Create YAML Parser (`src/lib/yaml-loader.ts`)

Implement `parseProgressYaml(raw: string): ProgressData`:
- Parse raw YAML via js-yaml
- `extractKnown()` helper: separate known keys from extra fields
- `normalizeStatus()`: map "done"/"active"/"wip"/etc to canonical enum
- `normalizeStringArray()`: handle string-for-array coercion
- Key alias map: `est_hours` → `estimated_hours`, `completed` → `completed_date`, etc.
- Normalize each section: project, milestones, tasks, recent_work, notes, blockers
- Compute derived fields: milestone progress from task ratios, tasks_completed/total
- Wrap in try/catch: on total failure return minimal ProgressData with error

### 3. Write Unit Tests (`tests/yaml-loader.test.ts`)

Test cases:
- Valid complete progress.yaml → correct ProgressData
- Missing sections (no milestones, no tasks) → empty arrays, no crash
- Status variants: "done" → "completed", "active" → "in_progress"
- Key aliases: "est_hours" → "estimated_hours"
- Unknown fields preserved in extra
- String-for-array: `notes: "single note"` → `["single note"]`
- Completely empty file → minimal ProgressData
- Real progress.yaml from this project

### 4. Test with Real Data

Parse actual progress.yaml files:
- This project's progress.yaml
- Web visualizer's progress.yaml (if accessible)
- Verify no crashes, data looks correct

---

## Verification

- [ ] `src/lib/types.ts` exports all interfaces
- [ ] `src/lib/yaml-loader.ts` exports `parseProgressYaml`
- [ ] `npm run typecheck` passes
- [ ] All unit tests pass (`npm test`)
- [ ] Status normalization handles all variants
- [ ] Key aliases resolve correctly
- [ ] Extra fields preserved (not discarded)
- [ ] Empty/missing sections don't crash
- [ ] Real progress.yaml parses successfully

---

**Next Task**: [Task 3: CLI Entry Point & File Loading](task-3-cli-entry-point.md)
**Related Design Docs**: Web visualizer `local.data-model-yaml-parsing.md`
