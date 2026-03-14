# Task 3: CLI Entry Point & File Loading

**Milestone**: [M1 - Project Scaffold & Data Pipeline](../../milestones/milestone-1-scaffold-data-pipeline.md)
**Design Reference**: [TUI Requirements - CLI Interface](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: Task 2 (YAML parser exists)
**Status**: Not Started

---

## Objective

Wire up the CLI entry point to parse arguments, read progress.yaml from the filesystem, parse it, and either output JSON (--json mode) or render the Ink app (interactive mode).

---

## Context

The CLI is the user's entry point. It needs to handle:
- Positional path argument (default: `./agent/progress.yaml`)
- `--json` for machine-readable output (prints JSON and exits)
- `--no-color` for piped output
- `--watch` flag (parsed here, implemented in Task 4)
- `--view` flag (parsed here, used in M2)
- Error handling for missing/invalid files

---

## Steps

### 1. Update CLI Entry (`src/cli.tsx`)

Configure meow with:
- Positional `[path]` argument
- Flags: `--json`, `--no-color`, `--watch`/`-w`, `--view`/`-v`, `--help`/`-h`, `--version`/`-V`

### 2. Implement File Reading

Create `useProgressData` hook (`src/hooks/useProgressData.ts`):
- Accept file path
- Read file with `fs.readFileSync` (sync for initial load)
- Parse with `parseProgressYaml`
- Return `{ data, error, loading, reload }`
- Handle file-not-found, parse errors gracefully

### 3. Wire Up JSON Mode

In cli.tsx:
- If `--json`: read file, parse, `console.log(JSON.stringify(data, null, 2))`, exit
- If `--no-color`: set `FORCE_COLOR=0` environment variable before Ink render

### 4. Wire Up Interactive Mode

- Pass parsed data and flags to `<App />` component
- App receives: `data`, `filePath`, `watch`, `initialView`
- For now, App can just display a simple text summary (views come in M2)

### 5. Error Handling

- File not found: show helpful message with path attempted
- Parse error: show error message with details
- Both modes (json/interactive) handle errors gracefully

---

## Verification

- [ ] `acp-visualizer-tui ./agent/progress.yaml --json` outputs valid JSON
- [ ] `acp-visualizer-tui --json` uses default path `./agent/progress.yaml`
- [ ] `acp-visualizer-tui nonexistent.yaml` shows file-not-found error
- [ ] `acp-visualizer-tui --help` shows usage
- [ ] `acp-visualizer-tui --version` shows version
- [ ] Interactive mode launches Ink app with parsed data
- [ ] `--no-color` flag respected

---

**Next Task**: [Task 4: Watch Mode](task-4-watch-mode.md)
