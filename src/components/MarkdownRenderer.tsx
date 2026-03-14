import React, { useMemo } from 'react';
import { Text, Box, useStdout } from 'ink';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

interface MarkdownRendererProps {
  content: string;
  scrollOffset?: number;
  maxHeight?: number;
}

export function MarkdownRenderer({ content, scrollOffset = 0, maxHeight }: MarkdownRendererProps) {
  const { stdout } = useStdout();
  const termHeight = maxHeight ?? (stdout?.rows ? stdout.rows - 12 : 30);

  const { visibleText, totalLines, atEnd } = useMemo(() => {
    let rendered: string;
    try {
      const marked = new Marked(markedTerminal() as unknown as Record<string, unknown>);
      rendered = (marked.parse(content) as string).trimEnd();
    } catch {
      rendered = content;
    }

    const lines = rendered.split('\n');
    const total = lines.length;
    const clampedOffset = Math.max(0, Math.min(scrollOffset, Math.max(0, total - termHeight)));
    const visible = lines.slice(clampedOffset, clampedOffset + termHeight);
    return {
      visibleText: visible.join('\n'),
      totalLines: total,
      atEnd: clampedOffset + termHeight >= total,
    };
  }, [content, scrollOffset, termHeight]);

  const showScrollHint = totalLines > termHeight;

  return (
    <Box flexDirection="column">
      <Text>{visibleText}</Text>
      {showScrollHint && (
        <Text dimColor>
          {'─ '}
          Lines {scrollOffset + 1}-{Math.min(scrollOffset + termHeight, totalLines)} of {totalLines}
          {atEnd ? ' (end)' : ' (j/k to scroll)'}
        </Text>
      )}
    </Box>
  );
}
