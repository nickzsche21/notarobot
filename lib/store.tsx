"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { applySignals, START_HUMANITY, type Signal } from "./humanity";
import { CHALLENGES } from "./challenges";
import type { ChallengeResult } from "./types";

type LogLine = { level: number; text: string; delta: number };

type State = {
  index: number;
  humanity: number;
  log: LogLine[];
  finished: boolean;
  /** flash the meter when it moves */
  lastDelta: number;
};

type Action = { type: "resolve"; result: ChallengeResult } | { type: "reset" };

const initial: State = {
  index: 0,
  humanity: START_HUMANITY,
  log: [],
  finished: false,
  lastDelta: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initial;
    case "resolve": {
      const { signals, remark } = action.result;
      const humanity = applySignals(state.humanity, signals);
      const delta = humanity - state.humanity;
      const next = state.index + 1;
      return {
        index: next,
        humanity,
        lastDelta: delta,
        finished: next >= CHALLENGES.length,
        log: [
          ...state.log,
          { level: state.index + 1, text: remark, delta },
          ...signals.map((s: Signal) => ({
            level: state.index + 1,
            text: `  ↳ ${s.label}`,
            delta: s.delta,
          })),
        ],
      };
    }
  }
}

const Ctx = createContext<{
  state: State;
  resolve: (r: ChallengeResult) => void;
  reset: () => void;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const resolve = useCallback(
    (result: ChallengeResult) => dispatch({ type: "resolve", result }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const value = useMemo(() => ({ state, resolve, reset }), [state, resolve, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
