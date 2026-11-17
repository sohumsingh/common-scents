/**
 * Logo assets.
 *
 * Generated from the supplied artwork (`Common Scents Calligraphy Logo.png`
 * in the project root, which is never modified) by removing the paper
 * background. The monogram is the logo's own "C" and "S" strokes, kept in the
 * positions the calligrapher drew them.
 *
 * To replace with a final vector logo, swap these paths and sizes; every usage
 * goes through `components/brand/Logo.tsx`.
 */
export const logo = {
  full: {
    charcoal: "/brand/common-scents-logo.png",
    ivory: "/brand/common-scents-logo-ivory.png",
    width: 1239,
    height: 583,
  },
  monogram: {
    charcoal: "/brand/common-scents-monogram.png",
    ivory: "/brand/common-scents-monogram-ivory.png",
    width: 686,
    height: 591,
  },
  alt: "Common Scents",
} as const;
