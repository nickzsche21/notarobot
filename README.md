# NOT A ROBOT

A CAPTCHA that suspects **you**.

Eight verification levels. A suspicion meter that goes **up when you do well** —
because perfect typing, a ruler-straight mouse drag and a 90ms reaction time are
not what a body produces. To pass, you have to prove you're a mess.

The interface starts as a pristine, official-looking verification widget. As
suspicion climbs past half, the room turns black and the blue turns red.

## The joke is load-bearing

The detection is real, not theatre. Every level measures something:

| Level | Measures | Robot tell |
|---|---|---|
| Checkbox | reaction latency | sub-180ms, or a 25s+ `sleep()` |
| Regret grid | hesitation, selection size | instant answers |
| A → B drag | path **tortuosity** + angular jitter | a geometrically perfect line |
| Transcription | Levenshtein distance, keystroke CV | zero typos, metronomic rhythm |
| Idle 7s | micro-movement count and drift | perfect stillness |
| Trolley | time-to-decide | doing the arithmetic too fast |
| Pain | which mundane humiliation stings | reporting no pain at all |
| The reversal | compliance | complying |

`lib/humanity.ts` holds the whole engine — tortuosity, angular jitter,
coefficient of variation, edit distance — and nothing else imports a library
to do it.

Two design decisions worth knowing before you tune the numbers:

- **Gains have diminishing returns, losses land at full force**
  (`applySignals`). Without the asymmetry, anyone who just picks the obviously
  human option every time lands on exactly 100 and every shared score is
  identical.
- **The palette inverts over a narrow band**, not a slow crossfade
  (`paletteFor`). A symmetric fade drags text and background through mid-grey
  together, where nothing has contrast against anything.

## Run it

```bash
npm install
npm run dev
```

http://localhost:3222

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/og`.

No database, no API keys, no runtime cost. It survives a front page.

## Sharing

Finishing gives you `/?h=<score>`. That route generates its own OG image at
`/api/og?h=<score>`, so a pasted link unfurls with the verdict the sharer
actually got instead of a logo.

Set `NEXT_PUBLIC_SITE_URL` to your deployed origin so absolute OG URLs resolve.

## License

MIT
