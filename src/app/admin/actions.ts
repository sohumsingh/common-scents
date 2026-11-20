"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { CATALOGUE_TAG } from "@/lib/catalogue/db";
import { occasions } from "@/lib/catalogue/occasions";
import { LOW_STOCK } from "@/lib/catalogue/stock";

/**
 * Admin actions. Each one: checks admin access, validates the input, writes
 * with the admin's own session (row-level security applies), then refreshes
 * the shop's cached catalogue so the change shows immediately.
 */

export type AdminFormState = { error?: string; message?: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOUR = /^#[0-9a-fA-F]{6}$/;
const GENDERS = ["men", "women", "unisex"] as const;
const SHAPES = ["flacon", "classic", "tall", "orb", "square"] as const;
const CAPS = ["cylindrical", "square", "faceted"] as const;
const CHARACTERS = ["fresh", "woody", "sweet", "bold", "floral"] as const;
const INTENSITIES = ["light", "balanced", "rich"] as const;
const OCCASION_SLUGS = occasions.map((occasion) => occasion.slug) as string[];

type VariantInput = { id: string; label: string; size: string; price: number; stock: number | null; isDefault: boolean };

const str = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};
const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const optionalInt = (value: string, min: number, max: number): number | null | "invalid" => {
  if (value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : "invalid";
};
const oneOf = <T extends string>(value: string, options: readonly T[]): T | null =>
  (options as readonly string[]).includes(value) ? (value as T) : null;

/** Stock status for the shop, worked out from the sizes' stock figures. */
function stockStatus(stocks: (number | null)[]) {
  if (stocks.length === 0 || stocks.some((stock) => stock === null)) return "pending-verification" as const;
  const total = stocks.reduce<number>((sum, stock) => sum + (stock ?? 0), 0);
  if (total === 0) return "out-of-stock" as const;
  return stocks.some((stock) => (stock ?? 0) <= LOW_STOCK) ? ("low-stock" as const) : ("in-stock" as const);
}

function parseVariants(raw: string): VariantInput[] | string {
  let rows: unknown;
  try {
    rows = JSON.parse(raw);
  } catch {
    return "The sizes couldn't be read. Please try again.";
  }
  if (!Array.isArray(rows) || rows.length === 0) return "Add at least one size.";

  const seen = new Set<string>();
  const variants: VariantInput[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    const size = String(row.size ?? "").trim();
    const price = Number(row.price);
    const stockRaw = String(row.stock ?? "").trim();
    const stock = stockRaw === "" ? null : Number(stockRaw);
    if (!size) return "Every size needs a name, such as “100 ml”.";
    if (!Number.isInteger(price) || price < 0) return `“${size}” needs a price in whole rand.`;
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return `“${size}”: stock must be a whole number, or left empty if unconfirmed.`;
    const id = String(row.id ?? "").trim() || size.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!id || seen.has(id)) return `Each size must be different (“${size}” appears twice).`;
    seen.add(id);
    variants.push({ id, size, label: String(row.label ?? "").trim() || size, price, stock, isDefault: Boolean(row.isDefault) });
  }
  if (!variants.some((variant) => variant.isDefault)) variants[variants.length - 1].isDefault = true;
  return variants;
}

/* ------------------------------------------------------------------------ */
/* Products                                                                 */
/* ------------------------------------------------------------------------ */

