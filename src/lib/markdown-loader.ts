import fs from 'node:fs';
import path from 'node:path';
import type { Task } from './types.js';

export type MarkdownResult =
  | { content: string; filePath: string }
  | { error: string };

/**
 * Derive project base path from progress.yaml path.
 * e.g., /home/user/project/agent/progress.yaml → /home/user/project/
 */
export function getBasePath(progressYamlPath: string): string {
  // Strip agent/progress.yaml to get project root
  const dir = path.dirname(progressYamlPath);
  if (path.basename(dir) === 'agent') {
    return path.dirname(dir);
  }
  return dir;
}

/**
 * Load a markdown file from the filesystem.
 */
export function loadMarkdownFile(basePath: string, relativePath: string): MarkdownResult {
  const fullPath = path.resolve(basePath, relativePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { content, filePath: relativePath };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ENOENT')) {
      return { error: `No document found at ${relativePath}` };
    }
    if (msg.includes('EACCES')) {
      return { error: `Cannot read ${relativePath}: permission denied` };
    }
    return { error: `Error reading ${relativePath}: ${msg}` };
  }
}

/**
 * Resolve milestone file by scanning agent/milestones/ for matching filename.
 * milestone_1 → look for milestone-1-*.md (excluding templates)
 */
export function resolveMilestoneFile(basePath: string, milestoneId: string): string | null {
  // Extract number: milestone_1 → 1, milestone_12 → 12
  const match = milestoneId.match(/(\d+)/);
  if (!match) return null;
  const num = match[1];

  const milestonesDir = path.join(basePath, 'agent', 'milestones');
  try {
    const files = fs.readdirSync(milestonesDir);
    const pattern = `milestone-${num}-`;
    const found = files.find(
      (f) => f.startsWith(pattern) && f.endsWith('.md') && !f.includes('template'),
    );
    return found ? path.join('agent', 'milestones', found) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve task file by looking up task.file in the tasks map.
 */
export function resolveTaskFile(
  tasks: Record<string, Task[]>,
  taskId: string,
): string | null {
  for (const milestoneTasks of Object.values(tasks)) {
    const task = milestoneTasks.find((t) => t.id === taskId);
    if (task?.file) return task.file;
  }
  return null;
}
