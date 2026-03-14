import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Task, Milestone, ProgressData } from '../lib/types.js';
import { getBasePath, loadMarkdownFile } from '../lib/markdown-loader.js';
import { StatusBadge } from './StatusBadge.js';
import { Breadcrumb } from './Breadcrumb.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';

interface TaskDetailProps {
  task: Task;
  milestone: Milestone;
  siblings: Task[];
  data: ProgressData;
  filePath: string;
  active: boolean;
  onBack: () => void;
  onNavigateSibling?: (task: Task) => void;
}

export function TaskDetail({
  task,
  milestone,
  siblings,
  filePath,
  active,
  onBack,
  onNavigateSibling,
}: TaskDetailProps) {
  const markdownResult = useMemo(() => {
    if (!task.file) return { error: `No file path for ${task.id}` };
    const basePath = getBasePath(filePath);
    return loadMarkdownFile(basePath, task.file);
  }, [filePath, task.file, task.id]);

  const [scrollOffset, setScrollOffset] = useState(0);

  const siblingIdx = siblings.findIndex((t) => t.id === task.id);
  const prevTask = siblingIdx > 0 ? siblings[siblingIdx - 1] : null;
  const nextTask = siblingIdx < siblings.length - 1 ? siblings[siblingIdx + 1] : null;

  useInput((input, key) => {
    if (!active) return;
    if (key.escape || key.backspace || key.delete) {
      onBack();
    } else if (input === 'j' || key.downArrow) {
      setScrollOffset((s) => s + 3);
    } else if (input === 'k' || key.upArrow) {
      setScrollOffset((s) => Math.max(0, s - 3));
    } else if (input === '[' && prevTask && onNavigateSibling) {
      setScrollOffset(0);
      onNavigateSibling(prevTask);
    } else if (input === ']' && nextTask && onNavigateSibling) {
      setScrollOffset(0);
      onNavigateSibling(nextTask);
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Breadcrumb
        items={[
          { label: 'Milestones' },
          { label: milestone.name },
          { label: task.name },
        ]}
      />

      {/* Metadata */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <StatusBadge status={task.status} />
        <Box gap={2}>
          {task.estimated_hours && <Text dimColor>Est: {task.estimated_hours}h</Text>}
          {task.completed_date && <Text dimColor>Completed: {task.completed_date}</Text>}
        </Box>
        <Text dimColor>Milestone: {milestone.name}</Text>
        {task.notes && <Text dimColor>{task.notes}</Text>}
      </Box>

      {/* Markdown */}
      {'content' in markdownResult ? (
        <MarkdownRenderer content={markdownResult.content} scrollOffset={scrollOffset} />
      ) : (
        <Text dimColor>{'error' in markdownResult ? markdownResult.error : 'No content'}</Text>
      )}

      {/* Sibling navigation */}
      <Box gap={2}>
        {prevTask ? (
          <Text dimColor>[: {prevTask.name}</Text>
        ) : (
          <Text dimColor>[: (first task)</Text>
        )}
        {nextTask ? (
          <Text dimColor>]: {nextTask.name}</Text>
        ) : (
          <Text dimColor>]: (last task)</Text>
        )}
      </Box>

      <Text dimColor>Esc:Back  j/k:Scroll  [/]:Prev/Next task</Text>
    </Box>
  );
}
