import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderStatus } from "./checkout";

/**
 * Reading orders. Row-level security decides what each visitor sees:
 * customers get their own orders, admins get everyone's. So the same
 * queries serve the account pages and the admin.
 */

export type OrderLine = {
  id: number;
  product_id: string;
  variant_id: string;
  slug: string;
  brand: string;
  name: string;
  variant_label: string;
  unit_price_zar: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  email: string;
  full_name: string;
  phone: string;
  delivery_method: string;
  address_line1: string;
  address_line2: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  subtotal_zar: number;
  delivery_fee_zar: number;
  total_zar: number;
  payment_method: "card" | "eft";
  payment_reference: string;
  created_at: string;
  updated_at: string;
  order_items: OrderLine[];
};

export type OrderListItem = Pick<
  Order,
  "id" | "order_number" | "status" | "full_name" | "email" | "total_zar" | "created_at" | "delivery_method"
> & { item_count: number };

const LIST_COLUMNS = "id, order_number, status, full_name, email, total_zar, created_at, delivery_method, order_items(quantity)";

type ListRow = Omit<OrderListItem, "item_count"> & { order_items: { quantity: number }[] };

function toListItem(row: ListRow): OrderListItem {
  const { order_items, ...rest } = row;
  return { ...rest, item_count: order_items.reduce((sum, line) => sum + line.quantity, 0) };
}

/** Orders visible to this client, newest first. */
export async function listOrders(
  supabase: SupabaseClient,
  options: { userId?: string; status?: OrderStatus; limit?: number } = {},
): Promise<OrderListItem[]> {
  let query = supabase.from("orders").select(LIST_COLUMNS).order("created_at", { ascending: false });
  if (options.userId) query = query.eq("user_id", options.userId);
  if (options.status) query = query.eq("status", options.status);
  if (options.limit) query = query.limit(options.limit);
  const { data } = await query;
  return ((data ?? []) as ListRow[]).map(toListItem);
}

/** One order with its lines, or null if it doesn't exist or isn't visible. */
export async function getOrder(supabase: SupabaseClient, orderNumber: string): Promise<Order | null> {
  if (!/^CS-\d{6,}$/.test(orderNumber)) return null;
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(id, product_id, variant_id, slug, brand, name, variant_label, unit_price_zar, quantity)")
    .eq("order_number", orderNumber)
    .order("id", { referencedTable: "order_items" })
    .maybeSingle();
  return (data as Order | null) ?? null;
}

/** The details from someone's latest order, to fill in their next checkout. */
export async function getLastOrderDetails(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("orders")
    .select("phone, delivery_method, address_line1, address_line2, suburb, city, province, postal_code")
    .eq("user_id", userId)
    .neq("delivery_method", "collect")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
