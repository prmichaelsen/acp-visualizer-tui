# ACP Visualizer TUI

**Concept**: Terminal-based interactive visualizer for ACP progress.yaml data using Ink (React for CLIs)
**Created**: 2026-03-14
**Status**: Design Specification

---

## Overview

A full-screen terminal UI application that renders ACP `progress.yaml` files as an interactive dashboard with keyboard navigation. Built with Ink (React for CLIs) and TypeScript, the TUI provides an overview dashboard, milestone table, expandable task tree, recent work log, and blockers/next steps views — all navigable without a mouse. It supports watch mode for auto-refresh, `--json` for machine-readable output, and `--no-color` for piping.

The tool is published to npm as `acp-visualizer-tui` (usable via `npx acp-visualizer-tui`) and lives at `~/.acp/projects/acp-visualizer-tui`.

---

## Problem Statement

ACP's `progress.yaml` files grow large (1800+ lines) and are difficult to navigate in a text editor. While the web-based `agent-context-protocol-visualizer` provides a browser dashboard, many developers work primarily in their terminal (IDE integrated terminals, standalone terminals, SSH/headless environments) and need a way to visualize project status without leaving their workflow.

The existing text-based ACP commands (`@acp.status`, `@acp.report`) provide useful summaries but lack:

- Interactive navigation through milestone/task hierarchies
- Persistent, auto-updating dashboard view
- Visual progress indicators (progress bars, status badges)
- Keyboard-driven exploration of project state

---

## Solution

Build an Ink (React for CLIs) application that:

1. Reads `progress.yaml` from the local filesystem
2. Parses YAML into structured TypeScript data (reusing the data model from the web visualizer)
3. Renders a full-screen TUI with multiple views (dashboard, milestones, tasks, activity, blockers)
4. Provides keyboard navigation with expandable/collapsible sections
5. Supports watch mode that auto-refreshes when progress.yaml changes
6. Offers `--json` and `--no-color` output modes

### Alternative Approaches Considered

- **blessed/neo-blessed**: More traditional, lower-level — rejected in favor of Ink's React model for consistency with web visualizer patterns
- **bubbletea (Go)**: Different ecosystem entirely — rejected to stay in TypeScript/Node.js
- **Textual (Python)**: Different ecosystem — rejected for same reason
- **Static pretty-print**: Rejected — MVP should be interactive from the start per requirements

---

## Implementation

### Architecture

```
acp-visualizer-tui/
├── src/
│   ├── app.tsx                    # Root Ink app component
│   ├── cli.tsx                    # CLI entry point (meow/yargs + Ink render)
│   ├── components/
│   │   ├── Dashboard.tsx          # Overview: project metadata, progress bars
│   │   ├── MilestoneTable.tsx     # Sortable milestone table
│   │   ├── TaskTree.tsx           # Expandable milestone → task tree
│   │   ├── MilestoneDetail.tsx    # Milestone detail: metadata + markdown + task list
│   │   ├── TaskDetail.tsx         # Task detail: metadata + markdown + sibling nav
│   │   ├── MarkdownRenderer.tsx   # Terminal markdown rendering
│   │   ├── Breadcrumb.tsx         # Navigation breadcrumb trail
│   │   ├── ActivityLog.tsx        # Recent work entries
│   │   ├── BlockersNextSteps.tsx  # Blockers and next steps summary
│   │   ├── StatusBadge.tsx        # Color-coded status indicator
│   │   ├── ProgressBar.tsx        # ASCII progress bar
│   │   ├── Header.tsx             # Top bar with project name, view tabs
│   │   ├── Sidebar.tsx            # Navigation sidebar (if split pane)
│   │   └── HelpBar.tsx            # Bottom bar with keyboard shortcuts
│   ├── hooks/
│   │   ├── useProgressData.ts     # Load and parse progress.yaml
│   │   ├── useWatchMode.ts        # fs.watch-based auto-refresh
│   │   ├── useNavigation.ts       # Keyboard navigation state
│   │   └── useFilter.ts           # Status filtering state
│   ├── lib/
│   │   ├── types.ts               # TypeScript interfaces (shared with web)
│   │   ├── yaml-loader.ts         # YAML parsing & normalization
│   │   ├── markdown-loader.ts     # Load markdown from milestone/task files
│   │   └── colors.ts              # Color tokens with graceful fallback
│   └── index.ts                   # Package entry point
├── package.json
├── tsconfig.json
└── agent/                         # ACP project files
```

