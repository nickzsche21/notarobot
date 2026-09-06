"use client";

import { useEffect, useRef } from "react";
import { GameProvider, useGame } from "@/lib/store";
import { paletteFor } from "@/lib/humanity";
import { CHALLENGES } from "@/lib/challenges";
import Meter from "./Meter";
import Verdict from "./Verdict";
import Checkbox from "./challenges/Checkbox";
import Grid from "./challenges/Grid";
import Wobble from "./challenges/Wobble";
import Typing from "./challenges/Typing";
import Idle from "./challenges/Idle";
import { Trolley, Pain } from "./challenges/Choice";
import FinalTwist from "./challenges/FinalTwist";
import type { ChallengeProps } from "@/lib/types";

const REGISTRY: Record<string, React.ComponentType<ChallengeProps>> = {
  checkbox: Checkbox,
  grid: Grid,
  wobble: Wobble,
  typing: Typing,
  idle: Idle,
  trolley: Trolley,
  pain: Pain,
  final: FinalTwist,
};

function Inner() {
  const { state, resolve, reset } = useGame();
  const logRef = useRef<HTMLDivElement>(null);
  const challenge = CHALLENGES[state.index];
  const Active = challenge ? REGISTRY[challenge.id] : null;

  // Drives the palette from "official widget" to "interrogation room".
  const pal = paletteFor(state.humanity);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [state.log.length]);

  return (
    <div
      className="stage flex min-h-dvh flex-col items-center justify-center gap-4 p-5"
      style={
        {
          "--paper": pal.paper,
          "--ink": pal.ink,
          "--muted": pal.muted,
          "--line": pal.line,
          "--accent": pal.accent,
          background: pal.paper,
          color: pal.ink,
        } as React.CSSProperties
      }
    >
      <div
        key={state.index}
        className="w-full max-w-sm space-y-4 rounded-lg border p-5 shadow-sm shake"
        style={{
          borderColor: "var(--line)",
          background: "var(--paper)",
          boxShadow: "0 1px 3px rgb(0 0 0 / 0.08)",
        }}
      >
        <header className="flex items-center justify-between">
          <div className="mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--muted)" }}>
            human verification
          </div>
          <div className="mono text-[10px] tabular-nums"
            style={{ color: "var(--muted)" }}>
            {Math.min(state.index + 1, CHALLENGES.length)}/{CHALLENGES.length}
          </div>
        </header>

        <Meter humanity={state.humanity} flash={state.lastDelta} />

        {state.finished || !Active ? (
          <Verdict humanity={state.humanity} onReset={reset} />
        ) : (
          <>
            <div>
              <h1 className="text-[15px] font-medium leading-snug">{challenge.prompt}</h1>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                {challenge.hint}
              </p>
            </div>
            <Active onDone={resolve} />
          </>
        )}
      </div>

      {state.log.length > 0 && (
        <div
          ref={logRef}
          className="mono h-28 w-full max-w-sm overflow-y-auto rounded-md border p-3 text-[10px] leading-relaxed"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          {state.log.map((l, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 opacity-40">L{l.level}</span>
              <span className="flex-1">{l.text}</span>
              {l.delta !== 0 && (
                <span
                  className="shrink-0 tabular-nums"
                  style={{ color: l.delta > 0 ? "#16a34a" : "#dc2626" }}
                >
                  {l.delta > 0 ? "+" : ""}
                  {l.delta.toFixed(0)}
                </span>
              )}
            </div>
          ))}
          <div className="caret opacity-50" />
        </div>
      )}
    </div>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <Inner />
    </GameProvider>
  );
}
