import React from 'react';
import { Text } from 'ink';
import { highlightMentions } from '../lib/agent-mention.js';

interface MentionTextProps {
  children: string;
  color?: string;
  dimColor?: boolean;
  bold?: boolean;
}

export function MentionText({ children, color, dimColor, bold }: MentionTextProps) {
  const segments = highlightMentions(children);

  return (
    <Text>
      {segments.map((seg, i) =>
        seg.isMention ? (
          <Text key={i} color="magenta" bold>
            {seg.text}
          </Text>
        ) : (
          <Text key={i} color={color} dimColor={dimColor} bold={bold}>
            {seg.text}
          </Text>
        ),
      )}
    </Text>
  );
}
