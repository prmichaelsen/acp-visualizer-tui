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

// Alternate block chars so adjacent tasks are visually distinct
const TASK_BLOCKS = ['█', '▓'];

export function FlameChart({ data }: FlameChartProps) {
  const { rows, totalHours } = useMemo(() => buildFlameData(data), [data]);
  const [selectedIdx, setSelectedIdx] = useState(0);

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

  const barWidth = 70;

  // Render a segmented bar: array of {charWidth, color, label, blockChar}
  function renderSegmentedBar(
    segments: { width: number; color: string; label: string; block: string }[],
    totalWidth: number,
  ): React.ReactNode {
    const parts: React.ReactNode[] = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const charWidth = Math.max(1, Math.round(seg.width * totalWidth));

      // Try to fit label inside the segment
      if (charWidth >= seg.label.length + 2) {
        const fill = charWidth - seg.label.length - 1;
        parts.push(
          <Text key={i} color={seg.color}>
            {seg.label}{' '}{seg.block.repeat(Math.max(0, fill))}
          </Text>
        );
      } else if (charWidth >= 3) {
        // Truncated label
        const truncated = seg.label.slice(0, charWidth - 1);
        parts.push(
          <Text key={i} color={seg.color}>
            {truncated}{seg.block}
          </Text>
        );
      } else {
        parts.push(
          <Text key={i} color={seg.color}>
            {seg.block.repeat(charWidth)}
          </Text>
        );
      }
    }
    return <>{parts}</>;
  }

  // Build milestone segments for top bar
  const milestoneSegments = milestoneRows.map((m, i) => ({
    width: m.width,
    color: STATUS_COLORS[m.status] || 'gray',
    label: m.label,
    block: '█',
  }));

  // Build task segments bar (all tasks, all milestones, in order — aligned under milestone bar)
  const taskSegments = taskRows.map((t, i) => ({
    width: t.width,
    color: STATUS_COLORS[t.status] || 'gray',
    label: t.label,
    block: TASK_BLOCKS[i % 2],
  }));

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Flame Chart</Text>
        <Text dimColor>Time allocation by milestone and task ({totalHours}h total)</Text>
        <Text />

        {/* Row 1: Milestone segments (top flame) */}
        <Text dimColor>  Milestones</Text>
        <Box>
          <Text>{'  '}</Text>
          {renderSegmentedBar(milestoneSegments, barWidth)}
        </Box>

        {/* Row 2: Task segments (bottom flame — aligned under milestones) */}
        <Box>
          <Text>{'  '}</Text>
          {renderSegmentedBar(taskSegments, barWidth)}
        </Box>
        <Text />

        {/* Scale */}
        <Box>
          <Text>{'  '}</Text>
          <Text dimColor>{'0h'}</Text>
          <Text dimColor>{' '.repeat(Math.max(0, barWidth - 6))}</Text>
          <Text dimColor>{totalHours}h</Text>
        </Box>
        <Text />

        {/* Detail: selected milestone breakdown */}
        {milestoneRows.map((m, mi) => {
          const isSelected = mi === selectedIdx;
          if (!isSelected) return null;

          const milestoneTasks = taskRows.filter((t) => t.milestone === m.milestone);

          return (
            <Box key={m.id} flexDirection="column">
              <Text bold color="cyan">
                {'  '}{m.label} <Text dimColor>({m.hours}h — {Math.round(m.width * 100)}% of total)</Text>
              </Text>
              <Text />
              {milestoneTasks.map((t, ti) => {
                const pct = Math.round((t.hours / m.hours) * 100);
                const taskBarWidth = 30;
                const filled = Math.max(1, Math.round((t.hours / m.hours) * taskBarWidth));
                const color = STATUS_COLORS[t.status] || 'gray';
                const dot = t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '●' : '○';

                return (
                  <Box key={t.id}>
                    <Text>{'    '}</Text>
                    <Text color={color}>{dot} </Text>
                    <Box width={20}>
                      <Text>{t.label.length > 18 ? t.label.slice(0, 17) + '…' : t.label}</Text>
                    </Box>
                    <Text color={color}>{'█'.repeat(filled)}</Text>
                    <Text dimColor> {t.hours}h ({pct}%)</Text>
                  </Box>
                );
              })}
            </Box>
          );
        })}

        <Text />
        <Box gap={3}>
          <Text color="green">█ Completed</Text>
          <Text color="cyan">█ In Progress</Text>
          <Text dimColor>█ Not Started</Text>
        </Box>
        <Text dimColor>j/k to select milestone · task breakdown shown below</Text>
      </Box>
    </Box>
  );
}
