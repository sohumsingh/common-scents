import { Cormorant_Garamond, Jost } from "next/font/google";

/**
 * Brand typography.
 *
 * - Cormorant Garamond: high-contrast serif used for display headings.
 * - Jost: geometric sans used for body copy, navigation and UI.
 *
 * The logo is the supplied signature artwork (see `lib/logo.ts`), so no
 * script typeface is loaded.
 */
export const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const sans = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
