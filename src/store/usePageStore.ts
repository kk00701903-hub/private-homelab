import { useState, useEffect } from 'react';

const STORAGE_KEY = 'homelab-page-step';

export function usePageStore() {
  const [activeStep, setActiveStepState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return 0;
      const n = Number(saved);
      // 유효하지 않은 값(NaN, 음수)이면 0으로 초기화
      return Number.isFinite(n) && n >= 0 ? n : 0;
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