### Data Model

Reuses the same TypeScript interfaces and YAML parsing pipeline designed for the web visualizer. Key types:

```typescript
export type Status = 'completed' | 'in_progress' | 'not_started';

export interface ProgressData {
  project: ProjectMetadata;
  milestones: Milestone[];
  tasks: Record<string, Task[]>;
  recent_work: WorkEntry[];
  next_steps: string[];
  notes: string[];
  current_blockers: string[];
  documentation: DocumentationStats;
  progress: ProgressSummary;
}
```

The parser follows "extract known, preserve unknown" — agent-added fields are captured in `extra: ExtraFields` on each entity, never silently discarded. Status variants (`"done"`, `"active"`, `"wip"`) are normalized to canonical enum values. Key aliases (`est_hours` → `estimated_hours`) are resolved during parsing.

See the web visualizer's `local.data-model-yaml-parsing.md` for the full parsing implementation.

### Views

**Dashboard (default view)**:
- Project name, version, status, start date
- Overall progress bar
- Current milestone indicator
- Milestone count by status
- Next steps list

**Milestone Table**:
- Columns: name, status, progress %, tasks (completed/total), started, est. weeks
- Sortable by any column via keyboard
- Status badges with color coding

**Task Tree**:
- Expandable milestone nodes
- Task items with status dots, file path, notes
- Extra fields badge (shows count of agent-added properties)

**Activity Log**:
- Recent work entries with date, description, bullet items
- Scrollable list

**Blockers & Next Steps**:
- Current blockers (highlighted)
- Next steps list

**Milestone Detail** (drill-down from table/tree):
- Breadcrumb: `Milestones > M1 - Project Scaffold`
- Metadata header: status badge, progress bar, dates, task count, est. weeks, notes
- Rendered markdown content from milestone document (`agent/milestones/milestone-N-*.md`)
- Task list at bottom with status dots and links to task detail

**Task Detail** (drill-down from task tree or milestone detail):
- Breadcrumb: `Milestones > M1 - Project Scaffold > Task 1: Initialize...`
- Metadata header: status badge, estimated hours, completed date, parent milestone, notes
- Rendered markdown content from task document (using `task.file` field)
- Prev/next sibling navigation at bottom (within same milestone)

### Markdown Rendering in Terminal

Terminal markdown rendering adapts the web visualizer's react-markdown approach for the terminal:

- **Headers**: Bold, with `#` level indicated by indentation or color intensity
- **Code blocks**: Bordered box with dimmed background (if terminal supports it), syntax type label
- **Inline code**: Highlighted with backtick-style markers
- **Lists**: Bullet/numbered with proper indentation
- **Bold/italic**: ANSI bold/dim formatting
- **Tables**: ASCII table rendering with column alignment
- **Links**: Show URL in parentheses after link text

Use a library like `marked-terminal` or `cli-markdown` for rendering, or build a lightweight renderer on top of a markdown AST parser.

### Markdown File Resolution

Follows the same strategy as the web visualizer:

- **Task files**: Use the `task.file` field from progress.yaml (e.g., `agent/tasks/task-1-initialize.md`)
- **Milestone files**: Scan `agent/milestones/` directory for files matching `milestone-{N}-*.md` pattern (excludes templates)
- **Base path**: Derived from the progress.yaml file path (strip `progress.yaml`, use parent as project root)
- **Missing files**: Show metadata header normally, display "No document found" message in content area — never crash

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Switch between views |
| `↑` / `↓` / `j` / `k` | Navigate within list/table |
| `Enter` / `Space` | Expand/collapse tree node |
| `Enter` (on milestone/task) | Open detail view |
| `Backspace` / `Escape` | Back to previous view (from detail) |
| `[` / `]` | Previous/next sibling (in task detail) |
| `s` | Cycle sort column (in table view) |
| `f` | Cycle status filter |
| `/` | Search (if implemented) |
| `q` | Quit |
| `r` | Manual refresh |
| `?` | Show help |

### Color Scheme

Matches the web visualizer's design tokens, adapted for terminal:

