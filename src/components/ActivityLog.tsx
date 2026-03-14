import React from 'react';
import { Box, Text } from 'ink';
import type { WorkEntry } from '../lib/types.js';

interface ActivityLogProps {
  entries: WorkEntry[];
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return <Text dimColor>No recent work entries.</Text>;
  }

  return (
    <Box flexDirection="column" gap={1}>
      {entries.map((entry, i) => (
        <Box key={i} flexDirection="column">
          <Text>
            <Text bold>{entry.date}</Text>
            <Text dimColor> — {entry.description}</Text>
          </Text>
          {entry.items.map((item, j) => (
            <Text key={j} dimColor>  • {item}</Text>
          ))}
        </Box>
      ))}
    </Box>
  );
}
