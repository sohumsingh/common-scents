"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setNewsletter, type NewsletterState } from "@/app/account/actions";

const changedOn = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric" });

function Toggle({ subscribed }: { subscribed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center px-6 text-[11px] uppercase tracking-[0.18em] transition-colors disabled:cursor-wait disabled:opacity-60 ${
        subscribed
          ? "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory"
          : "bg-charcoal text-ivory hover:bg-noir"
      }`}
    >
      {pending ? "Saving…" : subscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  );
}

/** The account page's newsletter setting: on or off, for the account's own email. */
export function NewsletterSetting({
  email,
  subscribed: initial,
  updatedAt,
}: {
  email: string;
  subscribed: boolean;
  updatedAt: string | null;
}) {
  const [state, action] = useActionState<NewsletterState, FormData>(setNewsletter, {});
  const subscribed = state.subscribed ?? initial;
  const when = state.subscribed !== undefined ? new Date() : updatedAt ? new Date(updatedAt) : null;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="subscribe" value={subscribed ? "0" : "1"} />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${subscribed ? "bg-emerald-700" : "bg-line-strong"}`}
        />
        <p role="status" aria-live="polite" className="text-[14px] leading-relaxed text-stone">
          {subscribed ? (
            <>
              <span className="text-charcoal">Subscribed.</span> New arrivals and notes go to{" "}
              <span className="break-words text-charcoal">{email}</span>.
            </>
          ) : (
            <>
              <span className="text-charcoal">Not subscribed.</span> Subscribe to get new arrivals and fragrance notes at{" "}
              <span className="break-words text-charcoal">{email}</span>.
            </>
          )}
          {when ? <span className="block text-[12px] text-muted">Last changed {changedOn.format(when)}</span> : null}
        </p>
      </div>
      <p className="text-[12px] leading-relaxed text-muted">
        In development: newsletter emails aren&apos;t being sent yet. Your choice is saved for when they start.
      </p>
      {state.error ? (
        <p role="alert" className="text-[13px] text-red-900">
          {state.error}
        </p>
      ) : null}
      <div>
        <Toggle subscribed={subscribed} />
      </div>
    </form>
  );
}
