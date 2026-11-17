"use client";

import { useEffect } from "react";

/**
 * Returns keyboard focus to wherever it was when a panel (bag, search, menu,
 * filters) opened, once that panel closes. Without this, closing a panel
 * drops focus to the top of the page and keyboard users lose their place.
 */
export function useRestoreFocus(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      // Wait a frame so the panel's `inert` state has applied before refocusing.
      requestAnimationFrame(() => {
        if (previous && previous.isConnected) previous.focus({ preventScroll: true });
      });
    };
  }, [open]);
}
