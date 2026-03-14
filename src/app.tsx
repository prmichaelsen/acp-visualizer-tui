import React from 'react';
import { Text, Box } from 'ink';
import type { ProgressData } from './lib/types.js';

interface AppProps {
  data: ProgressData;
  filePath: string;
  watch: boolean;
  initialView?: string;
}

export default function App({ data }: AppProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>{data.project.name} v{data.project.version}</Text>
      <Text>Status: {data.project.status}</Text>
      <Text>Milestones: {data.milestones.length}</Text>
      <Text dimColor>Views coming in M2...</Text>
    </Box>
  );
}
