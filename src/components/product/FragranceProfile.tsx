import type { ReactNode } from "react";
import { Bottle } from "./Bottle";
import { LogoMark } from "@/components/brand/Logo";
import { noteFamily } from "@/lib/catalogue/note-families";
import type { WearGuide } from "@/lib/types";
import type { Product } from "@/lib/types";
import { genderLabels } from "@/lib/format";

/**
 * The fragrance profile card: the bottle, its notes by tier, and an at-a-
 * glance guide to when it suits — season, day or night — and how long it
 * lasts. The wear guide comes from community votes (see wear.ts).
 */

const SEASONS = [
  { key: "winter", label: "Winter", color: "#8FA8C2", icon: "snow" },
  { key: "spring", label: "Spring", color: "#A3BC8A", icon: "bloom" },
  { key: "summer", label: "Summer", color: "#E2B657", icon: "sun" },
  { key: "autumn", label: "Autumn", color: "#C47A4F", icon: "leaf" },
] as const;

/** Longevity is drawn on a 12-hour scale. */
const LONGEVITY_SCALE = 12;

function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
        </svg>
      );
    case "bloom":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.4" />
          <path d="M12 9.6c-1.6-3.4.2-6.1 0-6.1s1.6 2.7 0 6.1ZM14.4 12c3.4-1.6 6.1.2 6.1 0s-2.7 1.6-6.1 0ZM12 14.4c1.6 3.4-.2 6.1 0 6.1s-1.6-2.7 0-6.1ZM9.6 12c-3.4 1.6-6.1-.2-6.1 0s2.7-1.6 6.1 0Z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
          <path d="M5 19 13 11" />
        </svg>
      );
    case "hourglass":
      return (
        <svg {...common}>
          <path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9" />
        </svg>
      );
    default:
      return null;
  }
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line/80 bg-paper/80 p-4 sm:p-5 ${className}`}>
      <h3 className="font-sans text-[11px] font-normal uppercase tracking-[0.22em] text-muted">{title}</h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

export function FragranceProfile({ product, wear }: { product: Product; wear?: WearGuide }) {
  const tiers = [
    { label: "Top", notes: product.notes.top },
    { label: "Heart", notes: product.notes.heart },
    { label: "Base", notes: product.notes.base },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line p-5 sm:p-7"
      style={{
        background: `linear-gradient(140deg, ${product.visual.wash} 0%, #f7f3ec 55%, #efe8db 100%)`,
      }}
    >
      {/* Heading */}
      <header className="relative">
        <h2 className="font-display text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.05] text-charcoal">
          {product.name} <span className="italic text-charcoal/70">{product.concentration}</span>
        </h2>
        <p className="mt-1.5 text-[13px] text-stone">
          {product.brand}
          <span aria-hidden="true" className="mx-2 text-gold">·</span>
          {product.gender === "unisex" ? "Unisex" : `For ${genderLabels[product.gender].toLowerCase()}`}
        </p>
      </header>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Bottle */}
        <div className="aspect-[4/5] overflow-hidden rounded-xl sm:aspect-auto sm:min-h-[16rem]">
          <Bottle item={product} wash={false} inset="8% 10% 6%" sizes="(min-width: 1024px) 22vw, 80vw" />
        </div>

        {/* Notes by tier */}
        <Panel title="Notes">
          <div className="flex flex-col gap-4">
            {tiers.map((tier) => (
              <div key={tier.label}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{tier.label}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {tier.notes.map((note) => {
                    const family = noteFamily(note);
                    return (
                      <li
                        key={note}
                        title={family.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory/80 py-1 pl-1.5 pr-2.5 text-[12px] text-ink"
                      >
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 rounded-full ring-1 ring-black/5"
                          style={{ backgroundColor: family.color }}
                        />
                        {note}
                        <span className="sr-only"> ({family.label})</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {wear ? (
        <div className="relative mt-4 grid gap-4 sm:grid-cols-2">
          {/* Longevity */}
          <Panel title="Longevity">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ivory text-charcoal">
                <Icon name="hourglass" className="h-5 w-5" />
              </span>
              <p className="font-display text-[1.9rem] leading-none text-charcoal">
                ~{wear.longevityHours}
                <span className="ml-1 font-sans text-[13px] text-stone">hours on skin</span>
              </p>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-line"
              role="img"
              aria-label={`About ${wear.longevityHours} of ${LONGEVITY_SCALE} hours`}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-gold to-gold-deep"
                style={{ width: `${Math.min(100, (wear.longevityHours / LONGEVITY_SCALE) * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted">
              <span>Light</span>
              <span>Long-lasting</span>
            </div>
          </Panel>

          {/* Day / night */}
          <Panel title="Day or night">
            <div
              className="flex h-11 overflow-hidden rounded-lg text-[12.5px]"
              role="img"
              aria-label={`Suits daytime ${wear.day}%, night ${100 - wear.day}%`}
            >
              <div
                className="flex items-center justify-center gap-1.5 bg-[#EADCB0] text-[#5C4A1E]"
                style={{ width: `${wear.day}%` }}
              >
                {wear.day >= 22 ? (
                  <>
                    <Icon name="sun" />
                    Day
                  </>
                ) : (
                  <Icon name="sun" />
                )}
              </div>
              <div
                className="flex items-center justify-center gap-1.5 bg-noir-soft text-ivory"
                style={{ width: `${100 - wear.day}%` }}
              >
                {100 - wear.day >= 22 ? (
                  <>
                    <Icon name="moon" />
                    Night
                  </>
                ) : (
                  <Icon name="moon" />
                )}
              </div>
            </div>
            <p className="mt-2.5 text-[12px] text-stone">
              {wear.day >= 65
                ? "Best by day — fresh enough for daylight hours."
                : wear.day <= 35
                  ? "Made for the evening."
                  : "Moves easily from day into evening."}
            </p>
          </Panel>

          {/* Seasons */}
          <Panel title="Seasons" className="sm:col-span-2">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {SEASONS.map((season) => {
                const value = wear.seasons[season.key];
                return (
                  <li key={season.key}>
                    <div
                      className="relative h-10 overflow-hidden rounded-lg bg-line/70"
                      role="img"
                      aria-label={`${season.label}: ${value}% suitable`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ width: `${value}%`, backgroundColor: season.color }}
                      />
                      <span className="relative flex h-full items-center gap-1.5 px-3 text-[12.5px] text-charcoal">
                        <Icon name={season.icon} />
                        {season.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      ) : null}

      <footer className="relative mt-5 flex items-center justify-between gap-4">
        <p className="max-w-sm text-[11.5px] leading-relaxed text-muted">
          Seasons, day/night and longevity reflect community wear votes; results vary with skin and
          climate. Notes are awaiting supplier confirmation.
        </p>
        <LogoMark className="w-12 shrink-0 opacity-70" />
      </footer>
    </div>
  );
}
