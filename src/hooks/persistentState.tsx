import React, { useEffect, useState } from 'react';

export default function usePersistentState<S>(
  initialState: S | (() => S),
  key: string
): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [value, setValue] = useState<S>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue ? JSON.parse(stickyValue) : initialState;
  });

  useEffect(() => {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
