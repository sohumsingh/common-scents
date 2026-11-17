"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const SCROLL_THRESHOLD = 24;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > SCROLL_THRESHOLD;

/**
 * The sticky header frame. Once the page scrolls it settles into a slimmer,
 * more solid state (`data-scrolled`), which child elements style through the
 * `group/header` variants. Only transform, colour and shadow change.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  const ref = useRef<HTMLElement>(null);

  // Publish the real header and announcement-bar heights (--header-h,
  // --topbar-h) so full-screen sections fit exactly on any device.
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const topbar = header.previousElementSibling as HTMLElement | null;
    const root = document.documentElement.style;
    const update = () => {
      root.setProperty("--header-h", `${header.offsetHeight}px`);
      root.setProperty("--topbar-h", `${topbar?.offsetHeight ?? 0}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    if (topbar) observer.observe(topbar);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      data-scrolled={scrolled ? "" : undefined}
      className="group/header sticky top-0 z-50 border-b border-transparent bg-ivory/80 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease-out-soft)] data-[scrolled]:border-line data-[scrolled]:bg-ivory/95 data-[scrolled]:shadow-[0_10px_30px_-24px_rgba(41,39,37,0.45)]"
    >
      {children}
    </header>
  );
}
