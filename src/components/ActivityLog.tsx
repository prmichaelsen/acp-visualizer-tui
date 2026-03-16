import React from 'react';
import { Box, Text } from 'ink';
import type { WorkEntry } from '../lib/types.js';
import { MentionText } from './MentionText.js';

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
            <Text dimColor> — </Text><MentionText dimColor>{entry.description}</MentionText>
          </Text>
          {entry.items.map((item, j) => (
            <MentionText key={j} dimColor>{`  • ${item}`}</MentionText>
          ))}
        </Box>
      ))}
    </Box>
  );
}
