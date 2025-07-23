import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value, delaying updates until after the specified delay period
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 750ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 750): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}