"use server";

import { updateTag } from "next/cache";
import { CATALOGUE_TAG } from "@/lib/catalogue/db";
import { PROVINCES, type DeliveryMethod, type PaymentMethod } from "@/lib/checkout";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Places a (demo) order. The browser sends the bag's sizes and quantities
 * and the customer's details; prices, stock and delivery fees are worked out
 * again by the database, which also takes the stock off. No payment is taken.
 */

export type CheckoutField =
  | "full_name"
  | "phone"
  | "address_line1"
  | "city"
  | "province"
  | "postal_code";

export type CheckoutState = {
  error?: string;
  fields?: Partial<Record<CheckoutField, string>>;
  orderNumber?: string;
};

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

function parseItems(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const items = parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const { productId, variantId, quantity } = entry as Record<string, unknown>;
        if (typeof productId !== "string" || typeof variantId !== "string") return null;
        const count = Number(quantity);
        if (!Number.isInteger(count) || count < 1 || count > 99) return null;
        return { product_id: productId, variant_id: variantId, quantity: count };
      })
      .filter((item) => item !== null);
    return items.length === parsed.length && items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

/** Turns the database's short error codes into something a customer can act on. */
function explain(message: string, detail: string | null | undefined): string {
  switch (message) {
    case "sold_out":
      return `Sorry, the ${detail ?? "fragrance"} sold out while you were checking out. Remove it from your bag to carry on.`;
    case "not_enough_stock": {
      const [name, left] = (detail ?? "").split("|");
      return `Only ${left} of the ${name} ${left === "1" ? "is" : "are"} left. Lower the quantity in your bag to carry on.`;
    }
    case "unavailable":
      return "Something in your bag is no longer on sale. Open your bag, remove it and try again.";
    case "empty_bag":
      return "Your bag is empty.";
    case "invalid_address":
      return "Please check your delivery address.";
    case "invalid_details":
      return "Please check your details.";
    case "not_signed_in":
      return "Your session has ended. Sign in again to place your order.";
    default:
      return "We couldn't place your order just now. Nothing was charged. Please try again.";
  }
}

export async function placeOrder(_state: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) return { error: explain("not_signed_in", null) };

  const items = parseItems(text(formData, "items"));
  if (!items) return { error: "Your bag couldn't be read. Refresh the page and try again." };

  const method = text(formData, "delivery_method") as DeliveryMethod;
  const payment = text(formData, "payment_method") as PaymentMethod;
  if (!["standard", "express", "collect"].includes(method) || !["card", "eft"].includes(payment)) {
    return { error: "Choose a delivery option and a payment method." };
  }

  const details = {
    email: user.email ?? "",
    full_name: text(formData, "full_name"),
    phone: text(formData, "phone"),
    delivery_method: method,
    payment_method: payment,
    address_line1: text(formData, "address_line1"),
    address_line2: text(formData, "address_line2"),
    suburb: text(formData, "suburb"),
    city: text(formData, "city"),
    province: text(formData, "province"),
    postal_code: text(formData, "postal_code"),
  };

  // Field-by-field checks, so each problem shows beside its box.
  const fields: CheckoutState["fields"] = {};
  if (details.full_name.length < 2) fields.full_name = "Enter your full name.";
  if (!/^\+?[0-9 ()-]{9,20}$/.test(details.phone)) fields.phone = "Enter a phone number we can reach you on.";
  if (method !== "collect") {
    if (details.address_line1.length < 3) fields.address_line1 = "Enter your street address.";
    if (details.city.length < 2) fields.city = "Enter your town or city.";
    if (!(PROVINCES as readonly string[]).includes(details.province)) fields.province = "Choose your province.";
    if (!/^[0-9]{4}$/.test(details.postal_code)) fields.postal_code = "Postal codes have 4 digits.";
  }
  if (Object.keys(fields).length > 0) {
    return { error: "A few details need another look.", fields };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", { items, details });
  if (error || !data?.[0]) {
    return { error: explain(error?.message ?? "", error?.details) };
  }

  // Stock has changed: refresh the shop's figures.
  updateTag(CATALOGUE_TAG);
  return { orderNumber: (data[0] as { order_number: string }).order_number };
}
