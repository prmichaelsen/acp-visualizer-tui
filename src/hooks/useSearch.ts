import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { ProgressData, Milestone, Task } from '../lib/types.js';

export interface SearchResult {
  type: 'milestone' | 'task';
  milestone?: Milestone;
  task?: Task;
  name: string;
  id: string;
}

export interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  startSearch: () => void;
  cancelSearch: () => void;
}

export function useSearch(data: ProgressData | null): SearchState {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fuse = useMemo(() => {
    if (!data) return null;

    const items: SearchResult[] = [];

    for (const m of data.milestones) {
      items.push({ type: 'milestone', milestone: m, name: m.name, id: m.id });
    }

    for (const [, tasks] of Object.entries(data.tasks)) {
      for (const t of tasks) {
        items.push({ type: 'task', task: t, name: t.name, id: t.id });
      }
    }

    return new Fuse(items, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'task.notes', weight: 0.2 },
        { name: 'milestone.notes', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [data]);

  const results = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query]);

  const startSearch = useCallback(() => {
    setIsSearching(true);
    setQuery('');
  }, []);

  const cancelSearch = useCallback(() => {
    setIsSearching(false);
    setQuery('');
  }, []);

  return { query, setQuery, results, isSearching, startSearch, cancelSearch };
}
