import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone, Task, Status } from '../lib/types.js';
import { StatusBadge } from './StatusBadge.js';

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

export function TaskTree({ milestones, tasks, filterMatch, active, onSelectTask }: TaskTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Default: expand in-progress milestones
    const set = new Set<string>();
    for (const m of milestones) {
      if (m.status === 'in_progress') set.add(m.id);
    }
    return set;
  });
  const [cursorIdx, setCursorIdx] = useState(0);

  // Build flat list of visible items
  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];
    for (const m of milestones) {
      const milestoneTasks = (tasks[m.id] || []).filter((t) => filterMatch(t.status));
      // Hide milestone if all tasks filtered out and milestone itself doesn't match
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

        if (item.type === 'milestone') {
          const m = item.milestone;
          const icon = expanded.has(m.id) ? '▼' : '►';
          const taskCount = (tasks[m.id] || []).filter((t) => filterMatch(t.status)).length;

          return (
            <Box key={m.id} gap={1}>
              <Text bold={isSelected} inverse={isSelected}>
                {icon} {m.name}
              </Text>
              <StatusBadge status={m.status} compact />
              <Text dimColor>[{m.progress}%]</Text>
              <Text dimColor>({taskCount} tasks)</Text>
            </Box>
          );
        }

        // Task item
        const t = item.task!;
        return (
          <Box key={t.id} gap={1} marginLeft={4}>
            <Text bold={isSelected} inverse={isSelected}>
              <StatusBadge status={t.status} compact /> {t.name}
            </Text>
            {t.estimated_hours && <Text dimColor>{t.estimated_hours}h</Text>}
          </Box>
        );
      })}
    </Box>
  );
}