export async function saveProduct(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await assertAdmin();

  const existingId = str(formData, "existingId");
  const slug = str(formData, "slug").toLowerCase();
  const name = str(formData, "name");
  const brandSlug = str(formData, "brand_slug");
  const concentration = str(formData, "concentration");
  const fullName = str(formData, "full_name") || `${name} ${concentration}`.trim();
  const gender = oneOf(str(formData, "gender"), GENDERS);
  const shortDescription = str(formData, "short_description");
  const description = str(formData, "description");
  const productOccasions = formData.getAll("occasions").map(String).filter((slug) => OCCASION_SLUGS.includes(slug));
  const finderCharacters = formData.getAll("finder_characters").map(String).filter((key) => oneOf(key, CHARACTERS));
  const finderIntensity = oneOf(str(formData, "finder_intensity"), INTENSITIES);
  const shape = oneOf(str(formData, "visual_shape"), SHAPES);
  const cap = oneOf(str(formData, "visual_cap"), CAPS);
  const colours = ["visual_accent", "visual_glass", "visual_wash"].map((field) => str(formData, field));
  const trending = optionalInt(str(formData, "trending_rank"), 1, 99);
  const compareAt = optionalInt(str(formData, "compare_at_price_zar"), 0, 1_000_000);
  const wear = ["wear_winter", "wear_spring", "wear_summer", "wear_autumn", "wear_day"].map((field) => optionalInt(str(formData, field), 0, 100));
  const longevityRaw = str(formData, "wear_longevity_hours");
  const longevity = longevityRaw === "" ? null : Number(longevityRaw);
  const addedAt = str(formData, "added_at") || new Date().toISOString().slice(0, 10);

  if (!name) return { error: "Give the fragrance a name." };
  if (!SLUG.test(slug)) return { error: "The web address may only use lowercase letters, numbers and dashes (e.g. dior-sauvage-eau-de-parfum)." };
  if (!brandSlug) return { error: "Choose a brand." };
  if (!concentration) return { error: "Add the concentration, e.g. Eau de Parfum." };
  if (!gender) return { error: "Choose who it's for." };
  if (!shortDescription || !description) return { error: "Add both the short and the full description." };
  if (productOccasions.length === 0) return { error: "Tick at least one occasion." };
  if (finderCharacters.length === 0 || !finderIntensity) return { error: "Choose at least one finder character and an intensity." };
  if (!shape || !cap || colours.some((colour) => !COLOUR.test(colour))) return { error: "Check the artwork colours and bottle shape." };
  if (trending === "invalid") return { error: "Trending position must be a whole number from 1 to 99, or empty." };
  if (compareAt === "invalid") return { error: "The ‘was’ price must be a whole number of rand, or empty." };
  if (wear.includes("invalid")) return { error: "Season and day values must be whole numbers from 0 to 100, or empty." };
  if (longevity !== null && (!Number.isFinite(longevity) || longevity < 0 || longevity > 48)) return { error: "Longevity must be a number of hours (0–48), or empty." };

  const variants = parseVariants(str(formData, "variants"));
  if (typeof variants === "string") return { error: variants };
  const listPrice = variants.find((variant) => variant.isDefault)!.price;

  const id = existingId || slug;

  // Optional new photo.
  let imageSrc: string | null | undefined;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!["image/webp", "image/png", "image/jpeg"].includes(image.type)) return { error: "Photos must be WebP, PNG or JPEG." };
    if (image.size > 5 * 1024 * 1024) return { error: "Photos must be 5 MB or smaller." };
    const extension = image.type === "image/png" ? "png" : image.type === "image/jpeg" ? "jpg" : "webp";
    const path = `${id}/${Date.now()}.${extension}`;
    const upload = await supabase.storage.from("product-images").upload(path, image, { contentType: image.type, upsert: false });
    if (upload.error) return { error: `The photo couldn't be uploaded: ${upload.error.message}` };
    imageSrc = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  } else if (formData.get("remove_image") === "on") {
    imageSrc = null;
  }

  if (!existingId) {
    const { data: taken } = await supabase.from("products").select("id").or(`id.eq.${id},slug.eq.${slug}`).limit(1);
    if (taken && taken.length > 0) return { error: "A fragrance with that web address already exists." };
  }

  let sortOrder: number | undefined;
  if (!existingId) {
    const { data: last } = await supabase.from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    sortOrder = (last?.[0]?.sort_order ?? -1) + 1;
  }

  const row = {
    id,
    slug,
    brand_slug: brandSlug,
    name,
    full_name: fullName,
    concentration,
    gender,
    price_zar: listPrice,
    compare_at_price_zar: compareAt,
    short_description: shortDescription,
    description,
    character: list(str(formData, "character")),
    notes_top: list(str(formData, "notes_top")),
    notes_heart: list(str(formData, "notes_heart")),
    notes_base: list(str(formData, "notes_base")),
    stock_status: stockStatus(variants.map((variant) => variant.stock)),
    added_at: addedAt,
    editorial_badge: str(formData, "editorial_badge") || null,
    visual_accent: colours[0],
    visual_glass: colours[1],
    visual_wash: colours[2],
    visual_shape: shape,
    visual_cap: cap,
    image_alt: str(formData, "image_alt") || `${fullName} bottle`,
    finder_characters: finderCharacters,
    finder_intensity: finderIntensity,
    wear_winter: wear[0],
    wear_spring: wear[1],
    wear_summer: wear[2],
    wear_autumn: wear[3],
    wear_day: wear[4],
    wear_longevity_hours: longevity,
    is_published: formData.get("is_published") === "on",
    trending_rank: trending,
    ...(imageSrc !== undefined ? { image_src: imageSrc } : {}),
    ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
  };

  const saved = existingId
    ? await supabase.from("products").update(row).eq("id", existingId)
    : await supabase.from("products").insert(row);
  if (saved.error) return { error: `Couldn't save: ${saved.error.message}` };

  // Occasions: replace the set.
  await supabase.from("product_occasions").delete().eq("product_id", id);
  const tags = await supabase
    .from("product_occasions")
    .insert(productOccasions.map((occasion, index) => ({ product_id: id, occasion_slug: occasion, sort_order: index })));
  if (tags.error) return { error: `Saved, but the occasions couldn't be updated: ${tags.error.message}` };

  // Sizes: upsert the new list first, then remove any that were taken out.
  const sizes = await supabase.from("product_variants").upsert(
    variants.map((variant, index) => ({
      product_id: id,
      id: variant.id,
      label: variant.label,
      size: variant.size,
      price_zar: variant.price,
      stock_quantity: variant.stock,
      sort_order: index,
    })),
    { onConflict: "product_id,id" },
  );
  if (sizes.error) return { error: `Saved, but the sizes couldn't be updated: ${sizes.error.message}` };
  const keep = variants.map((variant) => variant.id);
  await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", id)
    .not("id", "in", `(${keep.map((value) => `"${value}"`).join(",")})`);

  if (imageSrc !== undefined) {
    const keepPath = imageSrc ? decodeURIComponent(imageSrc.split("/product-images/")[1] ?? "") : undefined;
    await removeOldPhotos(supabase, id, keepPath);
  }

  updateTag(CATALOGUE_TAG);
  redirect(`/admin/products/${id}?saved=1`);
}

