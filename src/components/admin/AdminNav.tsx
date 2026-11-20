"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stock", label: "Stock & prices" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/customers", label: "Customers" },
];

/** The admin area's tab bar, with the current section underlined. */
export function AdminNav() {
  const pathname = usePathname();
  const active = items.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)))?.href;
  return <AdminNavList active={active} />;
}

/** The tab bar itself. Rendered without a highlight while the address is read. */
export function AdminNavList({ active }: { active?: string }) {
  return (
    <nav aria-label="Admin" className="scrollbar-quiet -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1 border-b border-line">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={`relative flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[0.18em] transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-px after:transition-colors ${
                active === item.href ? "text-charcoal after:bg-charcoal" : "text-stone after:bg-transparent hover:text-charcoal"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="ml-auto">
          <Link href="/" className="flex min-h-11 items-center px-4 text-[11px] uppercase tracking-[0.18em] text-stone hover:text-charcoal">
            View site ↗
          </Link>
        </li>
      </ul>
    </nav>
  );
}
