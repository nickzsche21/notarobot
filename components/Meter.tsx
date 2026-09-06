"use client";

/** The suspicion meter. Fills toward red as your humanity drains. */
export default function Meter({ humanity, flash }: { humanity: number; flash: number }) {
  const suspicion = 100 - humanity;
  return (
    <div className="space-y-1.5">
      <div className="mono flex items-baseline justify-between text-[10px] uppercase tracking-widest"
        style={{ color: "var(--muted)" }}>
        <span>suspicion</span>
        <span className="tabular-nums">
          {suspicion.toFixed(0)}%
          {flash !== 0 && (
            <span style={{ color: flash > 0 ? "#16a34a" : "#dc2626" }}>
              {" "}{flash > 0 ? "−" : "+"}{Math.abs(flash).toFixed(0)}
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--line)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${suspicion}%`,
            background: `linear-gradient(90deg, var(--accent), ${
              suspicion > 60 ? "#dc2626" : "var(--accent)"
            })`,
          }}
        />
      </div>
    </div>
  );
}
