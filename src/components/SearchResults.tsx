import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { SearchResult } from '../hooks/useSearch.js';
import { StatusBadge } from './StatusBadge.js';
import type { Milestone, Task } from '../lib/types.js';

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  active: boolean;
  onSelectMilestone?: (milestone: Milestone) => void;
  onSelectTask?: (task: Task) => void;
  onCancel: () => void;
}

export function SearchResults({
  query,
  results,
  active,
  onSelectMilestone,
  onSelectTask,
  onCancel,
}: SearchResultsProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useInput((input, key) => {
    if (!active) return;
    if (key.escape) {
      onCancel();
      return;
    }
    if (input === 'j' || key.downArrow) {
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (key.return && results[selectedIdx]) {
      const r = results[selectedIdx];
      if (r.type === 'milestone' && r.milestone && onSelectMilestone) {
        onSelectMilestone(r.milestone);
      } else if (r.type === 'task' && r.task && onSelectTask) {
        onSelectTask(r.task);
      }
    }
  });

  const milestoneResults = results.filter((r) => r.type === 'milestone');
  const taskResults = results.filter((r) => r.type === 'task');

  let flatIdx = 0;

  return (
    <Box flexDirection="column" gap={1}>
      <Text>
        Search: <Text bold>{query}</Text>
        {query && <Text dimColor> ({results.length} results)</Text>}
      </Text>

      {results.length === 0 && query.trim() && (
        <Text dimColor>No results found.</Text>
      )}

      {milestoneResults.length > 0 && (
        <Box flexDirection="column">
          <Text bold dimColor>Milestones ({milestoneResults.length})</Text>
          {milestoneResults.map((r) => {
            const idx = flatIdx++;
            const m = r.milestone!;
            return (
              <Text key={r.id} bold={idx === selectedIdx} inverse={idx === selectedIdx}>
                {'  '}<StatusBadge status={m.status} compact /> {m.name}
              </Text>
            );
          })}
        </Box>
      )}

      {taskResults.length > 0 && (
        <Box flexDirection="column">
          <Text bold dimColor>Tasks ({taskResults.length})</Text>
          {taskResults.map((r) => {
            const idx = flatIdx++;
            const t = r.task!;
            return (
              <Text key={r.id} bold={idx === selectedIdx} inverse={idx === selectedIdx}>
                {'  '}<StatusBadge status={t.status} compact /> {t.name}
              </Text>
            );
          })}
        </Box>
      )}

      <Text dimColor>j/k:Navigate  Enter:Open  Esc:Cancel</Text>
    </Box>
  );
}
