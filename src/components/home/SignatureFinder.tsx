"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FinderEntry } from "@/lib/catalogue/service";
import type { OccasionSlug } from "@/lib/types";
import { formatFromPrice, formatSizes, formatZAR } from "@/lib/format";
import { Bottle } from "@/components/product/Bottle";
import type { CSSProperties, ReactNode } from "react";
import type { CharacterKey, IntensityKey } from "@/lib/catalogue/finder-profile";

const characterOptions: { value: CharacterKey; label: string; hint: string }[] = [
  { value: "fresh", label: "Fresh & clean", hint: "Citrus, aquatic, airy" },
  { value: "woody", label: "Warm & woody", hint: "Cedar, vetiver, smoky woods" },
  { value: "sweet", label: "Sweet & gourmand", hint: "Vanilla, tonka, fruit" },
  { value: "bold", label: "Bold & intense", hint: "Oud, spice, amber" },
  { value: "floral", label: "Soft & floral", hint: "Peony, rose, jasmine" },
];

const intensityOptions: { value: IntensityKey; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "rich", label: "Rich" },
];

/** At most this many suggestions are shown. */
const RESULT_COUNT = 3;

type BudgetKey = "any" | "under-500" | "500-999" | "1000-1499" | "1500-plus";

/** Budget bands. A fragrance fits if any of its bottle sizes falls inside one. */
const budgetOptions: { value: BudgetKey; label: string; min: number; max: number }[] = [
  { value: "under-500", label: "Under R500", min: 0, max: 499 },
  { value: "500-999", label: "R500 – R999", min: 500, max: 999 },
  { value: "1000-1499", label: "R1 000 – R1 499", min: 1000, max: 1499 },
  { value: "1500-plus", label: "R1 500 and above", min: 1500, max: Number.POSITIVE_INFINITY },
];

/** The cheapest size of a fragrance that fits the chosen budget, if any. */
function sizeWithinBudget(entry: FinderEntry, budget: BudgetKey) {
  const band = budgetOptions.find((option) => option.value === budget);
  if (!band) return null;
  const fitting = entry.variants
    .filter((variant) => variant.priceZAR >= band.min && variant.priceZAR <= band.max)
    .sort((a, b) => a.priceZAR - b.priceZAR);
  return fitting[0] ?? null;
}

const occasionOptions: { value: OccasionSlug; label: string }[] = [
  { value: "daily-wear", label: "Everyday" },
  { value: "date-night", label: "Date night" },
  { value: "special-occasion", label: "A celebration" },
  { value: "gym-and-active", label: "Gym & outdoors" },
  { value: "office-wear", label: "The office" },
];

/**
 * A guided, rules-based finder.
 *
 * It scores the real catalogue against the customer's stated preferences and
 * returns products that genuinely match. It is deliberately not presented as
 * an AI feature — AI-assisted recommendations are a planned enhancement, not
 * something that exists today.
 */
const disclaimer =
  "These suggestions are matched against the current catalogue using the fragrance characteristics listed on each product page.";

