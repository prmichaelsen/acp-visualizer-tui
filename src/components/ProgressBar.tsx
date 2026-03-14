import React from 'react';
import { Text } from 'ink';

interface ProgressBarProps {
  percent: number;
  width?: number;
  label?: string;
}

export function ProgressBar({ percent, width = 20, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  const color = clamped >= 80 ? 'green' : clamped >= 40 ? 'cyan' : 'gray';

  return (
    <Text>
      {label && <Text>{label} </Text>}
      <Text color={color}>{bar}</Text>
      <Text> {clamped}%</Text>
    </Text>
  );
}
