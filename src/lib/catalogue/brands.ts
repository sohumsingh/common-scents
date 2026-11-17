import type { Brand } from "../types";

/**
 * Brand families referenced in the project brief. Every brand here is listed
 * in the brief as a potential catalogue brand, subject to sourcing and
 * commercial viability.
 */
export const brands: Brand[] = [
  { slug: "dior", name: "Dior", family: "designer" },
  { slug: "ysl", name: "Yves Saint Laurent", family: "designer" },
  { slug: "giorgio-armani", name: "Giorgio Armani", family: "designer" },
  { slug: "versace", name: "Versace", family: "designer" },
  { slug: "paco-rabanne", name: "Paco Rabanne", family: "designer" },
  { slug: "dolce-gabbana", name: "Dolce & Gabbana", family: "designer" },
  { slug: "lancome", name: "Lancôme", family: "designer" },
  { slug: "montblanc", name: "Montblanc", family: "designer" },
  { slug: "lattafa", name: "Lattafa", family: "middle-eastern" },
  { slug: "afnan", name: "Afnan", family: "middle-eastern" },
  { slug: "armaf", name: "Armaf", family: "middle-eastern" },
  { slug: "rasasi", name: "Rasasi", family: "middle-eastern" },
  { slug: "maison-alhambra", name: "Maison Alhambra", family: "middle-eastern" },
  { slug: "al-haramain", name: "Al Haramain", family: "middle-eastern" },
  { slug: "swiss-arabian", name: "Swiss Arabian", family: "middle-eastern" },
];

export const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

export const brandFamilyLabels: Record<Brand["family"], string> = {
  designer: "Designer",
  "middle-eastern": "Middle Eastern",
};
