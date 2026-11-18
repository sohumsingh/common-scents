import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

/**
 * The frame for the sign-in, register and password pages: a brand panel on
 * large screens beside a focused form card. Fills the screen below the header.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="fit-viewport py-[clamp(2rem,6svh,5rem)]">
      <Container>
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-line bg-paper shadow-[0_40px_90px_-60px_rgba(41,39,37,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
          {/* Brand panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-noir p-12 text-ivory lg:flex">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(184,161,123,0.22),transparent_70%),radial-gradient(60%_50%_at_10%_95%,rgba(184,161,123,0.12),transparent_70%)]"
            />
            <Logo tone="ivory" className="relative w-48" sizes="192px" />
            <div className="relative">
              <p className="font-display text-[2.2rem] italic leading-tight text-ivory">{site.tagline}</p>
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ivory/65">
                Save your details, keep your bag across devices and check out faster.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-10 sm:px-12 sm:py-14">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              {eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-[clamp(2rem,4vw,2.8rem)] leading-[1.05] text-charcoal">{title}</h1>
            {description ? (
              <div className="mt-3 max-w-md text-[14px] leading-relaxed text-stone">{description}</div>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8 border-t border-line pt-6 text-[13px] text-stone">{footer}</div> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
