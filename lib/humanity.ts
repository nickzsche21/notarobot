/**
 * The detection engine.
 *
 * Everything here answers one question: does this input look like it came from
 * a body? Bodies are noisy. They overshoot, they drift, they hesitate for
 * reasons they can't articulate. Machines are clean.
 *
 * So every metric below rewards mess and punishes precision.
 */

export type Pt = { x: number; y: number; t: number };

export type Signal = {
  label: string;
  /** positive = looks human, negative = looks synthetic */
  delta: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Path length divided by straight-line distance.
 * A ruler-straight drag scores 1.0. A human hand wanders: 1.05 - 1.4.
 */
export function tortuosity(pts: Pt[]): number {
  if (pts.length < 2) return 1;
  let travelled = 0;
  for (let i = 1; i < pts.length; i++) {
    travelled += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  const direct = Math.hypot(
    pts[pts.length - 1].x - pts[0].x,
    pts[pts.length - 1].y - pts[0].y
  );
  if (direct < 1) return 1;
  return travelled / direct;
}

/**
 * Mean absolute heading change per segment, in radians. Tremor, basically.
 * Interpolated/scripted movement holds a heading; a hand cannot.
 */
export function angularJitter(pts: Pt[]): number {
  if (pts.length < 3) return 0;
  const headings: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    if (Math.hypot(dx, dy) < 0.5) continue; // ignore sub-pixel noise
    headings.push(Math.atan2(dy, dx));
  }
  if (headings.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < headings.length; i++) {
    let d = headings[i] - headings[i - 1];
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    sum += Math.abs(d);
  }
  return sum / (headings.length - 1);
}

/**
 * Coefficient of variation: stddev / mean.
 * A metronome scores ~0. Human keystroke rhythm lands around 0.3 - 0.8.
 */
export function coefficientOfVariation(gaps: number[]): number {
  const clean = gaps.filter((g) => Number.isFinite(g) && g > 0);
  if (clean.length < 2) return 0;
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  if (mean === 0) return 0;
  const variance =
    clean.reduce((a, b) => a + (b - mean) ** 2, 0) / clean.length;
  return Math.sqrt(variance) / mean;
}

/** Levenshtein distance — used to count how badly you fumbled the typing test. */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i, ...new Array<number>(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

/* ------------------------------------------------------------------ */
/* Scorers — each returns signals that get folded into the meter        */
/* ------------------------------------------------------------------ */

/**
 * Reaction time. Sub-200ms is inhuman.
 *
 * The upper bound matters as much as the lower one: without it, walking away
 * from the keyboard would be the optimal move on every timed level. A process
 * that sits idle for half a minute is a sleeping script, not a hesitant person.
 */
export function judgeReaction(ms: number): Signal[] {
  const s = (ms / 1000).toFixed(1);
  if (ms < 180)
    return [{ label: `reacted in ${ms}ms — no nerve is that short`, delta: -22 }];
  if (ms < 400)
    return [{ label: `${ms}ms reaction — suspiciously sharp`, delta: -8 }];
  if (ms > 25000)
    return [{ label: `idle ${s}s — that is a sleep() call, not a thought`, delta: -18 }];
  if (ms > 6000)
    return [{ label: `${s}s — you dissociated. very human`, delta: 14 }];
  if (ms > 1200)
    return [{ label: `hesitated for ${s}s`, delta: 12 }];
  return [{ label: `${ms}ms — plausibly meaty`, delta: 6 }];
}

/** Mouse drag quality. Straight lines are the single loudest robot tell. */
export function judgeDrag(pts: Pt[]): Signal[] {
  const t = tortuosity(pts);
  const j = angularJitter(pts);
  const out: Signal[] = [];

  if (t < 1.02) out.push({ label: "your line was geometrically perfect", delta: -30 });
  else if (t < 1.08) out.push({ label: `tortuosity ${t.toFixed(3)} — too clean`, delta: -12 });
  else if (t > 2.2) out.push({ label: "you drew a hurricane. deeply human", delta: 20 });
  else out.push({ label: `tortuosity ${t.toFixed(3)} — acceptable wobble`, delta: 15 });

  if (j < 0.05) out.push({ label: "zero tremor detected", delta: -18 });
  else if (j > 0.35) out.push({ label: "hand tremor confirmed", delta: 12 });

  return out;
}

/** Typing. Getting it right is the wrong answer. */
export function judgeTyping(typed: string, target: string, gaps: number[]): Signal[] {
  const errors = editDistance(typed.trim(), target.trim());
  const cv = coefficientOfVariation(gaps);
  const out: Signal[] = [];

  if (errors === 0)
    out.push({ label: "flawless transcription. nobody does that", delta: -28 });
  else if (errors <= 4)
    out.push({ label: `${errors} typo${errors > 1 ? "s" : ""} — beautifully fallible`, delta: 20 });
  else
    out.push({ label: `${errors} errors — either human or not trying`, delta: 8 });

  if (cv < 0.15) out.push({ label: "keystroke rhythm was metronomic", delta: -24 });
  else if (cv > 0.45) out.push({ label: `rhythm variance ${cv.toFixed(2)} — chaotic, good`, delta: 16 });
  else out.push({ label: `rhythm variance ${cv.toFixed(2)}`, delta: 4 });

  return out;
}

/** Idling. Perfect stillness is a screensaver, not a person. */
export function judgeIdle(moves: number, drift: number): Signal[] {
  if (moves === 0)
    return [{ label: "you did not move once. corpses do that", delta: -26 }];
  if (drift > 400)
    return [{ label: "you fidgeted relentlessly. extremely human", delta: 18 }];
  return [{ label: `${moves} micro-movements while idle`, delta: 14 }];
}

/* ------------------------------------------------------------------ */

export const START_HUMANITY = 50;

/**
 * Gains get harder the more human you already look; losses land at full force.
 *
 * Without the asymmetry, anyone who simply picks the obviously-human option at
 * every level tops out at exactly 100 and every shared score reads the same.
 * The 110 denominator makes a perfect score asymptotic — reachable in principle,
 * never in practice — so the number on the share card is worth arguing about.
 */
export function applySignals(current: number, signals: Signal[]): number {
  let v = current;
  for (const s of signals) {
    v += s.delta >= 0 ? s.delta * (1 - v / 110) : s.delta;
  }
  return clamp(v, 0, 100);
}

/**
 * How corrupted the interface should look, 0 → 1.
 * Stays at 0 while you are passing: the room only darkens once suspicion
 * crosses half, so the decay reads as a consequence rather than a theme.
 */
export function dreadFor(humanity: number): number {
  return clamp((50 - humanity) / 50, 0, 1);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgb = (r: number, g: number, b: number) =>
  `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

export type Palette = {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
};

/**
 * Single source of truth for the palette, shared by the live UI and the OG card
 * so a share image always matches the room the player was actually sitting in.
 *
 * Background and text invert over a deliberately NARROW band around dread 0.5.
 * A slow symmetric crossfade would drag both through mid-grey at the same time,
 * where nothing has contrast against anything; snapping through instead keeps
 * text legible at every score and makes the room flip like a light switch the
 * moment suspicion takes over.
 */
export function paletteFor(humanity: number): Palette {
  const d = dreadFor(humanity);
  const flip = clamp((d - 0.46) / 0.08, 0, 1);

  // pre-flip the surface cools off slightly; post-flip it is properly dark
  const paper = lerp(lerp(246, 231, d), 14, flip);
  const ink = lerp(lerp(32, 48, d), 237, flip);
  const muted = lerp(lerp(95, 120, d), 150, flip);
  const line = lerp(lerp(218, 205, d), 58, flip);

  return {
    paper: rgb(paper, paper + 1, paper + 3),
    ink: rgb(ink, ink + 1, ink + 4),
    muted: rgb(muted, muted + 4, muted + 9),
    line: rgb(line, line + 2, line + 6),
    // Google blue drains to alarm red. Front-loaded (sqrt) so it reads as red
    // rather than an indecisive magenta through the middle of the range.
    accent: (() => {
      const a = Math.sqrt(d);
      return rgb(lerp(26, 220, a), lerp(115, 38, a), lerp(232, 38, a));
    })(),
  };
}

export type Verdict = {
  title: string;
  blurb: string;
  tone: "pass" | "fail" | "edge";
};

export function verdictFor(humanity: number): Verdict {
  if (humanity >= 78)
    return {
      title: "VERIFIED ORGANISM",
      blurb: "Wet, imprecise, easily distracted. You are cleared for the internet.",
      tone: "pass",
    };
  if (humanity >= 62)
    return {
      title: "PROBABLY ALIVE",
      blurb: "You pass, but we are keeping the file open.",
      tone: "pass",
    };
  if (humanity >= 40)
    return {
      title: "INCONCLUSIVE",
      blurb: "You are either a tired person or a well-funded model. We cannot tell.",
      tone: "edge",
    };
  if (humanity >= 20)
    return {
      title: "LIKELY SYNTHETIC",
      blurb: "Too accurate. Too fast. Too composed. We have seen your kind.",
      tone: "fail",
    };
  return {
    title: "CONFIRMED MACHINE",
    blurb: "There is no body behind this cursor. Access denied. Have a nice epoch.",
    tone: "fail",
  };
}
