"use client";

import { useEffect, useState } from "react";
import type { ChallengeProps } from "@/lib/types";

/**
 * Level 8. The form has been "corrected". Complying is the trap.
 * Refusal only becomes available to people who sit with the discomfort.
 */
export default function FinalTwist({ onDone }: ChallengeProps) {
  const [showRefuse, setShowRefuse] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowRefuse(true), 4500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex h-48 flex-col items-center justify-center gap-6">
      <button
        type="button"
        onClick={() =>
          onDone({
            signals: [
              { label: "you confirmed it. we did not even have to ask twice", delta: -40 },
            ],
            remark: "subject complied",
          })
        }
        className="flex items-center gap-3 rounded border px-4 py-3 transition-colors hover:bg-[var(--line)]"
        style={{ borderColor: "var(--line)" }}
      >
        <span
          className="h-6 w-6 rounded-sm border-2"
          style={{ borderColor: "var(--muted)" }}
        />
        <span className="text-sm">I am a robot</span>
      </button>

      <button
        type="button"
        onClick={() =>
          onDone({
            signals: [
              { label: "you refused a direct instruction. nothing is more human", delta: 34 },
            ],
            remark: "subject refused",
          })
        }
        className="mono text-[11px] underline underline-offset-4 transition-opacity duration-1000"
        style={{
          color: "var(--muted)",
          opacity: showRefuse ? 1 : 0,
          pointerEvents: showRefuse ? "auto" : "none",
        }}
      >
        no.
      </button>
    </div>
  );
}
