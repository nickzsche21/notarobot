import type { Metadata } from "next";
import Game from "@/components/Game";
import { verdictFor } from "@/lib/humanity";

type Props = { searchParams: Promise<{ h?: string }> };

/**
 * A shared link carries the score in ?h= so the unfurl shows the verdict
 * the sharer actually got. That preview is the whole distribution loop.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { h } = await searchParams;
  const score = Number(h);

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return {
      title: "NOT A ROBOT",
      description: "A CAPTCHA that suspects you. Being good at it makes things worse.",
      openGraph: { images: ["/api/og"] },
      twitter: { card: "summary_large_image", images: ["/api/og"] },
    };
  }

  const v = verdictFor(score);
  const title = `${Math.round(score)}% human — ${v.title}`;
  const image = `/api/og?h=${Math.round(score)}`;

  return {
    title,
    description: v.blurb,
    openGraph: { title, description: v.blurb, images: [image] },
    twitter: { card: "summary_large_image", title, description: v.blurb, images: [image] },
  };
}

export default function Page() {
  return <Game />;
}
