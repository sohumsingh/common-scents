/**
 * ---------------------------------------------------------------------------
 * SIGNATURE FINDER PROFILES — EDITORIAL
 * ---------------------------------------------------------------------------
 *
 * How each fragrance answers the finder's questions: its character (one or
 * two of the five) and how strongly it comes across. Set by hand because a
 * note list alone misleads (Sauvage's ambroxan and pepper read as "bold" on
 * paper, but it wears as a fresh spicy scent). Review when the catalogue
 * changes; every product must have an entry.
 */

import type { CharacterKey, FinderProfile, IntensityKey } from "../types";

export type { CharacterKey, FinderProfile, IntensityKey };

const profile = (characters: CharacterKey[], intensity: IntensityKey): FinderProfile => ({
  characters,
  intensity,
});

export const finderProfiles: Record<string, FinderProfile> = {
  "dior-sauvage-edp": profile(["fresh", "bold"], "balanced"),
  "ysl-black-opium-edp": profile(["sweet"], "rich"),
  "lancome-la-vie-est-belle-edp": profile(["sweet", "floral"], "rich"),
  "montblanc-legend-edp": profile(["fresh", "woody"], "light"),
  "dg-light-blue-edt": profile(["fresh", "floral"], "light"),
  "afnan-9pm-edp": profile(["sweet", "bold"], "rich"),
  "lattafa-khamrah-edp": profile(["sweet", "bold"], "rich"),
  "versace-eros-edp": profile(["fresh", "sweet"], "rich"),
  "armani-adg-profondo-edp": profile(["fresh"], "light"),
  "armaf-cdnim-edt": profile(["woody", "fresh"], "rich"),
  "paco-rabanne-1-million-edt": profile(["sweet", "bold"], "rich"),
  "lattafa-fakhar-black-edp": profile(["fresh", "woody"], "light"),
  "versace-bright-crystal-edt": profile(["floral", "fresh"], "light"),
  "rasasi-hawas-edp": profile(["fresh", "sweet"], "balanced"),
  "swiss-arabian-shaghaf-oud": profile(["bold", "woody"], "rich"),
  "ysl-y-edp": profile(["fresh", "woody"], "balanced"),
  "maison-alhambra-delilah-edp": profile(["floral", "sweet"], "balanced"),
  "dior-jadore-edp": profile(["floral"], "balanced"),
  "ysl-libre-edp": profile(["floral", "sweet"], "rich"),
  "armani-swy-intensely-edp": profile(["sweet", "bold"], "rich"),
  "armani-my-way-edp": profile(["floral"], "balanced"),
  "lancome-idole-edp": profile(["floral"], "light"),
  "lattafa-yara-edp": profile(["sweet", "floral"], "balanced"),
  "lattafa-ana-abiyedh-edp": profile(["fresh"], "light"),
  "al-haramain-amber-oud-gold-edp": profile(["sweet", "bold"], "rich"),
};

