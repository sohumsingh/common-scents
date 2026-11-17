"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Product, ProductVariant } from "@/lib/types";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { CartCatalogue } from "@/lib/catalogue/service";

const STORAGE_KEY = "common-scents-cart-v1";

type CartState = {
  items: CartLine[];
};

type CartAction =
  | { type: "add"; product: Product; variant: ProductVariant; quantity: number }
  | { type: "remove"; key: string }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartLine[] };

function lineKey(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };

    case "add": {
      const key = lineKey(action.product.id, action.variant.id);
      const existing = state.items.find((item) => item.key === key);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(item.quantity + action.quantity, 99) }
              : item,
          ),
        };
      }
      const line: CartLine = {
        key,
        productId: action.product.id,
        slug: action.product.slug,
        brand: action.product.brand,
        name: action.product.name,
        fullName: action.product.fullName,
        variantId: action.variant.id,
        variantLabel: action.variant.label,
        priceZAR: action.variant.priceZAR,
        quantity: Math.min(action.quantity, 99),
        visual: action.product.visual,
        image: action.product.image,
        occasions: action.product.occasions,
      };
      return { items: [...state.items, line] };
    }

    case "remove":
      return { items: state.items.filter((item) => item.key !== action.key) };

    case "setQuantity": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((item) => item.key !== action.key) };
      }
      return {
        items: state.items.map((item) =>
          item.key === action.key
            ? { ...item, quantity: Math.min(action.quantity, 99) }
            : item,
        ),
      };
    }

    case "clear":
      return { items: [] };

    default:
      return state;
  }
}

/**
 * On small screens the bag drawer covers the whole page, so adding an item
 * shows a light confirmation instead and leaves the customer where they were.
 * Matches the `lg` breakpoint, where the header switches to the mobile menu.
 */
const COMPACT_SCREEN_QUERY = "(max-width: 1023px)";

export type AddedNotice = {
  /** Changes on every add, so repeated adds restart the confirmation. */
  id: number;
  name: string;
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  /** Set briefly after adding so the UI can confirm the action. */
  lastAdded: string | null;
  /** Small-screen "added to bag" confirmation, or null when none is showing. */
  addedNotice: AddedNotice | null;
  dismissAddedNotice: () => void;
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Rebuild a saved bag from the live catalogue. Anything read back from the
 * browser is untrusted: it may be from an older catalogue or edited by hand.
 * Only the line's identity and quantity are kept; price, names and imagery
 * always come from the catalogue, and unknown sizes are dropped.
 */
function reconcileSavedBag(saved: unknown, catalogue: CartCatalogue): CartLine[] {
  if (!Array.isArray(saved)) return [];
  const lines = new Map<string, CartLine>();
  for (const entry of saved) {
    if (!entry || typeof entry !== "object") continue;
    const { productId, variantId, quantity } = entry as Partial<CartLine>;
    if (typeof productId !== "string" || typeof variantId !== "string") continue;
    const key = lineKey(productId, variantId);
    const current = catalogue[key];
    if (!current) continue;
    const count = Number.isFinite(quantity) ? Math.floor(quantity as number) : 0;
    if (count < 1) continue;
    const merged = Math.min((lines.get(key)?.quantity ?? 0) + count, 99);
    lines.set(key, { ...current, key, quantity: merged });
  }
  return [...lines.values()];
}

export function CartProvider({
  children,
  catalogue,
}: {
  children: ReactNode;
  /** Live prices and details for every size; see `getCartCatalogue`. */
  catalogue: CartCatalogue;
}) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<AddedNotice | null>(null);
  const hydrated = useIsMounted();

  // Restore the cart after mount so server and client markup stay identical.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "hydrate", items: reconcileSavedBag(JSON.parse(stored), catalogue) });
      }
    } catch {
      // Corrupt or unavailable storage — start with an empty cart.
    }
  }, [catalogue]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage may be full or blocked (private browsing) — the cart still
      // works for the current session.
    }
  }, [state.items, hydrated]);

  const addItem = useCallback(
    (product: Product, variantId?: string, quantity = 1) => {
      const variant =
        product.variants.find((candidate) => candidate.id === variantId) ?? product.variants[0];
      if (!variant) return;
      dispatch({ type: "add", product, variant, quantity });
      setLastAdded(product.id);
      if (window.matchMedia(COMPACT_SCREEN_QUERY).matches) {
        setAddedNotice({ id: Date.now(), name: product.name, size: variant.size, quantity });
      } else {
        setCartOpen(true);
      }
    },
    [],
  );

  const dismissAddedNotice = useCallback(() => setAddedNotice(null), []);

  const removeItem = useCallback((key: string) => {
    dispatch({ type: "remove", key });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "setQuantity", key, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = state.items.reduce(
      (total, item) => total + item.priceZAR * item.quantity,
      0,
    );
    return {
      items: state.items,
      itemCount,
      subtotal,
      isOpen,
      lastAdded,
      addedNotice,
      dismissAddedNotice,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openCart,
      closeCart,
      setCartOpen,
    };
  }, [
    state.items,
    isOpen,
    lastAdded,
    addedNotice,
    dismissAddedNotice,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    openCart,
    closeCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>.");
  }
  return context;
}
