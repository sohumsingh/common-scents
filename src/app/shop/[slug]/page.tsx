import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductPageSkeleton } from "@/components/ui/PageSkeletons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { BackToResults } from "@/components/catalogue/ResultsTrail";
import { InfoNote } from "@/components/ui/InfoNote";
import { AvailabilityNote } from "@/components/product/AvailabilityNote";
import { schemaAvailability } from "@/lib/catalogue/stock";
import { Badge } from "@/components/ui/Badge";
import { genderLabels } from "@/lib/format";
import { occasionBySlug } from "@/lib/catalogue/occasions";
import {
  getOccasionAlternatives,
  getProductBadge,
  getProductBySlug,
  listProducts,
} from "@/lib/catalogue/service";
import { OccasionCompare } from "@/components/product/OccasionCompare";
import { SelectedPrice, SelectedVariantProvider } from "@/components/product/SelectedVariant";
import { getDefaultVariant } from "@/lib/catalogue/variants";
import { defaultShareImage, site } from "@/lib/site";

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Fragrance not found" };

  const occasions = product.occasions
    .map((occasion) => occasionBySlug.get(occasion)?.name)
    .filter(Boolean)
    .join(", ");

  const title = `${product.brand} ${product.fullName}`;
  const description = `${product.shortDescription} Best suited to ${occasions.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      images: [defaultShareImage],
      type: "website",
      title: `${title} | ${site.name}`,
      description,
      url: `/shop/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
  };
}

/**
 * The page reads its URL inside <Suspense>, so a click from another product
 * shows the page frame immediately and the fragrance streams in.
 */
export default function ProductPage(props: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageContent params={props.params} />
    </Suspense>
  );
}

