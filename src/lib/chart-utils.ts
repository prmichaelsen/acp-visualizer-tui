import type { ProgressData, Milestone, Task } from './types.js';

// ─── Burndown Chart ─────────────────────────────────────────────────────────

export interface BurndownPoint {
  date: string;
  completed: number;
  total: number;
  remaining: number;
}

export function buildBurndownData(data: ProgressData): BurndownPoint[] {
  const allTasks: Task[] = [];
  for (const tasks of Object.values(data.tasks)) {
    allTasks.push(...tasks);
  }

  const total = allTasks.length;
  if (total === 0) return [];

  // Collect completion dates
  const completionDates: string[] = [];
  for (const task of allTasks) {
    if (task.completed_date && task.status === 'completed') {
      completionDates.push(task.completed_date.slice(0, 10));
    }
  }

  if (completionDates.length === 0) {
    // No completed tasks — show single point at start
    const startDate = data.project.started || new Date().toISOString().slice(0, 10);
    return [{ date: startDate, completed: 0, total, remaining: total }];
  }

  // Sort unique dates
  const uniqueDates = [...new Set(completionDates)].sort();

  // Add project start date as first point if earlier than first completion
  const startDate = data.project.started?.slice(0, 10);
  if (startDate && startDate < uniqueDates[0]) {
    uniqueDates.unshift(startDate);
  }

  // Build cumulative points
  const points: BurndownPoint[] = [];
  let cumulative = 0;

  for (const date of uniqueDates) {
    const completedOnDate = completionDates.filter((d) => d === date).length;
    // Start date has 0 completions if it's before any completion
    if (date === startDate && completedOnDate === 0) {
      points.push({ date, completed: 0, total, remaining: total });
      continue;
    }
    cumulative += completedOnDate;
    points.push({ date, completed: cumulative, total, remaining: total - cumulative });
  }

  return points;
}

// ─── Estimate vs Actual ─────────────────────────────────────────────────────

export interface EstimateDataPoint {
  name: string;
  estimated: number;
  actual: number | null;
  status: string;
}

export function buildEstimateData(data: ProgressData): EstimateDataPoint[] {
  return data.milestones.map((m) => {
    const tasks = data.tasks[m.id] || [];
    const estimated = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
    let actual: number | null = null;

    if (m.started && m.completed) {
      const start = new Date(m.started);
      const end = new Date(m.completed);
      const days = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      actual = Math.round(days * 6 * 10) / 10; // 6 productive hours/day
    }

    return {
      name: m.name.length > 25 ? m.name.slice(0, 24) + '…' : m.name,
      estimated,
      actual,
      status: m.status,
    };
  });
}

// ─── Date Utilities ─────────────────────────────────────────────────────────

