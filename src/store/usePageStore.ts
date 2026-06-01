import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PageStore {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({
      activeStep: 0,
      setActiveStep: (step) => set({ activeStep: step }),
    }),
    {
      name: 'homelab-page',
    }
  )
);
