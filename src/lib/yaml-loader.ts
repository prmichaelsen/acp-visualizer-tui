import yaml from 'js-yaml';
import type {
  ProgressData,
  ProjectMetadata,
  Milestone,
  Task,
  WorkEntry,
  DocumentationStats,
  ProgressSummary,
  Status,
  ExtraFields,
} from './types.js';

const TASK_ALIASES: Record<string, string> = {
  est_hours: 'estimated_hours',
  hours: 'estimated_hours',
  estimate: 'estimated_hours',
  completed: 'completed_date',
  done_date: 'completed_date',
  filename: 'file',
  path: 'file',
};

function extractKnown(
  obj: Record<string, unknown> | null | undefined,
  knownKeys: string[],
): { known: Record<string, unknown>; extra: ExtraFields } {
  if (!obj || typeof obj !== 'object') return { known: {}, extra: {} };
  const known: Record<string, unknown> = {};
  const extra: ExtraFields = {};
  for (const [key, value] of Object.entries(obj)) {
    const resolved = TASK_ALIASES[key] ?? key;
    if (knownKeys.includes(resolved)) {
      known[resolved] = value;
    } else {
      extra[key] = value;
    }
  }
  return { known, extra };
}

export function normalizeStatus(value: unknown): Status {
  const s = String(value || 'not_started')
    .toLowerCase()
    .replace(/[\s-]/g, '_');
  if (s === 'completed' || s === 'done' || s === 'complete') return 'completed';
  if (s === 'in_progress' || s === 'active' || s === 'wip') return 'in_progress';
  return 'not_started';
}

function normalizeStringArray(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

function safeString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProject(raw: unknown): ProjectMetadata {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { known, extra } = extractKnown(obj, [
    'name', 'version', 'started', 'status', 'current_milestone', 'description',
  ]);
  return {
    name: safeString(known.name, 'Unknown Project'),
    version: safeString(known.version, '0.0.0'),
    started: safeString(known.started),
    status: normalizeStatus(known.status),
    current_milestone: known.current_milestone ? safeString(known.current_milestone) : undefined,
    description: safeString(known.description),
    extra,
  };
}

function normalizeMilestone(raw: unknown): Milestone {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { known, extra } = extractKnown(obj, [
    'id', 'name', 'status', 'progress', 'started', 'completed',
    'estimated_weeks', 'tasks_completed', 'tasks_total', 'notes',
  ]);
  return {
    id: safeString(known.id),
    name: safeString(known.name),
    status: normalizeStatus(known.status),
    progress: safeNumber(known.progress),
    started: known.started ? safeString(known.started) : null,
    completed: known.completed ? safeString(known.completed) : null,
    estimated_weeks: safeString(known.estimated_weeks),
    tasks_completed: safeNumber(known.tasks_completed),
    tasks_total: safeNumber(known.tasks_total),
    notes: safeString(known.notes),
    extra,
  };
}

function normalizeMilestones(raw: unknown): Milestone[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeMilestone);
}

function normalizeTask(raw: unknown, milestoneId: string): Task {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { known, extra } = extractKnown(obj, [
    'id', 'name', 'status', 'file', 'estimated_hours', 'completed_date', 'notes',
  ]);
  return {
    id: safeString(known.id),
    name: safeString(known.name),
    status: normalizeStatus(known.status),
    milestone_id: milestoneId,
    file: safeString(known.file),
    estimated_hours: safeString(known.estimated_hours),
    completed_date: known.completed_date ? safeString(known.completed_date) : null,
    notes: safeString(known.notes),
    extra,
  };
}

function normalizeTasks(raw: unknown): Record<string, Task[]> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, Task[]> = {};
  for (const [milestoneId, tasks] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(tasks)) {
      result[milestoneId] = tasks.map((t) => normalizeTask(t, milestoneId));
    }
  }
  return result;
}

function normalizeWorkEntry(raw: unknown): WorkEntry {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { known, extra } = extractKnown(obj, ['date', 'description', 'items']);
  return {
    date: safeString(known.date),
    description: safeString(known.description),
    items: normalizeStringArray(known.items),
    extra,
  };
}

function normalizeWorkEntries(raw: unknown): WorkEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWorkEntry);
}

function normalizeDocStats(raw: unknown): DocumentationStats {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    design_documents: safeNumber(obj?.design_documents),
    milestone_documents: safeNumber(obj?.milestone_documents),
    pattern_documents: safeNumber(obj?.pattern_documents),
    task_documents: safeNumber(obj?.task_documents),
  };
}

function normalizeProgress(raw: unknown): ProgressSummary {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    planning: safeNumber(obj?.planning),
    implementation: safeNumber(obj?.implementation),
    overall: safeNumber(obj?.overall),
  };
}

export function parseProgressYaml(raw: string): ProgressData {
  try {
    const doc = yaml.load(raw) as Record<string, unknown> | null;
    if (!doc || typeof doc !== 'object') {
      return emptyProgressData();
    }

    const milestones = normalizeMilestones(doc.milestones);
    const tasks = normalizeTasks(doc.tasks);

    // Compute milestone progress from tasks if not explicitly set
    for (const milestone of milestones) {
      const milestoneTasks = tasks[milestone.id];
      if (milestoneTasks && milestoneTasks.length > 0) {
        const completed = milestoneTasks.filter((t) => t.status === 'completed').length;
        const total = milestoneTasks.length;
        if (milestone.tasks_total === 0) milestone.tasks_total = total;
        if (milestone.tasks_completed === 0) milestone.tasks_completed = completed;
        if (milestone.progress === 0 && total > 0) {
          milestone.progress = Math.round((completed / total) * 100);
        }
      }
    }

    return {
      project: normalizeProject(doc.project),
      milestones,
      tasks,
      recent_work: normalizeWorkEntries(doc.recent_work),
      next_steps: normalizeStringArray(doc.next_steps),
      notes: normalizeStringArray(doc.notes),
      current_blockers: normalizeStringArray(doc.current_blockers),
      documentation: normalizeDocStats(doc.documentation),
      progress: normalizeProgress(doc.progress),
    };
  } catch {
    return emptyProgressData();
  }
}

function emptyProgressData(): ProgressData {
  return {
    project: {
      name: 'Unknown',
      version: '0.0.0',
      started: '',
      status: 'not_started',
      description: '',
      extra: {},
    },
    milestones: [],
    tasks: {},
    recent_work: [],
    next_steps: [],
    notes: [],
    current_blockers: [],
    documentation: { design_documents: 0, milestone_documents: 0, pattern_documents: 0, task_documents: 0 },
    progress: { planning: 0, implementation: 0, overall: 0 },
  };
}
