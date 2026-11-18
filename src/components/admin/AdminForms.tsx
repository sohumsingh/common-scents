"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveBrand, saveStock, type AdminFormState } from "@/app/admin/actions";
import { formatZAR } from "@/lib/format";
import { LOW_STOCK, adminButton, adminInput } from "./AdminUI";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={adminButton}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function Result({ state }: { state: AdminFormState }) {
  if (state.error) return <p role="alert" className="text-[13px] text-red-900">{state.error}</p>;
  if (state.message) return <p role="status" className="text-[13px] text-emerald-900">{state.message}</p>;
  return null;
}

/* ------------------------------------------------------------------------ */
/* Stock and prices: every size in one table                                */
/* ------------------------------------------------------------------------ */

export type StockRow = {
  productId: string;
  productName: string;
  brand: string;
  isPublished: boolean;
  variantId: string;
  size: string;
  price: number;
  stock: number | null;
};

export function StockForm({ rows }: { rows: StockRow[] }) {
  const [state, action] = useActionState(saveStock, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[40rem] text-left text-[14px]">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-3 font-normal">Fragrance</th>
              <th className="px-4 py-3 font-normal">Size</th>
              <th className="w-36 px-4 py-3 font-normal">Price (R)</th>
              <th className="w-36 px-4 py-3 font-normal">In stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => {
              const ref = `${row.productId}::${row.variantId}`;
              const firstOfProduct = index === 0 || rows[index - 1].productId !== row.productId;
              const low = row.stock !== null && row.stock <= LOW_STOCK;
              return (
                <tr key={ref} className={firstOfProduct ? "border-t-2 border-t-line" : ""}>
                  <td className="px-4 py-2">
                    {firstOfProduct ? (
                      <>
                        <span className="block text-charcoal">{row.productName}</span>
                        <span className="block text-[12px] text-muted">
                          {row.brand}
                          {row.isPublished ? "" : " · hidden"}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-stone">{row.size}</td>
                  <td className="px-4 py-2">
                    <input
                      name={`price:${ref}`}
                      inputMode="numeric"
                      defaultValue={row.price}
                      aria-label={`Price of ${row.productName} ${row.size}, currently ${formatZAR(row.price)}`}
                      className={adminInput}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      name={`stock:${ref}`}
                      inputMode="numeric"
                      defaultValue={row.stock ?? ""}
                      placeholder="Unconfirmed"
                      aria-label={`Stock of ${row.productName} ${row.size}`}
                      className={`${adminInput} ${low ? "border-gold/70 bg-gold/8" : ""}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t border-line bg-ivory/95 py-4 backdrop-blur">
        <Result state={state} />
        <Submit label="Save all" pendingLabel="Saving…" />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */
/* Brands                                                                   */
/* ------------------------------------------------------------------------ */

export type BrandRow = { slug: string; name: string; family: string; sort_order: number; products: number };

export function BrandForm({ brand }: { brand?: BrandRow }) {
  const [state, action] = useActionState(saveBrand, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      {brand ? <input type="hidden" name="existingSlug" value={brand.slug} /> : null}
      <label className="flex min-w-48 flex-1 flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-stone">Name</span>
        <input name="name" defaultValue={brand?.name} className={adminInput} placeholder="e.g. Maison Francis Kurkdjian" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-stone">Family</span>
        <select name="family" defaultValue={brand?.family ?? "designer"} className={adminInput}>
          <option value="designer">Designer</option>
          <option value="middle-eastern">Middle Eastern</option>
        </select>
      </label>
      <label className="flex w-24 flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-stone">Order</span>
        <input name="sort_order" inputMode="numeric" defaultValue={brand?.sort_order ?? ""} className={adminInput} />
      </label>
      <Submit label={brand ? "Save" : "Add brand"} pendingLabel="Saving…" />
      <div className="basis-full empty:hidden">
        <Result state={state} />
      </div>
    </form>
  );
}
