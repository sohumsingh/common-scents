/**
 * Checkout rules shared by the checkout page, order pages and the admin.
 * Safe to use in the browser.
 *
 * The checkout is a demo: no payment is taken. The database function
 * `place_order` is the final word on prices, stock and delivery fees; the
 * figures here mirror it so the page can show the total before ordering.
 */

export const DEMO_CHECKOUT_NOTE = "This is a demo shop. No payment is taken and nothing will be sent.";

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

/** Standard delivery is free from this order value (rand). */
export const FREE_DELIVERY_FROM = 1500;

export type DeliveryMethod = "standard" | "express" | "collect";

export const DELIVERY_OPTIONS: { id: DeliveryMethod; label: string; timing: string; note: string }[] = [
  { id: "standard", label: "Standard courier", timing: "3–5 working days", note: `Free from R${FREE_DELIVERY_FROM.toLocaleString("en-ZA")}` },
  { id: "express", label: "Express courier", timing: "1–2 working days", note: "Main centres" },
  { id: "collect", label: "Collect in Cape Town", timing: "Ready in 1 working day", note: "We'll message you when it's ready" },
];

export function deliveryFee(method: DeliveryMethod, subtotal: number): number {
  if (method === "express") return 180;
  if (method === "collect") return 0;
  return subtotal >= FREE_DELIVERY_FROM ? 0 : 99;
}

export type PaymentMethod = "card" | "eft";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Card (demo)",
  eft: "Instant EFT (demo)",
};

export type OrderStatus = "paid" | "processing" | "shipped" | "delivered" | "cancelled";

/** The order's journey, in order. Cancelled sits outside it. */
export const ORDER_STEPS: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

export const ORDER_STATUS: Record<OrderStatus, { label: string; customer: string }> = {
  paid: { label: "Paid", customer: "Payment received. We're getting your order ready." },
  processing: { label: "Being prepared", customer: "Your order is being packed." },
  shipped: { label: "On its way", customer: "Your order has left us and is with the courier." },
  delivered: { label: "Delivered", customer: "Your order has been delivered. Enjoy." },
  cancelled: { label: "Cancelled", customer: "This order was cancelled. No payment was taken." },
};

export function deliveryLabel(method: string): string {
  return DELIVERY_OPTIONS.find((option) => option.id === method)?.label ?? method;
}