| Element | Color |
|---------|-------|
| Completed | Green |
| In Progress | Blue/Cyan |
| Not Started | Gray/Dim |
| Blockers | Red |
| Progress bar fill | Green/Blue gradient |
| Headers | Bold white |
| Data values | Default (monospace inherent in terminal) |

Rich colors (256-color/truecolor) with graceful fallback to basic 16 colors for limited terminals.

### CLI Interface

```
Usage: acp-visualizer-tui [options] [path]

Arguments:
  path                    Path to progress.yaml (default: ./agent/progress.yaml)

Options:
  -w, --watch             Watch mode: auto-refresh on file changes
  -v, --view <view>       Initial view: dashboard|milestones|tasks|activity|blockers
  --json                  Output parsed data as JSON (non-interactive)
  --no-color              Disable colors (for piping)
  -h, --help              Show help
  -V, --version           Show version
```

### Watch Mode

Uses `fs.watch()` on the progress.yaml file path. On change:
1. Re-read and re-parse the file
2. Update the Ink component tree
3. Preserve current navigation state (selected view, scroll position, expanded nodes)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| TUI framework | Ink (React for CLIs) |
| Language | TypeScript |
| Runtime | Node.js |
| YAML parsing | js-yaml |
| CLI parsing | meow or yargs |
| Color support | chalk (bundled with Ink) |
| File watching | Node.js fs.watch |

---

## Priority Tiers

### P0 — MVP

| Feature | Description |
|---------|-------------|
| Dashboard view | Project metadata, progress bars, next steps |
| Milestone table | Sortable columns with status badges |
| Task tree | Expandable milestone → task hierarchy |
| Keyboard navigation | View switching, list navigation, expand/collapse |
| Status filtering | Cycle through all/in-progress/completed/not-started |
| Local file loading | Read progress.yaml from filesystem |
| Watch mode | Auto-refresh on file changes |
| `--json` output | Machine-readable non-interactive mode |
| `--no-color` | Plain text for piping |
| npm publishable | `npx acp-visualizer-tui` works |

### P1 — Detail Views & Enhanced

| Feature | Description |
|---------|-------------|
| Milestone detail view | Drill-down: metadata header + rendered markdown + task list |
| Task detail view | Drill-down: metadata header + rendered markdown + sibling nav |
| Markdown rendering | Terminal-adapted markdown with headers, code blocks, lists, tables |
| Markdown file loading | Resolve and read milestone/task documents from filesystem |
| Breadcrumb navigation | Show path (Milestones > M1 > Task 1) with back navigation |
| Sibling navigation | Prev/next task within same milestone |
| Activity log view | Recent work timeline |
| Blockers view | Current blockers and next steps |
| Search | Fuzzy search across milestones and tasks |
| Extra fields display | Show agent-added properties on entities |

### P2 — Future

| Feature | Description |
|---------|-------------|
| Multi-project | Select from ~/.acp/projects.yaml |

---

## Benefits

- **In-terminal workflow**: View project status without leaving the terminal
- **SSH-friendly**: Works in headless environments where browsers aren't available
- **Fast startup**: No browser, no server — direct file read and render
- **Shared data model**: Same parsing logic as web visualizer ensures consistency
- **Auto-updating**: Watch mode reflects real-time agent progress

---

## Trade-offs

- **Ink limitations**: Less layout flexibility than a browser — no CSS grid, limited table rendering (mitigated by keeping layouts simple)
- **Node.js dependency**: Users need Node.js installed (acceptable per requirements)
- **Duplicate data model**: Parsing code shared conceptually but maintained separately from web visualizer (mitigated by keeping interfaces identical)
- **Terminal variance**: Different terminals have different color/Unicode support (mitigated by graceful fallback)

---

## Dependencies

- `ink` — React for CLIs
- `ink-text-input` — text input component (for search, P1)
- `react` — peer dependency of Ink
- `js-yaml` — YAML parsing
- `meow` or `yargs` — CLI argument parsing
- `chalk` — color support (bundled with Ink)
- `marked` + `marked-terminal` — terminal markdown rendering (P1, for detail views)

---

## Testing Strategy

