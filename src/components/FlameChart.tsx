import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { buildFlameData } from '../lib/chart-utils.js';
import type { FlameRow } from '../lib/chart-utils.js';

interface FlameChartProps {
  data: ProgressData;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'green',
  in_progress: 'cyan',
  not_started: 'gray',
};

const BLOCK_CHARS = ['█', '▓', '▒', '░'];

export function FlameChart({ data }: FlameChartProps) {
  const { rows, totalHours } = useMemo(() => buildFlameData(data), [data]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Separate milestone rows and task rows
  const milestoneRows = useMemo(() => rows.filter((r) => r.depth === 0), [rows]);
  const taskRows = useMemo(() => rows.filter((r) => r.depth === 1), [rows]);

  useInput((input, key) => {
    if (input === 'j' || key.downArrow) {
      setSelectedIdx((i) => Math.min(i + 1, milestoneRows.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
  });

  if (rows.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Flame Chart</Text>
        <Text dimColor>No tasks with hours found.</Text>
      </Box>
    );
  }

  const barWidth = 60;

  // Render a flame row as colored bar
  function renderBar(items: FlameRow[], width: number): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const charWidth = Math.max(1, Math.round(item.width * width));
      const color = STATUS_COLORS[item.status] || 'gray';
      const blockChar = item.depth === 0 ? '█' : BLOCK_CHARS[i % BLOCK_CHARS.length];
      const label = item.label.slice(0, charWidth - 1);
      const fill = charWidth - label.length - 1;

      if (charWidth >= label.length + 2) {
        elements.push(
          <Text key={item.id} color={color}>
            {label}{' '}{blockChar.repeat(Math.max(0, fill))}
          </Text>
        );
      } else {
        elements.push(
          <Text key={item.id} color={color}>
            {blockChar.repeat(charWidth)}
          </Text>
        );
      }
    }
    return elements;
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Flame Chart</Text>
        <Text dimColor>Time allocation by milestone and task ({totalHours}h total)</Text>
        <Text />

        {/* Milestone-level bar (top flame) */}
        <Text dimColor>{'  Milestones'.padEnd(18)}</Text>
        <Box>
          <Text>{'  '}</Text>
          {renderBar(milestoneRows, barWidth)}
        </Box>
        <Text />

        {/* Per-milestone task breakdown */}
        {milestoneRows.map((m, mi) => {
          const isSelected = mi === selectedIdx;
          const milestoneTasks = taskRows.filter((t) => t.milestone === m.milestone);

          // Normalize task widths relative to this milestone
          const normalizedTasks = milestoneTasks.map((t) => ({
            ...t,
            width: t.hours / m.hours,
          }));

          return (
            <Box key={m.id} flexDirection="column" marginBottom={0}>
              <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : STATUS_COLORS[m.status]}>
                  {isSelected ? '> ' : '  '}
                  {m.label}
                </Text>
                <Text dimColor> ({m.hours}h)</Text>
              </Box>
              <Box>
                <Text>{'  '}</Text>
                {normalizedTasks.map((t, ti) => {
                  const charWidth = Math.max(1, Math.round(t.width * barWidth));
                  const color = STATUS_COLORS[t.status] || 'gray';
                  const label = t.label.slice(0, Math.max(0, charWidth - 1));

                  if (charWidth >= label.length + 2) {
                    return (
                      <Text key={t.id} color={color}>
                        {label}{' '}{'█'.repeat(Math.max(0, charWidth - label.length - 1))}
                      </Text>
                    );
                  }
                  return (
                    <Text key={t.id} color={color}>
                      {'█'.repeat(charWidth)}
                    </Text>
                  );
                })}
              </Box>
              {isSelected && (
                <Box flexDirection="column" marginLeft={2}>
                  {milestoneTasks.map((t) => (
                    <Text key={t.id} dimColor>
                      <Text color={STATUS_COLORS[t.status]}>
                        {t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '●' : '○'}
                      </Text>
                      {' '}{t.label} — {t.hours}h
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}

        <Text />
        <Box gap={3}>
          <Text color="green">█ Completed</Text>
          <Text color="cyan">█ In Progress</Text>
          <Text dimColor>█ Not Started</Text>
        </Box>
        <Text dimColor>j/k to select milestone, shows task breakdown</Text>
      </Box>
    </Box>
  );
}
