import Link from "next/link";
import type { ReactNode } from "react";

/** Small uppercase text link with an animated underline and arrow. */
export function ArrowLink({
  href,
  children,
  tone = "light",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] ${
        tone === "dark" ? "text-ivory" : "text-charcoal"
      } ${className}`}
    >
      <span className="link-underline pb-1">{children}</span>
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
