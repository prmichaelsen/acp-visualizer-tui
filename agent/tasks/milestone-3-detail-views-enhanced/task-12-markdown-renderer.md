# Task 12: Terminal Markdown Renderer

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Markdown Rendering in Terminal](../../design/local.tui-requirements.md)
**Estimated Time**: 3 hours
**Dependencies**: Task 11 (markdown loader exists)
**Status**: Not Started

---

## Objective

Create a component that renders markdown content in the terminal with proper formatting for headers, code blocks, lists, tables, bold/italic, and links.

---

## Context

The web visualizer uses react-markdown + rehype-highlight. For the terminal, we need `marked` + `marked-terminal` (or equivalent). Task/milestone documents contain headings, bullet lists, code blocks (bash, TypeScript, YAML), tables, and inline formatting.

---

## Steps

### 1. Install Dependencies

- `marked` — markdown parser
- `marked-terminal` — terminal renderer for marked
- Evaluate alternatives if quality is insufficient: `cli-markdown`, custom renderer

### 2. Create MarkdownRenderer Component (`src/components/MarkdownRenderer.tsx`)

- Accept `content: string` prop
- Parse with marked, render with marked-terminal
- Wrap in Ink `<Text>` component
- Configure marked-terminal options:
  - Code block styling (bordered, dimmed background)
  - Header styling (bold, colored by level)
  - List indentation
  - Table rendering (ASCII borders)
  - Link display (URL in parentheses)

### 3. Handle Scrolling

- Markdown content may exceed terminal height
- Implement scroll offset with j/k navigation when in detail view
- Track scroll position, render visible portion

### 4. Color Integration

- Use project color tokens from `colors.ts`
- Headers: bold white
- Code: dim/gray background
- Links: blue/cyan
- Respect `--no-color` flag

### 5. Test with Real Documents

- Render this project's milestone and task documents
- Verify code blocks, headers, lists, tables look good
- Check edge cases: empty content, very long lines, nested lists

---

## Verification

- [ ] Headers render bold with level distinction
- [ ] Code blocks render with visual boundary
- [ ] Bullet and numbered lists indent correctly
- [ ] Tables render with ASCII borders
- [ ] Bold/italic use ANSI formatting
- [ ] Links show URL
- [ ] Scrolling works for long content
- [ ] `--no-color` renders plain text
- [ ] Real milestone/task documents render correctly

---

**Next Task**: [Task 13: Milestone Detail View](task-13-milestone-detail-view.md)
**Notes**: This is the key technical risk in M3. If marked-terminal quality is poor, evaluate alternatives early.
