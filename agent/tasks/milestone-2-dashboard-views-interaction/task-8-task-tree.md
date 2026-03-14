# Task 8: Task Tree

**Milestone**: [M2 - Dashboard Views & Interaction](../../milestones/milestone-2-dashboard-views-interaction.md)
**Design Reference**: [TUI Requirements - Task Tree](../../design/local.tui-requirements.md)
**Estimated Time**: 4 hours
**Dependencies**: Task 6 (StatusBadge exists)
**Status**: Not Started

---

## Objective

Build an expandable tree view showing milestones as parent nodes with tasks as children. Navigate with j/k, expand/collapse with Enter/Space.

---

## Steps

### 1. Create TaskTree Component (`src/components/TaskTree.tsx`)

Tree structure:
```
▼ M1 - Project Scaffold & Data Pipeline    ● Completed   [████] 100%
    ✓ Task 1: Initialize Project            ● Completed   2h
    ✓ Task 2: Data Model & YAML Parsing     ● Completed   3h
    ✓ Task 3: CLI Entry Point               ● Completed   2h
    ✓ Task 4: Watch Mode                    ● Completed   2h
▼ M2 - Dashboard Views & Interaction       ● In Progress  [██░░] 33%
    ✓ Task 5: App Shell & Layout            ● Completed   3h
    ● Task 6: Dashboard View                ● In Progress  3h
    ○ Task 7: Milestone Table               ○ Not Started  4h
    ○ Task 8: Task Tree                     ○ Not Started  4h
► M3 - Detail Views & Enhanced             ○ Not Started  [░░░░] 0%
```

### 2. Implement Expand/Collapse

- ▼ = expanded, ► = collapsed
- Enter/Space toggles expand state
- Track expanded state per milestone
- Default: current milestone expanded, others collapsed

### 3. Implement Tree Navigation

- j/k moves cursor through visible items (milestones + expanded tasks)
- Skip collapsed children
- Track flat index for cursor position

### 4. Task Row Display

- Status dot (✓/●/○) with color
- Task name
- Status badge
- Estimated hours
- Notes preview (truncated, if space)

### 5. Integrate Filter

- Filter applies to tasks within milestones
- Milestone hidden if all its tasks filtered out
- Show task count after filter: `(2/5 shown)`

---

## Verification

- [ ] Tree renders milestones with correct task children
- [ ] Enter/Space toggles expand/collapse
- [ ] ▼/► indicator updates correctly
- [ ] j/k navigates through visible items
- [ ] Collapsed milestone children are hidden
- [ ] Status dots show correct color
- [ ] Filter hides tasks by status
- [ ] Empty tree (no data) shows message
- [ ] Scrolling works for long trees

---

**Next Task**: [Task 9: Keyboard Navigation & Filtering](task-9-keyboard-navigation-filtering.md)
