import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useProgressData } from './hooks/useProgressData.js';
import { useWatchMode } from './hooks/useWatchMode.js';
import { useNavigation } from './hooks/useNavigation.js';
import { useFilter } from './hooks/useFilter.js';
import { Header } from './components/Header.js';
import { HelpBar } from './components/HelpBar.js';
import { Dashboard } from './components/Dashboard.js';
import { MilestoneTable } from './components/MilestoneTable.js';
import { TaskTree } from './components/TaskTree.js';
import { ActivityLog } from './components/ActivityLog.js';
import { BlockersNextSteps } from './components/BlockersNextSteps.js';

interface AppProps {
  filePath: string;
  watch: boolean;
  initialView?: string;
}

export default function App({ filePath, watch, initialView }: AppProps) {
  const { data, error, reload } = useProgressData(filePath);
  useWatchMode(filePath, watch, reload);
  const nav = useNavigation(initialView);
  const filter = useFilter();
  const { exit } = useApp();
  const [showHelp, setShowHelp] = useState(false);

  // Global keyboard handling
  useInput((input, key) => {
    if (showHelp) {
      setShowHelp(false);
      return;
    }

    if (input === 'q') {
      exit();
      return;
    }
    if (input === '?') {
      setShowHelp(true);
      return;
    }
    if (input === 'f') {
      filter.cycleFilter();
      return;
    }
    if (input === 'r') {
      reload();
      return;
    }
    if (key.tab) {
      if (key.shift) {
        nav.prevView();
      } else {
        nav.nextView();
      }
    }
  });

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

  // Help overlay
  if (showHelp) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Keyboard Shortcuts</Text>
        <Text />
        <Text><Text bold>Tab</Text> / <Text bold>Shift+Tab</Text>  Switch views</Text>
        <Text><Text bold>j/k</Text> or <Text bold>↑/↓</Text>       Navigate</Text>
        <Text><Text bold>Enter</Text>              Expand / select</Text>
        <Text><Text bold>s</Text>                  Cycle sort (table)</Text>
        <Text><Text bold>f</Text>                  Cycle status filter</Text>
        <Text><Text bold>r</Text>                  Refresh data</Text>
        <Text><Text bold>q</Text>                  Quit</Text>
        <Text><Text bold>?</Text>                  Toggle this help</Text>
        <Text />
        <Text dimColor>Press any key to dismiss</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Header
        projectName={data.project.name}
        projectVersion={data.project.version}
        currentView={nav.currentView}
        views={nav.views}
        labels={nav.labels}
        filterLabel={filter.label}
      />

      <Text dimColor>{'─'.repeat(80)}</Text>

      {/* Content */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {nav.currentView === 'dashboard' && (
          <Dashboard data={data} />
        )}
        {nav.currentView === 'milestones' && (
          <MilestoneTable
            milestones={data.milestones}
            filterMatch={filter.matches}
            active={nav.currentView === 'milestones'}
          />
        )}
        {nav.currentView === 'tasks' && (
          <TaskTree
            milestones={data.milestones}
            tasks={data.tasks}
            filterMatch={filter.matches}
            active={nav.currentView === 'tasks'}
          />
        )}
        {nav.currentView === 'activity' && (
          <ActivityLog entries={data.recent_work} />
        )}
        {nav.currentView === 'blockers' && (
          <BlockersNextSteps
            blockers={data.current_blockers}
            nextSteps={data.next_steps}
          />
        )}
      </Box>

      {/* Help Bar */}
      <Text dimColor>{'─'.repeat(80)}</Text>
      <HelpBar currentView={nav.currentView} />
    </Box>
  );
}
