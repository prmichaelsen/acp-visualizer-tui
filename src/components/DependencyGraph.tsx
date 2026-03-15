import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProgressData } from '../lib/types.js';
import { buildGraphData } from '../lib/chart-utils.js';
import type { GraphNode, GraphEdge } from '../lib/chart-utils.js';

interface DependencyGraphProps {
  data: ProgressData;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'green',
  in_progress: 'cyan',
  not_started: 'gray',
};

const STATUS_DOTS: Record<string, string> = {
  completed: '✓',
  in_progress: '●',
  not_started: '○',
};

interface LayoutNode extends GraphNode {
  col: number;
  row: number;
}

function layoutGraph(nodes: GraphNode[], edges: GraphEdge[], data: ProgressData): LayoutNode[] {
  // Simple layout: group tasks by milestone, stack vertically
  const layoutNodes: LayoutNode[] = [];
  let row = 0;

  for (const milestone of data.milestones) {
    const milestoneTasks = (data.tasks[milestone.id] || []);
    for (let i = 0; i < milestoneTasks.length; i++) {
      const task = milestoneTasks[i];
      const node = nodes.find((n) => n.id === task.id);
      if (node) {
        layoutNodes.push({
          ...node,
          col: 0,
          row,
        });
        row++;
      }
    }
  }

  return layoutNodes;
}

export function DependencyGraph({ data }: DependencyGraphProps) {
  const { nodes, edges } = useMemo(() => buildGraphData(data), [data]);
  const layoutNodes = useMemo(() => layoutGraph(nodes, edges, data), [nodes, edges, data]);

  const [scrollOffset, setScrollOffset] = useState(0);
  const visibleRows = 20;

  useInput((input, key) => {
    if (input === 'j' || key.downArrow) {
      setScrollOffset((s) => Math.min(s + 1, Math.max(0, layoutNodes.length - visibleRows)));
    } else if (input === 'k' || key.upArrow) {
      setScrollOffset((s) => Math.max(s - 1, 0));
    }
  });

  if (layoutNodes.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold> Dependency Graph</Text>
        <Text dimColor>No tasks found.</Text>
      </Box>
    );
  }

  // Group by milestone for visual separation
  let currentMilestone = '';
  const visible = layoutNodes.slice(scrollOffset, scrollOffset + visibleRows);

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold> Dependency Graph</Text>
        <Text dimColor>Task dependencies (sequential within milestones, linked across)</Text>
        <Text />

        {visible.map((node, i) => {
          const absoluteIdx = scrollOffset + i;
          const showMilestoneHeader = node.milestone !== currentMilestone;
          if (showMilestoneHeader) currentMilestone = node.milestone;

          const color = STATUS_COLORS[node.status] || 'gray';
          const dot = STATUS_DOTS[node.status] || '?';

          // Check if there's an edge from previous node
          const prevNode = absoluteIdx > 0 ? layoutNodes[absoluteIdx - 1] : null;
          const hasIncoming = prevNode ? edges.some((e) => e.from === prevNode.id && e.to === node.id) : false;
          const hasOutgoing = absoluteIdx < layoutNodes.length - 1 &&
            edges.some((e) => e.from === node.id && e.to === layoutNodes[absoluteIdx + 1]?.id);

          // Cross-milestone edge?
          const isCrossMilestone = prevNode && hasIncoming &&
            nodes.find((n) => n.id === prevNode.id)?.milestone !== node.milestone;

          return (
            <React.Fragment key={node.id}>
              {showMilestoneHeader && (
                <Box marginTop={absoluteIdx === 0 ? 0 : 1}>
                  <Text bold dimColor>{'  '}{node.milestone}</Text>
                </Box>
              )}
              {isCrossMilestone && (
                <Text dimColor>{'      '}╰{'─'.repeat(3)}╮</Text>
              )}
              <Box>
                <Text>{'  '}</Text>
                {hasIncoming && !isCrossMilestone ? (
                  <Text dimColor>{'  │ '}</Text>
                ) : isCrossMilestone ? (
                  <Text dimColor>{'  ╰▶'}</Text>
                ) : (
                  <Text>{'    '}</Text>
                )}
                <Text color={color}>┌{'─'.repeat(node.width)}┐</Text>
              </Box>
              <Box>
                <Text>{'  '}</Text>
                <Text>{'    '}</Text>
                <Text color={color}>│</Text>
                <Text color={color}>{dot} </Text>
                <Text>{node.label.padEnd(node.width - 2)}</Text>
                <Text color={color}>│</Text>
              </Box>
              <Box>
                <Text>{'  '}</Text>
                {hasOutgoing ? (
                  <Text dimColor>{'  │ '}</Text>
                ) : (
                  <Text>{'    '}</Text>
                )}
                <Text color={color}>└{'─'.repeat(node.width)}┘</Text>
              </Box>
              {hasOutgoing && !isCrossMilestone && (
                <Text dimColor>{'      '}│</Text>
              )}
            </React.Fragment>
          );
        })}

        <Text />
        <Box gap={3}>
          <Text color="green">✓ Completed</Text>
          <Text color="cyan">● In Progress</Text>
          <Text dimColor>○ Not Started</Text>
        </Box>
        {layoutNodes.length > visibleRows && (
          <Text dimColor>
            Showing {scrollOffset + 1}-{Math.min(scrollOffset + visibleRows, layoutNodes.length)} of {layoutNodes.length} · j/k to scroll
          </Text>
        )}
      </Box>
    </Box>
  );
}
