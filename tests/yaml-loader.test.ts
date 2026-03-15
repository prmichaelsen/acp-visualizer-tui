import { describe, it, expect } from 'vitest';
import { parseProgressYaml, normalizeStatus } from '../src/lib/yaml-loader.js';
import fs from 'node:fs';
import path from 'node:path';

describe('normalizeStatus', () => {
  it('maps canonical values', () => {
    expect(normalizeStatus('completed')).toBe('completed');
    expect(normalizeStatus('in_progress')).toBe('in_progress');
    expect(normalizeStatus('not_started')).toBe('not_started');
  });

  it('maps common aliases', () => {
    expect(normalizeStatus('done')).toBe('completed');
    expect(normalizeStatus('complete')).toBe('completed');
    expect(normalizeStatus('active')).toBe('in_progress');
    expect(normalizeStatus('wip')).toBe('in_progress');
    expect(normalizeStatus('in-progress')).toBe('in_progress');
    expect(normalizeStatus('in progress')).toBe('in_progress');
  });

  it('defaults to not_started for unknown', () => {
    expect(normalizeStatus('unknown')).toBe('not_started');
    expect(normalizeStatus('')).toBe('not_started');
    expect(normalizeStatus(null)).toBe('not_started');
    expect(normalizeStatus(undefined)).toBe('not_started');
  });
});

