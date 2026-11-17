"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

/**
 * "Back to results"
 *
 * When a customer opens a fragrance from a filtered list, a collection or a
 * search, the product page offers a link straight back to that exact list.
 * "Shop All" in the breadcrumb still means the full, unfiltered catalogue.
 *
 * The list is remembered for the browser tab only (sessionStorage), and is
 * forgotten as soon as the customer moves somewhere that is not a list or a
 * product, so a stale link never appears later.
 */

const STORAGE_KEY = "common-scents-results-trail";

type Trail = { href: string; label: string };

/**
 * A tiny store over sessionStorage so the link re-renders whenever the trail
 * changes. Reading once during render is not enough: Next.js can keep and
 * re-show an earlier render of a page, which would show a stale link.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getRawTrail(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseTrail(raw: string | null): Trail | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Trail>;
    // Only ever link to a path on this site.
    if (typeof parsed.href !== "string" || !parsed.href.startsWith("/") || parsed.href.startsWith("//")) {
      return null;
    }
    return { href: parsed.href, label: typeof parsed.label === "string" ? parsed.label : "Back to results" };
  } catch {
    return null;
  }
}

function writeTrail(trail: Trail | null) {
  try {
    if (trail) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private browsing) — the link simply does not appear.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Rendered by a results list. Pass `null` when the list is just the plain
 * catalogue, which the "Shop All" breadcrumb already covers.
 */
export function ResultsTrailRecorder({ trail }: { trail: Trail | null }) {
  const href = trail?.href ?? null;
  const label = trail?.label ?? null;
  useEffect(() => {
    writeTrail(href ? { href, label: label ?? "Back to results" } : null);
  }, [href, label]);
  return null;
}

/** Product pages and results lists keep the trail; everything else clears it. */
function keepsTrail(pathname: string) {
  return (
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/collections/") ||
    pathname === "/search"
  );
}

/** Mounted once in the root layout. */
export function ResultsTrailReset() {
  const pathname = usePathname();
  useEffect(() => {
    if (!keepsTrail(pathname)) writeTrail(null);
  }, [pathname]);
  return null;
}

/** Shown on the product page when the customer arrived from a results list. */
export function BackToResults() {
  const raw = useSyncExternalStore(subscribe, getRawTrail, () => null);
  const trail = parseTrail(raw);
  if (!trail) return null;

  return (
    <Link
      href={trail.href}
      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
    >
      <span aria-hidden="true">←</span>
      {trail.label}
    </Link>
  );
}
