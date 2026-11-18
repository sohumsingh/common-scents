import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { occasions } from "@/lib/catalogue/occasions";
import type { ProductFormValues } from "@/components/admin/ProductForm";

/** Options for the product form: brands (from the database) and the five occasions. */
export async function productFormOptions(supabase: SupabaseClient) {
  const { data } = await supabase.from("brands").select("slug, name").order("sort_order");
  return {
    brands: (data ?? []).map((brand) => ({ value: brand.slug as string, label: brand.name as string })),
    occasions: [...occasions].sort((a, b) => a.order - b.order).map((occasion) => ({ value: occasion.slug, label: occasion.name })),
  };
}

/** One product, shaped for the edit form (including hidden products). */
export async function loadProductForEdit(supabase: SupabaseClient, id: string): Promise<ProductFormValues | null> {
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(id, label, size, price_zar, stock_quantity, sort_order), product_occasions(occasion_slug, sort_order)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const bySort = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;
  const { product_variants: variants, product_occasions: tags, ...product } = data;
  return {
    ...(product as Omit<ProductFormValues, "variants" | "occasions">),
    variants: [...(variants as ProductFormValues["variants"] & { sort_order: number }[])].sort(bySort),
    occasions: [...(tags as { occasion_slug: string; sort_order: number }[])].sort(bySort).map((tag) => tag.occasion_slug),
  };
}
