import { registerPlugin } from '@capacitor/core';

export interface StepCounterPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  getSteps(): Promise<{ steps: number; available: boolean }>;
}

const StepCounter = registerPlugin<StepCounterPlugin>('StepCounter', {
  web: () => ({
    isAvailable: async () => ({ available: false }),
    getSteps: async () => ({ steps: 0, available: false }),
  }),
});

export default StepCounter;
