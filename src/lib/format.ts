import type { Gender } from "./types";

const gbpLike = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format a number as a ZAR price, e.g. R1 899. */
export function formatZAR(amount: number): string {
  return gbpLike.format(amount).replace(/ /g, " ");
}

type PricedSize = { size: string; priceZAR: number };

/** The cheapest size a fragrance is sold in. */
export function lowestPrice(variants: readonly PricedSize[]): number {
  return Math.min(...variants.map((variant) => variant.priceZAR));
}

/**
 * Price label for listings: "From R1 099" when sizes are priced differently,
 * otherwise the single price.
 */
export function formatFromPrice(variants: readonly PricedSize[]): string {
  const prices = new Set(variants.map((variant) => variant.priceZAR));
  const label = formatZAR(lowestPrice(variants));
  return prices.size > 1 ? `From ${label}` : label;
}

/** Bottle sizes in ascending price order, e.g. "50 ml · 100 ml". */
export function formatSizes(variants: readonly PricedSize[]): string {
  return [...variants]
    .sort((a, b) => a.priceZAR - b.priceZAR)
    .map((variant) => variant.size)
    .join(" · ");
}

/** Format a number as a plain ZAR amount without a currency symbol. */
export function formatZARPlain(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const genderLabels: Record<Gender, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

export const genderDescriptions: Record<Gender, string> = {
  men: "Marketed towards men",
  women: "Marketed towards women",
  unisex: "Suitable for everyone",
};

export function pluralise(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