async function ProductPageContent({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const alternatives = await getOccasionAlternatives(product, 4);
  const occasions = product.occasions
    .map((occasion) => occasionBySlug.get(occasion))
    .filter((occasion): occasion is NonNullable<typeof occasion> => Boolean(occasion));

  const offerAvailability = schemaAvailability(product.variants);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.fullName,
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription,
    category: "Fragrance",
    audience: { "@type": "PeopleAudience", suggestedGender: product.gender },
    // One offer for a single size; a price range when there are several, so
    // search engines see the same prices the page shows.
    offers:
      product.variants.length > 1
        ? {
            "@type": "AggregateOffer",
            lowPrice: Math.min(...product.variants.map((variant) => variant.priceZAR)),
            highPrice: Math.max(...product.variants.map((variant) => variant.priceZAR)),
            offerCount: product.variants.length,
            priceCurrency: "ZAR",
            availability: offerAvailability,
            url: `${site.url}/shop/${product.slug}`,
            seller: { "@type": "Organization", name: site.name },
          }
        : {
            "@type": "Offer",
            price: product.variants[0]?.priceZAR ?? product.priceZAR,
            priceCurrency: "ZAR",
            availability: offerAvailability,
            url: `${site.url}/shop/${product.slug}`,
            seller: { "@type": "Organization", name: site.name },
          },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Container className="py-[clamp(1.25rem,3svh,2.5rem)]">
        {/* Main grid */}
        <div className="grid gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0">
          {/* Breadcrumbs, plus a way back to the list the customer came from */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:col-start-2 lg:row-start-1 lg:mb-[clamp(1rem,3svh,1.75rem)]">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
              <li>
                <Link href="/" className="text-muted transition-colors hover:text-charcoal">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
              <li>
                <Link href="/shop" className="text-muted transition-colors hover:text-charcoal">
                  Shop All
                </Link>
              </li>
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
              <li>
                <Link
                  href={`/shop?brand=${product.brandSlug}`}
                  className="text-muted transition-colors hover:text-charcoal"
                >
                  {product.brand}
                </Link>
              </li>
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
              <li className="text-charcoal">{product.name}</li>
            </ol>
          </nav>
          <BackToResults />
          </div>

          {/* The gallery fills the screen beside the details and stays put while they scroll. */}
          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <ProductGallery product={product} wear={product.wear} />
          </div>

          <SelectedVariantProvider defaultVariantId={getDefaultVariant(product).id}>
          <div className="mt-4 flex flex-col lg:col-start-2 lg:row-start-2 lg:mt-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="gold">{product.brand}</Badge>
              {getProductBadge(product) ? (
                <Badge tone="neutral">{getProductBadge(product)}</Badge>
              ) : null}
              <Badge tone="outline">{genderLabels[product.gender]}</Badge>
            </div>

            <h1 className="mt-[clamp(0.75rem,2svh,1.25rem)] text-balance text-[clamp(2.1rem,min(4.2vw,6.5svh),3.2rem)] leading-[1.05] text-charcoal">
              {product.name}
            </h1>
            <p className="mt-2 text-[13px] uppercase tracking-[0.16em] text-muted">
              {product.concentration}
            </p>

            <div className="mt-[clamp(0.9rem,2.5svh,1.5rem)] flex items-baseline gap-3">
              <SelectedPrice
                product={product}
                className="font-display text-[2rem] leading-none tabular-nums text-charcoal"
              />
              {product.pricingStatus === "indicative" ? (
                <span className="text-[11px] uppercase tracking-[0.16em] text-gold-deep">
                  Indicative price
                </span>
              ) : null}
            </div>

            <p className="mt-[clamp(0.9rem,2.5svh,1.5rem)] max-w-xl text-[0.95rem] leading-relaxed text-stone">
              {product.shortDescription}
            </p>

            <ul className="mt-[clamp(0.9rem,2.5svh,1.5rem)] flex flex-wrap gap-2">
              {product.character.map((trait) => (
                <li
                  key={trait}
                  className="rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-stone"
                >
                  {trait}
                </li>
              ))}
            </ul>

            <div className="mt-[clamp(1.25rem,3svh,2rem)] border-t border-line pt-[clamp(1.25rem,3svh,2rem)]">
              <ProductPurchasePanel product={product} />
            </div>

            {/* Availability */}
            <div className="mt-8 space-y-3">
              <AvailabilityNote product={product} />
              <InfoNote tone="info" title="Delivery">
                Common Scents delivers nationwide across South Africa. Delivery pricing and
                timelines are confirmed at checkout once the courier is connected.
              </InfoNote>
            </div>

            {/* Occasions */}
            {occasions.length > 0 ? (
              <div className="mt-8 border-t border-line pt-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
                  Recommended for
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {occasions.map((occasion) => (
                    <li key={occasion.slug}>
                      <Link
                        href={`/collections/${occasion.slug}`}
                        className="inline-flex items-center gap-2 border border-line bg-paper px-4 py-2.5 text-[11px] text-ink transition-colors hover:border-charcoal/40 hover:text-charcoal"
                      >
                        {occasion.name}
                        <span className="text-[11px] text-muted">{occasion.question}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          </SelectedVariantProvider>
        </div>

        {/* Detail sections */}
        <div className="mt-16 grid gap-10 border-t border-line pt-14 lg:grid-cols-3 lg:gap-12">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">The scent</h2>
            <p className="mt-5 text-[0.92rem] leading-relaxed text-stone">{product.description}</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
              Fragrance notes
            </h2>
            <ul className="mt-5 space-y-4">
              {(
                [
                  ["Top notes", product.notes.top],
                  ["Heart notes", product.notes.heart],
                  ["Base notes", product.notes.base],
                ] as const
              ).map(([label, notes]) => (
                <li key={label}>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink">{notes.join(", ")}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] leading-relaxed text-muted">
              {product.notesStatus === "verified"
                ? "Notes confirmed against supplier documentation."
                : "These notes are published from well-known public brand literature and are awaiting confirmation against supplier documentation."}
            </p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">Details</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line text-[13px]">
              {[
                ["Brand", product.brand],
                ["Concentration", product.concentration],
                ["Suitable for", genderLabels[product.gender]],
                [
                  "Sizes",
                  product.variants.map((variant) => variant.size).join(", "),
                ],
                ["Occasions", occasions.map((occasion) => occasion.name).join(", ")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </Container>

      {/* Compare by occasion */}
      {alternatives.length > 0 ? (
        <section className="border-t border-line bg-paper py-16 lg:py-20">
          <Container>
            <OccasionCompare
              productName={product.name}
              groups={alternatives.map(({ occasion, products }) => ({
                slug: occasion.slug,
                name: occasion.name,
                cards: products.map((item) => <ProductCard key={item.id} product={item} />),
              }))}
            />
          </Container>
        </section>
      ) : null}
    </>
  );
}
