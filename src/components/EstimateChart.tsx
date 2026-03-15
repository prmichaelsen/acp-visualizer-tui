import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { buildEstimateData } from '../lib/chart-utils.js';

interface EstimateChartProps {
  data: ProgressData;
}

export function EstimateChart({ data }: EstimateChartProps) {
  const chartData = useMemo(() => buildEstimateData(data), [data]);

  if (chartData.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Estimate vs Actual</Text>
        <Text dimColor>No milestones found.</Text>
      </Box>
    );
  }

  const maxHours = Math.max(
    ...chartData.map((d) => Math.max(d.estimated, d.actual ?? 0)),
    1
  );
  const barMaxWidth = 40;

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Estimate vs Actual (hours)</Text>
        <Text dimColor>Estimated hours from tasks, actual from milestone dates (6h/day)</Text>
        <Text />

        {chartData.map((item, i) => {
          const estWidth = Math.max(1, Math.round((item.estimated / maxHours) * barMaxWidth));
          const actWidth = item.actual !== null ? Math.max(1, Math.round((item.actual / maxHours) * barMaxWidth)) : 0;
          const isOver = item.actual !== null && item.actual > item.estimated;

          return (
            <Box key={i} flexDirection="column" marginBottom={1}>
              <Text bold>{item.name}</Text>
              <Box>
                <Text dimColor>{'  Est '.padEnd(7)}</Text>
                <Text color="blue">{'█'.repeat(estWidth)}</Text>
                <Text dimColor> {item.estimated}h</Text>
              </Box>
              {item.actual !== null ? (
                <Box>
                  <Text dimColor>{'  Act '.padEnd(7)}</Text>
                  <Text color={isOver ? 'red' : 'green'}>{'█'.repeat(actWidth)}</Text>
                  <Text dimColor> {item.actual}h</Text>
                  {isOver && <Text color="red"> (+{Math.round((item.actual - item.estimated) * 10) / 10}h)</Text>}
                </Box>
              ) : (
                <Box>
                  <Text dimColor>{'  Act '.padEnd(7)}—</Text>
                </Box>
              )}
            </Box>
          );
        })}

        <Text />
        <Box gap={3}>
          <Text color="blue">█ Estimated</Text>
          <Text color="green">█ Actual (under)</Text>
          <Text color="red">█ Actual (over)</Text>
        </Box>
      </Box>
    </Box>
  );
}
