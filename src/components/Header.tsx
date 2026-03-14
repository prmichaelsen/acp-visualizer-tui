import React from 'react';
import { Box, Text } from 'ink';
import type { ViewName } from '../hooks/useNavigation.js';

interface HeaderProps {
  projectName: string;
  projectVersion: string;
  currentView: ViewName;
  views: ViewName[];
  labels: Record<ViewName, string>;
  filterLabel: string;
}

export function Header({
  projectName,
  projectVersion,
  currentView,
  views,
  labels,
  filterLabel,
}: HeaderProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Text bold>
        {projectName} <Text dimColor>v{projectVersion}</Text>
      </Text>
      <Box gap={1}>
        {views.map((view) => {
          const isActive = view === currentView;
          if (isActive) {
            return (
              <Text key={view} bold color="cyan">
                [{labels[view]}]
              </Text>
            );
          }
          return (
            <Text key={view} dimColor>
              {' '}{labels[view]}{' '}
            </Text>
          );
        })}
      </Box>
      <Text dimColor>
        Filter: <Text color={filterLabel === 'All' ? 'gray' : 'yellow'} bold={filterLabel !== 'All'}>{filterLabel}</Text>
      </Text>
    </Box>
  );
}
