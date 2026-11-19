"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { placeOrder, type CheckoutField, type CheckoutState } from "@/app/checkout/actions";
import { useCart } from "@/components/cart/CartProvider";
import { Bottle } from "@/components/product/Bottle";
import {
  DELIVERY_OPTIONS,
  DEMO_CHECKOUT_NOTE,
  FREE_DELIVERY_FROM,
  PROVINCES,
  deliveryFee,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/checkout";
import { formatZAR } from "@/lib/format";

export type CheckoutDefaults = {
  email: string;
  full_name: string;
  phone: string;
  delivery_method: DeliveryMethod;
  address_line1: string;
  address_line2: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
};

type Values = Omit<CheckoutDefaults, "email" | "delivery_method">;

const inputClass =
  "h-12 w-full border bg-ivory/40 px-4 text-[15px] text-charcoal transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:border-gold-deep focus:shadow-[0_2px_0_0_var(--color-gold)] focus:outline-none";

const FIELD_ORDER: CheckoutField[] = ["full_name", "phone", "address_line1", "city", "province", "postal_code"];

/* ------------------------------------------------------------------------ */

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${number}`} className="border-t border-line pt-7">
      <h2 id={`step-${number}`} className="flex items-baseline gap-3 text-[11px] uppercase tracking-[0.22em] text-gold-deep">
        <span className="font-display text-[1.35rem] normal-case tracking-normal text-charcoal">{number}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  optional,
  className = "",
  ...input
}: {
  label: string;
  name: keyof Values;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  optional?: boolean;
  className?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "text";
  maxLength?: number;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-[11px] uppercase tracking-[0.18em] text-stone">
        {label}
        {optional ? <span className="ml-2 normal-case tracking-normal text-muted">optional</span> : null}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-2 ${inputClass} ${error ? "border-red-800/60" : "border-line"}`}
        {...input}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] text-red-900">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  name,
  value,
  checked,
  onSelect,
  title,
  detail,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
  aside: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 border px-4 py-3.5 transition-colors duration-200 ${
        checked ? "border-charcoal bg-paper" : "border-line bg-ivory/40 hover:border-charcoal/40"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-charcoal)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] text-charcoal">{title}</span>
        <span className="mt-0.5 block text-[12px] text-stone">{detail}</span>
      </span>
      <span className="shrink-0 text-right text-[13px] tabular-nums text-charcoal">{aside}</span>
    </label>
  );
}

function PlaceOrderButton({ total, disabled }: { total: number; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="sheen flex h-13 w-full items-center justify-center gap-3 bg-charcoal px-6 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:bg-noir disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border border-ivory/40 border-t-ivory" />
          Processing payment…
        </>
      ) : (
        `Pay ${formatZAR(total)}`
      )}
    </button>
  );
}

