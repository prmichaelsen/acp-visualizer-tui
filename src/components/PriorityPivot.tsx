import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { buildPriorityData } from '../lib/chart-utils.js';
import { ProgressBar } from './ProgressBar.js';

interface PriorityPivotProps {
  data: ProgressData;
  active: boolean;
  onSelectTask?: (task: import('../lib/types.js').Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'red',
  P1: 'yellow',
  P2: 'cyan',
  P3: 'gray',
  UNSET: 'gray',
};

export function PriorityPivot({ data, active, onSelectTask }: PriorityPivotProps) {
  const buckets = useMemo(() => buildPriorityData(data), [data]);
  const [selectedBucket, setSelectedBucket] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [taskIdx, setTaskIdx] = useState(0);

  // Build flat list for navigation
  const flatItems = useMemo(() => {
    const items: { type: 'bucket' | 'task'; bucketIdx: number; taskIdx?: number }[] = [];
    for (let bi = 0; bi < buckets.length; bi++) {
      items.push({ type: 'bucket', bucketIdx: bi });
      if (expanded.has(buckets[bi].priority)) {
        for (let ti = 0; ti < buckets[bi].tasks.length; ti++) {
          items.push({ type: 'task', bucketIdx: bi, taskIdx: ti });
        }
      }
    }
    return items;
  }, [buckets, expanded]);

  const [cursorIdx, setCursorIdx] = useState(0);

  useInput((input, key) => {
    if (!active) return;

    if (input === 'j' || key.downArrow) {
      setCursorIdx((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setCursorIdx((i) => Math.max(i - 1, 0));
    } else if (key.return || input === ' ') {
      const item = flatItems[cursorIdx];
      if (!item) return;
      if (item.type === 'bucket') {
        const priority = buckets[item.bucketIdx].priority;
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(priority)) next.delete(priority);
          else next.add(priority);
          return next;
        });
      } else if (item.type === 'task' && onSelectTask) {
        const bucket = buckets[item.bucketIdx];
        onSelectTask(bucket.tasks[item.taskIdx!].task);
      }
    }
  });

  if (buckets.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Priority Pivot</Text>
        <Text dimColor>No tasks found.</Text>
      </Box>
    );
  }

  const allTaskCount = buckets.reduce((s, b) => s + b.tasks.length, 0);
  const hasPriorities = !buckets.every((b) => b.priority === 'UNSET');

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Priority Pivot</Text>
        <Text dimColor>
          Tasks grouped by priority ({allTaskCount} total)
          {!hasPriorities && ' — add priority: P0/P1/P2/P3 to tasks in progress.yaml'}
        </Text>
        <Text />

        {/* Header */}
        <Box>
          <Text dimColor>{'  '}</Text>
          <Box width={12}><Text bold dimColor>Priority</Text></Box>
          <Box width={8}><Text bold dimColor>Tasks</Text></Box>
          <Box width={8}><Text bold dimColor>Hours</Text></Box>
          <Box width={24}><Text bold dimColor>Status</Text></Box>
          <Box width={20}><Text bold dimColor>Progress</Text></Box>
        </Box>
        <Text dimColor>{'─'.repeat(75)}</Text>

        {/* Rows */}
        {flatItems.map((item, i) => {
          const isSelected = i === cursorIdx && active;

          if (item.type === 'bucket') {
            const bucket = buckets[item.bucketIdx];
            const total = bucket.tasks.length;
            const pct = total > 0 ? Math.round((bucket.completed / total) * 100) : 0;
            const color = PRIORITY_COLORS[bucket.priority] || 'white';
            const isExpanded = expanded.has(bucket.priority);

            return (
              <Box key={bucket.priority}>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {isSelected ? '> ' : '  '}
                </Text>
                <Box width={12}>
                  <Text color={isSelected ? 'cyan' : color} bold>
                    {isExpanded ? '▼' : '►'} {bucket.priority}
                  </Text>
                </Box>
                <Box width={8}>
                  <Text color={isSelected ? 'cyan' : undefined}>{total}</Text>
                </Box>
                <Box width={8}>
                  <Text color={isSelected ? 'cyan' : undefined}>{bucket.totalHours}h</Text>
                </Box>
                <Box width={24}>
                  <Text color="green">{bucket.completed}✓</Text>
                  <Text> </Text>
                  <Text color="cyan">{bucket.inProgress}●</Text>
                  <Text> </Text>
                  <Text dimColor>{bucket.notStarted}○</Text>
                </Box>
                <Box width={20}>
                  <ProgressBar percent={pct} width={12} />
                </Box>
              </Box>
            );
          }

          // Task row
          const bucket = buckets[item.bucketIdx];
          const { task, milestone } = bucket.tasks[item.taskIdx!];
          const statusDot = task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '●' : '○';
          const dotColor = task.status === 'completed' ? 'green' : task.status === 'in_progress' ? 'cyan' : 'gray';

          return (
            <Box key={task.id}>
              <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                {isSelected ? '>     ' : '      '}
              </Text>
              <Text color={isSelected ? 'cyan' : dotColor}>{statusDot}</Text>
              <Text color={isSelected ? 'cyan' : undefined}>
                {' '}{task.name.length > 35 ? task.name.slice(0, 34) + '…' : task.name}
              </Text>
              <Text dimColor={!isSelected} color={isSelected ? 'cyan' : undefined}>
                {' '}{task.estimated_hours ? `${task.estimated_hours}h` : ''}
                {' '}<Text dimColor>({milestone.length > 15 ? milestone.slice(0, 14) + '…' : milestone})</Text>
              </Text>
            </Box>
          );
        })}

        <Text />
        <Box gap={2}>
          <Text color="red" bold>P0</Text>
          <Text color="yellow" bold>P1</Text>
          <Text color="cyan" bold>P2</Text>
          <Text dimColor bold>P3</Text>
        </Box>
        <Text dimColor>Enter/Space to expand, Enter on task to open detail</Text>
      </Box>
    </Box>
  );
}
