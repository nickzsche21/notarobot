"use client";

import { useRef, useState } from "react";
import { judgeReaction } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

/** Level 1. Looks like the real thing. Runs away twice, then relents. */
export default function Checkbox({ onDone }: ChallengeProps) {
  const start = useRef(Date.now());
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [checked, setChecked] = useState(false);

  function dodge() {
    if (dodges >= 2) return;
    setDodges((d) => d + 1);
    setOffset({
      x: (Math.random() - 0.5) * 180,
      y: (Math.random() - 0.5) * 60,
    });
  }

  function commit() {
    if (dodges < 2) return dodge();
    setChecked(true);
    const ms = Date.now() - start.current;
    setTimeout(
      () =>
        onDone({
          signals: judgeReaction(ms),
          remark: `checkbox acquired after ${dodges} evasions`,
        }),
      450
    );
  }

  return (
    <div className="flex h-48 items-center justify-center">
      <div
        className="flex items-center gap-3 rounded border bg-white/60 px-4 py-3 transition-transform duration-200"
        style={{
          borderColor: "var(--line)",
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        onMouseEnter={dodge}
      >
        <button
          type="button"
          onClick={commit}
          aria-label="I am not a robot"
          className="grid h-6 w-6 place-items-center rounded-sm border-2 transition-colors"
          style={{
            borderColor: checked ? "var(--accent)" : "var(--muted)",
            background: checked ? "var(--accent)" : "transparent",
          }}
        >
          {checked && (
            <svg viewBox="0 0 16 16" className="h-4 w-4 stroke-white" fill="none" strokeWidth="2.5">
              <path d="M3 8.5l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <span className="text-sm select-none" style={{ color: "var(--ink)" }}>
          {dodges === 0 && "I'm not a robot"}
          {dodges === 1 && "I'm not a robot (are you sure)"}
          {dodges >= 2 && !checked && "fine. click it."}
          {checked && "noted."}
        </span>
      </div>
    </div>
  );
}
