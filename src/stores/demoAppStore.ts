import { create } from 'zustand';
import type { BusinessType, DemoData } from '@shared/types';
import { mockDemoData } from '@shared/demo-mock-data';
interface DemoAppState {
  businessType: BusinessType | null;
  data: DemoData | null;
  setBusinessType: (type: BusinessType) => void;
  resetDemo: () => void;
}
export const useDemoAppStore = create<DemoAppState>((set) => ({
  businessType: null,
  data: null,
  setBusinessType: (type) => {
    set({
      businessType: type,
      data: mockDemoData[type] || null,
    });
  },
  resetDemo: () => {
    set({
      businessType: null,
      data: null,
    });
  },
}));