"use client";

import Image from "next/image";
import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { saveProduct, type AdminFormState } from "@/app/admin/actions";
import { adminInput, adminLabel } from "./AdminUI";

export type ProductFormValues = {
  id: string;
  slug: string;
  brand_slug: string;
  name: string;
  full_name: string;
  concentration: string;
  gender: string;
  compare_at_price_zar: number | null;
  short_description: string;
  description: string;
  character: string[];
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  notes_status: string;
  pricing_status: string;
  added_at: string;
  editorial_badge: string | null;
  visual_accent: string;
  visual_glass: string;
  visual_wash: string;
  visual_shape: string;
  visual_cap: string;
  image_src: string | null;
  image_alt: string | null;
  finder_characters: string[];
  finder_intensity: string;
  wear_winter: number | null;
  wear_spring: number | null;
  wear_summer: number | null;
  wear_autumn: number | null;
  wear_day: number | null;
  wear_longevity_hours: number | string | null;
  is_published: boolean;
  trending_rank: number | null;
  price_zar: number;
  occasions: string[];
  variants: { id: string; label: string; size: string; price_zar: number; stock_quantity: number | null }[];
};

type Option = { value: string; label: string };

const CHARACTERS: Option[] = [
  { value: "fresh", label: "Fresh & clean" },
  { value: "woody", label: "Warm & woody" },
  { value: "sweet", label: "Sweet & gourmand" },
  { value: "bold", label: "Bold & intense" },
  { value: "floral", label: "Soft & floral" },
];

const blank: ProductFormValues = {
  id: "",
  slug: "",
  brand_slug: "",
  name: "",
  full_name: "",
  concentration: "Eau de Parfum",
  gender: "unisex",
  compare_at_price_zar: null,
  short_description: "",
  description: "",
  character: [],
  notes_top: [],
  notes_heart: [],
  notes_base: [],
  notes_status: "pending-verification",
  pricing_status: "indicative",
  added_at: new Date().toISOString().slice(0, 10),
  editorial_badge: null,
  visual_accent: "#B8A17B",
  visual_glass: "#E8DCC4",
  visual_wash: "#F2EBDD",
  visual_shape: "flacon",
  visual_cap: "cylindrical",
  image_src: null,
  image_alt: null,
  finder_characters: [],
  finder_intensity: "balanced",
  wear_winter: null,
  wear_spring: null,
  wear_summer: null,
  wear_autumn: null,
  wear_day: null,
  wear_longevity_hours: null,
  is_published: true,
  trending_rank: null,
  price_zar: 0,
  occasions: [],
  variants: [],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ------------------------------------------------------------------------ */

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{title}</h2>
        {description ? <p className="mt-2 text-[13px] leading-relaxed text-stone">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className={adminLabel}>{children}</span>
      {hint ? <span className="ml-2 text-[12px] normal-case tracking-normal text-muted">{hint}</span> : null}
    </label>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center bg-charcoal px-8 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-noir disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving…" : isNew ? "Add fragrance" : "Save changes"}
    </button>
  );
}

/* ------------------------------------------------------------------------ */

