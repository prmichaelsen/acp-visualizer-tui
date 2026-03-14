# Task 1: Initialize Project & Dependencies

**Milestone**: [M1 - Project Scaffold & Data Pipeline](../../milestones/milestone-1-scaffold-data-pipeline.md)
**Design Reference**: [TUI Requirements](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: None
**Status**: Not Started

---

## Objective

Initialize the npm project with TypeScript, Ink (React for CLIs), and CLI tooling. Create the project skeleton with proper build configuration, bin entry for npx usage, and directory structure.

---

## Context

This is the first task — it creates the foundation everything else builds on. The project uses Ink v4+ with React 18, TypeScript with strict mode, and a bundler (tsup) for producing a CLI executable. The package must be publishable to npm with a `bin` entry so `npx acp-visualizer-tui` works.

---

## Steps

### 1. Initialize npm Project

```bash
npm init -y
```

Update package.json with proper metadata:
- name: `acp-visualizer-tui`
- version: `0.1.0`
- description: from design doc
- type: `module`
- bin: `{ "acp-visualizer-tui": "./dist/cli.js" }`
- scripts: build, dev, start, test, typecheck

### 2. Install Dependencies

**Runtime**:
- `ink` (React for CLIs)
- `react` (peer dep of Ink)
- `js-yaml` (YAML parsing)
- `meow` (CLI argument parsing — lightweight, ESM-native)

**Dev**:
- `typescript`
- `@types/react`
- `@types/js-yaml`
- `tsup` (bundler)
- `vitest` (testing)
- `ink-testing-library` (component tests)

### 3. Create TypeScript Configuration

tsconfig.json with:
- target: ES2022
- module: Node16 / moduleResolution: Node16
- jsx: react-jsx
- strict: true
- outDir: ./dist

### 4. Create Build Configuration

tsup.config.ts:
- Entry: src/cli.tsx
- Format: esm
- Target: node18
- Add shebang banner: `#!/usr/bin/env node`

### 5. Create Directory Structure

```
src/
├── cli.tsx           # CLI entry (placeholder)
├── app.tsx           # Root Ink component (placeholder)
├── components/       # (empty, for M2)
├── hooks/            # (empty, for later tasks)
├── lib/              # (empty, for task 2)
└── index.ts          # Package entry
tests/
└── .gitkeep
```

### 6. Create Placeholder Entry Files

- `src/cli.tsx`: Minimal meow setup + `render(<App />)`
- `src/app.tsx`: `<Text>acp-visualizer-tui</Text>` placeholder
- `src/index.ts`: Re-export app

### 7. Verify Build

```bash
npm run build
npm run typecheck
```

---

## Verification

- [ ] `npm install` succeeds
- [ ] `npm run build` produces `dist/cli.js` with shebang
- [ ] `npm run typecheck` passes
- [ ] `node dist/cli.js` renders placeholder text
- [ ] package.json has correct bin entry
- [ ] All directory structure created
- [ ] .gitignore includes node_modules/, dist/

---

## Expected Output

```
acp-visualizer-tui/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .gitignore
├── src/
│   ├── cli.tsx
│   ├── app.tsx
│   ├── index.ts
│   ├── components/
│   ├── hooks/
│   └── lib/
├── tests/
└── dist/           # (after build)
    └── cli.js
```

---

**Next Task**: [Task 2: Data Model & YAML Parsing](task-2-data-model-yaml-parsing.md)
**Related Design Docs**: [TUI Requirements - Architecture](../../design/local.tui-requirements.md)
