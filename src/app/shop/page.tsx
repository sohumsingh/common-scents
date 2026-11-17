import { Suspense } from "react";
import { defaultShareImage } from "@/lib/site";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  CatalogueFallback,
  CatalogueView,
} from "@/components/catalogue/CatalogueView";

export const metadata: Metadata = {
  title: "All Fragrances",
  description:
    "Browse the full Common Scents catalogue of designer and Middle Eastern fragrances. Filter by occasion, brand, price and who the scent is for.",
  alternates: { canonical: "/shop" },
  openGraph: {
    images: [defaultShareImage],
    title: "All Fragrances | Common Scents",
    description:
      "Designer and Middle Eastern fragrances, organised by the moment you will wear them.",
    url: "/shop",
  },
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <>
      <PageHeader
        eyebrow="The Catalogue"
        title="Every fragrance, every moment."
        description="Designer and Middle Eastern scents side by side. Filter by the occasion you have in mind, the house you like, or the price that suits you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop All" }]}
      />

      <div className="py-12 lg:py-16">
        <Suspense fallback={<CatalogueFallback />}>
          <CatalogueView searchParams={props.searchParams} basePath="/shop" />
        </Suspense>
      </div>
    </>
  );
}
