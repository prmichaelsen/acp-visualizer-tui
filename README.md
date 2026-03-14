# acp-visualizer-tui

Terminal-based interactive visualizer for ACP progress.yaml data.

> Built with [Agent Context Protocol](https://github.com/prmichaelsen/agent-context-protocol)

## Quick Start

```bash
npx acp-visualizer-tui
```

Or with a specific path:

```bash
npx acp-visualizer-tui ./path/to/progress.yaml
```

## Usage

```
$ acp-visualizer-tui [path] [options]

Arguments:
  path    Path to progress.yaml (default: ./agent/progress.yaml)

Options:
  -w, --watch       Watch mode: auto-refresh on file changes
  -v, --view        Initial view: dashboard|milestones|tasks|activity|blockers
  --json            Output parsed data as JSON (non-interactive)
  --no-color        Disable colors (for piping)
  -h, --help        Show help
  -V, --version     Show version
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Switch between views |
| `j` / `k` or `↑` / `↓` | Navigate within list/table |
| `Enter` / `Space` | Expand/collapse tree node |
| `s` | Cycle sort column (milestone table) |
| `f` | Cycle status filter (All → In Progress → Completed → Not Started) |
| `r` | Manual refresh |
| `q` | Quit |
| `?` | Show help |

## Views

- **Dashboard** — Project overview with progress bars, milestone summary, next steps
- **Milestones** — Sortable table with status badges, progress %, task counts
- **Tasks** — Expandable tree: milestones → tasks with status indicators
- **Activity** — Recent work timeline with dates and bullet items
- **Blockers** — Current blockers and next steps

## Features

- Interactive full-screen TUI with keyboard navigation
- Watch mode (`-w`) auto-refreshes when progress.yaml changes
- Status filtering across all views
- `--json` for machine-readable output (great for scripting)
- `--no-color` for piping to files
- Rich 256-color support with graceful 16-color fallback

## Development

```bash
npm install
npm run build     # Build CLI to dist/
npm run dev       # Build with watch
npm run test      # Run tests
npm run typecheck # TypeScript check
```

## License

MIT

## Author

Patrick Michaelsen