/** A card drawing for the demo payment step. It is a picture, not a form. */
function DemoCard({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[1.586] w-full max-w-[19rem] overflow-hidden rounded-xl bg-[linear-gradient(135deg,#292725_0%,#3b3631_55%,#6b5a3e_100%)] p-5 text-ivory shadow-[0_24px_40px_-26px_rgba(41,39,37,0.8)]"
    >
      <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-gold/30" />
      <span className="absolute -right-2 -top-4 h-24 w-24 rounded-full border border-gold/20" />
      <div className="flex items-start justify-between">
        <span className="h-7 w-9 rounded-[5px] bg-[linear-gradient(135deg,#e8d7a6,#b8954a)]" />
        <span className="text-[10px] uppercase tracking-[0.24em] text-gold">Demo</span>
      </div>
      <p className="mt-6 font-mono text-[15px] tracking-[0.14em]">4242 4242 4242 4242</p>
      <div className="mt-3 flex items-end justify-between text-[10px] uppercase tracking-[0.16em] text-ivory/70">
        <span className="truncate pr-4">{name || "Your name"}</span>
        <span>12 / 30</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export function CheckoutForm({ defaults }: { defaults: CheckoutDefaults }) {
  const router = useRouter();
  const { items, ready, subtotal, clearCart, openCart } = useCart();
  const [state, formAction] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [method, setMethod] = useState<DeliveryMethod>(defaults.delivery_method);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [values, setValues] = useState<Values>({
    full_name: defaults.full_name,
    phone: defaults.phone,
    address_line1: defaults.address_line1,
    address_line2: defaults.address_line2,
    suburb: defaults.suburb,
    city: defaults.city,
    province: defaults.province,
    postal_code: defaults.postal_code,
  });
  const errorRef = useRef<HTMLDivElement>(null);
  const set = (name: keyof Values) => (value: string) => setValues((current) => ({ ...current, [name]: value }));

  // Order placed: empty the bag and show the confirmation.
  useEffect(() => {
    if (!state.orderNumber) return;
    clearCart();
    router.replace(`/account/orders/${state.orderNumber}?placed=1`);
  }, [state.orderNumber, clearCart, router]);

  // A problem: take the customer to the first field that needs attention.
  useEffect(() => {
    if (!state.error) return;
    const first = FIELD_ORDER.find((name) => state.fields?.[name]);
    if (first) document.getElementById(first)?.focus();
    else errorRef.current?.focus();
  }, [state]);

  const fee = deliveryFee(method, subtotal);
  const total = subtotal + fee;
  const soldOut = items.filter((item) => item.stock === 0);
  const tooMany = items.filter((item) => typeof item.stock === "number" && item.stock > 0 && item.quantity > item.stock);
  const blocked = soldOut.length > 0 || tooMany.length > 0;
  const fieldError = (name: CheckoutField) => state.fields?.[name];

  if (!ready || state.orderNumber) {
    return (
      <div role="status" aria-label={state.orderNumber ? "Opening your order" : "Loading your bag"} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse bg-parchment/60" />
          ))}
        </div>
        <div className="h-80 animate-pulse bg-parchment/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg border-t border-line pt-8">
        <p className="font-display text-2xl text-charcoal">Your bag is empty</p>
        <p className="mt-2 text-[14px] leading-relaxed text-stone">Add a fragrance to your bag, then come back here to check out.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center bg-charcoal px-7 text-[11px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-noir"
        >
          Browse fragrances
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })))}
      />

      <div className="flex min-w-0 flex-col gap-10">
        {state.error ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[14px] leading-relaxed text-red-900 focus:outline-none"
          >
            {state.error}
          </div>
        ) : null}

        <Step number={1} title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="full_name" autoComplete="name" value={values.full_name} onChange={set("full_name")} error={fieldError("full_name")} />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={set("phone")}
              error={fieldError("phone")}
            />
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone">Email</p>
              <p className="mt-2 text-[15px] text-charcoal">{defaults.email}</p>
              <p className="mt-1 text-[12px] text-muted">Your order confirmation is linked to this account.</p>
            </div>
          </div>
        </Step>

        <Step number={2} title="Delivery">
          <fieldset>
            <legend className="sr-only">Delivery option</legend>
            <div className="flex flex-col gap-2.5">
              {DELIVERY_OPTIONS.map((option) => {
                const optionFee = deliveryFee(option.id, subtotal);
                return (
                  <Choice
                    key={option.id}
                    name="delivery_method"
                    value={option.id}
                    checked={method === option.id}
                    onSelect={() => setMethod(option.id)}
                    title={option.label}
                    detail={`${option.timing} · ${option.note}`}
                    aside={optionFee === 0 ? "Free" : formatZAR(optionFee)}
                  />
                );
              })}
            </div>
          </fieldset>
          {method === "standard" && subtotal < FREE_DELIVERY_FROM ? (
            <p className="mt-3 text-[12px] text-stone">
              Add {formatZAR(FREE_DELIVERY_FROM - subtotal)} more for free standard delivery.
            </p>
          ) : null}

          {method === "collect" ? (
            <p className="mt-6 border border-line bg-parchment/40 px-4 py-3.5 text-[13px] leading-relaxed text-stone">
              Collect from our Cape Town studio. We&apos;ll message you on the number above when your order is ready, with the address and opening hours.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Street address"
                name="address_line1"
                autoComplete="address-line1"
                className="sm:col-span-2"
                value={values.address_line1}
                onChange={set("address_line1")}
                error={fieldError("address_line1")}
              />
              <Field
                label="Apartment, complex or unit"
                name="address_line2"
                autoComplete="address-line2"
                optional
                className="sm:col-span-2"
                value={values.address_line2}
                onChange={set("address_line2")}
              />
              <Field label="Suburb" name="suburb" optional value={values.suburb} onChange={set("suburb")} />
              <Field
                label="Town or city"
                name="city"
                autoComplete="address-level2"
                value={values.city}
                onChange={set("city")}
                error={fieldError("city")}
              />
              <div>
                <label htmlFor="province" className="text-[11px] uppercase tracking-[0.18em] text-stone">
                  Province
                </label>
                <select
                  id="province"
                  name="province"
                  autoComplete="address-level1"
                  value={values.province}
                  onChange={(event) => set("province")(event.target.value)}
                  required
                  aria-invalid={fieldError("province") ? true : undefined}
                  aria-describedby={fieldError("province") ? "province-error" : undefined}
                  className={`mt-2 ${inputClass} ${fieldError("province") ? "border-red-800/60" : "border-line"} ${values.province ? "" : "text-muted"}`}
                >
                  <option value="">Choose…</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {fieldError("province") ? (
                  <p id="province-error" className="mt-1.5 text-[12px] text-red-900">
                    {fieldError("province")}
                  </p>
                ) : null}
              </div>
              <Field
                label="Postal code"
                name="postal_code"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={4}
                value={values.postal_code}
                onChange={set("postal_code")}
                error={fieldError("postal_code")}
              />
            </div>
          )}
        </Step>

        <Step number={3} title="Payment">
          <p className="mb-4 border border-gold/35 bg-gold/8 px-4 py-3 text-[12px] leading-relaxed text-gold-deep">
            {DEMO_CHECKOUT_NOTE} Pick either option to see how it works.
          </p>
          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <div className="flex flex-col gap-2.5">
              <Choice
                name="payment_method"
                value="card"
                checked={payment === "card"}
                onSelect={() => setPayment("card")}
                title="Card"
                detail="Visa, Mastercard or American Express"
                aside={<span className="text-[11px] uppercase tracking-[0.14em] text-stone">Demo</span>}
              />
              <Choice
                name="payment_method"
                value="eft"
                checked={payment === "eft"}
                onSelect={() => setPayment("eft")}
                title="Instant EFT"
                detail="Pay straight from your bank account"
                aside={<span className="text-[11px] uppercase tracking-[0.14em] text-stone">Demo</span>}
              />
            </div>
          </fieldset>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            {payment === "card" ? (
              <>
                <DemoCard name={values.full_name} />
                <p className="max-w-xs text-[13px] leading-relaxed text-stone">
                  In a live shop your card details would be entered on the payment provider&apos;s secure page. Here, a demo card is used and nothing is charged.
                </p>
              </>
            ) : (
              <p className="max-w-md text-[13px] leading-relaxed text-stone">
                In a live shop you would be sent to your bank to approve the payment. In this demo, that step is skipped and the order is marked as paid.
              </p>
            )}
          </div>
        </Step>
      </div>

      {/* Summary */}
      <aside aria-labelledby="summary-heading" className="border border-line bg-paper lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
        <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
          <h2 id="summary-heading" className="text-[11px] uppercase tracking-[0.22em] text-gold-deep">
            Your order
          </h2>
          <button type="button" onClick={openCart} className="text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
            Edit bag
          </button>
        </div>

        <ul className="scrollbar-quiet max-h-[40svh] divide-y divide-line overflow-y-auto px-5">
          {items.map((item) => {
            const out = item.stock === 0;
            const over = typeof item.stock === "number" && item.stock > 0 && item.quantity > item.stock;
            return (
              <li key={item.key} className="flex gap-3.5 py-3.5">
                <div className="relative h-16 w-13 shrink-0 border border-line">
                  <Bottle item={item} inset="8% 10% 5%" sizes="52px" shadow={false} />
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-charcoal px-1 text-[10px] tabular-nums text-ivory">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold-deep">{item.brand}</p>
                  <p className="truncate font-display text-[1rem] leading-snug text-charcoal">{item.name}</p>
                  <p className="text-[11px] text-muted">{item.variantLabel}</p>
                  {out ? <p className="mt-0.5 text-[11px] text-red-900">Sold out</p> : null}
                  {over ? <p className="mt-0.5 text-[11px] text-red-900">Only {item.stock} left</p> : null}
                </div>
                <p className="shrink-0 text-[13px] tabular-nums text-charcoal">{formatZAR(item.priceZAR * item.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-2 border-t border-line px-5 py-4 text-[13px]">
          <div className="flex justify-between text-stone">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-charcoal">{formatZAR(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-stone">
            <dt>Delivery</dt>
            <dd className="tabular-nums text-charcoal">{fee === 0 ? "Free" : formatZAR(fee)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-stone">Total</dt>
            <dd className="font-display text-[1.7rem] leading-none tabular-nums text-charcoal">{formatZAR(total)}</dd>
          </div>
        </dl>

        <div className="border-t border-line px-5 py-5">
          {blocked ? (
            <p className="mb-3 text-[12px] leading-relaxed text-red-900">
              Update your bag first: {soldOut.length > 0 ? "remove sold-out items" : "lower the quantities marked above"}.
            </p>
          ) : null}
          <PlaceOrderButton total={total} disabled={blocked} />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
            Demo payment: nothing is charged. By placing an order you accept our{" "}
            <Link href="/info/terms" className="underline underline-offset-2 hover:text-charcoal">
              terms
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}
