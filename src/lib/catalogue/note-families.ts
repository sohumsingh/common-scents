/**
 * Groups fragrance notes into families, each with a swatch colour, so the
 * profile card can show at a glance whether a note is citrus, floral, woody…
 *
 * Matching is by keyword and ORDER MATTERS — the first family that matches
 * wins. Aromatic comes before floral (so "Rosemary" is not read as "rose" and
 * "Violet Leaf" stays green), floral before citrus ("Orange Blossom" is a
 * flower) and amber before woody ("Amberwood"). Unrecognised notes fall back
 * to "other".
 */

export type NoteFamily = {
  id: string;
  label: string;
  /** Swatch colour for the family. */
  color: string;
};

const families: (NoteFamily & { match: string[] })[] = [
  { id: "aquatic", label: "Aquatic", color: "#8FB4C6", match: ["marine", "watery", "aquozone", "ice accord", "sea "] },
  { id: "aromatic", label: "Aromatic", color: "#8FA77F", match: ["lavender", "sage", "rosemary", "mint", "juniper", "cypress", "lentisk", "bamboo", "green notes", "leaf"] },
  { id: "floral", label: "Floral", color: "#D9A3B3", match: ["rose", "jasmine", "iris", "orris", "peony", "magnolia", "lily", "blossom", "ylang", "lotus", "bellflower", "orchid", "heliotrope", "violet", "geranium"] },
  { id: "citrus", label: "Citrus", color: "#E6C35C", match: ["lemon", "bergamot", "mandarin", "grapefruit", "orange", "tangerine", "yuzu", "lime", "petitgrain"] },
  { id: "fruity", label: "Fruity", color: "#D9826B", match: ["apple", "pear", "blackcurrant", "plum", "melon", "peach", "lychee", "rhubarb", "pomegranate", "blackberry", "dates", "fruit"] },
  { id: "spicy", label: "Spicy", color: "#C2733F", match: ["pepper", "cinnamon", "nutmeg", "cardamom", "ginger", "saffron", "anise", "licorice", "spic", "mahonial"] },
  { id: "gourmand", label: "Gourmand", color: "#B48A68", match: ["vanilla", "tonka", "praline", "toffee", "coffee", "almond", "caramel", "gourmand"] },
  { id: "amber", label: "Amber & resin", color: "#C9A23E", match: ["amber", "ambroxan", "benzoin", "myrrh", "olibanum", "incense", "labdanum"] },
  { id: "leather", label: "Leather", color: "#7A5A47", match: ["leather", "suede"] },
  { id: "woody", label: "Woody", color: "#8C6B4C", match: ["cedar", "sandalwood", "vetiver", "oud", "birch", "wood", "cashmere", "mahogany", "moss", "patchouli"] },
  { id: "musk", label: "Musky", color: "#CDC3B6", match: ["musk", "cashmeran"] },
];

const other: NoteFamily = { id: "other", label: "Other", color: "#BDB4A7" };

/** The family a note belongs to, e.g. "Sicilian Lemon" → Citrus. */
export function noteFamily(note: string): NoteFamily {
  const value = `${note.toLowerCase()} `;
  return families.find((family) => family.match.some((keyword) => value.includes(keyword))) ?? other;
}
