/**
 * Fixed price bands used by the price filter. Kept apart from service.ts
 * (server-only, it talks to the database) because the filter controls also
 * use them in the browser.
 */

export type PriceBucket = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export const priceBuckets: PriceBucket[] = [
  { id: "under-500", label: "Under R500", min: 0, max: 499 },
  { id: "500-999", label: "R500 – R999", min: 500, max: 999 },
  { id: "1000-1499", label: "R1 000 – R1 499", min: 1000, max: 1499 },
  { id: "1500-1999", label: "R1 500 – R1 999", min: 1500, max: 1999 },
  { id: "2000-plus", label: "R2 000 and above", min: 2000, max: Number.POSITIVE_INFINITY },
];
