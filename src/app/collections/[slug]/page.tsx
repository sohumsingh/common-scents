import { Suspense } from "react";
import { CollectionPageSkeleton } from "@/components/ui/PageSkeletons";
import { defaultShareImage } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Bottle } from "@/components/product/Bottle";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { stagger } from "@/components/motion/stagger";
import {
  CatalogueFallback,
  CatalogueView,
} from "@/components/catalogue/CatalogueView";
import { getOccasion, getProductsByOccasion, listOccasions } from "@/lib/catalogue/service";
import type { OccasionSlug } from "@/lib/types";

export async function generateStaticParams() {
  const occasions = await listOccasions();
  return occasions.map((occasion) => ({ slug: occasion.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const occasion = await getOccasion(slug);
  if (!occasion) return { title: "Collection not found" };

  return {
    title: `${occasion.name} Fragrances`,
    description: `${occasion.description} Browse the Common Scents ${occasion.name.toLowerCase()} collection.`,
    alternates: { canonical: `/collections/${occasion.slug}` },
    openGraph: {
      images: [defaultShareImage],
      title: `${occasion.name} Fragrances | Common Scents`,
      description: occasion.tagline,
      url: `/collections/${occasion.slug}`,
    },
  };
}

/**
 * The page reads its URL inside <Suspense>, so moving between collections
 * shows the page frame immediately and the collection streams in.
 */
export default function CollectionPage(props: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<CollectionPageSkeleton />}>
      <CollectionPageContent {...props} />
    </Suspense>
  );
}

async function CollectionPageContent(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const occasion = await getOccasion(slug);
  if (!occasion) notFound();

  const products = await getProductsByOccasion(occasion.slug as OccasionSlug);
  const stage = products.filter((product) => product.image).slice(0, 3);

  return (
    <>
      {/* Collection hero */}
      <header className="relative flex min-h-[calc(100svh-var(--header-h)-var(--topbar-h))] flex-col overflow-hidden border-b border-line bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(70% 90% at 85% 10%, ${occasion.wash}, transparent 70%)` }}
        />
        <Container className="relative flex flex-1 flex-col justify-center">
          <div className="grid items-center gap-12 py-[clamp(2rem,6svh,5rem)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="rise-in mb-[clamp(1.25rem,4svh,2.5rem)]" style={stagger(0)}>
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Shop All", href: "/shop" },
                    { label: occasion.name },
                  ]}
                />
              </div>

              <span className="eyebrow rise-in flex items-center gap-3" style={stagger(1)}>
                <span aria-hidden="true" className="h-px w-8 bg-gold" />
                {occasion.question}
              </span>

              <h1
                className="rise-in mt-[clamp(0.9rem,2.5svh,1.5rem)] text-balance text-[clamp(2.6rem,min(5.6vw,9svh),4.8rem)] leading-[1] text-charcoal"
                style={stagger(2)}
              >
                {occasion.name}
              </h1>

              <p className="rise-in mt-[clamp(1rem,3svh,1.75rem)] max-w-xl text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed text-stone" style={stagger(3)}>
                {occasion.description}
              </p>

              <p
                className="rise-in mt-[clamp(1rem,3svh,1.75rem)] inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-gold-deep"
                style={stagger(4)}
              >
                <span className="font-display text-[1.6rem] normal-case italic tracking-normal text-charcoal">
                  {products.length}
                </span>
                {products.length === 1 ? "fragrance" : "fragrances"} in this collection
              </p>
            </div>

            {/* The stage */}
            <div
              className="mx-auto flex w-full items-end justify-center gap-3 sm:gap-4 lg:max-w-[calc((100svh-var(--header-h)-var(--topbar-h))*0.8)]"
              aria-hidden="true"
            >
              {stage.map((product, index) => (
                <div
                  key={product.id}
                  className={`rise-in ${index === 1 ? "w-[36%]" : "mb-6 w-[30%]"}`}
                  style={stagger(index + 2)}
                >
                  <div className="float-slow" style={{ animationDelay: `${-index * 2.2}s` }}>
                    <div
                      className="aspect-[3/4.6] overflow-hidden rounded-t-[999px] border border-white/60 shadow-[0_36px_60px_-42px_rgba(41,39,37,0.55)]"
                      style={{ backgroundColor: occasion.wash }}
                    >
                      <Bottle item={product} wash={false} inset="20% 12% 8%" sizes="(min-width: 1024px) 16vw, 30vw" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
        <a
          href="#collection-products"
          className="relative mx-auto mb-[clamp(1rem,3svh,2rem)] inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone transition-colors hover:text-charcoal"
        >
          Browse the collection
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 5v14m-6-6 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </header>

      <div id="collection-products" className="scroll-mt-[var(--header-h)] py-12 lg:py-16">
        <Suspense fallback={<CatalogueFallback />}>
          <CatalogueView
            searchParams={props.searchParams}
            basePath={`/collections/${occasion.slug}`}
            lockedOccasion={occasion.slug as OccasionSlug}
          />
        </Suspense>
      </div>
    </>
  );
}
