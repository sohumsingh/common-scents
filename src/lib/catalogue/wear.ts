/**
 * ---------------------------------------------------------------------------
 * WEAR GUIDE — COMMUNITY VOTES
 * ---------------------------------------------------------------------------
 *
 * When and how long each fragrance tends to wear: season suitability, the
 * day/night balance and typical longevity on skin.
 *
 * Derived from Fragrantica community votes (read November 2026), normalised:
 *  - seasons: each season's votes as a share of the most-voted season (0–100)
 *  - day: day votes as a share of day + night votes (0–100; the rest is night)
 *  - longevityHours: vote-weighted average of the band midpoints
 *    (very weak 0.75 h, weak 2 h, moderate 4.5 h, long lasting 9.5 h,
 *    eternal 13 h), rounded
 *
 * Votes describe the fragrance in general, not our stock. Refresh them
 * occasionally, or replace with supplier guidance or customer reviews later.
 */

export type WearGuide = {
  seasons: { winter: number; spring: number; summer: number; autumn: number };
  day: number;
  longevityHours: number;
};

const guide = (
  winter: number,
  spring: number,
  summer: number,
  autumn: number,
  day: number,
  longevityHours: number,
): WearGuide => ({ seasons: { winter, spring, summer, autumn }, day, longevityHours });

export const wearGuides: Record<string, WearGuide> = {
  "dior-sauvage-edp": guide(93, 99, 83, 100, 49, 8),
  "ysl-black-opium-edp": guide(100, 24, 15, 86, 27, 6),
  "lancome-la-vie-est-belle-edp": guide(100, 56, 32, 86, 49, 9),
  "montblanc-legend-edp": guide(78, 100, 78, 100, 52, 6),
  "dg-light-blue-edt": guide(11, 54, 100, 12, 89, 5),
  "afnan-9pm-edp": guide(100, 52, 22, 84, 32, 8),
  "lattafa-khamrah-edp": guide(100, 18, 11, 79, 30, 9),
  "versace-eros-edp": guide(83, 100, 81, 93, 48, 8),
  "armani-adg-profondo-edp": guide(9, 80, 100, 24, 75, 6),
  "armaf-cdnim-edt": guide(58, 100, 97, 87, 53, 8),
  "paco-rabanne-1-million-edt": guide(100, 35, 20, 84, 29, 8),
  "lattafa-fakhar-black-edp": guide(31, 98, 100, 69, 63, 5),
  "versace-bright-crystal-edt": guide(16, 100, 89, 20, 87, 5),
  "rasasi-hawas-edp": guide(17, 85, 100, 37, 69, 8),
  "swiss-arabian-shaghaf-oud": guide(100, 26, 13, 83, 32, 10),
  "ysl-y-edp": guide(53, 100, 99, 82, 56, 8),
  "maison-alhambra-delilah-edp": guide(42, 100, 78, 56, 68, 7),
  "dior-jadore-edp": guide(51, 100, 59, 71, 62, 7),
  "ysl-libre-edp": guide(82, 77, 46, 100, 52, 7),
  "armani-swy-intensely-edp": guide(100, 14, 7, 77, 30, 9),
  "armani-my-way-edp": guide(35, 100, 71, 51, 72, 6),
  "lancome-idole-edp": guide(33, 100, 72, 53, 74, 6),
  "lattafa-yara-edp": guide(48, 100, 80, 54, 77, 5),
  "lattafa-ana-abiyedh-edp": guide(50, 100, 93, 71, 63, 8),
  "al-haramain-amber-oud-gold-edp": guide(79, 100, 91, 91, 52, 10),
};

export function getWearGuide(productId: string): WearGuide | undefined {
  return wearGuides[productId];
}
