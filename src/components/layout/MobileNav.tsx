"use client";

import { useRestoreFocus } from "@/hooks/useRestoreFocus";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Portal } from "@/components/ui/Portal";

type NavItem = { label: string; href: string };

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  useRestoreFocus(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-mr-2 grid h-11 w-11 place-items-center text-charcoal transition-colors hover:text-gold-deep lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
        </svg>
      </button>

      <Portal>
        <div
          className={`fixed inset-0 z-[95] overflow-hidden lg:hidden ${open ? "" : "pointer-events-none"}`}
          inert={!open}
        >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-charcoal/40 backdrop-blur-[3px] transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal={open}
          aria-label="Site menu"
          className={`absolute inset-y-0 right-0 flex w-full max-w-[22rem] flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Logo className="w-[92px]" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-stone transition-colors hover:bg-parchment hover:text-charcoal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="scrollbar-quiet flex-1 overflow-y-auto px-6 py-6">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li
                  key={item.href}
                  className={`border-b border-line/70 last:border-b-0 motion-safe:transition-[opacity,transform] motion-safe:ease-[var(--ease-out-soft)] ${
                    open
                      ? "translate-x-0 opacity-100 motion-safe:duration-500"
                      : "translate-x-6 opacity-0 motion-safe:duration-150"
                  }`}
                  style={{ transitionDelay: open ? `${160 + index * 45}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-gold-deep"
                  >
                    <span className="font-display text-[1.45rem] text-charcoal">{item.label}</span>
                    <span className="text-[11px] tabular-nums text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
              <LogoMark className="w-11 opacity-80" />
              <p className="font-display text-[1.05rem] italic leading-relaxed text-stone">
                Every Moment. Every Scent.
              </p>
            </div>
          </nav>
        </div>
      </div>
      </Portal>
    </>
  );
}
