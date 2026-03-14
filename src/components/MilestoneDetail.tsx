import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone, Task, ProgressData } from '../lib/types.js';
import { getBasePath, resolveMilestoneFile, loadMarkdownFile } from '../lib/markdown-loader.js';
import { StatusBadge } from './StatusBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { Breadcrumb } from './Breadcrumb.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';

interface MilestoneDetailProps {
  milestone: Milestone;
  tasks: Task[];
  data: ProgressData;
  filePath: string;
  active: boolean;
  onBack: () => void;
  onSelectTask?: (task: Task) => void;
}

export function MilestoneDetail({
  milestone,
  tasks,
  filePath,
  active,
  onBack,
  onSelectTask,
}: MilestoneDetailProps) {
  const markdownResult = useMemo(() => {
    const basePath = getBasePath(filePath);
    const resolved = resolveMilestoneFile(basePath, milestone.id);
    if (!resolved) return { error: `No milestone document found for ${milestone.id}` };
    return loadMarkdownFile(basePath, resolved);
  }, [filePath, milestone.id]);

  const [scrollOffset, setScrollOffset] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [focusArea, setFocusArea] = useState<'content' | 'tasks'>('content');

  useInput((input, key) => {
    if (!active) return;
    if (key.escape || key.backspace || key.delete) {
      onBack();
    } else if (key.tab) {
      // Toggle focus between content scroll and task list
      setFocusArea((f) => f === 'content' ? 'tasks' : 'content');
    } else if (input === 'j' || key.downArrow) {
      if (focusArea === 'content') {
        setScrollOffset((s) => s + 3);
      } else {
        setTaskIdx((i) => Math.min(i + 1, tasks.length - 1));
      }
    } else if (input === 'k' || key.upArrow) {
      if (focusArea === 'content') {
        setScrollOffset((s) => Math.max(0, s - 3));
      } else {
        setTaskIdx((i) => Math.max(i - 1, 0));
      }
    } else if (key.return && focusArea === 'tasks' && tasks[taskIdx] && onSelectTask) {
      onSelectTask(tasks[taskIdx]);
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Breadcrumb items={[{ label: 'Milestones' }, { label: milestone.name }]} />

      {/* Metadata */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Box gap={2}>
          <StatusBadge status={milestone.status} />
          <ProgressBar percent={milestone.progress} width={15} />
        </Box>
        <Box gap={2}>
          <Text dimColor>Started: {milestone.started || '—'}</Text>
          <Text dimColor>Est: {milestone.estimated_weeks}w</Text>
          <Text dimColor>Tasks: {milestone.tasks_completed}/{milestone.tasks_total}</Text>
        </Box>
        {milestone.notes && <Text dimColor>{milestone.notes}</Text>}
      </Box>

      {/* Markdown */}
      {'content' in markdownResult ? (
        <Box borderStyle={focusArea === 'content' ? 'bold' : undefined}>
          <MarkdownRenderer content={markdownResult.content} scrollOffset={scrollOffset} />
        </Box>
      ) : (
        <Text dimColor>{'error' in markdownResult ? markdownResult.error : 'No content'}</Text>
      )}

      {/* Task list */}
      {tasks.length > 0 && (
        <Box flexDirection="column" borderStyle={focusArea === 'tasks' ? 'bold' : 'single'} paddingX={1}>
          <Text bold> Tasks</Text>
          {tasks.map((t, i) => {
            const isSel = i === taskIdx && focusArea === 'tasks';
            return (
              <Text key={t.id} bold={isSel} color={isSel ? 'cyan' : undefined}>
                {isSel ? '> ' : '  '}<StatusBadge status={t.status} compact /> {t.name}
              </Text>
            );
          })}
        </Box>
      )}

      <Text dimColor>
        Esc:Back  j/k:Scroll  Tab:{focusArea === 'content' ? 'Focus tasks' : 'Focus content'}  Enter:Open task
      </Text>
    </Box>
  );
}
