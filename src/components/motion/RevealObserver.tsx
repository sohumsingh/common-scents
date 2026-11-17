"use client";

import { useEffect } from "react";

/**
 * Site-wide scroll reveals.
 *
 * Any element with `data-reveal` fades and rises into place as it scrolls
 * into view. One observer serves the whole site, and a mutation observer
 * picks up content that streams in or appears after navigation.
 *
 * The hiding itself is gated by `html.motion-ok`, which the inline script in
 * the root layout adds before first paint — and only when the visitor has
 * not asked for reduced motion. `reveal-ready` tells that script hydration
 * happened; if it never does, the script removes `motion-ok` so content is
 * never left hidden.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    if (!root.classList.contains("motion-ok") || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const watched = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((element) => {
        if (watched.has(element)) return;
        watched.add(element);
        io.observe(element);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

/**
 * Runs before first paint (inlined in the document head). Enables hidden
 * reveal states only for visitors who have not asked for reduced motion, and
 * undoes that if the page's JavaScript has not started within four seconds.
 */
export const revealBootScript = `(function(){try{var d=document.documentElement;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion-ok');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('motion-ok');},4000);}catch(e){}})();`;
