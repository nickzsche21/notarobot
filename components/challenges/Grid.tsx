"use client";

import { useRef, useState } from "react";
import { judgeReaction, type Signal } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

/** Level 2. A real CAPTCHA grid, except the category is not a category. */
const TILES = [
  "a voicemail you never returned",
  "the gym, january",
  "2019",
  "an unsent draft",
  "someone's last message",
  "the group chat you left",
  "a plant you named",
  "the good knife you lost",
  "sunday, 4pm",
];

export default function Grid({ onDone }: ChallengeProps) {
  const start = useRef(Date.now());
  const [picked, setPicked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function submit() {
    const ms = Date.now() - start.current;
    const n = picked.size;
    const signals: Signal[] = [...judgeReaction(ms)];

    if (n === 0)
      signals.push({ label: "you selected nothing. denial is very human", delta: 16 });
    else if (n === 9)
      signals.push({ label: "you selected all nine. oh.", delta: 24 });
    else if (n <= 2)
      signals.push({ label: `${n} selected — economical with the past`, delta: 8 });
    else signals.push({ label: `${n} selected — a normal amount of history`, delta: 12 });

    onDone({ signals, remark: `regret grid: ${n}/9 squares` });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {TILES.map((t, i) => {
          const on = picked.has(i);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(i)}
              className="relative aspect-square overflow-hidden rounded-sm p-2 text-left text-[10px] leading-tight transition-all"
              style={{
                background: on ? "var(--accent)" : "var(--line)",
                color: on ? "white" : "var(--muted)",
                outline: on ? "3px solid var(--paper)" : "none",
                outlineOffset: "-3px",
              }}
            >
              <span className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,#000 0 2px,transparent 2px 5px)",
                }}
              />
              <span className="relative">{t}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={submit}
        className="w-full rounded-sm py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)" }}
      >
        Verify
      </button>
    </div>
  );
}
