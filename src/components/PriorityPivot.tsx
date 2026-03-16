import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProgressData, Task, Status } from '../lib/types.js';
import { StatusBadge } from './StatusBadge.js';

interface PriorityPivotProps {
  data: ProgressData;
  active: boolean;
  onSelectTask?: (task: Task) => void;
}

type SortKey = 'priority' | 'name' | 'status' | 'milestone' | 'hours';

const SORT_KEYS: SortKey[] = ['priority', 'name', 'status', 'milestone', 'hours'];

const STATUS_ORDER: Record<Status, number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'red',
  P1: 'yellow',
  P2: 'cyan',
  P3: 'gray',
};

const PRIORITY_ORDER: Record<string, number> = {
  P0: 0, P1: 1, P2: 2, P3: 3,
};

interface TaskRow {
  task: Task;
  priority: string;
  milestone: string;
  hours: number;
}

function getPriority(task: Task): string {
  const raw = task.extra.priority ?? task.extra.P ?? task.extra.p ?? task.extra.Priority ?? 'Unset';
  const p = String(raw).toUpperCase();
  return /^\d$/.test(p) ? `P${p}` : p;
}

function sortRows(rows: TaskRow[], key: SortKey, asc: boolean): TaskRow[] {
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'priority': {
        const aOrd = PRIORITY_ORDER[a.priority] ?? 99;
        const bOrd = PRIORITY_ORDER[b.priority] ?? 99;
        cmp = aOrd - bOrd;
        break;
      }
      case 'name': cmp = a.task.name.localeCompare(b.task.name); break;
      case 'status': cmp = STATUS_ORDER[a.task.status] - STATUS_ORDER[b.task.status]; break;
      case 'milestone': cmp = a.milestone.localeCompare(b.milestone); break;
      case 'hours': cmp = a.hours - b.hours; break;
    }
    return asc ? cmp : -cmp;
  });
}

export function PriorityPivot({ data, active, onSelectTask }: PriorityPivotProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortAsc, setSortAsc] = useState(true);

  const allRows = useMemo(() => {
    const rows: TaskRow[] = [];
    for (const m of data.milestones) {
      const tasks = data.tasks[m.id] || [];
      for (const t of tasks) {
        rows.push({
          task: t,
          priority: getPriority(t),
          milestone: m.name,
          hours: parseFloat(t.estimated_hours) || 0,
        });
      }
    }
    return rows;
  }, [data]);

  const sorted = useMemo(() => sortRows(allRows, sortKey, sortAsc), [allRows, sortKey, sortAsc]);

  useInput((input, key) => {
    if (!active) return;

    if (input === 'j' || key.downArrow) {
      setSelectedIdx((i) => Math.min(i + 1, sorted.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (input === 's') {
      setSortKey((prev) => {
        const idx = SORT_KEYS.indexOf(prev);
        return SORT_KEYS[(idx + 1) % SORT_KEYS.length];
      });
    } else if (key.return && sorted[selectedIdx] && onSelectTask) {
      onSelectTask(sorted[selectedIdx].task);
    }
  });

  if (sorted.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold> Priority Table</Text>
        <Text dimColor>No tasks found.</Text>
      </Box>
    );
  }

  const hasPriorities = allRows.some((r) => r.priority !== 'UNSET');

  return (
    <Box flexDirection="column">
      {!hasPriorities && (
        <Text dimColor>  Tip: add priority: P0/P1/P2/P3 to tasks in progress.yaml</Text>
      )}
      {/* Header row */}
      <Box>
        <Text dimColor>{'  '}</Text>
        <Box width={8}><Text bold dimColor>{colLabel('priority', sortKey)} Pri</Text></Box>
        <Box width={32}><Text bold dimColor>{colLabel('name', sortKey)} Task</Text></Box>
        <Box width={14}><Text bold dimColor>{colLabel('status', sortKey)} Status</Text></Box>
        <Box width={20}><Text bold dimColor>{colLabel('milestone', sortKey)} Milestone</Text></Box>
        <Box width={6}><Text bold dimColor>{colLabel('hours', sortKey)} Hrs</Text></Box>
      </Box>

      {/* Separator */}
      <Text dimColor>{'─'.repeat(82)}</Text>

      {/* Data rows */}
      {sorted.map((row, i) => {
        const isSelected = i === selectedIdx && active;
        const priColor = PRIORITY_COLORS[row.priority] || 'gray';

        return (
          <Box key={`${row.task.id}-${i}`}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '> ' : '  '}
            </Text>
            <Box width={8}>
              <Text bold color={isSelected ? 'cyan' : priColor}>
                {row.priority}
              </Text>
            </Box>
            <Box width={32}>
              <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {truncate(row.task.name, 30)}
              </Text>
            </Box>
            <Box width={14}>
              {isSelected ? (
                <Text color="cyan">{statusText(row.task.status)}</Text>
              ) : (
                <StatusBadge status={row.task.status} />
              )}
            </Box>
            <Box width={20}>
              <Text dimColor={!isSelected} color={isSelected ? 'cyan' : undefined}>
                {truncate(row.milestone, 18)}
              </Text>
            </Box>
            <Box width={6}>
              <Text dimColor={!isSelected} color={isSelected ? 'cyan' : undefined}>
                {row.hours > 0 ? `${row.hours}h` : '—'}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function statusText(status: Status): string {
  switch (status) {
    case 'completed': return '✓ Completed';
    case 'in_progress': return '● In Progress';
    case 'not_started': return '○ Not Started';
  }
}

function colLabel(col: SortKey, active: SortKey): string {
  return col === active ? '▼' : ' ';
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
