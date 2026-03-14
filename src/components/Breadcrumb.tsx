import React from 'react';
import { Text } from 'ink';

interface BreadcrumbItem {
  label: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Text>
      {items.map((item, i) => (
        <Text key={i}>
          {i < items.length - 1 ? (
            <Text dimColor>{item.label} &gt; </Text>
          ) : (
            <Text bold>{item.label}</Text>
          )}
        </Text>
      ))}
    </Text>
  );
}
