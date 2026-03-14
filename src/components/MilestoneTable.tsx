import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone, Status } from '../lib/types.js';
import { StatusBadge } from './StatusBadge.js';

interface MilestoneTableProps {
  milestones: Milestone[];
  filterMatch: (status: Status) => boolean;
  active: boolean;
  onSelect?: (milestone: Milestone) => void;
}

type SortKey = 'name' | 'status' | 'progress' | 'tasks' | 'started' | 'estimated_weeks';

const SORT_KEYS: SortKey[] = ['name', 'status', 'progress', 'tasks', 'started', 'estimated_weeks'];

const STATUS_ORDER: Record<Status, number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
};

function sortMilestones(milestones: Milestone[], key: SortKey, asc: boolean): Milestone[] {
  return [...milestones].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'status': cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break;
      case 'progress': cmp = a.progress - b.progress; break;
      case 'tasks': cmp = a.tasks_completed - b.tasks_completed; break;
      case 'started': cmp = (a.started || '').localeCompare(b.started || ''); break;
      case 'estimated_weeks': cmp = parseFloat(a.estimated_weeks || '0') - parseFloat(b.estimated_weeks || '0'); break;
    }
    return asc ? cmp : -cmp;
  });
}

export function MilestoneTable({ milestones, filterMatch, active, onSelect }: MilestoneTableProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = milestones.filter((m) => filterMatch(m.status));
  const sorted = sortMilestones(filtered, sortKey, sortAsc);

  useInput((input, key) => {
    if (!active) return;

    if (input === 'j' || key.downArrow) {
      setSelectedIdx((i) => Math.min(i + 1, sorted.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (input === 's') {
      setSortKey((prev) => {
        const idx = SORT_KEYS.indexOf(prev);
        const next = SORT_KEYS[(idx + 1) % SORT_KEYS.length];
        if (next === prev) setSortAsc((a) => !a);
        return next;
      });
    } else if (key.return && sorted[selectedIdx] && onSelect) {
      onSelect(sorted[selectedIdx]);
    }
  });

  if (sorted.length === 0) {
    return <Text dimColor>No milestones match current filter.</Text>;
  }

  return (
    <Box flexDirection="column">
      {/* Header row */}
      <Box>
        <Text dimColor>{'  '}</Text>
        <Box width={32}><Text bold dimColor>{colLabel('name', sortKey)} Name</Text></Box>
        <Box width={14}><Text bold dimColor>{colLabel('status', sortKey)} Status</Text></Box>
        <Box width={8}><Text bold dimColor>{colLabel('progress', sortKey)} Prog</Text></Box>
        <Box width={8}><Text bold dimColor>{colLabel('tasks', sortKey)} Tasks</Text></Box>
        <Box width={12}><Text bold dimColor>{colLabel('started', sortKey)} Started</Text></Box>
        <Box width={6}><Text bold dimColor>{colLabel('estimated_weeks', sortKey)} Est</Text></Box>
      </Box>

      {/* Separator */}
      <Text dimColor>{'─'.repeat(80)}</Text>

      {/* Data rows */}
      {sorted.map((m, i) => {
        const isSelected = i === selectedIdx && active;
        return (
          <Box key={m.id}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {isSelected ? '> ' : '  '}
            </Text>
            <Box width={32}>
              <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {truncate(m.name, 30)}
              </Text>
            </Box>
            <Box width={14}>
              {isSelected ? <Text color="cyan">{statusText(m.status)}</Text> : <StatusBadge status={m.status} />}
            </Box>
            <Box width={8}>
              <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{m.progress}%</Text>
            </Box>
            <Box width={8}>
              <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{m.tasks_completed}/{m.tasks_total}</Text>
            </Box>
            <Box width={12}>
              <Text dimColor={!isSelected} color={isSelected ? 'cyan' : undefined}>
                {m.started ? shortDate(m.started) : '—'}
              </Text>
            </Box>
            <Box width={6}>
              <Text dimColor={!isSelected} color={isSelected ? 'cyan' : undefined}>{m.estimated_weeks}w</Text>
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

function shortDate(d: string): string {
  try {
    const date = new Date(d);
    return date.toISOString().slice(0, 10);
  } catch {
    return d.slice(0, 10);
  }
}
