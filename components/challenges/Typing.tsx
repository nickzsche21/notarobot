"use client";

import { useRef, useState } from "react";
import { coefficientOfVariation, judgeTyping } from "@/lib/humanity";
import type { ChallengeProps } from "@/lib/types";

const TARGET = "the sixth sick sheikh's sixth sheep's sick";

/** Level 4. Rewards typos. Punishes perfection and metronomic rhythm. */
export default function Typing({ onDone }: ChallengeProps) {
  const gaps = useRef<number[]>([]);
  const last = useRef<number | null>(null);
  const [value, setValue] = useState("");
  const [pasted, setPasted] = useState(false);

  function onKey() {
    const now = performance.now();
    if (last.current !== null) gaps.current.push(now - last.current);
    last.current = now;
  }

  function submit() {
    const signals = judgeTyping(value, TARGET, gaps.current);
    if (pasted)
      signals.push({ label: "you pasted it. we saw that.", delta: -35 });
    onDone({ signals, remark: `transcription submitted (${value.length} chars)` });
  }

  const cv = coefficientOfVariation(gaps.current);

  return (
    <div className="space-y-3">
      <div
        className="mono rounded-sm border px-3 py-3 text-sm select-none"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--line) 30%, transparent)" }}
      >
        {TARGET}
      </div>
      <input
        autoFocus
        value={value}
        onKeyDown={onKey}
        onPaste={() => setPasted(true)}
        onChange={(e) => setValue(e.target.value)}
        placeholder="type it badly"
        className="mono w-full rounded-sm border bg-transparent px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>
          rhythm variance {cv.toFixed(2)}
          {gaps.current.length > 6 && cv < 0.15 ? " — inhumanly even" : ""}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={value.length < 8}
          className="rounded-sm px-4 py-1.5 text-sm font-medium text-white disabled:opacity-30"
          style={{ background: "var(--accent)" }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
