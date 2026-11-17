import type { ReactNode } from "react";

const tones = {
  info: "border-line bg-parchment/40 text-stone",
  pending: "border-gold/35 bg-gold/8 text-gold-deep",
  notice: "border-charcoal/15 bg-charcoal/[0.04] text-ink",
} as const;

/**
 * A small editorial note. Used to flag placeholder data and pending
 * integrations so the interface is honest about what is not yet live.
 */
export function InfoNote({
  title,
  children,
  tone = "info",
  className = "",
}: {
  title?: string;
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <aside className={`border px-4 py-3.5 text-[12px] leading-relaxed ${tones[tone]} ${className}`}>
      {title ? (
        <p className="mb-1 text-[11px] uppercase tracking-[0.18em] opacity-80">{title}</p>
      ) : null}
      <div>{children}</div>
    </aside>
  );
}
