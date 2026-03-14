import React from 'react';
import { Box, Text } from 'ink';

interface BlockersNextStepsProps {
  blockers: string[];
  nextSteps: string[];
}

export function BlockersNextSteps({ blockers, nextSteps }: BlockersNextStepsProps) {
  return (
    <Box flexDirection="column" gap={1}>
      {/* Blockers */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold color={blockers.length > 0 ? 'red' : undefined}> Current Blockers</Text>
        {blockers.length === 0 ? (
          <Text dimColor>  (none)</Text>
        ) : (
          blockers.map((b, i) => (
            <Text key={i} color="red">  • {b}</Text>
          ))
        )}
      </Box>

      {/* Next Steps */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Next Steps</Text>
        {nextSteps.length === 0 ? (
          <Text dimColor>  (none)</Text>
        ) : (
          nextSteps.map((s, i) => (
            <Text key={i}>  {i + 1}. {s}</Text>
          ))
        )}
      </Box>
    </Box>
  );
}
