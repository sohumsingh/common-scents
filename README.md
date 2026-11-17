# Common Scents

**Every Moment. Every Scent.**

A premium e-commerce storefront for Common Scents, a South African online fragrance retailer
built around occasion-based fragrance discovery.

The store is organised the way people actually shop for fragrance — by the moment you are
dressing for — rather than by gender or brand. Gender remains available as a secondary filter.

---

## Stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)            |
| Language   | TypeScript (strict)                           |
| Styling    | Tailwind CSS v4 (CSS-first `@theme`)          |
| Fonts      | `next/font` — Cormorant Garamond, Jost, Allura |
| Data       | Typed seed catalogue behind a service layer   |
| Deployment | Vercel-ready                                  |

Planned, not yet connected: PostgreSQL (Prisma/Drizzle), Cloudinary, PayFast / Peach Payments,
customer accounts, order management.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

No environment variables are required to run the site. See `.env.example` for the values that
will be needed once the backend integrations are live.

---

## Project structure

```
src/
├── app/                        # Routes (App Router)
│   ├── page.tsx                # Home
│   ├── shop/
│   │   ├── page.tsx            # Shop All — full catalogue with filters
│   │   └── [slug]/page.tsx     # Product detail
│   ├── collections/[slug]/     # The five occasion collections
│   ├── about/  contact/  search/
│   ├── info/                   # delivery · returns · privacy · terms
│   ├── api/contact/route.ts    # Validated enquiry endpoint
│   ├── globals.css             # Design system
│   ├── fonts.ts                # Brand typography
│   ├── layout.tsx              # Shell: header, footer, cart
│   ├── robots.ts  sitemap.ts  icon.svg
│   └── not-found.tsx  error.tsx
│
├── components/
│   ├── brand/       Logo (signature wordmark)
│   ├── layout/      Header, mobile nav, footer, page header, breadcrumbs
│   ├── home/        Hero, occasion showcase, featured, trending, finder, about, newsletter
│   ├── catalogue/   Product card, catalogue controls (filters, sort, chips)
│   ├── product/     Bottle artwork, gallery, purchase panel
│   ├── cart/        Cart provider, drawer, buttons
│   ├── search/      Search overlay
│   ├── contact/     Contact form
│   ├── info/        Customer information page layout
│   └── ui/          Container, Button, Badge, SectionHeading, InfoNote, Portal
│
└── lib/
    ├── types.ts                 # Domain types
    ├── site.ts                  # Brand config, navigation, contact placeholders, feature flags
    ├── logo.ts  format.ts  current-year.ts
    └── catalogue/
        ├── products.ts          # ← THE SEED CATALOGUE (edit here)
        ├── occasions.ts         # The five collections
        ├── brands.ts            # Brand registry
        ├── service.ts           # Data access layer (swap for a DB here)
        └── query.ts             # Filtering, sorting, faceting (pure functions)
```

---

## Managing the catalogue

**`src/lib/catalogue/products.ts` is the single source of truth.** Add, edit or remove a product
there and every page, filter, collection and search index updates automatically. No component
imports the raw array — they all go through `src/lib/catalogue/service.ts`.

A product looks like this:

```ts
{
  id: "dior-sauvage-edp",
  slug: "dior-sauvage-eau-de-parfum",   // used in the URL
  brand: "Dior",
  brandSlug: "dior",
  name: "Sauvage",
  fullName: "Sauvage Eau de Parfum",
  concentration: "Eau de Parfum",
  gender: "men",
  occasions: ["daily-wear", "office-wear"],   // a fragrance can sit in several
  priceZAR: 1899,
  variants: [
    { id: "50ml",  label: "50 ml Eau de Parfum",  size: "50 ml",  priceZAR: 1099 },
    { id: "100ml", label: "100 ml Eau de Parfum", size: "100 ml", priceZAR: 1899 },
  ],
  shortDescription: "…",              // shown on cards
  description: "…",                   // shown on the product page
  character: ["Aromatic", "Fresh", "Confident"],
  notes: { top: [...], heart: [...], base: [...] },
  notesStatus: "pending-verification",
  pricingStatus: "indicative",
  stockStatus: "pending-verification",
  addedAt: "2026-10-28",               // drives "newest arrivals"
  visual: { accent: "#5F7E99", glass: "#8FA9BF", wash: "#E2E8EC", shape: "flacon", cap: "square" },
  image: undefined,                   // set this when Cloudinary photography is ready
}
```

### Moving to PostgreSQL

