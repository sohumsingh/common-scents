import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { InfoNote } from "@/components/ui/InfoNote";

/**
 * Shared layout for the customer information pages. These documents are
 * working drafts — the brief lists the final delivery, returns, payment and
 * contact policies as outstanding decisions, so every page says so rather
 * than presenting provisional policy as settled.
 */
export function InfoPage({
  eyebrow = "Customer Care",
  title,
  description,
  updated,
  children,
  draftNote,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  updated?: string;
  children: ReactNode;
  draftNote?: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />

      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
            <article className="max-w-2xl">
              {updated ? (
                <p className="mb-8 text-[11px] uppercase tracking-[0.18em] text-muted">
                  {updated}
                </p>
              ) : null}
              {children}
            </article>

            <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
              {draftNote ? (
                <InfoNote tone="pending" title="Working draft">
                  {draftNote}
                </InfoNote>
              ) : null}
              <InfoNote tone="info" title="Need more help?" className={draftNote ? "mt-4" : ""}>
                Our customer support team is happy to walk you through any of this. Get in touch
                and we will explain it in plain terms.
              </InfoNote>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-[1.55rem] leading-snug text-charcoal">{title}</h2>
      <div className="mt-4 space-y-4 text-[0.93rem] leading-relaxed text-stone">{children}</div>
    </section>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
