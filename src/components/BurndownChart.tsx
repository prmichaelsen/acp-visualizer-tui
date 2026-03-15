import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { buildBurndownData } from '../lib/chart-utils.js';

interface BurndownChartProps {
  data: ProgressData;
}

export function BurndownChart({ data }: BurndownChartProps) {
  const points = useMemo(() => buildBurndownData(data), [data]);

  if (points.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Burndown Chart</Text>
        <Text dimColor>No tasks found.</Text>
      </Box>
    );
  }

  const total = points[0].total;
  const chartHeight = Math.min(16, Math.max(8, total + 2));
  const chartWidth = Math.min(60, Math.max(20, points.length * 6));

  // Build ASCII chart
  const rows: string[] = [];
  const yMax = total;

  for (let row = 0; row < chartHeight; row++) {
    const yValue = yMax - (row / (chartHeight - 1)) * yMax;
    const yLabel = Math.round(yValue).toString().padStart(3);
    let line = '';

    for (let col = 0; col < points.length; col++) {
      const colWidth = Math.max(1, Math.floor(chartWidth / points.length));
      const remaining = points[col].remaining;
      const completed = points[col].completed;

      // Determine what character to draw
      const remainingNorm = (remaining / yMax) * (chartHeight - 1);
      const completedNorm = (completed / yMax) * (chartHeight - 1);
      const invertedRow = chartHeight - 1 - row;

      if (invertedRow <= completedNorm && completedNorm > 0) {
        line += '█'.repeat(colWidth);
      } else if (invertedRow <= remainingNorm + completedNorm) {
        line += '░'.repeat(colWidth);
      } else {
        line += ' '.repeat(colWidth);
      }
    }

    rows.push(`${yLabel} │${line}`);
  }

  // X-axis
  const axisWidth = points.length * Math.max(1, Math.floor(chartWidth / points.length));
  rows.push(`    └${'─'.repeat(axisWidth)}`);

  // Date labels
  const colWidth = Math.max(1, Math.floor(chartWidth / points.length));
  let dateRow = '     ';
  for (let i = 0; i < points.length; i++) {
    const dateLabel = points[i].date.slice(5); // MM-DD
    dateRow += dateLabel.padEnd(colWidth);
  }
  rows.push(dateRow);

  // Stats
  const lastPoint = points[points.length - 1];

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Burndown Chart</Text>
        <Text dimColor>Task completion over time</Text>
        <Text />

        {rows.map((row, i) => (
          <Text key={i}>
            {row.includes('█') ? (
              <>
                <Text>{row.split('█')[0]}</Text>
                <Text color="green">{'█'.repeat((row.match(/█/g) || []).length)}</Text>
                <Text>{row.split(/█+/).slice(1).join('')}</Text>
              </>
            ) : row.includes('░') ? (
              <>
                <Text>{row.split('░')[0]}</Text>
                <Text color="blue">{'░'.repeat((row.match(/░/g) || []).length)}</Text>
                <Text>{row.split(/░+/).slice(1).join('')}</Text>
              </>
            ) : (
              <Text>{row}</Text>
            )}
          </Text>
        ))}

        <Text />
        <Box gap={3}>
          <Text color="green">█ Completed: {lastPoint.completed}</Text>
          <Text color="blue">░ Remaining: {lastPoint.remaining}</Text>
          <Text dimColor>Total: {lastPoint.total}</Text>
        </Box>
      </Box>
    </Box>
  );
}
