"use client";

import { useState } from "react";
import { verdictFor } from "@/lib/humanity";

export default function Verdict({
  humanity,
  onReset,
}: {
  humanity: number;
  onReset: () => void;
}) {
  const v = verdictFor(humanity);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/?h=${Math.round(humanity)}`;
    const text = `I scored ${Math.round(humanity)}% human. Verdict: ${v.title}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "NOT A ROBOT", text, url });
        return;
      } catch {
        /* user dismissed the sheet — fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5 text-center">
      <div>
        <div className="mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--muted)" }}>
          verification complete
        </div>
        <div className="mono mt-3 text-7xl font-bold tabular-nums"
          style={{ color: v.tone === "fail" ? "#dc2626" : "var(--accent)" }}>
          {Math.round(humanity)}%
        </div>
        <div className="mono mt-1 text-sm uppercase tracking-widest">{v.title}</div>
      </div>

      <p className="mx-auto max-w-xs text-sm leading-relaxed"
        style={{ color: "var(--muted)" }}>
        {v.blurb}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={share}
          className="flex-1 rounded-sm py-2.5 text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          {copied ? "copied" : "share the accusation"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-sm border px-4 py-2.5 text-sm"
          style={{ borderColor: "var(--line)" }}
        >
          again
        </button>
      </div>
    </div>
  );
}
