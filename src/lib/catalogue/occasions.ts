import type { Occasion } from "../types";

/**
 * The five occasion collections. These are the primary way customers
 * navigate the catalogue — gender remains a secondary filter only.
 */
export const occasions: Occasion[] = [
  {
    slug: "daily-wear",
    name: "Daily Wear",
    shortName: "Daily",
    tagline: "Versatile, comfortable fragrances you can wear without thinking twice.",
    description:
      "The fragrances you reach for without thinking — comfortable, adaptable and easy to wear from Monday to Sunday. Daily Wear scents are the ones that earn their place on your shelf: they sit close to the skin, suit a full day of wear and never overpower the room you are in.",
    question: "What should I wear every day?",
    accent: "#8C8272",
    wash: "#E7E0D2",
    order: 1,
  },
  {
    slug: "date-night",
    name: "Date Night",
    shortName: "Date Night",
    tagline: "Distinctive scents that create presence and stay memorable.",
    description:
      "Evening fragrances with a little more presence — warm, magnetic and designed to be remembered. Date Night scents are chosen for the hour after sunset, when the room is smaller and you would rather be noticed than blend in.",
    question: "What fragrance is suitable for a date?",
    accent: "#9A5B52",
    wash: "#EFE0DA",
    order: 2,
  },
  {
    slug: "special-occasion",
    name: "Special Occasion",
    shortName: "Special",
    tagline: "Sophisticated, expressive fragrances for the moments that matter.",
    description:
      "Weddings, celebrations, milestones and the nights you will talk about for years. Special Occasion fragrances are the more expressive end of the catalogue — richer, more layered and made to carry the weight of an event.",
    question: "What should I wear to a special occasion?",
    accent: "#B08A46",
    wash: "#F0E6D2",
    order: 3,
  },
  {
    slug: "gym-and-active",
    name: "Gym & Active",
    shortName: "Active",
    tagline: "Light, fresh and invigorating scents for active environments.",
    description:
      "Clean, energetic fragrances that feel good during movement — the gym, a morning run, a long afternoon outdoors. Active scents keep things light and breathable rather than heavy, so you stay comfortable while you work.",
    question: "What is something fresh for the gym?",
    accent: "#5F8A87",
    wash: "#DEE9E6",
    order: 4,
  },
  {
    slug: "office-wear",
    name: "Office Wear",
    shortName: "Office",
    tagline: "Refined, clean and unobtrusive fragrances for professional settings.",
    description:
      "Considered, professional scents that read as well-mannered rather than loud. Office Wear fragrances are polished and reliable — the kind you can wear through a full day of meetings without anyone noticing anything but the fact that you smell put together.",
    question: "What fragrance works for the office?",
    accent: "#6B7280",
    wash: "#E3E5E8",
    order: 5,
  },
];

export const occasionBySlug = new Map(occasions.map((o) => [o.slug, o]));
