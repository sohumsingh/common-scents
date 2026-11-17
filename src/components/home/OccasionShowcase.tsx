import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bottle } from "@/components/product/Bottle";
import { stagger } from "@/components/motion/stagger";
import { getProductsByOccasion, listOccasions } from "@/lib/catalogue/service";
import type { Occasion, Product } from "@/lib/types";

function OccasionCard({
  occasion,
  product,
  featured,
}: {
  occasion: Occasion;
  product?: Product;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/collections/${occasion.slug}`}
      className={`group relative flex min-h-[19rem] w-full overflow-hidden sm:min-h-[8rem] border border-line transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-42px_rgba(41,39,37,0.55)] `}
      style={{ backgroundColor: occasion.wash }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundColor: occasion.accent }}
      />

      {product ? (
        <div
          className={`pointer-events-none absolute transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:-translate-y-2 group-hover:scale-[1.05] ${
            featured
              ? "bottom-0 right-[-2%] w-[46%] aspect-[4/5] sm:right-[2%] sm:w-[36%] lg:right-[4%] lg:w-[32%]"
              : "bottom-[-4%] right-[-6%] w-[50%] aspect-[4/5] lg:w-[44%]"
          }`}
        >
          <Bottle item={product} wash={false} inset="6% 8% 4%" sizes="(min-width: 1024px) 18vw, 40vw" />
        </div>
      ) : null}

      <div
        className={`relative z-10 flex flex-1 flex-col ${featured ? "p-[clamp(1.25rem,4svh,2.75rem)]" : "p-[clamp(1rem,2.4svh,1.5rem)]"}`}
      >
        <span className="text-[11px] tabular-nums tracking-[0.22em] text-charcoal/45">
          {String(occasion.order).padStart(2, "0")}
        </span>

        <h3
          className={`mt-[clamp(0.4rem,1.2svh,0.75rem)] font-display leading-[1.05] text-charcoal ${
            featured ? "text-[clamp(2rem,min(3.4vw,6svh),2.9rem)]" : "text-[clamp(1.3rem,min(2vw,3.4svh),1.6rem)]"
          }`}
        >
          {occasion.name}
        </h3>

        <p
          className={`mt-[clamp(0.4rem,1.2svh,0.75rem)] font-display italic leading-snug text-charcoal/75 ${
            featured ? "max-w-md text-[1.05rem]" : "max-w-[62%] text-[0.95rem]"
          }`}
        >
          {occasion.question}
        </p>

        <p
          className={`mt-3 max-w-md text-[13px] leading-relaxed text-charcoal/65 ${
            featured ? "block" : "hidden"
          }`}
        >
          {occasion.tagline}
        </p>

        <span className="mt-auto inline-flex items-center gap-2 pt-[clamp(0.75rem,2.5svh,1.75rem)] text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors group-hover:text-gold-deep">
          Explore collection
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export async function OccasionShowcase() {
  const occasions = await listOccasions();

  // A different fragrance on each tile, so no bottle appears twice.
  const byOccasion = await Promise.all(occasions.map((occasion) => getProductsByOccasion(occasion.slug)));
  const used = new Set<string>();
  const featuredProducts = byOccasion.map((products) => {
    const pick = products.find((product) => !used.has(product.id) && product.image) ?? products[0];
    if (pick) used.add(pick.id);
    return pick;
  });

  return (
    <section id="occasions" className="fit-viewport scroll-mt-[var(--header-h)] py-[clamp(2rem,6svh,5rem)]">
      <Container className="flex flex-1 flex-col">
        <SectionHeading
          reveal
          eyebrow="Shop by Occasion"
          title="Start with the moment, not the brand."
          description="Most fragrance stores organise by gender or label. We organise by the part of your life the fragrance is for — which is usually a much easier place to begin."
          action={
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-charcoal underline decoration-gold/60 underline-offset-[7px] transition-colors hover:decoration-charcoal"
            >
              View all fragrances
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          }
        />

        <div className="mt-[clamp(2rem,4svh,3rem)] grid flex-1 gap-4 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-4 lg:grid-rows-2">
          {occasions.map((occasion, index) => (
            <div
              key={occasion.slug}
              data-reveal
              style={stagger(index)}
              className={`flex ${index === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`}
            >
              <OccasionCard occasion={occasion} product={featuredProducts[index]} featured={index === 0} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
