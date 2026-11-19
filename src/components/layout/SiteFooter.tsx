import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { contact, nav, site } from "@/lib/site";
import { getCurrentYear } from "@/lib/current-year";
import { stagger } from "@/components/motion/stagger";

export async function SiteFooter() {
  const year = await getCurrentYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-noir text-ivory">
      {/* Oversized monogram watermark */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-10 w-[34rem] opacity-[0.04] lg:-right-10">
        <LogoMark tone="ivory" className="w-full" />
      </div>

      <Container className="relative py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
          {/* Brand */}
          <div className="max-w-sm" data-reveal="rise-sm">
            <Link href="/" aria-label={`${site.name} — home`} className="inline-block">
              <Logo tone="ivory" className="w-[180px]" sizes="180px" />
            </Link>
            <p className="mt-7 text-[14px] leading-relaxed text-ivory/65">
              A South African online fragrance retailer helping you find the right scent for the
              moment you are dressing for — from an ordinary Tuesday to a night worth remembering.
            </p>
            <p className="mt-5 font-display text-xl italic text-gold">{site.tagline}</p>
          </div>

          {/* Link columns */}
          {nav.footer.map((column, index) => (
            <nav
              key={column.title}
              aria-label={column.title}
              data-reveal="rise-sm"
              style={stagger(index + 1)}
            >
              <h2 className="text-[11px] uppercase tracking-[0.24em] text-gold">{column.title}</h2>
              <ul className="mt-6 flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-[14px] text-ivory/70 transition-colors duration-200 hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-16 grid gap-8 border-t border-ivory/12 pt-10 sm:grid-cols-3">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-gold">Email</h2>
            <a
              href={`mailto:${contact.email}`}
              className="link-underline mt-3 inline-block text-[14px] text-ivory"
            >
              {contact.email}
            </a>
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-gold">Phone</h2>
            <p className="mt-3 text-[14px] text-ivory">{contact.phone}</p>
            <p className="mt-1.5 text-[12px] text-ivory/45">Placeholder — to be confirmed</p>
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-gold">Support Hours</h2>
            <p className="mt-3 text-[14px] text-ivory">{contact.hours}</p>
            <p className="mt-1.5 text-[12px] text-ivory/45">{contact.responseTime}</p>
          </div>
        </div>
      </Container>

      <div className="relative border-t border-ivory/10">
        <Container className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ivory/50">
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="max-w-xl text-[12px] leading-relaxed text-ivory/45">
            Common Scents is a portfolio project. Products and prices are for demonstration only.
          </p>
        </Container>
      </div>
    </footer>
  );
}
