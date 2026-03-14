import React from 'react';
import { Box, Text } from 'ink';
import type { ViewName } from '../hooks/useNavigation.js';

interface HelpBarProps {
  currentView: ViewName;
}

const COMMON_KEYS = 'Tab:View  f:Filter  r:Refresh  q:Quit  ?:Help';

const VIEW_KEYS: Record<ViewName, string> = {
  dashboard: `j/k:Scroll  ${COMMON_KEYS}`,
  milestones: `j/k:Navigate  s:Sort  Enter:Detail  ${COMMON_KEYS}`,
  tasks: `j/k:Navigate  Enter:Expand  ${COMMON_KEYS}`,
  activity: `j/k:Scroll  ${COMMON_KEYS}`,
  blockers: `j/k:Scroll  ${COMMON_KEYS}`,
};

export function HelpBar({ currentView }: HelpBarProps) {
  return (
    <Box>
      <Text dimColor>{VIEW_KEYS[currentView]}</Text>
    </Box>
  );
}
