# Task 11: Markdown Loading Service

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Markdown File Resolution](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: Task 10 (M2 complete)
**Status**: Not Started

---

## Objective

Create a service that resolves and loads markdown files for milestone and task documents from the local filesystem, following the same resolution strategy as the web visualizer.

---

## Context

Milestone documents don't have a `file` field in progress.yaml — they must be found by scanning `agent/milestones/` for files matching `milestone-{N}-*.md`. Task documents have a `file` field pointing directly to their markdown. The base path is derived from the progress.yaml file path.

---

## Steps

### 1. Create Markdown Loader (`src/lib/markdown-loader.ts`)

Functions:
- `loadMarkdownFile(basePath: string, relativePath: string): { content: string } | { error: string }`
- `resolveMilestoneFile(basePath: string, milestoneId: string): string | null`
  - Extract number from id: `milestone_1` → `1`
  - Scan `agent/milestones/` for `milestone-1-*.md` (exclude templates)
  - Return first match or null
- `resolveTaskFile(tasks: Record<string, Task[]>, taskId: string): string | null`
  - Search all milestone task arrays for matching task id
  - Return `task.file` if found

### 2. Base Path Resolution

- Derive from progress.yaml path: strip filename, use parent directory
- e.g., `/home/user/project/agent/progress.yaml` → `/home/user/project/`

### 3. Error Handling

- File not found: return `{ error: "No document found at ..." }`
- Permission error: return `{ error: "Cannot read ..." }`
- Never throw — always return structured result

### 4. Unit Tests

- Milestone resolution: finds correct file by scanning
- Milestone resolution: excludes template files
- Task resolution: returns correct file path
- Missing files: returns error object
- Base path derivation: correct for various paths

---

## Verification

- [ ] `resolveMilestoneFile` finds milestone docs by scanning directory
- [ ] `resolveMilestoneFile` excludes `*.template.md` files
- [ ] `resolveTaskFile` returns correct `task.file` path
- [ ] `loadMarkdownFile` reads file content successfully
- [ ] Missing file returns structured error (not throw)
- [ ] Base path derived correctly from progress.yaml path
- [ ] Unit tests pass

---

**Next Task**: [Task 12: Terminal Markdown Renderer](task-12-markdown-renderer.md)
