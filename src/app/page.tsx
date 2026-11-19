import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { OccasionShowcase } from "@/components/home/OccasionShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { SignatureFinder } from "@/components/home/SignatureFinder";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFinderCatalogue } from "@/lib/catalogue/service";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Find Your Scent for Every Moment`,
  description:
    "Common Scents is a South African online fragrance retailer. Discover designer and Middle Eastern fragrances for daily wear, date night, special occasions, the gym and the office.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const finderCatalogue = await getFinderCatalogue();

  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    areaServed: { "@type": "Country", name: "South Africa" },
    currenciesAccepted: "ZAR",
  };

  return (
    <div className="home-scroll">
      {/* Background that shifts colour as you scroll (see globals.css) */}
      <div aria-hidden="true" className="home-wash pointer-events-none fixed inset-0 -z-10" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
      />

      <Hero />

      <OccasionShowcase />

      <FeaturedProducts />

      <TrendingSection />

      {/* Signature finder */}
      <section className="fit-viewport py-[clamp(2rem,6svh,5rem)]">
        <Container>
          <SignatureFinder
            catalogue={finderCatalogue}
            intro={
              <SectionHeading
                reveal
                eyebrow="Discover Your Signature Scent"
                title="Not sure where to start? Let us help."
                titleClassName="text-[clamp(2rem,min(3.4vw,6svh),3rem)]"
                description="Answer a few quick questions and we'll find the fragrances made for you."
              />
            }
          />
        </Container>
      </section>

      <AboutTeaser />

      <NewsletterSection />
    </div>
  );
}
