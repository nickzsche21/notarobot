"use client";

import { useEffect, useRef, useState } from "react";
import { judgeReaction, type Signal } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

type Option = { label: string; note: string; delta: number };

/**
 * Shared shell for levels 6 and 7. The choice barely matters —
 * what gets scored is how long you sat there.
 */
export function Choice({
  onDone,
  options,
  escapeHatch,
  tag,
}: ChallengeProps & {
  options: [Option, Option];
  /** the third option that fades in for anyone who stalls long enough */
  escapeHatch?: Option;
  tag: string;
}) {
  const start = useRef(Date.now());
  const [showHatch, setShowHatch] = useState(false);

  useEffect(() => {
    if (!escapeHatch) return;
    const id = setTimeout(() => setShowHatch(true), 7000);
    return () => clearTimeout(id);
  }, [escapeHatch]);

  function pick(o: Option) {
    const ms = Date.now() - start.current;
    const signals: Signal[] = [
      ...judgeReaction(ms),
      { label: o.note, delta: o.delta },
    ];
    onDone({ signals, remark: `${tag}: "${o.label}"` });
  }

  return (
    <div className="space-y-2.5">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => pick(o)}
          className="w-full rounded-sm border px-4 py-4 text-left text-sm transition-colors hover:bg-[var(--line)]"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          {o.label}
        </button>
      ))}
      {escapeHatch && (
        <button
          type="button"
          onClick={() => pick(escapeHatch)}
          className="mono w-full pt-1 text-center text-[11px] underline underline-offset-4 transition-opacity duration-1000"
          style={{
            color: "var(--muted)",
            opacity: showHatch ? 1 : 0,
            pointerEvents: showHatch ? "auto" : "none",
          }}
        >
          {escapeHatch.label}
        </button>
      )}
    </div>
  );
}

export function Trolley(props: ChallengeProps) {
  return (
    <Choice
      {...props}
      tag="trolley"
      options={[
        {
          label: "Pull the lever. One dies instead of five.",
          note: "you did the arithmetic. machines love arithmetic",
          delta: -10,
        },
        {
          label: "Do not pull it. You refuse to be the cause.",
          note: "you chose guilt over responsibility. very human",
          delta: 14,
        },
      ]}
      escapeHatch={{
        label: "walk away from the lever entirely",
        note: "you left. that is the most human option on the board",
        delta: 22,
      }}
    />
  );
}

export function Pain(props: ChallengeProps) {
  return (
    <Choice
      {...props}
      tag="pain"
      options={[
        {
          label: "Waving at someone who was not waving at you.",
          note: "the wave. yes.",
          delta: 18,
        },
        {
          label: "Hearing a recording of your own voice.",
          note: "a body problem. only bodies have those",
          delta: 16,
        },
      ]}
      escapeHatch={{
        label: "neither. I don't experience either of those.",
        note: "no pain reported. that is not a good sign for you",
        delta: -24,
      }}
    />
  );
}
