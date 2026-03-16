import React from 'react';
import { Box, Text } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { StatusBadge } from './StatusBadge.js';
import { ProgressBar } from './ProgressBar.js';
import { MentionText } from './MentionText.js';

interface DashboardProps {
  data: ProgressData;
}

export function Dashboard({ data }: DashboardProps) {
  const { project, milestones, next_steps, current_blockers } = data;

  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in_progress').length;
  const notStarted = milestones.filter((m) => m.status === 'not_started').length;

  const currentMilestone = milestones.find((m) => m.id === project.current_milestone);

  return (
    <Box flexDirection="column" gap={1}>
      {/* Project Info */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Project</Text>
        <Text>
          {project.name} <Text dimColor>v{project.version}</Text>
        </Text>
        <Box gap={2}>
          <StatusBadge status={project.status} />
          <Text dimColor>Started: {project.started || 'N/A'}</Text>
        </Box>
        <ProgressBar percent={data.progress.overall} label="Progress:" />
        {currentMilestone && (
          <Text>
            Current: <Text bold>{currentMilestone.name}</Text>
          </Text>
        )}
      </Box>

      {/* Milestone Summary */}
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Milestones</Text>
        <Box gap={3}>
          <Text color="green">✓ Completed: {completed}</Text>
          <Text color="cyan">● In Progress: {inProgress}</Text>
          <Text dimColor>○ Not Started: {notStarted}</Text>
        </Box>
      </Box>

      {/* Blockers */}
      {current_blockers.length > 0 && (
        <Box flexDirection="column" borderStyle="single" paddingX={1}>
          <Text bold color="red"> Blockers</Text>
          {current_blockers.map((b, i) => (
            <MentionText key={i} color="red">{`  • ${b}`}</MentionText>
          ))}
        </Box>
      )}

      {/* Next Steps */}
      {next_steps.length > 0 && (
        <Box flexDirection="column" borderStyle="single" paddingX={1}>
          <Text bold> Next Steps</Text>
          {next_steps.map((step, i) => (
            <MentionText key={i}>{`  ${i + 1}. ${step}`}</MentionText>
          ))}
        </Box>
      )}
    </Box>
  );
}