/**
 * Removes a product's uploaded photos from storage (they live in a folder
 * named after the product), except the one currently in use, if any.
 */
async function removeOldPhotos(
  supabase: Awaited<ReturnType<typeof assertAdmin>>["supabase"],
  productId: string,
  keepPath?: string,
) {
  const bucket = supabase.storage.from("product-images");
  const { data: files } = await bucket.list(productId);
  const stale = (files ?? []).map((file) => `${productId}/${file.name}`).filter((path) => path !== keepPath);
  if (stale.length > 0) await bucket.remove(stale);
}

export async function setPublished(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = str(formData, "id");
  const publish = formData.get("publish") === "true";
  await supabase.from("products").update({ is_published: publish }).eq("id", id);
  updateTag(CATALOGUE_TAG);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = str(formData, "id");
  if (str(formData, "confirm") !== "delete") redirect(`/admin/products/${id}?confirmDelete=1`);
  await supabase.from("products").delete().eq("id", id);
  // Remove its uploaded photos too, so nothing is left behind in storage.
  await removeOldPhotos(supabase, id);
  updateTag(CATALOGUE_TAG);
  redirect("/admin/products?deleted=1");
}

/* ------------------------------------------------------------------------ */
/* Stock and prices                                                         */
/* ------------------------------------------------------------------------ */

