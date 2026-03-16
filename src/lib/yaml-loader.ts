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
  SchemaVersion,
} from './types.js';

export interface ParseResult {
  data: ProgressData;
  schemaVersion: SchemaVersion;
  warnings: string[];
}

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
  // Legacy schema: milestones is an array with id field
  if (Array.isArray(raw)) {
    return raw.map(normalizeMilestone);
  }
  // v6 schema: milestones is a map keyed by ID (e.g., M1: { name: ... })
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, unknown>).map(([key, value]) => {
      const milestone = normalizeMilestone(value);
      milestone.id = key; // ID comes from the map key, not a field
      return milestone;
    });
  }
  return [];
}

function detectSchemaVersion(doc: Record<string, unknown>): SchemaVersion {
  const milestones = doc.milestones;
  if (Array.isArray(milestones)) return 'legacy';
  if (milestones && typeof milestones === 'object') return 'v6';
  // If no milestones, check task keys for M1 vs milestone_1 pattern
  if (doc.tasks && typeof doc.tasks === 'object') {
    const keys = Object.keys(doc.tasks as Record<string, unknown>);
    if (keys.some((k) => /^M\d+$/.test(k))) return 'v6';
  }
  return 'legacy';
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

function extractNumber(key: string): number | null {
  const match = key.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function reconcileTaskKeys(
  tasks: Record<string, Task[]>,
  milestones: Milestone[],
): Record<string, Task[]> {
  const milestoneIds = new Set(milestones.map((m) => m.id));
  const taskKeys = Object.keys(tasks);

  // If all task keys already match milestone IDs, nothing to do
  if (taskKeys.every((k) => milestoneIds.has(k))) return tasks;

  // Build a number→milestoneId lookup from milestones
  const numToMilestoneId = new Map<number, string>();
  for (const m of milestones) {
    const n = extractNumber(m.id);
    if (n !== null) numToMilestoneId.set(n, m.id);
  }

  const reconciled: Record<string, Task[]> = {};
  const unmatchedKeys: string[] = [];

  for (const key of taskKeys) {
    if (milestoneIds.has(key)) {
      // Exact match — keep as-is
      reconciled[key] = tasks[key];
    } else {
      // Try numeric match
      const n = extractNumber(key);
      const resolvedId = n !== null ? numToMilestoneId.get(n) : undefined;
      if (resolvedId && !reconciled[resolvedId]) {
        // Re-key and update each task's milestone_id
        reconciled[resolvedId] = tasks[key].map((t) => ({ ...t, milestone_id: resolvedId }));
      } else {
        unmatchedKeys.push(key);
      }
    }
  }

  // Last resort: match remaining unmatched keys to unmatched milestones by position
  const reconciledIds = new Set(Object.keys(reconciled));
  const unmatchedMilestones = milestones.filter((m) => !reconciledIds.has(m.id));
  let positionalIdx = 0;
  for (const key of unmatchedKeys) {
    if (positionalIdx < unmatchedMilestones.length) {
      const mid = unmatchedMilestones[positionalIdx].id;
      reconciled[mid] = tasks[key].map((t) => ({ ...t, milestone_id: mid }));
      positionalIdx++;
    } else {
      // No milestone to map to — preserve under original key
      reconciled[key] = tasks[key];
    }
  }

  return reconciled;
}

export function parseProgressYaml(raw: string): ParseResult {
  try {
    const doc = yaml.load(raw) as Record<string, unknown> | null;
    if (!doc || typeof doc !== 'object') {
      return { data: emptyProgressData(), schemaVersion: 'legacy', warnings: [] };
    }

    const schemaVersion = detectSchemaVersion(doc);
    const warnings: string[] = [];

    if (schemaVersion === 'legacy') {
      warnings.push(
        'Detected legacy progress.yaml schema (array-style milestones).',
        'This format is deprecated and will not be supported starting December 2026.',
        'Migrate to v6 schema: milestones as a map keyed by ID (M1, M2, ...) instead of an array.',
        'See: https://github.com/prmichaelsen/agent-context-protocol for migration guide.',
      );
    }

    const milestones = normalizeMilestones(doc.milestones);
    const tasks = reconcileTaskKeys(normalizeTasks(doc.tasks), milestones);

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

    const data: ProgressData = {
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

    return { data, schemaVersion, warnings };
  } catch {
    return { data: emptyProgressData(), schemaVersion: 'legacy', warnings: [] };
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
