import { useState, useCallback } from 'react';
import type { Status } from '../lib/types.js';

export type FilterValue = 'all' | Status;

const FILTER_ORDER: FilterValue[] = ['all', 'in_progress', 'completed', 'not_started'];

const FILTER_LABELS: Record<FilterValue, string> = {
  all: 'All',
  in_progress: 'In Progress',
  completed: 'Completed',
  not_started: 'Not Started',
};

export interface FilterState {
  filter: FilterValue;
  label: string;
  cycleFilter: () => void;
  matches: (status: Status) => boolean;
}

export function useFilter(): FilterState {
  const [filter, setFilter] = useState<FilterValue>('all');

  const cycleFilter = useCallback(() => {
    setFilter((prev) => {
      const idx = FILTER_ORDER.indexOf(prev);
      return FILTER_ORDER[(idx + 1) % FILTER_ORDER.length];
    });
  }, []);

  const matches = useCallback(
    (status: Status) => filter === 'all' || filter === status,
    [filter],
  );

  return {
    filter,
    label: FILTER_LABELS[filter],
    cycleFilter,
    matches,
  };
}