export function ProductForm({
  product,
  brands,
  occasions,
}: {
  product?: ProductFormValues;
  brands: Option[];
  occasions: Option[];
}) {
  const isNew = !product;
  const initial = product ?? blank;
  const [state, action] = useActionState<AdminFormState, FormData>(saveProduct, {});

  const [name, setName] = useState(initial.name);
  const [brand, setBrand] = useState(initial.brand_slug);
  const [concentration, setConcentration] = useState(initial.concentration);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const autoSlug = slugify(`${brands.find((b) => b.value === brand)?.label ?? ""} ${name} ${concentration}`);
  const shownSlug = slugTouched ? slug : autoSlug;

  const [variants, setVariants] = useState(() =>
    initial.variants.length > 0
      ? initial.variants.map((variant) => ({
          key: crypto.randomUUID(),
          id: variant.id,
          size: variant.size,
          label: variant.label,
          price: String(variant.price_zar),
          stock: variant.stock_quantity === null ? "" : String(variant.stock_quantity),
          isDefault: variant.price_zar === initial.price_zar,
        }))
      : [{ key: crypto.randomUUID(), id: "", size: "100 ml", label: "", price: "", stock: "", isDefault: true }],
  );
  const updateVariant = (key: string, patch: Partial<(typeof variants)[number]>) =>
    setVariants((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const setDefault = (key: string) => setVariants((rows) => rows.map((row) => ({ ...row, isDefault: row.key === key })));

  const [preview, setPreview] = useState<string | null>(initial.image_src);
  const [colours, setColours] = useState({
    accent: initial.visual_accent,
    glass: initial.visual_glass,
    wash: initial.visual_wash,
  });

  const variantsJson = JSON.stringify(
    variants.map((row) => ({
      id: row.id,
      size: row.size,
      label: row.label || `${row.size} ${concentration}`.trim(),
      price: row.price === "" ? NaN : Number(row.price),
      stock: row.stock,
      isDefault: row.isDefault,
    })),
  );

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      {product ? <input type="hidden" name="existingId" value={product.id} /> : null}
      <input type="hidden" name="variants" value={variantsJson} />

      {state.error ? (
        <p role="alert" className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[14px] text-red-900">
          {state.error}
        </p>
      ) : null}

      <Section title="The basics" description="What the fragrance is called and where it lives on the site.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Fragrance name</Label>
            <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className={adminInput} placeholder="Sauvage" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="brand_slug">Brand</Label>
            <select id="brand_slug" name="brand_slug" value={brand} onChange={(e) => setBrand(e.target.value)} className={adminInput}>
              <option value="">Choose a brand…</option>
              {brands.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="concentration">Concentration</Label>
            <input
              id="concentration"
              name="concentration"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              list="concentrations"
              className={adminInput}
            />
            <datalist id="concentrations">
              <option value="Eau de Parfum" />
              <option value="Eau de Toilette" />
              <option value="Parfum" />
              <option value="Extrait de Parfum" />
              <option value="Eau de Cologne" />
            </datalist>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender">Who it&apos;s for</Label>
            <select id="gender" name="gender" defaultValue={initial.gender} className={adminInput}>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="full_name" hint="Leave empty to use “name + concentration”">
              Full name
            </Label>
            <input id="full_name" name="full_name" defaultValue={initial.full_name} className={adminInput} placeholder={`${name} ${concentration}`.trim()} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="slug" hint={isNew ? "Filled in for you — edit if needed" : "Changing it changes the page's link"}>
              Web address
            </Label>
            <div className="flex items-center gap-0">
              <span className="flex h-11 items-center border border-r-0 border-line bg-parchment/60 px-3 text-[13px] text-muted">/shop/</span>
              <input
                id="slug"
                name="slug"
                value={shownSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className={adminInput}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Occasions" description="Where it appears in the five collections. A fragrance can suit several.">
        <div className="flex flex-wrap gap-2">
          {occasions.map((occasion) => (
            <label key={occasion.value} className="flex min-h-11 cursor-pointer items-center gap-2.5 border border-line bg-paper px-4 text-[14px] text-charcoal has-[:checked]:border-charcoal has-[:checked]:bg-charcoal has-[:checked]:text-ivory">
              <input type="checkbox" name="occasions" value={occasion.value} defaultChecked={initial.occasions.includes(occasion.value)} className="sr-only" />
              {occasion.label}
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes, prices and stock"
        description="Prices in whole rand. Leave stock empty while the supplier hasn't confirmed it. The default size is preselected on the product page and sets the headline price."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-[14px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-stone">
                <th className="pb-2 pr-3 font-normal">Size</th>
                <th className="pb-2 pr-3 font-normal">Price (R)</th>
                <th className="pb-2 pr-3 font-normal">Stock</th>
                <th className="pb-2 pr-3 font-normal">Default</th>
                <th className="pb-2 font-normal" />
              </tr>
            </thead>
            <tbody>
              {variants.map((row) => (
                <tr key={row.key} className="align-middle">
                  <td className="py-1.5 pr-3">
                    <input aria-label="Size" value={row.size} onChange={(e) => updateVariant(row.key, { size: e.target.value })} className={adminInput} placeholder="100 ml" />
                  </td>
                  <td className="py-1.5 pr-3">
                    <input aria-label="Price in rand" inputMode="numeric" value={row.price} onChange={(e) => updateVariant(row.key, { price: e.target.value.replace(/[^\d]/g, "") })} className={adminInput} placeholder="1499" />
                  </td>
                  <td className="py-1.5 pr-3">
                    <input aria-label="Stock" inputMode="numeric" value={row.stock} onChange={(e) => updateVariant(row.key, { stock: e.target.value.replace(/[^\d]/g, "") })} className={adminInput} placeholder="Unconfirmed" />
                  </td>
                  <td className="py-1.5 pr-3 text-center">
                    <input type="radio" aria-label="Default size" checked={row.isDefault} onChange={() => setDefault(row.key)} className="h-4 w-4 accent-charcoal" />
                  </td>
                  <td className="py-1.5 text-right">
                    <button
                      type="button"
                      disabled={variants.length === 1}
                      onClick={() => setVariants((rows) => rows.filter((item) => item.key !== row.key))}
                      className="min-h-11 px-2 text-[12px] text-stone underline-offset-4 hover:text-red-800 hover:underline disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => setVariants((rows) => [...rows, { key: crypto.randomUUID(), id: "", size: "", label: "", price: "", stock: "", isDefault: false }])}
            className="min-h-11 text-[12px] uppercase tracking-[0.16em] text-charcoal underline decoration-gold/60 underline-offset-4"
          >
            + Add a size
          </button>
          <label className="flex items-center gap-2 text-[13px] text-stone">
            <input type="checkbox" name="pricing_confirmed" defaultChecked={initial.pricing_status === "confirmed"} className="h-4 w-4 accent-charcoal" />
            Prices confirmed with the supplier (removes “indicative price”)
          </label>
          <div className="flex items-center gap-2">
            <Label htmlFor="compare_at_price_zar">‘Was’ price</Label>
            <input id="compare_at_price_zar" name="compare_at_price_zar" inputMode="numeric" defaultValue={initial.compare_at_price_zar ?? ""} className={`${adminInput} w-28`} placeholder="Optional" />
          </div>
        </div>
      </Section>

      <Section title="Descriptions and notes" description="The short line appears on cards; the full description on the product page. Separate tags and notes with commas.">
        <div className="flex flex-col gap-2">
          <Label htmlFor="short_description">Short description</Label>
          <input id="short_description" name="short_description" defaultValue={initial.short_description} className={adminInput} maxLength={160} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Full description</Label>
          <textarea id="description" name="description" defaultValue={initial.description} rows={5} className={`${adminInput} h-auto py-3 leading-relaxed`} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="character" hint="e.g. Aromatic, Fresh, Confident">
            Character tags
          </Label>
          <input id="character" name="character" defaultValue={initial.character.join(", ")} className={adminInput} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {(["notes_top", "notes_heart", "notes_base"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <Label htmlFor={field}>{field === "notes_top" ? "Top notes" : field === "notes_heart" ? "Heart notes" : "Base notes"}</Label>
              <textarea id={field} name={field} defaultValue={initial[field].join(", ")} rows={3} className={`${adminInput} h-auto py-2.5`} />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[13px] text-stone">
          <input type="checkbox" name="notes_verified" defaultChecked={initial.notes_status === "verified"} className="h-4 w-4 accent-charcoal" />
          Notes confirmed against supplier documentation
        </label>
      </Section>

      <Section title="Photo" description="WebP, PNG or JPEG up to 5 MB. A transparent or white background works best. Without a photo, the illustrated bottle below is shown.">
        <div className="flex flex-wrap items-start gap-6">
          <div className="relative grid h-40 w-32 place-items-center overflow-hidden border border-line" style={{ backgroundColor: colours.wash }}>
            {preview ? (
              <Image src={preview} alt="" fill sizes="128px" className="object-contain p-3 mix-blend-multiply" unoptimized={preview.startsWith("blob:")} />
            ) : (
              <span className="px-3 text-center text-[12px] text-muted">No photo</span>
            )}
          </div>
          <div className="flex min-w-60 flex-1 flex-col gap-3">
            <input
              type="file"
              name="image"
              accept="image/webp,image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
              className="text-[13px] text-stone file:mr-4 file:min-h-11 file:border file:border-charcoal/25 file:bg-paper file:px-4 file:text-[11px] file:uppercase file:tracking-[0.16em] file:text-charcoal"
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="image_alt" hint="Describes the photo for screen readers">
                Photo description
              </Label>
              <input id="image_alt" name="image_alt" defaultValue={initial.image_alt ?? ""} className={adminInput} placeholder={`${name} bottle`} />
            </div>
            {initial.image_src ? (
              <label className="flex items-center gap-2 text-[13px] text-stone">
                <input type="checkbox" name="remove_image" className="h-4 w-4 accent-charcoal" />
                Remove the current photo
              </label>
            ) : null}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-5">
          {(
            [
              ["visual_accent", "Accent", "accent"],
              ["visual_glass", "Glass", "glass"],
              ["visual_wash", "Background", "wash"],
            ] as const
          ).map(([field, label, key]) => (
            <div key={field} className="flex flex-col gap-2">
              <Label htmlFor={field}>{label}</Label>
              <input
                id={field}
                name={field}
                type="color"
                value={colours[key]}
                onChange={(e) => setColours((current) => ({ ...current, [key]: e.target.value }))}
                className="h-11 w-full cursor-pointer border border-line bg-paper p-1"
              />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <Label htmlFor="visual_shape">Bottle shape</Label>
            <select id="visual_shape" name="visual_shape" defaultValue={initial.visual_shape} className={adminInput}>
              {["flacon", "classic", "tall", "orb", "square"].map((shape) => (
                <option key={shape} value={shape}>
                  {shape[0].toUpperCase() + shape.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="visual_cap">Cap</Label>
            <select id="visual_cap" name="visual_cap" defaultValue={initial.visual_cap} className={adminInput}>
              {["cylindrical", "square", "faceted"].map((cap) => (
                <option key={cap} value={cap}>
                  {cap[0].toUpperCase() + cap.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Signature finder" description="How the home page finder matches this fragrance.">
        <div className="flex flex-wrap gap-2">
          {CHARACTERS.map((option) => (
            <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-2.5 border border-line bg-paper px-4 text-[14px] text-charcoal has-[:checked]:border-charcoal has-[:checked]:bg-charcoal has-[:checked]:text-ivory">
              <input type="checkbox" name="finder_characters" value={option.value} defaultChecked={initial.finder_characters.includes(option.value)} className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>
        <div className="flex max-w-xs flex-col gap-2">
          <Label htmlFor="finder_intensity">Intensity</Label>
          <select id="finder_intensity" name="finder_intensity" defaultValue={initial.finder_intensity} className={adminInput}>
            <option value="light">Light</option>
            <option value="balanced">Balanced</option>
            <option value="rich">Rich</option>
          </select>
        </div>
      </Section>

      <Section title="Wear guide" description="Season and day values are 0–100 (normalised community votes); longevity is typical hours. Leave all empty to hide the guide.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          {(
            [
              ["wear_winter", "Winter"],
              ["wear_spring", "Spring"],
              ["wear_summer", "Summer"],
              ["wear_autumn", "Autumn"],
              ["wear_day", "Day %"],
              ["wear_longevity_hours", "Hours"],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="flex flex-col gap-2">
              <Label htmlFor={field}>{label}</Label>
              <input id={field} name={field} inputMode="decimal" defaultValue={initial[field] ?? ""} className={adminInput} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="On the shop" description="Badges, Trending Now and whether the fragrance is visible.">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="editorial_badge" hint="Optional">
              Badge
            </Label>
            <input id="editorial_badge" name="editorial_badge" defaultValue={initial.editorial_badge ?? ""} list="badges" className={adminInput} />
            <datalist id="badges">
              <option value="Signature Pick" />
              <option value="Curator's Edit" />
            </datalist>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="trending_rank" hint="1 = first; empty = not trending">
              Trending position
            </Label>
            <input id="trending_rank" name="trending_rank" inputMode="numeric" defaultValue={initial.trending_rank ?? ""} className={adminInput} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="added_at" hint="Sets “New In”">
              Date added
            </Label>
            <input id="added_at" name="added_at" type="date" defaultValue={initial.added_at} className={adminInput} />
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-[14px] text-charcoal">
          <input type="checkbox" name="is_published" defaultChecked={initial.is_published} className="h-4 w-4 accent-charcoal" />
          Show on the shop (untick to hide it without deleting)
        </label>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-end gap-4 border-t border-line bg-ivory/95 px-5 py-4 backdrop-blur sm:mx-0">
        <SaveButton isNew={isNew} />
      </div>
    </form>
  );
}
