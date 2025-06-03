// frontend/src/hooks/useDebounce.ts
import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------
 *  useDebounce (значение)
 * ------------------------------------------------------------------
 *    const valueDebounced = useDebounce(value, 800);
 * ------------------------------------------------------------------ */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/* ------------------------------------------------------------------
 *  useDebouncedCallback (функция)
 * ------------------------------------------------------------------
 *    const save = useDebouncedCallback(doAutosave, 800);
 *    save(draftData);
 * ------------------------------------------------------------------ */
export function useDebouncedCallback<F extends (...args: any[]) => void>(
  fn: F,
  delay = 500,
) {
  const timer = useRef<number>();

  // сохраняем ссылку на актуальную функцию
  const fnRef = useRef<F>(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const callback = useCallback(
    (...args: Parameters<F>) => {
      cancel();
      timer.current = window.setTimeout(() => fnRef.current(...args), delay);
    },
    [delay, cancel],
  );

  return [callback, cancel] as const;
}
