import type { CSSProperties } from "react";

/** Per-column distances for `scroll-lift` cards, so a row arrives unevenly. */
const LIFTS = ["28px", "64px", "40px", "84px"];

/** Inline style for a `scroll-lift` card (see globals.css) at this grid position. */
export function lift(index: number): CSSProperties {
  return { "--lift": LIFTS[index % LIFTS.length] } as CSSProperties;
}

/** Inline style that staggers a `data-reveal` element by its position. */
export function stagger(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
