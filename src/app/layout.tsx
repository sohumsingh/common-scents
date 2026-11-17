import { Suspense, ViewTransition } from "react";
import { RevealObserver, revealBootScript } from "@/components/motion/RevealObserver";
import type { Metadata, Viewport } from "next";
import { display, sans } from "./fonts";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AddedToBagNotice } from "@/components/cart/AddedToBagNotice";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ResultsTrailReset } from "@/components/catalogue/ResultsTrail";
import { site } from "@/lib/site";
import { getCartCatalogue } from "@/lib/catalogue/service";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "fragrance South Africa",
    "online perfume store",
    "designer fragrance",
    "Middle Eastern fragrance",
    "perfume by occasion",
    "eau de parfum South Africa",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#F4F0E8",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Live prices for every size, so a bag saved in the browser is re-checked.
  const cartCatalogue = await getCartCatalogue();

  return (
    <html
      lang="en-ZA"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} h-full`}
      // The boot script below adds a motion class before React loads.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-ivory font-sans text-charcoal antialiased">
        <CartProvider catalogue={cartCatalogue}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-charcoal focus:px-5 focus:py-3 focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-ivory"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {/* Pages crossfade into each other (skipped for reduced motion). */}
            <ViewTransition default="page">{children}</ViewTransition>
          </main>
          <SiteFooter />
          <CartDrawer />
          <AddedToBagNotice />
          <Suspense fallback={null}>
            <ResultsTrailReset />
          </Suspense>
          <RevealObserver />
        </CartProvider>
      </body>
    </html>
  );
}