export function parseDate(str: string): Date | null {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

export function formatShortDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

// ─── Gantt Data ─────────────────────────────────────────────────────────────

export interface GanttBar {
  id: string;
  name: string;
  status: string;
  progress: number;
  startPct: number;
  widthPct: number;
  startDate: Date;
  endDate: Date;
}

export function buildGanttData(milestones: Milestone[]): { bars: GanttBar[]; minDate: Date; maxDate: Date; totalDays: number } {
  const withDates = milestones
    .map((m) => {
      const start = m.started ? parseDate(m.started) : null;
      if (!start) return null;

      let end: Date;
      if (m.completed) {
        end = parseDate(m.completed) || new Date();
      } else if (m.status === 'in_progress') {
        end = new Date();
      } else {
        const weeks = parseFloat(m.estimated_weeks) || 2;
        end = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
      }

      return { milestone: m, start, end };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (withDates.length === 0) {
    const now = new Date();
    return { bars: [], minDate: now, maxDate: now, totalDays: 1 };
  }

  const allStarts = withDates.map((x) => x.start.getTime());
  const allEnds = withDates.map((x) => x.end.getTime());
  const minDate = new Date(Math.min(...allStarts));
  const maxDate = new Date(Math.max(...allEnds));
  const totalDays = Math.max(1, daysBetween(minDate, maxDate));

  const bars: GanttBar[] = withDates.map(({ milestone: m, start, end }) => {
    const startPct = (daysBetween(minDate, start) / totalDays) * 100;
    const widthPct = Math.max(1, (daysBetween(start, end) / totalDays) * 100);
    return {
      id: m.id,
      name: m.name.length > 22 ? m.name.slice(0, 21) + '…' : m.name,
      status: m.status,
      progress: m.progress,
      startPct,
      widthPct,
      startDate: start,
      endDate: end,
    };
  });

  return { bars, minDate, maxDate, totalDays };
}

// ─── Dependency Graph ───────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  status: string;
  milestone: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

// ─── Flame Chart ────────────────────────────────────────────────────────────

export interface FlameRow {
  label: string;
  width: number;    // proportional width (0-1) relative to total
  offset: number;   // proportional left offset (0-1)
  hours: number;
  status: string;
  depth: number;    // 0 = milestone row, 1 = task row
  id: string;
  milestone: string;
}

export function buildFlameData(data: ProgressData): { rows: FlameRow[]; totalHours: number } {
  const milestoneHours: { milestone: Milestone; hours: number; tasks: { task: Task; hours: number }[] }[] = [];
  let totalHours = 0;

  for (const m of data.milestones) {
    const tasks = data.tasks[m.id] || [];
    const taskEntries = tasks.map((t) => ({
      task: t,
      hours: parseFloat(t.estimated_hours) || 1,
    }));
    const milestoneTotal = taskEntries.reduce((s, e) => s + e.hours, 0);
    milestoneHours.push({ milestone: m, hours: milestoneTotal, tasks: taskEntries });
    totalHours += milestoneTotal;
  }

  if (totalHours === 0) return { rows: [], totalHours: 0 };

  const rows: FlameRow[] = [];
  let milestoneOffset = 0;

  for (const { milestone, hours, tasks } of milestoneHours) {
    const milestoneWidth = hours / totalHours;

    // Milestone bar (depth 0) — spans the full width of its tasks
    rows.push({
      label: milestone.name.length > 25 ? milestone.name.slice(0, 24) + '…' : milestone.name,
      width: milestoneWidth,
      offset: milestoneOffset,
      hours,
      status: milestone.status,
      depth: 0,
      id: milestone.id,
      milestone: milestone.name,
    });

    // Task bars (depth 1) — stacked within milestone width
    let taskOffset = milestoneOffset;
    for (const { task, hours: taskHours } of tasks) {
      const taskWidth = taskHours / totalHours;
      rows.push({
        label: task.name.length > 18 ? task.name.slice(0, 17) + '…' : task.name,
        width: taskWidth,
        offset: taskOffset,
        hours: taskHours,
        status: task.status,
        depth: 1,
        id: task.id,
        milestone: milestone.name,
      });
      taskOffset += taskWidth;
    }

    milestoneOffset += milestoneWidth;
  }

  return { rows, totalHours };
}

// ─── Priority Pivot ─────────────────────────────────────────────────────────

export interface PriorityBucket {
  priority: string;
  tasks: { task: Task; milestone: string }[];
  totalHours: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}

export function buildPriorityData(data: ProgressData): PriorityBucket[] {
  const buckets = new Map<string, PriorityBucket>();

  for (const milestone of data.milestones) {
    const tasks = data.tasks[milestone.id] || [];
    for (const task of tasks) {
      // Look for priority in extra fields: priority, P, p, Priority
      const raw = task.extra.priority ?? task.extra.P ?? task.extra.p ?? task.extra.Priority ?? 'Unset';
      const priority = String(raw).toUpperCase();
      // Normalize: "P0" stays "P0", "0" becomes "P0", "high" stays "HIGH"
      const normalized = /^\d$/.test(priority) ? `P${priority}` : priority;

      if (!buckets.has(normalized)) {
        buckets.set(normalized, {
          priority: normalized,
          tasks: [],
          totalHours: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
        });
      }

      const bucket = buckets.get(normalized)!;
      bucket.tasks.push({ task, milestone: milestone.name });
      bucket.totalHours += parseFloat(task.estimated_hours) || 0;
      if (task.status === 'completed') bucket.completed++;
      else if (task.status === 'in_progress') bucket.inProgress++;
      else bucket.notStarted++;
    }
  }

  // Sort: P0 first, then P1, P2, etc., then alphabetical, Unset last
  return [...buckets.values()].sort((a, b) => {
    if (a.priority === 'UNSET') return 1;
    if (b.priority === 'UNSET') return -1;
    const aNum = a.priority.match(/^P(\d+)$/)?.[1];
    const bNum = b.priority.match(/^P(\d+)$/)?.[1];
    if (aNum !== undefined && bNum !== undefined) return parseInt(aNum) - parseInt(bNum);
    if (aNum !== undefined) return -1;
    if (bNum !== undefined) return 1;
    return a.priority.localeCompare(b.priority);
  });
}

export function buildGraphData(data: ProgressData): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const milestoneLastTask: Record<string, string> = {};
  const milestoneFirstTask: Record<string, string> = {};

  for (const milestone of data.milestones) {
    const tasks = data.tasks[milestone.id] || [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      nodes.push({
        id: task.id,
        label: task.name.length > 20 ? task.name.slice(0, 19) + '…' : task.name,
        status: task.status,
        milestone: milestone.name,
        x: 0, y: 0, width: 24, height: 3,
      });

      if (i === 0) milestoneFirstTask[milestone.id] = task.id;
      if (i === tasks.length - 1) milestoneLastTask[milestone.id] = task.id;

      // Sequential edge within milestone
      if (i > 0) {
        edges.push({ from: tasks[i - 1].id, to: task.id });
      }
    }
  }

  // Cross-milestone edges
  for (let i = 1; i < data.milestones.length; i++) {
    const prevId = data.milestones[i - 1].id;
    const currId = data.milestones[i].id;
    const lastTask = milestoneLastTask[prevId];
    const firstTask = milestoneFirstTask[currId];
    if (lastTask && firstTask) {
      edges.push({ from: lastTask, to: firstTask });
    }
  }

  return { nodes, edges };
}