describe('parseProgressYaml', () => {
  it('parses a complete progress.yaml', () => {
    const yaml = `
project:
  name: test-project
  version: 1.0.0
  started: 2026-01-01
  status: in_progress
  description: A test project

milestones:
  - id: milestone_1
    name: First Milestone
    status: completed
    progress: 100
    estimated_weeks: "1"
    tasks_completed: 2
    tasks_total: 2

tasks:
  milestone_1:
    - id: task_1
      name: First Task
      status: completed
      file: agent/tasks/task-1.md
      estimated_hours: "2"
    - id: task_2
      name: Second Task
      status: completed
      file: agent/tasks/task-2.md
      estimated_hours: "3"

recent_work:
  - date: "2026-01-01"
    description: Did stuff
    items:
      - item 1
      - item 2

next_steps:
  - Step 1
  - Step 2

notes:
  - A note

current_blockers: []
`;
    const data = parseProgressYaml(yaml);

    expect(data.project.name).toBe('test-project');
    expect(data.project.version).toBe('1.0.0');
    expect(data.project.status).toBe('in_progress');
    expect(data.milestones).toHaveLength(1);
    expect(data.milestones[0].name).toBe('First Milestone');
    expect(data.milestones[0].status).toBe('completed');
    expect(data.tasks.milestone_1).toHaveLength(2);
    expect(data.tasks.milestone_1[0].name).toBe('First Task');
    expect(data.tasks.milestone_1[0].milestone_id).toBe('milestone_1');
    expect(data.recent_work).toHaveLength(1);
    expect(data.recent_work[0].items).toHaveLength(2);
    expect(data.next_steps).toEqual(['Step 1', 'Step 2']);
    expect(data.notes).toEqual(['A note']);
    expect(data.current_blockers).toEqual([]);
  });

  it('handles missing sections gracefully', () => {
    const yaml = `
project:
  name: minimal
`;
    const data = parseProgressYaml(yaml);

    expect(data.project.name).toBe('minimal');
    expect(data.milestones).toEqual([]);
    expect(data.tasks).toEqual({});
    expect(data.recent_work).toEqual([]);
    expect(data.next_steps).toEqual([]);
    expect(data.notes).toEqual([]);
    expect(data.current_blockers).toEqual([]);
  });

  it('normalizes status variants', () => {
    const yaml = `
project:
  name: test
  status: active

milestones:
  - id: m1
    name: M1
    status: done
  - id: m2
    name: M2
    status: wip

tasks:
  m1:
    - id: t1
      name: T1
      status: complete
`;
    const data = parseProgressYaml(yaml);

    expect(data.project.status).toBe('in_progress');
    expect(data.milestones[0].status).toBe('completed');
    expect(data.milestones[1].status).toBe('in_progress');
    expect(data.tasks.m1[0].status).toBe('completed');
  });

  it('resolves key aliases', () => {
    const yaml = `
project:
  name: test

tasks:
  m1:
    - id: t1
      name: T1
      status: not_started
      est_hours: "5"
      done_date: "2026-01-01"
      filename: agent/tasks/t1.md
`;
    const data = parseProgressYaml(yaml);
    const task = data.tasks.m1[0];

    expect(task.estimated_hours).toBe('5');
    expect(task.completed_date).toBe('2026-01-01');
    expect(task.file).toBe('agent/tasks/t1.md');
  });

  it('preserves unknown fields in extra', () => {
    const yaml = `
project:
  name: test
  custom_field: hello
  priority: high

milestones:
  - id: m1
    name: M1
    status: not_started
    custom_metric: 42

tasks:
  m1:
    - id: t1
      name: T1
      status: not_started
      assignee: agent-1
`;
    const data = parseProgressYaml(yaml);

    expect(data.project.extra.custom_field).toBe('hello');
    expect(data.project.extra.priority).toBe('high');
    expect(data.milestones[0].extra.custom_metric).toBe(42);
    expect(data.tasks.m1[0].extra.assignee).toBe('agent-1');
  });

  it('handles string-for-array coercion', () => {
    const yaml = `
project:
  name: test

notes: "single note"
next_steps: "single step"
current_blockers: "single blocker"
`;
    const data = parseProgressYaml(yaml);

    expect(data.notes).toEqual(['single note']);
    expect(data.next_steps).toEqual(['single step']);
    expect(data.current_blockers).toEqual(['single blocker']);
  });

  it('handles completely empty input', () => {
    const data = parseProgressYaml('');

    expect(data.project.name).toBe('Unknown');
    expect(data.milestones).toEqual([]);
    expect(data.tasks).toEqual({});
  });

  it('handles invalid YAML', () => {
    const data = parseProgressYaml('{{{{not yaml at all');

    expect(data.project.name).toBe('Unknown');
    expect(data.milestones).toEqual([]);
  });

  it('computes milestone progress from tasks', () => {
    const yaml = `
project:
  name: test

milestones:
  - id: m1
    name: M1
    status: in_progress
    progress: 0
    tasks_completed: 0
    tasks_total: 0

tasks:
  m1:
    - id: t1
      name: T1
      status: completed
    - id: t2
      name: T2
      status: completed
    - id: t3
      name: T3
      status: not_started
`;
    const data = parseProgressYaml(yaml);

    expect(data.milestones[0].tasks_completed).toBe(2);
    expect(data.milestones[0].tasks_total).toBe(3);
    expect(data.milestones[0].progress).toBe(67);
  });

  it('reconciles mismatched task keys to milestone IDs by number', () => {
    const yaml = `
project:
  name: test

milestones:
  - id: M1
    name: First
    status: in_progress
  - id: M2
    name: Second
    status: not_started

tasks:
  milestone_1:
    - id: t1
      name: Task One
      status: completed
    - id: t2
      name: Task Two
      status: not_started
  milestone_2:
    - id: t3
      name: Task Three
      status: not_started
`;
    const data = parseProgressYaml(yaml);

    // Tasks should be re-keyed to M1/M2
    expect(data.tasks.M1).toHaveLength(2);
    expect(data.tasks.M2).toHaveLength(1);
    expect(data.tasks.M1[0].milestone_id).toBe('M1');
    expect(data.tasks.M1[0].name).toBe('Task One');
    expect(data.tasks.M2[0].milestone_id).toBe('M2');
    // Old keys should not exist
    expect(data.tasks.milestone_1).toBeUndefined();
    expect(data.tasks.milestone_2).toBeUndefined();
  });

  it('reconciles mixed exact and mismatched task keys', () => {
    const yaml = `
project:
  name: test

milestones:
  - id: m1
    name: First
    status: completed
  - id: M2
    name: Second
    status: not_started

tasks:
  m1:
    - id: t1
      name: Exact Match
      status: completed
  milestone_2:
    - id: t2
      name: Numeric Match
      status: not_started
`;
    const data = parseProgressYaml(yaml);

    expect(data.tasks.m1).toHaveLength(1);
    expect(data.tasks.m1[0].milestone_id).toBe('m1');
    expect(data.tasks.M2).toHaveLength(1);
    expect(data.tasks.M2[0].milestone_id).toBe('M2');
  });

  it('leaves already-matching task keys unchanged', () => {
    const yaml = `
project:
  name: test

milestones:
  - id: milestone_1
    name: First
    status: completed

tasks:
  milestone_1:
    - id: t1
      name: Already Matches
      status: completed
`;
    const data = parseProgressYaml(yaml);

    expect(data.tasks.milestone_1).toHaveLength(1);
    expect(data.tasks.milestone_1[0].milestone_id).toBe('milestone_1');
  });

  it('computes progress after reconciling mismatched keys', () => {
    const yaml = `
project:
  name: test

milestones:
  - id: M1
    name: First
    status: in_progress
    progress: 0
    tasks_completed: 0
    tasks_total: 0

tasks:
  milestone_1:
    - id: t1
      name: Done
      status: completed
    - id: t2
      name: Not Done
      status: not_started
`;
    const data = parseProgressYaml(yaml);

    expect(data.tasks.M1).toHaveLength(2);
    expect(data.milestones[0].tasks_completed).toBe(1);
    expect(data.milestones[0].tasks_total).toBe(2);
    expect(data.milestones[0].progress).toBe(50);
  });

  it('parses real progress.yaml from this project', () => {
    const filePath = path.resolve('agent/progress.yaml');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = parseProgressYaml(raw);

    expect(data.project.name).toBe('acp-visualizer-tui');
    expect(data.milestones.length).toBeGreaterThanOrEqual(3);
    expect(Object.keys(data.tasks).length).toBeGreaterThanOrEqual(3);
    expect(data.recent_work.length).toBeGreaterThan(0);
  });
});