export async function saveStock(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await assertAdmin();

  const updates: { productId: string; variantId: string; price: number; stock: number | null }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("price:")) continue;
    const ref = key.slice("price:".length);
    const [productId, variantId] = ref.split("::");
    const price = Number(value);
    const stockRaw = String(formData.get(`stock:${ref}`) ?? "").trim();
    const stock = stockRaw === "" ? null : Number(stockRaw);
    if (!Number.isInteger(price) || price < 0) return { error: `A price for ${productId} (${variantId}) isn't a whole number of rand.` };
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return { error: `Stock for ${productId} (${variantId}) must be a whole number or empty.` };
    // Skip sizes that weren't changed (the form sends what each one started as).
    if (String(formData.get(`was:${ref}`) ?? "") === `${price}|${stock ?? ""}`) continue;
    updates.push({ productId, variantId, price, stock });
  }

  if (updates.length === 0) return { message: "Nothing to save — no changes." };

  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from("product_variants")
        .update({ price_zar: update.price, stock_quantity: update.stock })
        .eq("product_id", update.productId)
        .eq("id", update.variantId),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) return { error: `Couldn't save every size: ${failed.error.message}` };

  // Keep the changed fragrances' list price and stock status in step with their sizes.
  const changed = [...new Set(updates.map((update) => update.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("id, price_zar, product_variants(id, price_zar, stock_quantity)")
    .in("id", changed);
  await Promise.all(
    (products ?? []).map((product) => {
      const sizes = product.product_variants as { id: string; price_zar: number; stock_quantity: number | null }[];
      const listStillMatches = sizes.some((size) => size.price_zar === product.price_zar);
      return supabase
        .from("products")
        .update({
          stock_status: stockStatus(sizes.map((size) => size.stock_quantity)),
          ...(listStillMatches || sizes.length === 0 ? {} : { price_zar: Math.max(...sizes.map((size) => size.price_zar)) }),
        })
        .eq("id", product.id);
    }),
  );

  updateTag(CATALOGUE_TAG);
  return { message: `Saved ${updates.length} size${updates.length === 1 ? "" : "s"}.` };
}

/* ------------------------------------------------------------------------ */
/* Brands                                                                   */
/* ------------------------------------------------------------------------ */

export async function saveBrand(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await assertAdmin();
  const existing = str(formData, "existingSlug");
  const name = str(formData, "name");
  const slug = existing || str(formData, "slug").toLowerCase() || name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const family = str(formData, "family");
  const order = optionalInt(str(formData, "sort_order"), 0, 999);

  if (!name) return { error: "Give the brand a name." };
  if (!SLUG.test(slug)) return { error: "The brand's short name may only use lowercase letters, numbers and dashes." };
  if (family !== "designer" && family !== "middle-eastern") return { error: "Choose Designer or Middle Eastern." };
  if (order === "invalid") return { error: "Order must be a whole number." };

  // A new brand without an order goes to the end of the list.
  let sortOrder = order;
  if (sortOrder === null && !existing) {
    const { data: last } = await supabase.from("brands").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    sortOrder = (last?.[0]?.sort_order ?? -1) + 1;
  }
  const row = { slug, name, family, ...(sortOrder !== null ? { sort_order: sortOrder } : {}) };
  const result = existing
    ? await supabase.from("brands").update(row).eq("slug", existing)
    : await supabase.from("brands").insert(row);
  if (result.error) {
    return { error: result.error.code === "23505" ? "A brand with that name already exists." : `Couldn't save: ${result.error.message}` };
  }

  updateTag(CATALOGUE_TAG);
  return { message: existing ? `Saved ${name}.` : `Added ${name}.` };
}

export async function deleteBrand(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const slug = str(formData, "slug");
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("brand_slug", slug);
  if ((count ?? 0) > 0) redirect("/admin/brands?inUse=1");
  await supabase.from("brands").delete().eq("slug", slug);
  updateTag(CATALOGUE_TAG);
}

/* ------------------------------------------------------------------------ */
/* Customers                                                                */
/* ------------------------------------------------------------------------ */

export async function setRole(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const target = str(formData, "id");
  const role = str(formData, "role") === "admin" ? "admin" : "customer";
  const { error } = await supabase.rpc("admin_set_role", { target, new_role: role });
  if (error) redirect(`/admin/customers?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/customers?updated=1");
}

/* ------------------------------------------------------------------------ */
/* Orders                                                                   */
/* ------------------------------------------------------------------------ */

const ORDER_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;

export async function setOrderStatus(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = str(formData, "id");
  const number = str(formData, "number");
  const status = str(formData, "status");
  const back = `/admin/orders/${encodeURIComponent(number)}`;
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) redirect(`${back}?error=${encodeURIComponent("Choose a status.")}`);
  if (status === "cancelled" && str(formData, "confirm") !== "cancel") redirect(`${back}?confirmCancel=1`);

  const { error } = await supabase.rpc("admin_set_order_status", { target: id, new_status: status });
  if (error) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
  // Cancelling puts stock back on the shop.
  if (status === "cancelled") updateTag(CATALOGUE_TAG);
  redirect(`${back}?updated=1`);
}

/* ------------------------------------------------------------------------ */
/* Messages (contact enquiries)                                             */
/* ------------------------------------------------------------------------ */

export async function setEnquiryStatus(formData: FormData): Promise<void> {
  const { supabase } = await assertAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status") === "replied" ? "replied" : "new";
  const back = str(formData, "back") || "/admin/messages";
  const { error } = await supabase
    .from("enquiries")
    .update({ status, replied_at: status === "replied" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent("Couldn't update that message.")}`);
  redirect(back);
}
