"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export type OccasionCompareGroup = {
  slug: string;
  name: string;
  /** Server-rendered product cards for this occasion. */
  cards: ReactNode;
};

/**
 * "Also for …" — the other fragrances for the same occasion, closest in price.
 *
 * When a fragrance suits more than one occasion, a small switch lets the
 * customer choose which moment to compare against. The cards themselves are
 * rendered on the server; this component only chooses which set is shown.
 */
export function OccasionCompare({
  productName,
  groups,
}: {
  productName: string;
  groups: OccasionCompareGroup[];
}) {
  const [activeSlug, setActiveSlug] = useState(groups[0]?.slug);
  const active = groups.find((group) => group.slug === activeSlug) ?? groups[0];
  if (!active) return null;

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Compare by occasion</p>
          <h2 className="mt-4 text-[clamp(1.6rem,2.8vw,2.3rem)] leading-tight text-charcoal">
            Also for {active.name}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-stone">
            Other {active.name} fragrances, closest in price to {productName} first.
          </p>
        </div>
        <Link
          href={`/collections/${active.slug}`}
          className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-charcoal underline decoration-gold/60 underline-offset-[7px] transition-colors hover:decoration-charcoal"
        >
          All {active.name}
        </Link>
      </div>

      {groups.length > 1 ? (
        <div role="group" aria-label="Compare against occasion" className="mt-6 flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => setActiveSlug(group.slug)}
              aria-pressed={group.slug === active.slug}
              className={`min-h-10 rounded-full border px-4 py-2 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                group.slug === active.slug
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        {active.cards}
      </div>
    </>
  );
}