export function SignatureFinder({
  catalogue,
  intro,
}: {
  catalogue: FinderEntry[];
  /** Section heading; sits in its own left-hand column on wide screens. */
  intro?: ReactNode;
}) {
  const [occasion, setOccasion] = useState<OccasionSlug | "any">("any");
  const [character, setCharacter] = useState<CharacterKey | null>(null);
  const [intensity, setIntensity] = useState<IntensityKey | null>(null);
  const [budget, setBudget] = useState<BudgetKey>("any");

  /**
   * Matching. Budget is a hard limit — never suggest something outside what
   * the customer wants to spend. Every taste answer (moment, character,
   * intensity) is checked against the fragrance's editorial profile:
   * fragrances that satisfy all of them come first; only if there are fewer
   * than three do close matches (missing one answer) fill in, labelled with
   * what they miss. Nothing that matches none of the answers is suggested.
   */
  const results = useMemo(() => {
    const checks: { label: string; test: (entry: FinderEntry) => boolean }[] = [];
    if (occasion !== "any") {
      const name = occasionOptions.find((option) => option.value === occasion)?.label.toLowerCase();
      checks.push({ label: `not tagged for ${name}`, test: (entry) => entry.occasions.includes(occasion) });
    }
    if (character) {
      const name = characterOptions.find((option) => option.value === character)?.label.toLowerCase();
      checks.push({ label: `not ${name}`, test: (entry) => entry.characters.includes(character) });
    }
    if (intensity) {
      checks.push({
        label: intensity === "light" ? "stronger than light" : intensity === "rich" ? "lighter than rich" : "not balanced",
        test: (entry) => entry.intensity === intensity,
      });
    }
    if (checks.length === 0 && budget === "any") return [];

    const scored = catalogue
      .filter((entry) => budget === "any" || sizeWithinBudget(entry, budget) !== null)
      .map((entry) => {
        const missing = checks.filter((check) => !check.test(entry)).map((check) => check.label);
        // A fragrance whose primary character is the one asked for ranks first.
        const primary = character !== null && entry.characters[0] === character ? 0 : 1;
        return { entry, missing, primary };
      })
      .filter((result) => checks.length === 0 || result.missing.length < checks.length)
      .sort((a, b) => a.missing.length - b.missing.length || a.primary - b.primary);

    const exact = scored.filter((result) => result.missing.length === 0);
    // Close matches (one answer missed) only fill the gap when exact ones run out.
    const close = scored.filter((result) => result.missing.length === 1);
    return [...exact, ...close].slice(0, RESULT_COUNT);
  }, [catalogue, occasion, character, intensity, budget]);

  const hasAnswer =
    character !== null || intensity !== null || occasion !== "any" || budget !== "any";

  return (
    <div
      className={`grid gap-10 ${
        intro
          ? "lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-12"
          : "mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14"
      }`}
    >
      {intro ? (
        <div className="flex flex-col justify-between gap-8">
          {intro}
          <p className="hidden border-t border-line pt-5 text-[11.5px] leading-relaxed text-muted lg:block">
            {disclaimer}
          </p>
        </div>
      ) : null}

      {/* Questions */}
      <div className="flex flex-col gap-[clamp(0.9rem,2.6svh,2rem)]">
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            01 — The moment
          </legend>
          <div className="mt-[clamp(0.6rem,1.4svh,1rem)] flex flex-wrap gap-2">
            {occasionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOccasion(option.value)}
                aria-pressed={occasion === option.value}
                className={`rounded-full border px-4 py-2.5 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                  occasion === option.value
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOccasion("any")}
              aria-pressed={occasion === "any"}
              className={`rounded-full border px-4 py-2.5 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                occasion === "any"
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              Not sure yet
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            02 — The character
          </legend>
          <div className="mt-[clamp(0.6rem,1.4svh,1rem)] grid gap-2 sm:grid-cols-2">
            {characterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCharacter(option.value)}
                aria-pressed={character === option.value}
                className={`flex flex-col items-start gap-1 border px-4 py-[clamp(0.4rem,1.1svh,0.875rem)] text-left transition-all duration-300 ${
                  character === option.value
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
                }`}
              >
                <span className="text-[13px]">{option.label}</span>
                <span
                  className={`text-[11px] [@media(max-height:50rem)]:hidden ${character === option.value ? "text-ivory/65" : "text-muted"}`}
                >
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            03 — The intensity
          </legend>
          <div className="mt-[clamp(0.6rem,1.4svh,1rem)] flex flex-wrap gap-2">
            {intensityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setIntensity(option.value)}
                aria-pressed={intensity === option.value}
                className={`rounded-full border px-5 py-2.5 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                  intensity === option.value
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            04 — The budget
          </legend>
          <div className="mt-[clamp(0.6rem,1.4svh,1rem)] flex flex-wrap gap-2">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudget(option.value)}
                aria-pressed={budget === option.value}
                className={`rounded-full border px-4 py-2.5 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                  budget === option.value
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBudget("any")}
              aria-pressed={budget === "any"}
              className={`rounded-full border px-4 py-2.5 text-[11px] tracking-[0.06em] transition-all duration-300 ${
                budget === "any"
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-line text-stone hover:border-charcoal/40 hover:text-charcoal"
              }`}
            >
              Any budget
            </button>
          </div>
        </fieldset>

        <p
          className={`border-t border-line pt-5 text-[11.5px] leading-relaxed text-muted ${intro ? "lg:hidden" : ""}`}
        >
          {disclaimer}
        </p>
      </div>

      {/* Results */}
      <div className={`lg:border-l lg:border-line ${intro ? "lg:pl-8 xl:pl-12" : "lg:pl-14"}`}>
        {!hasAnswer ? (
          <div className="flex h-full min-h-[18rem] flex-col items-center justify-center border border-dashed border-line-strong px-8 text-center">
            <p className="font-display text-2xl leading-snug text-charcoal">
              Your signature scent
              <br />
              starts here.
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-stone">
              Answer any question and we will pull matching fragrances straight from the catalogue.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex h-full min-h-[18rem] flex-col items-center justify-center border border-dashed border-line-strong px-8 text-center">
            <p className="font-display text-2xl text-charcoal">Nothing matches that combination</p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-stone">
              Try loosening one of the answers — the catalogue is still growing.
            </p>
          </div>
        ) : (
          // Keyed by the answers, so each new set of suggestions rises in afresh.
          <ul key={`${occasion}-${character}-${intensity}-${budget}`} className="flex flex-col divide-y divide-line">
            {results.map(({ entry, missing }, index) => (
              <li key={entry.slug} className="rise-in" style={{ "--i": index } as CSSProperties}>
                <Link
                  href={`/shop/${entry.slug}`}
                  className="group flex items-center gap-5 py-5 transition-colors first:pt-0 last:pb-0"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden border border-line transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5">
                    <Bottle item={entry} inset="8% 10% 5%" sizes="80px" shadow={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] tabular-nums tracking-[0.2em] text-gold-deep">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                        {entry.brand}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-[1.3rem] leading-tight text-charcoal transition-colors group-hover:text-gold-deep">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-stone">
                      {entry.shortDescription}
                    </p>
                    <p
                      className={`mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] ${
                        missing.length === 0 ? "text-gold-deep" : "text-muted"
                      }`}
                    >
                      {missing.length === 0 ? (
                        <>
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Matches your answers
                        </>
                      ) : (
                        <>Close match · {missing[0]}</>
                      )}
                    </p>
                  </div>
                  <PriceForBudget entry={entry} budget={budget} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * With a budget chosen, show the size that fits it; otherwise the "From"
 * price across every size.
 */
function PriceForBudget({ entry, budget }: { entry: FinderEntry; budget: BudgetKey }) {
  const fitting = budget === "any" ? null : sizeWithinBudget(entry, budget);
  return (
    <div className="shrink-0 text-right">
      <p className="text-[13px] tabular-nums text-charcoal">
        {fitting ? formatZAR(fitting.priceZAR) : formatFromPrice(entry.variants)}
      </p>
      <p className="mt-0.5 text-[11px] tabular-nums text-muted">
        {fitting ? fitting.size : formatSizes(entry.variants)}
      </p>
    </div>
  );
}
