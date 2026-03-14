import { describe, it, expect } from 'vitest';
import path from 'node:path';
import {
  getBasePath,
  loadMarkdownFile,
  resolveMilestoneFile,
  resolveTaskFile,
} from '../src/lib/markdown-loader.js';

const PROJECT_ROOT = path.resolve('.');

describe('getBasePath', () => {
  it('strips agent/progress.yaml to get project root', () => {
    expect(getBasePath('/home/user/project/agent/progress.yaml'))
      .toBe('/home/user/project');
  });

  it('handles non-agent parent directory', () => {
    expect(getBasePath('/home/user/progress.yaml'))
      .toBe('/home/user');
  });
});

describe('resolveMilestoneFile', () => {
  it('finds milestone file by scanning directory', () => {
    const result = resolveMilestoneFile(PROJECT_ROOT, 'milestone_1');
    expect(result).toBe('agent/milestones/milestone-1-scaffold-data-pipeline.md');
  });

  it('finds milestone 2', () => {
    const result = resolveMilestoneFile(PROJECT_ROOT, 'milestone_2');
    expect(result).toBe('agent/milestones/milestone-2-dashboard-views-interaction.md');
  });

  it('excludes template files', () => {
    // milestone-1-{title}.template.md should not match
    const result = resolveMilestoneFile(PROJECT_ROOT, 'milestone_1');
    expect(result).not.toContain('template');
  });

  it('returns null for non-existent milestone', () => {
    const result = resolveMilestoneFile(PROJECT_ROOT, 'milestone_99');
    expect(result).toBeNull();
  });

  it('returns null for invalid milestone id', () => {
    const result = resolveMilestoneFile(PROJECT_ROOT, 'invalid');
    expect(result).toBeNull();
  });
});

describe('resolveTaskFile', () => {
  const tasks = {
    milestone_1: [
      { id: 'task_1', name: 'T1', status: 'completed' as const, milestone_id: 'milestone_1', file: 'agent/tasks/m1/task-1.md', estimated_hours: '2', completed_date: null, notes: '', extra: {} },
      { id: 'task_2', name: 'T2', status: 'completed' as const, milestone_id: 'milestone_1', file: 'agent/tasks/m1/task-2.md', estimated_hours: '3', completed_date: null, notes: '', extra: {} },
    ],
    milestone_2: [
      { id: 'task_3', name: 'T3', status: 'not_started' as const, milestone_id: 'milestone_2', file: 'agent/tasks/m2/task-3.md', estimated_hours: '4', completed_date: null, notes: '', extra: {} },
    ],
  };

  it('finds task file in first milestone', () => {
    expect(resolveTaskFile(tasks, 'task_1')).toBe('agent/tasks/m1/task-1.md');
  });

  it('finds task file in second milestone', () => {
    expect(resolveTaskFile(tasks, 'task_3')).toBe('agent/tasks/m2/task-3.md');
  });

  it('returns null for non-existent task', () => {
    expect(resolveTaskFile(tasks, 'task_99')).toBeNull();
  });
});

describe('loadMarkdownFile', () => {
  it('reads an existing markdown file', () => {
    const result = loadMarkdownFile(PROJECT_ROOT, 'agent/milestones/milestone-1-scaffold-data-pipeline.md');
    expect('content' in result).toBe(true);
    if ('content' in result) {
      expect(result.content).toContain('Milestone 1');
      expect(result.filePath).toBe('agent/milestones/milestone-1-scaffold-data-pipeline.md');
    }
  });

  it('returns error for non-existent file', () => {
    const result = loadMarkdownFile(PROJECT_ROOT, 'nonexistent.md');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('No document found');
    }
  });
});
