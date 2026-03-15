import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone, Task, Status } from '../lib/types.js';
import { ProgressBar } from './ProgressBar.js';

interface KanbanBoardProps {
  milestones: Milestone[];
  tasks: Record<string, Task[]>;
  filterMatch: (status: Status) => boolean;
  active: boolean;
  onSelect?: (milestone: Milestone) => void;
}

interface Column {
  status: Status;
  label: string;
  color: string;
  milestones: Milestone[];
}

export function KanbanBoard({ milestones, tasks, filterMatch, active, onSelect }: KanbanBoardProps) {
  const columns: Column[] = [
    {
      status: 'not_started',
      label: 'Not Started',
      color: 'gray',
      milestones: milestones.filter((m) => m.status === 'not_started' && filterMatch(m.status)),
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      color: 'cyan',
      milestones: milestones.filter((m) => m.status === 'in_progress' && filterMatch(m.status)),
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      milestones: milestones.filter((m) => m.status === 'completed' && filterMatch(m.status)),
    },
  ];

  const [colIdx, setColIdx] = useState(() => {
    // Start on first non-empty column
    const idx = columns.findIndex((c) => c.milestones.length > 0);
    return idx >= 0 ? idx : 0;
  });
  const [rowIdx, setRowIdx] = useState(0);

  useInput((input, key) => {
    if (!active) return;

    if (input === 'h' || key.leftArrow) {
      setColIdx((i) => {
        const next = Math.max(0, i - 1);
        setRowIdx(0);
        return next;
      });
    } else if (input === 'l' || key.rightArrow) {
      setColIdx((i) => {
        const next = Math.min(columns.length - 1, i + 1);
        setRowIdx(0);
        return next;
      });
    } else if (input === 'j' || key.downArrow) {
      setRowIdx((i) => Math.min(i + 1, (columns[colIdx]?.milestones.length || 1) - 1));
    } else if (input === 'k' || key.upArrow) {
      setRowIdx((i) => Math.max(i - 1, 0));
    } else if (key.return) {
      const col = columns[colIdx];
      if (col && col.milestones[rowIdx] && onSelect) {
        onSelect(col.milestones[rowIdx]);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold> Kanban Board</Text>
      <Text />
      <Box flexDirection="row" gap={1}>
        {columns.map((col, ci) => {
          const isActiveCol = ci === colIdx;
          return (
            <Box key={col.status} flexDirection="column" flexGrow={1} flexBasis={0}>
              {/* Column header */}
              <Box borderStyle="single" justifyContent="center" paddingX={1}>
                <Text bold color={col.color}>
                  {col.label} ({col.milestones.length})
                </Text>
              </Box>

              {/* Cards */}
              {col.milestones.length === 0 ? (
                <Box paddingX={1} paddingY={1}>
                  <Text dimColor>No milestones</Text>
                </Box>
              ) : (
                col.milestones.map((m, ri) => {
                  const isSelected = isActiveCol && ri === rowIdx;
                  const taskList = tasks[m.id] || [];
                  const completedTasks = taskList.filter((t) => t.status === 'completed').length;

                  return (
                    <Box
                      key={m.id}
                      flexDirection="column"
                      borderStyle={isSelected ? 'double' : 'single'}
                      borderColor={isSelected ? 'cyan' : col.color}
                      paddingX={1}
                      marginTop={ri === 0 ? 0 : 0}
                    >
                      <Text bold color={isSelected ? 'cyan' : undefined}>
                        {m.name.length > 22 ? m.name.slice(0, 21) + '…' : m.name}
                      </Text>
                      <ProgressBar percent={m.progress} width={15} />
                      <Text dimColor>
                        {completedTasks}/{taskList.length} tasks
                        {m.notes ? ` · ${m.notes.slice(0, 20)}` : ''}
                      </Text>
                    </Box>
                  );
                })
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
