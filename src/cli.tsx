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

// Read and parse
function readFile(p: string): string {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ENOENT')) {
      console.error(`Error: File not found: ${p}`);
      console.error(`\nMake sure progress.yaml exists at the specified path.`);
      console.error(`Default path: ./agent/progress.yaml`);
    } else {
      console.error(`Error reading file: ${msg}`);
    }
    process.exit(1);
  }
}

const raw = readFile(resolvedPath);

const data = parseProgressYaml(raw);

// JSON mode
if (cli.flags.json) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

// Interactive mode
render(
  <App
    data={data}
    filePath={resolvedPath}
    watch={cli.flags.watch}
    initialView={cli.flags.view}
  />
);
