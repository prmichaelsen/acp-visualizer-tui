# Task 15: Activity Log & Blockers Views

**Milestone**: [M3 - Detail Views & Enhanced Features](../../milestones/milestone-3-detail-views-enhanced.md)
**Design Reference**: [TUI Requirements - Views](../../design/local.tui-requirements.md)
**Estimated Time**: 2 hours
**Dependencies**: Task 5 (app shell, view routing)
**Status**: Not Started

---

## Objective

Build the activity log view (recent_work entries) and blockers/next steps view. These are the remaining Tab-navigable views from the design.

---

## Steps

### 1. Create ActivityLog Component (`src/components/ActivityLog.tsx`)

Layout:
```
┌─ Recent Work ─────────────────────────────┐
│                                            │
│ 2026-03-14 — Project created               │
│   • Initialized ACP project                │
│   • Completed clarification-1              │
│   • Created project scaffold               │
│                                            │
│ 2026-03-13 — Design work                   │
│   • Created TUI requirements design doc    │
│   • Reviewed web visualizer designs        │
│                                            │
└────────────────────────────────────────────┘
```

- Render `recent_work` entries from ProgressData
- Date bold, description as subheader
- Bullet items indented
- Scrollable with j/k
- Most recent at top

### 2. Create BlockersNextSteps Component (`src/components/BlockersNextSteps.tsx`)

Layout:
```
┌─ Current Blockers ────────────────────────┐
│ (none)                                     │
└────────────────────────────────────────────┘

┌─ Next Steps ──────────────────────────────┐
│ 1. Complete task-5: App Shell & Layout     │
│ 2. Build milestone table view              │
│ 3. Implement keyboard navigation           │
└────────────────────────────────────────────┘
```

- Blockers: red color, or "(none)" if empty
- Next steps: numbered list
- Both sections scrollable

### 3. Register in View Routing

- Add 'activity' and 'blockers' to view cycle
- Tab order: dashboard → milestones → tasks → activity → blockers
- Update header tabs and help bar

---

## Verification

- [ ] Activity log renders recent_work entries
- [ ] Entries ordered most recent first
- [ ] Bullet items indented under each entry
- [ ] Blockers shown in red (or "(none)" if empty)
- [ ] Next steps rendered as numbered list
- [ ] Both views accessible via Tab
- [ ] j/k scrolls within views
- [ ] Empty data handled gracefully

---

**Next Task**: [Task 16: Fuzzy Search](task-16-fuzzy-search.md)
