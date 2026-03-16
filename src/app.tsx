import React, { useState, useCallback } from 'react';
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
import { MilestoneDetail } from './components/MilestoneDetail.js';
import { TaskDetail } from './components/TaskDetail.js';
import { SearchResults } from './components/SearchResults.js';
import { useSearch } from './hooks/useSearch.js';
import { BurndownChart } from './components/BurndownChart.js';
import { EstimateChart } from './components/EstimateChart.js';
import { KanbanBoard } from './components/KanbanBoard.js';
import { GanttChart } from './components/GanttChart.js';
import { DependencyGraph } from './components/DependencyGraph.js';
import { PriorityPivot } from './components/PriorityPivot.js';
import type { Milestone, Task } from './lib/types.js';

interface AppProps {
  filePath: string;
  watch: boolean;
  initialView?: string;
}

type DetailState =
  | { type: 'none' }
  | { type: 'milestone'; milestone: Milestone }
  | { type: 'task'; task: Task; milestone: Milestone };

export default function App({ filePath, watch, initialView }: AppProps) {
  const { data, error, reload, warnings } = useProgressData(filePath);
  useWatchMode(filePath, watch, reload);
  const nav = useNavigation(initialView);
  const filter = useFilter();
  const { exit } = useApp();
  const [showHelp, setShowHelp] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [detail, setDetail] = useState<DetailState>({ type: 'none' });
  const search = useSearch(data);

  const openMilestoneDetail = useCallback((milestone: Milestone) => {
    setDetail({ type: 'milestone', milestone });
  }, []);

  const openTaskDetail = useCallback((task: Task) => {
    if (!data) return;
    // Find parent milestone
    const milestone = data.milestones.find((m) => m.id === task.milestone_id);
    if (milestone) {
      setDetail({ type: 'task', task, milestone });
    }
  }, [data]);

  const closeDetail = useCallback(() => {
    setDetail((prev) => {
      // If in task detail, go back to milestone detail
      if (prev.type === 'task') {
        return { type: 'milestone', milestone: prev.milestone };
      }
      return { type: 'none' };
    });
  }, []);

  const navigateToSiblingTask = useCallback((task: Task) => {
    if (!data) return;
    const milestone = data.milestones.find((m) => m.id === task.milestone_id);
    if (milestone) {
      setDetail({ type: 'task', task, milestone });
    }
  }, [data]);

  // Global keyboard handling
  useInput((input, key) => {
    if (warnings.length > 0 && !dismissedWarning) {
      setDismissedWarning(true);
      return;
    }

    if (showHelp) {
      setShowHelp(false);
      return;
    }

    // Search input mode: capture typed characters
    if (search.isSearching) {
      if (key.escape) { search.cancelSearch(); return; }
      if (key.backspace || key.delete) {
        search.setQuery(search.query.slice(0, -1));
        return;
      }
      // Let j/k/Enter pass through to SearchResults when query exists
      if (search.query && (input === 'j' || input === 'k' || key.return || key.downArrow || key.upArrow)) {
        return; // SearchResults useInput handles these
      }
      if (input && !key.ctrl && !key.meta && input.length === 1 && input !== 'q') {
        search.setQuery(search.query + input);
        return;
      }
      return;
    }

    // In detail view, let detail component handle most keys
    if (detail.type !== 'none') {
      if (input === 'q') { exit(); return; }
      if (input === '?') { setShowHelp(true); return; }
      if (input === 'r') { reload(); return; }
      return;
    }

    if (input === 'q') { exit(); return; }
    if (input === '?') { setShowHelp(true); return; }
    if (input === 'f') { filter.cycleFilter(); return; }
    if (input === 'r') { reload(); return; }
    if (input === '/') { search.startSearch(); return; }
    // Number keys: 1-9 → views 0-8, 0 → view 9, - → view 10
    if (input && input >= '1' && input <= '9') { nav.goToIndex(parseInt(input) - 1); return; }
    if (input === '0' && nav.views.length > 9) { nav.goToIndex(9); return; }
    if (input === '-' && nav.views.length > 10) { nav.goToIndex(10); return; }
    if (key.tab) {
      if (key.shift) { nav.prevView(); }
      else { nav.nextView(); }
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

  // Schema deprecation warning (shown once, dismissed with any key)
  if (warnings.length > 0 && !dismissedWarning) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={2} paddingY={1}>
          <Text bold color="yellow"> Deprecation Warning</Text>
          <Text />
          {warnings.map((w, i) => (
            <Text key={i} color="yellow">  {w}</Text>
          ))}
          <Text />
          <Text dimColor>  Press any key to dismiss</Text>
        </Box>
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
        <Text><Text bold>Enter</Text>              Expand / open detail</Text>
        <Text><Text bold>Backspace/Esc</Text>      Back from detail</Text>
        <Text><Text bold>[/]</Text>                Prev/next task (in detail)</Text>
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

  // Search view
  if (search.isSearching) {
    return (
      <Box flexDirection="column">
        <Header
          projectName={data.project.name}
          projectVersion={data.project.version}
          currentView={nav.currentView}
          views={nav.views}
          labels={nav.labels}
          filterLabel={filter.label}
        />
        <Text dimColor>{'─'.repeat(80)}</Text>
        <Box flexDirection="column" flexGrow={1} paddingX={1}>
          <SearchResults
            query={search.query}
            results={search.results}
            active={true}
            onSelectMilestone={(m) => { search.cancelSearch(); openMilestoneDetail(m); }}
            onSelectTask={(t) => { search.cancelSearch(); openTaskDetail(t); }}
            onCancel={search.cancelSearch}
          />
        </Box>
      </Box>
    );
  }

  // Detail views
  if (detail.type === 'milestone') {
    const milestoneTasks = data.tasks[detail.milestone.id] || [];
    return (
      <Box flexDirection="column">
        <Header
          projectName={data.project.name}
          projectVersion={data.project.version}
          currentView={nav.currentView}
          views={nav.views}
          labels={nav.labels}
          filterLabel={filter.label}
        />
        <Text dimColor>{'─'.repeat(80)}</Text>
        <Box flexDirection="column" flexGrow={1} paddingX={1}>
          <MilestoneDetail
            milestone={detail.milestone}
            tasks={milestoneTasks}
            data={data}
            filePath={filePath}
            active={true}
            onBack={closeDetail}
            onSelectTask={openTaskDetail}
          />
        </Box>
      </Box>
    );
  }

  if (detail.type === 'task') {
    const siblings = data.tasks[detail.milestone.id] || [];
    return (
      <Box flexDirection="column">
        <Header
          projectName={data.project.name}
          projectVersion={data.project.version}
          currentView={nav.currentView}
          views={nav.views}
          labels={nav.labels}
          filterLabel={filter.label}
        />
        <Text dimColor>{'─'.repeat(80)}</Text>
        <Box flexDirection="column" flexGrow={1} paddingX={1}>
          <TaskDetail
            task={detail.task}
            milestone={detail.milestone}
            siblings={siblings}
            data={data}
            filePath={filePath}
            active={true}
            onBack={closeDetail}
            onNavigateSibling={navigateToSiblingTask}
          />
        </Box>
      </Box>
    );
  }

  // Normal list views
  return (
    <Box flexDirection="column">
      <Header
        projectName={data.project.name}
        projectVersion={data.project.version}
        currentView={nav.currentView}
        views={nav.views}
        labels={nav.labels}
        filterLabel={filter.label}
      />
      <Text dimColor>{'─'.repeat(80)}</Text>
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {nav.currentView === 'dashboard' && (
          <Dashboard data={data} />
        )}
        {nav.currentView === 'milestones' && (
          <MilestoneTable
            milestones={data.milestones}
            filterMatch={filter.matches}
            active={true}
            onSelect={openMilestoneDetail}
          />
        )}
        {nav.currentView === 'tasks' && (
          <TaskTree
            milestones={data.milestones}
            tasks={data.tasks}
            filterMatch={filter.matches}
            active={true}
            onSelectTask={openTaskDetail}
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
        {nav.currentView === 'burndown' && (
          <BurndownChart data={data} />
        )}
        {nav.currentView === 'estimates' && (
          <EstimateChart data={data} />
        )}
        {nav.currentView === 'kanban' && (
          <KanbanBoard
            milestones={data.milestones}
            tasks={data.tasks}
            filterMatch={filter.matches}
            active={true}
            onSelect={openMilestoneDetail}
          />
        )}
        {nav.currentView === 'gantt' && (
          <GanttChart
            milestones={data.milestones}
            active={true}
            onSelect={openMilestoneDetail}
          />
        )}
{nav.currentView === 'priority' && (
          <PriorityPivot
            data={data}
            active={true}
            onSelectTask={openTaskDetail}
          />
        )}
        {nav.currentView === 'graph' && (
          <DependencyGraph data={data} />
        )}
      </Box>
      <Text dimColor>{'─'.repeat(80)}</Text>
      <HelpBar currentView={nav.currentView} />
    </Box>
  );
}
