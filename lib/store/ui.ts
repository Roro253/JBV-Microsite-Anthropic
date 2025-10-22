"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ExplorerInvestorMode = "explorer" | "investor" | "intelligence";

export type SimulatorScenario = {
  entryValuation: number; // billions in USD
  ownershipPct: number; // percent
  dilutionFollowOn: number; // percent
  exitValuation: number; // billions in USD
  years: number;
};

export type SimulatorState = {
  current: SimulatorScenario;
  comparison?: SimulatorScenario;
  compareEnabled: boolean;
};

interface UIState {
  mode: ExplorerInvestorMode;
  simulator: SimulatorState;
  setMode: (mode: ExplorerInvestorMode) => void;
  updateScenario: <K extends keyof SimulatorScenario>(key: K, value: SimulatorScenario[K]) => void;
  setScenario: (scenario: SimulatorScenario) => void;
  toggleComparison: (enabled?: boolean) => void;
  snapshotComparison: () => void;
  resetComparison: () => void;
}

const defaultScenario: SimulatorScenario = {
  entryValuation: 183,
  ownershipPct: 0.8,
  dilutionFollowOn: 10,
  exitValuation: 420,
  years: 5
};

const initialState: SimulatorState = {
  current: defaultScenario,
  comparison: undefined,
  compareEnabled: false
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mode: "explorer",
      simulator: initialState,
      setMode: (mode) => set({ mode }),
      updateScenario: (key, value) =>
        set((state) => ({
          simulator: {
            ...state.simulator,
            current: {
              ...state.simulator.current,
              [key]: value
            }
          }
        })),
      setScenario: (scenario) =>
        set((state) => ({
          simulator: {
            ...state.simulator,
            current: scenario
          }
        })),
      toggleComparison: (enabled) =>
        set((state) => ({
          simulator: {
            ...state.simulator,
            compareEnabled:
              typeof enabled === "boolean" ? enabled : !state.simulator.compareEnabled
          }
        })),
      snapshotComparison: () =>
        set((state) => ({
          simulator: {
            ...state.simulator,
            comparison: state.simulator.current,
            compareEnabled: true
          }
        })),
      resetComparison: () =>
        set((state) => ({
          simulator: {
            ...state.simulator,
            comparison: undefined,
            compareEnabled: false
          }
        }))
    }),
    {
      name: "ui-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        simulator: state.simulator
      })
    }
  )
);

export const getDefaultScenario = () => defaultScenario;
