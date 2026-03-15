import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Milestone } from '../lib/types.js';
import { buildGanttData, formatShortDate } from '../lib/chart-utils.js';

interface GanttChartProps {
  milestones: Milestone[];
  active: boolean;
  onSelect?: (milestone: Milestone) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'green',
  in_progress: 'cyan',
  not_started: 'gray',
};

export function GanttChart({ milestones, active, onSelect }: GanttChartProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { bars, minDate, maxDate, totalDays } = useMemo(() => buildGanttData(milestones), [milestones]);

  useInput((input, key) => {
    if (!active) return;
    if (input === 'j' || key.downArrow) {
      setSelectedIdx((i) => Math.min(i + 1, bars.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (key.return && bars[selectedIdx]) {
      const m = milestones.find((m) => m.id === bars[selectedIdx].id);
      if (m && onSelect) onSelect(m);
    }
  });

  if (bars.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Gantt Timeline</Text>
        <Text dimColor>No milestones with dates found.</Text>
      </Box>
    );
  }

  const labelWidth = 25;
  const timelineWidth = 50;

  // Generate month markers
  const monthMarkers: { label: string; pos: number }[] = [];
  const cursor = new Date(minDate);
  cursor.setDate(1);
  if (cursor < minDate) cursor.setMonth(cursor.getMonth() + 1);
  while (cursor <= maxDate) {
    const dayOffset = (cursor.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const pos = Math.round((dayOffset / totalDays) * timelineWidth);
    if (pos >= 0 && pos < timelineWidth) {
      monthMarkers.push({ label: formatShortDate(cursor), pos });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Build month header line
  let headerLine = ' '.repeat(timelineWidth);
  for (const marker of monthMarkers) {
    const lbl = marker.label;
    if (marker.pos + lbl.length <= timelineWidth) {
      headerLine = headerLine.slice(0, marker.pos) + lbl + headerLine.slice(marker.pos + lbl.length);
    }
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Gantt Timeline</Text>
        <Text dimColor>{formatShortDate(minDate)} — {formatShortDate(maxDate)} ({Math.round(totalDays)} days)</Text>
        <Text />

        {/* Header */}
        <Box>
          <Box width={labelWidth}><Text dimColor>Milestone</Text></Box>
          <Text dimColor>{headerLine}</Text>
        </Box>
        <Box>
          <Box width={labelWidth}><Text dimColor>{'─'.repeat(labelWidth - 1)}</Text></Box>
          <Text dimColor>{'─'.repeat(timelineWidth)}</Text>
        </Box>

        {/* Bars */}
        {bars.map((bar, i) => {
          const isSelected = i === selectedIdx && active;
          const color = STATUS_COLORS[bar.status] || 'gray';

          // Calculate bar position in character space
          const startCol = Math.round((bar.startPct / 100) * timelineWidth);
          const barWidth = Math.max(1, Math.round((bar.widthPct / 100) * timelineWidth));
          const fillWidth = Math.max(0, Math.round(barWidth * (bar.progress / 100)));
          const emptyWidth = barWidth - fillWidth;

          // Build the timeline row
          const before = ' '.repeat(Math.max(0, startCol));
          const filled = '█'.repeat(fillWidth);
          const empty = '░'.repeat(emptyWidth);
          const after = ' '.repeat(Math.max(0, timelineWidth - startCol - barWidth));

          return (
            <Box key={bar.id}>
              <Box width={labelWidth}>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                  {isSelected ? '> ' : '  '}{bar.name}
                </Text>
              </Box>
              <Text>
                {before}
                <Text color={color}>{filled}</Text>
                <Text color={color} dimColor>{empty}</Text>
                {after}
              </Text>
            </Box>
          );
        })}

        <Text />
        <Box gap={3}>
          <Text color="green">█ Completed</Text>
          <Text color="cyan">█ In Progress</Text>
          <Text dimColor>█ Not Started</Text>
        </Box>
      </Box>
    </Box>
  );
}
