import type { ReactNode } from "react";

const tones = {
  neutral: "border-line bg-parchment/60 text-stone",
  gold: "border-gold/40 bg-gold/12 text-gold-deep",
  charcoal: "border-charcoal/15 bg-charcoal/5 text-ink",
  outline: "border-charcoal/20 bg-transparent text-stone",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-normal uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
