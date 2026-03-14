import { useEffect, useRef } from 'react';
import fs from 'node:fs';

export function useWatchMode(
  filePath: string,
  enabled: boolean,
  onReload: () => void,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let watcher: fs.FSWatcher | null = null;

    try {
      watcher = fs.watch(filePath, () => {
        // Debounce: wait 300ms after last change before reloading
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onReload();
        }, 300);
      });

      watcher.on('error', () => {
        // File may have been deleted — keep watching in case it comes back
      });
    } catch {
      // fs.watch not available or file doesn't exist yet
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (watcher) watcher.close();
    };
  }, [filePath, enabled, onReload]);
}
