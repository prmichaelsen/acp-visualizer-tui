import React from 'react';
import { Text, Box } from 'ink';
import { useProgressData } from './hooks/useProgressData.js';
import { useWatchMode } from './hooks/useWatchMode.js';

interface AppProps {
  filePath: string;
  watch: boolean;
  initialView?: string;
}

export default function App({ filePath, watch }: AppProps) {
  const { data, error, reload } = useProgressData(filePath);
  useWatchMode(filePath, watch, reload);

  if (error && !data) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text dimColor>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>{data.project.name} v{data.project.version}</Text>
      <Text>Status: {data.project.status}</Text>
      <Text>Milestones: {data.milestones.length}</Text>
      {watch && <Text dimColor>Watching for changes...</Text>}
      <Text dimColor>Views coming in M2...</Text>
    </Box>
  );
}
