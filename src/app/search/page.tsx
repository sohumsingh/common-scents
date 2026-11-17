import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ResultsTrailRecorder } from "@/components/catalogue/ResultsTrail";
import { SearchForm } from "@/components/catalogue/SearchForm";
import { stagger } from "@/components/motion/stagger";
import { applyFilters, parseFilters, sortProducts } from "@/lib/catalogue/query";
import { listProducts } from "@/lib/catalogue/service";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the Common Scents catalogue by fragrance name, house, character or note.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

async function SearchResults({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const products = await listProducts();
  const results = sortProducts(applyFilters(products, filters), "featured");

  if (!filters.query) {
    return (
      <>
      <SearchForm />
      <div className="border border-dashed border-line-strong px-8 py-16 text-center">
        <p className="font-display text-2xl text-charcoal">What are you looking for?</p>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-stone">
          Search by fragrance name, the house it belongs to, or a note you remember — “vanilla”,
          “oud”, “YSL”, “fresh”.
        </p>
      </div>
      </>
    );
  }

  if (results.length === 0) {
    return (
      <>
      <SearchForm query={filters.query} />
      <div className="border border-dashed border-line-strong px-8 py-16 text-center">
        <p className="font-display text-2xl text-charcoal">
          No fragrances match “{filters.query}”
        </p>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-stone">
          Try a shorter term, a different spelling, or browse by the occasion you have in mind.
        </p>
      </div>
      </>
    );
  }

  return (
    <>
      <ResultsTrailRecorder
        trail={{
          href: `/search?q=${encodeURIComponent(filters.query)}`,
          label: "Back to search results",
        }}
      />
      <SearchForm query={filters.query} />
      <p className="mb-6 text-[11px] uppercase tracking-[0.16em] text-stone">
        {results.length} {results.length === 1 ? "result" : "results"} for{" "}
        <span className="text-charcoal">“{filters.query}”</span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
        {results.map((product, index) => (
          <div key={product.id} data-reveal="rise-sm" style={stagger(index % 4)} className="flex">
            <ProductCard product={product} priority={index < 4} morph className="w-full" />
          </div>
        ))}
      </div>
    </>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Find a fragrance."
        description="Search by name, by house, or by a note you remember."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <div className="py-12 lg:py-16">
        <Container>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="aspect-[4/5] animate-pulse bg-parchment/50" />
                ))}
              </div>
            }
          >
            <SearchResults searchParams={props.searchParams} />
          </Suspense>
        </Container>
      </div>
    </>
  );
}
