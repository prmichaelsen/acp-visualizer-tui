# acp-visualizer-tui

Terminal-based interactive visualizer for ACP progress.yaml data.

> Built with [Agent Context Protocol](https://github.com/prmichaelsen/agent-context-protocol)

## Quick Start

```bash
npx acp-visualizer-tui [path-to-progress.yaml]
```

## Features

- Interactive full-screen TUI with keyboard navigation
- Overview dashboard with progress bars
- Milestone table with sortable columns
- Task tree with expandable hierarchy
- Recent work / activity log
- Blockers & next steps summary
- Watch mode with auto-refresh on file changes
- Rich color support with graceful fallback

## Development

This project uses the Agent Context Protocol for development:

- `@acp.init` - Initialize agent context
- `@acp.plan` - Plan milestones and tasks
- `@acp.proceed` - Continue with next task
- `@acp.status` - Check project status

See [AGENT.md](./AGENT.md) for complete ACP documentation.

## Project Structure

```
acp-visualizer-tui/
├── AGENT.md              # ACP methodology
├── agent/                # ACP directory
│   ├── design/          # Design documents
│   ├── milestones/      # Project milestones
│   ├── tasks/           # Task breakdown
│   ├── patterns/        # Architectural patterns
│   └── progress.yaml    # Progress tracking
└── src/                 # Source code
```

## License

MIT

## Author

Patrick Michaelsen
