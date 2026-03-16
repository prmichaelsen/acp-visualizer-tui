import { describe, it, expect } from 'vitest';
import { buildBurndownData, buildEstimateData, buildGanttData, buildGraphData, buildPriorityData, parseDate, daysBetween, formatShortDate } from '../src/lib/chart-utils.js';
import type { ProgressData, Milestone, Task } from '../src/lib/types.js';

function makeData(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    project: { name: 'test', version: '1.0', started: '2026-03-01', status: 'in_progress', description: '', extra: {} },
    milestones: [
      { id: 'm1', name: 'M1', status: 'completed', progress: 100, started: '2026-03-01', completed: '2026-03-05', estimated_weeks: '1', tasks_completed: 2, tasks_total: 2, notes: '', extra: {} },
      { id: 'm2', name: 'M2', status: 'in_progress', progress: 50, started: '2026-03-06', completed: null, estimated_weeks: '2', tasks_completed: 1, tasks_total: 2, notes: '', extra: {} },
    ],
    tasks: {
      m1: [
        { id: 't1', name: 'Task 1', status: 'completed', milestone_id: 'm1', file: '', estimated_hours: '3', completed_date: '2026-03-03', notes: '', extra: {} },
        { id: 't2', name: 'Task 2', status: 'completed', milestone_id: 'm1', file: '', estimated_hours: '2', completed_date: '2026-03-05', notes: '', extra: {} },
      ],
      m2: [
        { id: 't3', name: 'Task 3', status: 'completed', milestone_id: 'm2', file: '', estimated_hours: '4', completed_date: '2026-03-08', notes: '', extra: {} },
        { id: 't4', name: 'Task 4', status: 'not_started', milestone_id: 'm2', file: '', estimated_hours: '3', completed_date: null, notes: '', extra: {} },
      ],
    },
    recent_work: [],
    next_steps: [],
    notes: [],
    current_blockers: [],
    documentation: { design_documents: 0, milestone_documents: 0, pattern_documents: 0, task_documents: 0 },
    progress: { planning: 100, implementation: 50, overall: 60 },
    ...overrides,
  };
}

describe('buildBurndownData', () => {
  it('builds cumulative completion data', () => {
    const points = buildBurndownData(makeData());
    expect(points.length).toBeGreaterThanOrEqual(3);
    expect(points[0].completed).toBe(0);
    expect(points[0].remaining).toBe(4);
    // Last point should have 3 completed
    const last = points[points.length - 1];
    expect(last.completed).toBe(3);
    expect(last.remaining).toBe(1);
  });

  it('returns single point when no tasks completed', () => {
    const data = makeData({
      tasks: {
        m1: [
          { id: 't1', name: 'Task 1', status: 'not_started', milestone_id: 'm1', file: '', estimated_hours: '3', completed_date: null, notes: '', extra: {} },
        ],
      },
    });
    const points = buildBurndownData(data);
    expect(points.length).toBe(1);
    expect(points[0].completed).toBe(0);
  });

  it('returns empty for no tasks', () => {
    const data = makeData({ tasks: {} });
    expect(buildBurndownData(data)).toEqual([]);
  });
});

describe('buildEstimateData', () => {
  it('calculates estimated hours from tasks', () => {
    const result = buildEstimateData(makeData());
    expect(result[0].name).toBe('M1');
    expect(result[0].estimated).toBe(5); // 3 + 2
  });

  it('calculates actual hours from milestone dates', () => {
    const result = buildEstimateData(makeData());
    expect(result[0].actual).not.toBeNull();
    expect(result[0].actual!).toBeGreaterThan(0);
  });

  it('returns null actual when no completed date', () => {
    const result = buildEstimateData(makeData());
    expect(result[1].actual).toBeNull(); // M2 has no completed date
  });
});

describe('buildGanttData', () => {
  it('creates bars for milestones with dates', () => {
    const { bars } = buildGanttData(makeData().milestones);
    expect(bars.length).toBe(2);
    expect(bars[0].name).toBe('M1');
  });

  it('skips milestones without start dates', () => {
    const milestones: Milestone[] = [
      { id: 'm1', name: 'M1', status: 'not_started', progress: 0, started: null, completed: null, estimated_weeks: '1', tasks_completed: 0, tasks_total: 1, notes: '', extra: {} },
    ];
    const { bars } = buildGanttData(milestones);
    expect(bars.length).toBe(0);
  });
});

describe('buildGraphData', () => {
  it('creates nodes for all tasks', () => {
    const { nodes } = buildGraphData(makeData());
    expect(nodes.length).toBe(4);
  });

  it('creates sequential edges within milestones', () => {
    const { edges } = buildGraphData(makeData());
    expect(edges.some((e) => e.from === 't1' && e.to === 't2')).toBe(true);
    expect(edges.some((e) => e.from === 't3' && e.to === 't4')).toBe(true);
  });

  it('creates cross-milestone edges', () => {
    const { edges } = buildGraphData(makeData());
    expect(edges.some((e) => e.from === 't2' && e.to === 't3')).toBe(true);
  });
});

describe('buildPriorityData', () => {
  it('groups tasks into Unset bucket when no priority set', () => {
    const buckets = buildPriorityData(makeData());
    expect(buckets.length).toBe(1);
    expect(buckets[0].priority).toBe('UNSET');
    expect(buckets[0].tasks.length).toBe(4);
  });

  it('groups tasks by priority from extra fields', () => {
    const data = makeData();
    data.tasks.m1[0].extra = { priority: 'P0' };
    data.tasks.m1[1].extra = { priority: 'P1' };
    data.tasks.m2[0].extra = { priority: 'P0' };
    const buckets = buildPriorityData(data);
    const p0 = buckets.find((b) => b.priority === 'P0');
    expect(p0).toBeDefined();
    expect(p0!.tasks.length).toBe(2);
  });

  it('normalizes numeric priority to P-prefix', () => {
    const data = makeData();
    data.tasks.m1[0].extra = { priority: '0' };
    const buckets = buildPriorityData(data);
    expect(buckets.some((b) => b.priority === 'P0')).toBe(true);
  });

  it('sorts P0 before P1 before Unset', () => {
    const data = makeData();
    data.tasks.m1[0].extra = { priority: 'P1' };
    data.tasks.m2[0].extra = { priority: 'P0' };
    const buckets = buildPriorityData(data);
    expect(buckets[0].priority).toBe('P0');
    expect(buckets[1].priority).toBe('P1');
    expect(buckets[buckets.length - 1].priority).toBe('UNSET');
  });
});

describe('date utilities', () => {
  it('parseDate handles valid dates', () => {
    expect(parseDate('2026-03-14')).toBeInstanceOf(Date);
  });

  it('parseDate returns null for invalid', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });

  it('daysBetween calculates correctly', () => {
    const a = new Date('2026-03-01');
    const b = new Date('2026-03-11');
    expect(daysBetween(a, b)).toBe(10);
  });

  it('formatShortDate formats correctly', () => {
    const d = new Date('2026-03-14');
    expect(formatShortDate(d)).toBe('Mar 14');
  });
});
