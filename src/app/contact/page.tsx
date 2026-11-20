import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { InfoNote } from "@/components/ui/InfoNote";
import { contact, defaultShareImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Common Scents about a fragrance, an order, delivery or anything else. Our customer support details and enquiry form.",
  alternates: { canonical: "/contact" },
  openGraph: {
    images: [defaultShareImage],
    title: "Contact Common Scents",
    description: "Questions about a fragrance, an order or delivery? We would like to hear from you.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer Care"
        title="Talk to us."
        description="Questions about a scent, an order or delivery — we would like to hear from you. Real people, real answers, as soon as we are available."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.78fr] lg:gap-16">
            {/* Form */}
            <div>
              <h2 className="font-display text-[1.8rem] leading-tight text-charcoal">
                Send us an enquiry
              </h2>
              <p className="mt-3 max-w-lg text-[0.92rem] leading-relaxed text-stone">
                The more context you give — the fragrance, the occasion, the order reference — the
                better we can help.
              </p>

              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            {/* Details */}
            <aside className="flex flex-col gap-8">
              <div className="border border-line bg-paper p-7">
                <h2 className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
                  Support details
                </h2>

                <dl className="mt-6 space-y-6">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">Email</dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-[14px] text-charcoal underline-offset-4 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">Hours</dt>
                    <dd className="mt-1.5 text-[14px] text-charcoal">{contact.hours}</dd>
                    <p className="mt-1 text-[11px] text-muted">{contact.responseTime}</p>
                  </div>
                </dl>

              </div>

              <InfoNote tone="info" title="Looking for a scent?">
                The fastest way to narrow things down is the occasion collections. Start with the
                moment you are dressing for and the catalogue will do the rest.
              </InfoNote>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
