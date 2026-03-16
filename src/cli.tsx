import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import fs from 'node:fs';
import path from 'node:path';
import { parseProgressYaml } from './lib/yaml-loader.js';
import App from './app.js';

const cli = meow(`
  Usage
    $ acp-visualizer-tui [path]

  Arguments
    path    Path to progress.yaml (default: ./agent/progress.yaml)

  Options
    -w, --watch       Watch mode: auto-refresh on file changes
    -v, --view        Initial view: dashboard|milestones|tasks|activity|blockers
    --json            Output parsed data as JSON (non-interactive)
    --no-color        Disable colors
    -h, --help        Show help
    -V, --version     Show version
`, {
  importMeta: import.meta,
  flags: {
    watch: { type: 'boolean', shortFlag: 'w', default: false },
    view: { type: 'string', shortFlag: 'v', default: 'dashboard' },
    json: { type: 'boolean', default: false },
  },
});

const filePath = cli.input[0] || './agent/progress.yaml';
const resolvedPath = path.resolve(filePath);

// Verify file exists before proceeding
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: File not found: ${resolvedPath}`);
  console.error(`\nMake sure progress.yaml exists at the specified path.`);
  console.error(`Default path: ./agent/progress.yaml`);
  process.exit(1);
}

// JSON mode: parse and output, then exit
if (cli.flags.json) {
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const result = parseProgressYaml(raw);
    if (result.warnings.length > 0) {
      for (const w of result.warnings) {
        console.error(`Warning: ${w}`);
      }
      console.error('');
    }
    console.log(JSON.stringify(result.data, null, 2));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error reading file: ${msg}`);
    process.exit(1);
  }
  process.exit(0);
}

// Clear terminal for full-screen rendering
process.stdout.write('\x1B[2J\x1B[H');

// Interactive mode: let App handle loading via useProgressData hook
render(
  <App
    filePath={resolvedPath}
    watch={cli.flags.watch}
    initialView={cli.flags.view}
  />
);
