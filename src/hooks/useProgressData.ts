import { useState, useCallback } from 'react';
import fs from 'node:fs';
import { parseProgressYaml } from '../lib/yaml-loader.js';
import type { ProgressData } from '../lib/types.js';

interface UseProgressDataResult {
  data: ProgressData | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useProgressData(filePath: string): UseProgressDataResult {
  const [state, setState] = useState<{
    data: ProgressData | null;
    error: string | null;
    loading: boolean;
  }>(() => {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return { data: parseProgressYaml(raw), error: null, loading: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { data: null, error: msg, loading: false };
    }
  });

  const reload = useCallback(() => {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = parseProgressYaml(raw);
      setState({ data, error: null, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ data: prev.data, error: msg, loading: false }));
    }
  }, [filePath]);

  return { ...state, reload };
}
