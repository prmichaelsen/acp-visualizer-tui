import React, { useMemo } from 'react';
import { Text, Box } from 'ink';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    try {
      const marked = new Marked(markedTerminal() as unknown as Record<string, unknown>);
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <Box flexDirection="column">
      <Text>{rendered}</Text>
    </Box>
  );
}
