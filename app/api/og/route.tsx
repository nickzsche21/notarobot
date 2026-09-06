import { ImageResponse } from "next/og";
import { paletteFor, verdictFor } from "@/lib/humanity";

export const alt = "NOT A ROBOT";
export const size = { width: 1200, height: 630 };

/**
 * The share card, rendered per-score so a link drop shows the verdict rather
 * than a logo. Satori quirks worth remembering before editing this:
 *   - React Fragments are not laid out; every child must be a real element.
 *   - Any box with more than one child needs an explicit display value.
 *   - Wrapping text needs an explicit width, not just maxWidth.
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const raw = Number(url.searchParams.get("h"));
  const hasScore = Number.isFinite(raw) && raw >= 0 && raw <= 100;
  const score = hasScore ? Math.round(raw) : 100;
  const v = verdictFor(score);

  const { paper, ink, muted, accent } = paletteFor(score);

  const headline = hasScore ? `${score}%` : "NOT A ROBOT";
  const subhead = hasScore ? v.title : "PROVE IT";
  const body = hasScore
    ? v.blurb
    : "A CAPTCHA that suspects you. Being good at it makes things worse.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: paper,
          color: ink,
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: muted }}>
          HUMAN VERIFICATION
        </div>
        <div
          style={{
            fontSize: hasScore ? 200 : 104,
            fontWeight: 700,
            color: accent,
            marginTop: hasScore ? 4 : 28,
            lineHeight: 1.15,
          }}
        >
          {headline}
        </div>
        <div style={{ fontSize: 46, letterSpacing: 6, marginTop: hasScore ? 0 : 24 }}>
          {subhead}
        </div>
        <div
          style={{
            width: 860,
            marginTop: 28,
            fontSize: 27,
            lineHeight: 1.5,
            color: muted,
            textAlign: "center",
          }}
        >
          {body}
        </div>
      </div>
    ),
    { ...size }
  );
}
