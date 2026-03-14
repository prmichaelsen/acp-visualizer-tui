import React from 'react';
import { Text } from 'ink';
import type { Status } from '../lib/types.js';

interface StatusBadgeProps {
  status: Status;
  compact?: boolean;
}

const STATUS_CONFIG: Record<Status, { dot: string; label: string; color: string }> = {
  completed: { dot: '✓', label: 'Completed', color: 'green' },
  in_progress: { dot: '●', label: 'In Progress', color: 'cyan' },
  not_started: { dot: '○', label: 'Not Started', color: 'gray' },
};

export function StatusBadge({ status, compact }: StatusBadgeProps) {
  const { dot, label, color } = STATUS_CONFIG[status];

  if (compact) {
    return <Text color={color}>{dot}</Text>;
  }

  return (
    <Text color={color}>
      {dot} {label}
    </Text>
  );
}
