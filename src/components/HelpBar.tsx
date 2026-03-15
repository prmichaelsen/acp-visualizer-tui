import React from 'react';
import { Box, Text } from 'ink';
import type { ViewName } from '../hooks/useNavigation.js';

interface HelpBarProps {
  currentView: ViewName;
}

const COMMON_KEYS = 'Tab:View  f:Filter  /:Search  r:Refresh  q:Quit  ?:Help';

const VIEW_KEYS: Record<ViewName, string> = {
  dashboard: `${COMMON_KEYS}`,
  milestones: `j/k:Navigate  s:Sort  Enter:Detail  ${COMMON_KEYS}`,
  tasks: `j/k:Navigate  Enter:Expand/Detail  Space:Toggle  e:Expand All  ${COMMON_KEYS}`,
  activity: `${COMMON_KEYS}`,
  blockers: `${COMMON_KEYS}`,
  burndown: `${COMMON_KEYS}`,
  estimates: `${COMMON_KEYS}`,
  kanban: `h/l:Column  j/k:Card  Enter:Detail  ${COMMON_KEYS}`,
  gantt: `j/k:Navigate  Enter:Detail  ${COMMON_KEYS}`,
  graph: `j/k:Scroll  ${COMMON_KEYS}`,
};

export function HelpBar({ currentView }: HelpBarProps) {
  return (
    <Box>
      <Text dimColor>{VIEW_KEYS[currentView]}</Text>
    </Box>
  );
}