- **Unit tests**: YAML parsing, status normalization, alias resolution, computed fields
- **Component tests**: Ink component rendering with `ink-testing-library`
- **Snapshot tests**: Known YAML → expected terminal output
- **Real-world tests**: Parse actual progress.yaml files from ACP projects
- **Edge cases**: Empty files, missing sections, huge files, no-color mode

---

## Migration Path

N/A — greenfield project.

1. Initialize npm project with TypeScript
2. Set up Ink with basic app structure
3. Implement YAML parsing (port from web visualizer design)
4. Build views incrementally (dashboard → table → tree)
5. Add keyboard navigation
6. Add watch mode
7. Publish to npm

---

## Key Design Decisions

### Scope

| Decision | Choice | Rationale |
|---|---|---|
| Project location | `~/.acp/projects/acp-visualizer-tui` | Alongside web visualizer, consistent with ACP project structure |
| Distribution | npm (`npx acp-visualizer-tui`) | Easy installation, no build required for end users |
| Data source | Local filesystem only | No GitHub remote — keeps MVP simple; SSH/headless use case doesn't need remote |
| Read/write mode | Read-only | Matches web visualizer — dashboard for viewing, not editing |

### Technology

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Ink (React for CLIs) | React patterns consistent with web visualizer; active ecosystem |
| Language | TypeScript / Node.js | Consistent with web visualizer; shared data model |
| YAML parser | js-yaml | Same as web visualizer for parsing consistency |
| Mouse support | None | Terminal-first, keyboard-only; SSH/headless environments often lack mouse |

### User Experience

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Full-screen with split panes (not resizable) | Maximizes information density; resizable adds complexity |
| MVP interactivity | Interactive from start | Not a static pretty-print; users want navigation immediately |
| Color support | Rich colors with 16-color fallback | Graceful degradation for limited terminals |
| Design tokens | Match web visualizer | Consistent visual identity across tools |

### Output Modes

| Decision | Choice | Rationale |
|---|---|---|
| `--json` flag | Yes | Machine-readable output for scripting/piping |
| `--no-color` flag | Yes | Clean output for piping to files |
| stdin input | No | Read from file path only; keeps CLI interface simple |

### Detail Views (P1)

| Decision | Choice | Rationale |
|---|---|---|
| Detail view trigger | `Enter` on selected milestone/task | Natural keyboard interaction; consistent with tree expand pattern |
| Detail layout | Full-screen replace (not split pane) | Terminal width is limited; full-screen gives markdown room to breathe |
| Back navigation | `Backspace`/`Escape` returns to list | Standard terminal back-navigation pattern |
| Milestone file resolution | Scan `agent/milestones/` for `milestone-{N}-*.md` | Same strategy as web visualizer; backwards compatible with existing progress.yaml |
| Task file resolution | Use `task.file` field from progress.yaml | Direct path, no scanning needed |
| Markdown rendering | `marked` + `marked-terminal` | Mature library combo; handles code blocks, tables, lists in terminal |
| Missing markdown | Show metadata + "No document found" | Never crash; metadata from progress.yaml is always available |
| Sibling navigation | `[`/`]` for prev/next task | Vim-inspired bracket navigation; works within same milestone |
| Breadcrumb | Text trail at top of detail view | Shows context (which milestone, which task); clickable via numbered shortcuts |

### Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Data model | Shared with web visualizer | Same TypeScript interfaces, same "extract known, preserve unknown" strategy |
| Watch mode | fs.watch on progress.yaml | Real-time updates as agents modify the file |
| Own ACP setup | Yes | Independent project tracking, not tracked in web visualizer's ACP |

---

## Future Considerations

- **`@acp.tui` command**: ACP package command to launch the TUI from any project
- **Shared npm package for data model**: Extract `types.ts` and `yaml-loader.ts` into a shared package consumed by both web and TUI visualizers
- **Theming**: User-configurable color schemes
- **Plugin views**: Allow ACP packages to contribute custom TUI views

---

**Status**: Design Specification
**Recommendation**: Plan milestones and tasks with @acp-plan, then begin P0 implementation
**Related Documents**: Web visualizer designs (local.visualizer-requirements.md, local.data-model-yaml-parsing.md, local.table-tree-views.md, local.search-filtering.md, local.milestone-task-detail-views.md), clarification-1-tui-visualizer-requirements.md
