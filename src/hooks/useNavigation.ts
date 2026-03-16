import { useState, useCallback } from 'react';

export type ViewName = 'dashboard' | 'milestones' | 'tasks' | 'activity' | 'blockers' | 'burndown' | 'estimates' | 'kanban' | 'gantt' | 'graph' | 'flame' | 'priority';

const VIEW_ORDER: ViewName[] = ['dashboard', 'milestones', 'tasks', 'kanban', 'gantt', 'burndown', 'estimates', 'flame', 'priority', 'graph', 'activity', 'blockers'];

const VIEW_LABELS: Record<ViewName, string> = {
  dashboard: 'Dashboard',
  milestones: 'Milestones',
  tasks: 'Tasks',
  kanban: 'Kanban',
  gantt: 'Gantt',
  burndown: 'Burndown',
  estimates: 'Estimates',
  flame: 'Flame',
  priority: 'Priority',
  graph: 'Graph',
  activity: 'Activity',
  blockers: 'Blockers',
};

export interface NavigationState {
  currentView: ViewName;
  viewStack: ViewName[];
  views: typeof VIEW_ORDER;
  labels: typeof VIEW_LABELS;
  nextView: () => void;
  prevView: () => void;
  goToView: (view: ViewName) => void;
  pushView: (view: ViewName) => void;
  popView: () => void;
}

export function useNavigation(initialView?: string): NavigationState {
  const initial = VIEW_ORDER.includes(initialView as ViewName)
    ? (initialView as ViewName)
    : 'dashboard';

  const [currentView, setCurrentView] = useState<ViewName>(initial);
  const [viewStack, setViewStack] = useState<ViewName[]>([]);

  const nextView = useCallback(() => {
    setCurrentView((prev) => {
      const idx = VIEW_ORDER.indexOf(prev);
      return VIEW_ORDER[(idx + 1) % VIEW_ORDER.length];
    });
  }, []);

  const prevView = useCallback(() => {
    setCurrentView((prev) => {
      const idx = VIEW_ORDER.indexOf(prev);
      return VIEW_ORDER[(idx - 1 + VIEW_ORDER.length) % VIEW_ORDER.length];
    });
  }, []);

  const goToView = useCallback((view: ViewName) => {
    setCurrentView(view);
  }, []);

  const pushView = useCallback((view: ViewName) => {
    setCurrentView((prev) => {
      setViewStack((stack) => [...stack, prev]);
      return view;
    });
  }, []);

  const popView = useCallback(() => {
    setViewStack((stack) => {
      if (stack.length === 0) return stack;
      const newStack = [...stack];
      const prev = newStack.pop()!;
      setCurrentView(prev);
      return newStack;
    });
  }, []);

  return {
    currentView,
    viewStack,
    views: VIEW_ORDER,
    labels: VIEW_LABELS,
    nextView,
    prevView,
    goToView,
    pushView,
    popView,
  };
}
