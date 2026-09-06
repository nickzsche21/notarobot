"use client";

import { useEffect, useRef, useState } from "react";
import { judgeIdle } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

/** Level 5. Stillness is the tell. Nobody can actually sit still. */
export default function Idle({ onDone }: ChallengeProps) {
  const [left, setLeft] = useState(7.0);
  const moves = useRef(0);
  const drift = useRef(0);
  const prev = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      moves.current++;
      if (prev.current)
        drift.current += Math.hypot(e.clientX - prev.current.x, e.clientY - prev.current.y);
      prev.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);

    const started = performance.now();
    const id = setInterval(() => {
      const remaining = 7 - (performance.now() - started) / 1000;
      if (remaining <= 0) {
        clearInterval(id);
        setLeft(0);
        if (done.current) return;
        done.current = true;
        onDone({
          signals: judgeIdle(moves.current, drift.current),
          remark: `idle window closed — ${Math.round(drift.current)}px of drift`,
        });
      } else setLeft(remaining);
    }, 60);

    return () => {
      clearInterval(id);
      window.removeEventListener("mousemove", onMove);
    };
  }, [onDone]);

  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3">
      <div className="mono text-6xl tabular-nums" style={{ color: "var(--accent)" }}>
        {left.toFixed(1)}
      </div>
      <p className="mono text-[11px]" style={{ color: "var(--muted)" }}>
        {moves.current === 0
          ? "no movement detected. concerning."
          : `${moves.current} micro-movements logged`}
      </p>
    </div>
  );
}
