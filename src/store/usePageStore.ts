import { useState, useEffect } from 'react';

const STORAGE_KEY = 'homelab-page-step';

export function usePageStore() {
  const [activeStep, setActiveStepState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(activeStep));
    } catch {
      // localStorage unavailable
    }
  }, [activeStep]);

  return { activeStep, setActiveStep: setActiveStepState };
}
