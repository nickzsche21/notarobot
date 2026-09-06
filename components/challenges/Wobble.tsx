"use client";

import { useRef, useState } from "react";
import { judgeDrag, tortuosity, type Pt } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

/**
 * Level 3. The one that actually catches automation.
 * We record the full pointer path and measure how straight it was.
 */
export default function Wobble({ onDone }: ChallengeProps) {
  const box = useRef<HTMLDivElement>(null);
  const pts = useRef<Pt[]>([]);
  // The guard lives in a ref, not state: a very quick flick can deliver
  // pointerup in the same frame as pointerdown, before a state update commits,
  // and reading stale `false` there would silently swallow the whole gesture.
  const active = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [path, setPath] = useState<Pt[]>([]);
  const [live, setLive] = useState(1);

  const A = { x: 40, y: 130 };
  const B = { x: 280, y: 40 };

  function local(e: React.PointerEvent) {
    const r = box.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
  }

  function down(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pts.current = [local(e)];
    active.current = true;
    setPath(pts.current);
    setDragging(true);
  }

  function move(e: React.PointerEvent) {
    if (!active.current) return;
    pts.current = [...pts.current, local(e)];
    setPath(pts.current);
    if (pts.current.length % 4 === 0) setLive(tortuosity(pts.current));
  }

  function up(e: React.PointerEvent) {
    if (!active.current) return;
    active.current = false;
    setDragging(false);
    const p = local(e);
    const reachedB = Math.hypot(p.x - B.x, p.y - B.y) < 46;
    if (!reachedB) {
      // missed the target — reset, but that miss is itself a human data point
      pts.current = [];
      setPath([]);
      setLive(1);
      return;
    }
    onDone({
      signals: judgeDrag(pts.current),
      remark: `drag logged: ${pts.current.length} samples`,
    });
  }

  const d = path.length
    ? "M " + path.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")
    : "";

  return (
    <div className="space-y-2">
      <div
        ref={box}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        className="relative h-44 w-full cursor-crosshair touch-none rounded-sm border"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 35%, transparent)" }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <line
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 4" opacity="0.4"
          />
          {d && <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        {([["A", A], ["B", B]] as const).map(([label, p]) => (
          <div
            key={label}
            className="mono absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold text-white"
            style={{ left: p.x, top: p.y, background: "var(--accent)" }}
          >
            {label}
          </div>
        ))}
      </div>
      <p className="mono text-[11px]" style={{ color: "var(--muted)" }}>
        {dragging
          ? `tortuosity ${live.toFixed(3)} ${live < 1.05 ? "— TOO STRAIGHT" : "— acceptable"}`
          : "hold and drag. a ruler-straight line will be held against you."}
      </p>
    </div>
  );
}
