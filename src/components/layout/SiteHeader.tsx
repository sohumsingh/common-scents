import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HeaderTools } from "./HeaderTools";
import { HeaderShell } from "./HeaderShell";
import { OccasionsMenu } from "./OccasionsMenu";
import { getSearchIndex, listOccasions } from "@/lib/catalogue/service";
import { nav, site } from "@/lib/site";

export async function SiteHeader() {
  const [searchIndex, occasions] = await Promise.all([getSearchIndex(), listOccasions()]);

  // Every primary link, including each occasion — used by the mobile menu.
  const fullNav = nav.primary;
  // Desktop keeps the occasions inside the Occasions dropdown, either side of
  // the centred signature.
  const leadingNav = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
  ];
  const trailingNav = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  const linkClass =
    "relative py-2 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-[var(--ease-out-soft)] hover:text-gold-deep hover:after:scale-x-100";

  return (
    <>
      <div className="bg-noir text-ivory">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center px-5 py-2.5 sm:px-8 lg:px-12">
          <p className="text-center text-[11px] uppercase tracking-[0.32em] text-ivory/80">
            {site.tagline}
          </p>
        </div>
      </div>

      <HeaderShell>
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-6 px-5 py-3 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
          {/* Desktop: left navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7 xl:gap-9">
              {leadingNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <OccasionsMenu occasions={occasions} />
              </li>
            </ul>
          </nav>

          {/* Signature — left on phones, centred on desktop */}
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="block w-fit origin-left transition-transform duration-500 ease-[var(--ease-out-soft)] group-data-[scrolled]/header:scale-[0.84] lg:origin-center lg:justify-self-center"
          >
            <Logo priority className="w-[96px] sm:w-[108px] lg:w-[128px]" sizes="(min-width: 1024px) 128px, 108px" />
          </Link>

          {/* Desktop: right navigation + tools */}
          <div className="flex items-center justify-end gap-6 xl:gap-8">
            <nav aria-label="Secondary" className="hidden lg:block">
              <ul className="flex items-center gap-7 xl:gap-9">
                {trailingNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <HeaderTools searchIndex={searchIndex} navItems={fullNav} />
          </div>
        </div>
      </HeaderShell>
    </>
  );
}
