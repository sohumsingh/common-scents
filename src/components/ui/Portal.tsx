"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/useIsMounted";

/**
 * Renders children into `document.body`.
 *
 * The site header uses `backdrop-filter`, which creates a containing block for
 * fixed-position descendants. Any overlay rendered inside the header would
 * therefore be positioned relative to the header instead of the viewport.
 * Portalling to the body keeps overlays anchored to the viewport regardless
 * of where they are mounted in the tree.
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();

  if (!mounted) return null;

  return createPortal(children, document.body);
}
