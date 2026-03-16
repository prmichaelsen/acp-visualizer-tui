import { useState, useCallback } from 'react';
import fs from 'node:fs';
import { parseProgressYaml } from '../lib/yaml-loader.js';
import type { ProgressData, SchemaVersion } from '../lib/types.js';

interface UseProgressDataResult {
  data: ProgressData | null;
  error: string | null;
  loading: boolean;
  schemaVersion: SchemaVersion | null;
  warnings: string[];
  reload: () => void;
}

export function useProgressData(filePath: string): UseProgressDataResult {
  const [state, setState] = useState<{
    data: ProgressData | null;
    error: string | null;
    loading: boolean;
    schemaVersion: SchemaVersion | null;
    warnings: string[];
  }>(() => {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const result = parseProgressYaml(raw);
      return { data: result.data, error: null, loading: false, schemaVersion: result.schemaVersion, warnings: result.warnings };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { data: null, error: msg, loading: false, schemaVersion: null, warnings: [] };
    }
  });

  const reload = useCallback(() => {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const result = parseProgressYaml(raw);
      setState({ data: result.data, error: null, loading: false, schemaVersion: result.schemaVersion, warnings: result.warnings });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ data: prev.data, error: msg, loading: false, schemaVersion: prev.schemaVersion, warnings: prev.warnings }));
    }
  }, [filePath]);

  return { ...state, reload };
}
