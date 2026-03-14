import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone, Task, Status } from '../lib/types.js';

interface TaskTreeProps {
  milestones: Milestone[];
  tasks: Record<string, Task[]>;
  filterMatch: (status: Status) => boolean;
  active: boolean;
  onSelectTask?: (task: Task) => void;
}

interface FlatItem {
  type: 'milestone' | 'task';
  milestone: Milestone;
  task?: Task;
}

const STATUS_DOTS: Record<Status, { dot: string; color: string }> = {
  completed: { dot: '✓', color: 'green' },
  in_progress: { dot: '●', color: 'cyan' },
  not_started: { dot: '○', color: 'gray' },
};

export function TaskTree({ milestones, tasks, filterMatch, active, onSelectTask }: TaskTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const m of milestones) {
      if (m.status === 'in_progress') set.add(m.id);
    }
    return set;
  });
  const [cursorIdx, setCursorIdx] = useState(0);

  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];
    for (const m of milestones) {
      const milestoneTasks = (tasks[m.id] || []).filter((t) => filterMatch(t.status));
      if (milestoneTasks.length === 0 && !filterMatch(m.status)) continue;

      items.push({ type: 'milestone', milestone: m });
      if (expanded.has(m.id)) {
        for (const t of milestoneTasks) {
          items.push({ type: 'task', milestone: m, task: t });
        }
      }
    }
    return items;
  }, [milestones, tasks, filterMatch, expanded]);

  useInput((input, key) => {
    if (!active) return;

    if (input === 'j' || key.downArrow) {
      setCursorIdx((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setCursorIdx((i) => Math.max(i - 1, 0));
    } else if (key.return || input === ' ') {
      const item = flatItems[cursorIdx];
      if (!item) return;
      if (item.type === 'milestone') {
        setExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(item.milestone.id)) {
            next.delete(item.milestone.id);
          } else {
            next.add(item.milestone.id);
          }
          return next;
        });
      } else if (item.task && onSelectTask) {
        onSelectTask(item.task);
      }
    }
  });

  if (flatItems.length === 0) {
    return <Text dimColor>No items match current filter.</Text>;
  }

  return (
    <Box flexDirection="column">
      {flatItems.map((item, i) => {
        const isSelected = i === cursorIdx && active;
        const selColor = isSelected ? 'cyan' : undefined;

        if (item.type === 'milestone') {
          const m = item.milestone;
          const icon = expanded.has(m.id) ? '▼' : '►';
          const taskCount = (tasks[m.id] || []).filter((t) => filterMatch(t.status)).length;
          const { dot, color } = STATUS_DOTS[m.status];

          return (
            <Box key={m.id}>
              <Text color={selColor} bold={isSelected}>
                {isSelected ? '> ' : '  '}
                {icon} {m.name}
              </Text>
              <Text> </Text>
              <Text color={isSelected ? 'cyan' : color}>{dot}</Text>
              <Text dimColor={!isSelected} color={selColor}> [{m.progress}%] ({taskCount} tasks)</Text>
            </Box>
          );
        }

        const t = item.task!;
        const { dot, color } = STATUS_DOTS[t.status];
        return (
          <Box key={t.id}>
            <Text color={selColor} bold={isSelected}>
              {isSelected ? '>     ' : '      '}
              <Text color={isSelected ? 'cyan' : color}>{dot}</Text>
              {' '}{t.name}
            </Text>
            {t.estimated_hours && <Text dimColor={!isSelected} color={selColor}> {t.estimated_hours}h</Text>}
          </Box>
        );
      })}
    </Box>
  );
}
