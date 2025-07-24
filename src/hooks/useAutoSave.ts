import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  error: string | null;
  save: () => Promise<void>;
}

/**
 * Custom hook that auto-saves data with debouncing and status tracking
 * @param data - The data to auto-save
 * @param onSave - Function that performs the save operation
 * @param delay - Debounce delay in milliseconds (default: 750ms)
 * @param enabled - Whether auto-save is enabled (default: true)
 * @returns Object with save status, error, and manual save function
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 750,
  enabled = true
}: UseAutoSaveProps<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const debouncedData = useDebounce(data, delay);
  const initialRender = useRef(true);
  const lastSavedData = useRef<T | undefined>(undefined);

  // Manual save function
  const save = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    try {
      setStatus('saving');
      setError(null);
      await onSave(data);
      lastSavedData.current = data;
      setStatus('saved');

      // Reset to idle after showing 'saved' status for 2 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setStatus('error');
    }
  }, [enabled, onSave, data]);

  // Auto-save effect triggered by debounced data changes
  useEffect(() => {
    // Skip on initial render to avoid saving initial data
    if (initialRender.current) {
      initialRender.current = false;
      lastSavedData.current = debouncedData;
      return;
    }

    // Skip if disabled or data hasn't changed
    if (!enabled || JSON.stringify(debouncedData) === JSON.stringify(lastSavedData.current)) {
      return;
    }

    save();
  }, [debouncedData, enabled, save]);

  return {
    status,
    error,
    save
  };
}