`src/lib/catalogue/service.ts` is deliberately the only module that reads the seed data, and its
functions are already `async`. To move to a database, replace the bodies of `listProducts`,
`getProductBySlug`, `getProductsByOccasion`, `getRelatedProducts` and `getSearchIndex` with
Prisma/Drizzle queries. No page or component needs to change.

---

## Design system

Defined once in `src/app/globals.css` via Tailwind v4's `@theme`.

| Token              | Value     | Use                          |
| ------------------ | --------- | ---------------------------- |
| `ivory`            | `#F4F0E8` | Primary background           |
| `paper`            | `#FBF9F4` | Raised surfaces, cards       |
| `charcoal`         | `#292725` | Text, primary buttons        |
| `beige`            | `#D8CBB8` | Secondary surfaces           |
| `gold` / `gold-deep` | `#B8A17B` | Accents, rules, highlights  |
| `font-display`     | Cormorant Garamond | Headings            |
| `font-sans`        | Jost      | Body, navigation, UI         |
| `font-signature`   | Allura    | Logo wordmark                |

### Logo

The final logo is a signature-style wordmark. Until the vector artwork is supplied, the site uses
a temporary text-based logo (the brand name in a script typeface with a hairline flourish).

To swap it in: drop the file at `public/brand/common-scents-signature.svg`, set `asset` in
`src/lib/logo.ts`, and nothing else changes — every usage goes through `components/brand/Logo.tsx`.

### Product imagery

There is no photography yet. Each fragrance is represented by a generated bottle illustration
(`components/product/ProductVisual.tsx`) that reflects the fragrance's glass tint, liquid colour
and silhouette. When a real image is attached to a product, `ProductImage` uses it automatically
and the artwork steps aside.

---

## What is real and what is placeholder

This is a pre-launch build. The interface is explicit about the difference rather than filling
gaps with invented information.

**Placeholder, and labelled as such in the UI:**

- Prices — shown with an "Indicative price" tag; no supplier pricing has been confirmed.
- Stock — every product shows an availability notice rather than a stock count.
- Notes — published from well-known public brand literature, flagged as awaiting confirmation
  against supplier documentation.
- Contact details, phone number, support hours and social handles — marked "Placeholder".
- Delivery, returns, privacy and terms — clearly labelled working drafts.

**Not present at all, by design:**

- Customer reviews, ratings, sales figures, bestseller rankings or popularity data. The
  "Trending Now" section is presented as a curated selection, and the popularity sort option is
  present but disabled with an explanation.
- Any claim of supplier relationships or product authentication.
- Any claim that checkout or payments work. The checkout button explains that no payment provider
  is connected.

### Feature flags

`src/lib/site.ts` holds a `features` object that documents each integration point:

```ts
features = {
  checkout: false,        // no payment provider connected
  accounts: false,        // customer accounts not implemented
  newsletter: false,      // no email provider connected
  contactDelivery: false, // enquiries validate but are not emailed
  aiDiscovery: false,     // the signature finder is rules-based, not AI
}
```

---

## Features

**Live**

- Occasion-led navigation and five collection pages
- Full catalogue with faceted filtering (occasion, gender, brand, price), sorting and search
- Product detail pages with size selection, quantity, notes, related products
- Shopping bag with persistence, quantity controls, subtotal
- Quick search overlay and a search results page
- Signature scent finder — a transparent, rules-based matcher over the real catalogue
- Contact form with client and server validation
- Customer information pages, 404, error boundary
- SEO: metadata, canonicals, Open Graph, JSON-LD (Organisation + Product), sitemap, robots
- Responsive from 320px up, keyboard accessible, skip link, focus styles

**Planned**

- PostgreSQL catalogue, Cloudinary imagery
- PayFast / Peach Payments checkout, order management, confirmation emails
- Customer accounts, order history, wishlist, discount codes, reviews
- AI-assisted fragrance finder and natural-language search

---

## Notes on the AI-assisted discovery section

The brief anticipates an AI fragrance finder. Rather than simulate one, the "Discover Your
Signature Scent" section ships as a working **rules-based** matcher: it scores the real catalogue
against the customer's stated occasion, character and intensity, and returns genuine matches.
The interface states plainly that AI personalisation is planned and not yet active. When a real
AI service is connected, `SignatureFinder` is the component to swap — the catalogue projection it
receives (`FinderEntry`) already contains everything a model would need.

---

## Deployment

Ready for Vercel: no environment variables are needed to build or run.

```bash
vercel
```

For the future backend, copy `.env.example` to `.env.local` and fill in the values as each
integration is configured.

---

© Common Scents. Every Moment. Every Scent.
