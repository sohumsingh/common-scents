import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/brand/Logo";
import { stagger } from "@/components/motion/stagger";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="link-underline text-muted transition-colors hover:text-charcoal">
                {item.label}
              </Link>
            ) : (
              <span className="text-charcoal">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  align?: "left" | "center";
}) {
  const centred = align === "center";

  return (
    <header className={`relative overflow-hidden border-b border-line bg-paper py-14 lg:py-20 ${centred ? "text-center" : ""}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_90%_0%,rgba(216,203,184,0.45),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-1/2 hidden w-72 -translate-y-1/2 opacity-[0.06] md:block"
      >
        <LogoMark className="w-full" />
      </div>

      <Container className="relative">
        {breadcrumbs ? (
          <div className={`rise-in ${centred ? "flex justify-center" : ""}`} style={stagger(0)}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        ) : null}

        <div
          className={`mt-8 flex flex-col gap-5 ${centred ? "mx-auto max-w-3xl items-center" : "max-w-3xl items-start"}`}
        >
          {eyebrow ? (
            <span className="eyebrow rise-in flex items-center gap-3" style={stagger(1)}>
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              {eyebrow}
            </span>
          ) : null}
          <h1
            className="rise-in text-balance text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-charcoal"
            style={stagger(2)}
          >
            {title}
          </h1>
          {description ? (
            <p className="rise-in max-w-2xl text-[1rem] leading-relaxed text-stone" style={stagger(3)}>
              {description}
            </p>
          ) : null}
          {children}
        </div>
      </Container>
    </header>
  );
}
