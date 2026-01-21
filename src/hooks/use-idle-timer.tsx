'use client';

import { useEffect, useRef } from 'react';

type IdleTimerOptions = {
  enabled?: boolean;
};

const useIdleTimer = (
  onIdle: () => void,
  idleTime: number,
  options: IdleTimerOptions = { enabled: true }
) => {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const { enabled } = options;

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (enabled) {
      timeoutId.current = setTimeout(onIdle, idleTime);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      return;
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [onIdle, idleTime, enabled]); // Add enabled to dependency array

  return null;
};

export default useIdleTimer;
