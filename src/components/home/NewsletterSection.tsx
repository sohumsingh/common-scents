"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/brand/Logo";
import { setNewsletter, type NewsletterState } from "@/app/account/actions";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createClient } from "@/lib/supabase/client";

const RETURN_HERE = encodeURIComponent("/#newsletter");

const primaryButton =
  "sheen inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-charcoal px-8 text-[11px] uppercase tracking-[0.2em] text-ivory transition-[background-color,transform] duration-300 hover:bg-noir active:scale-[0.98] disabled:cursor-wait disabled:opacity-60";

function SubmitButton({ children, pendingLabel, className }: { children: string; pendingLabel: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * The homepage newsletter sign-up. Subscribing needs an account: the
 * newsletter goes to the email the customer signed in with, and they can
 * unsubscribe from here or from their account page.
 */
export function NewsletterSection() {
  const auth = useAuthUser();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [state, action] = useActionState<NewsletterState, FormData>(setNewsletter, {});

  // Whether this account is already subscribed.
  useEffect(() => {
    if (auth.status !== "signed-in") return;
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("newsletter_opt_in").eq("id", data.user.id).single();
      if (active) setSaved(Boolean(profile?.newsletter_opt_in));
    });
    return () => {
      active = false;
    };
  }, [auth.status]);

  const subscribed = state.subscribed ?? saved;
  const justChanged = state.subscribed !== undefined;

  let body: React.ReactNode;
  if (auth.status === "loading" || (auth.status === "signed-in" && subscribed === null)) {
    body = <div aria-hidden="true" className="mx-auto h-[6.5rem] max-w-md animate-pulse bg-paper/60" />;
  } else if (auth.status === "signed-out") {
    body = (
      <div className="mx-auto max-w-md">
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/account/sign-in?next=${RETURN_HERE}`} className={primaryButton}>
            Sign in to subscribe
          </Link>
          <Link
            href={`/account/register?next=${RETURN_HERE}`}
            className="inline-flex min-h-12 items-center justify-center border border-charcoal/25 px-8 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-ivory"
          >
            Create an account
          </Link>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-stone">
          The newsletter goes to the email on your account, and you can unsubscribe at any time.
        </p>
      </div>
    );
  } else if (subscribed) {
    body = (
      <form action={action} className="mx-auto max-w-md">
        <input type="hidden" name="subscribe" value="0" />
        <p role="status" className="inline-flex items-center gap-2.5 border border-emerald-800/20 bg-paper px-5 py-3 text-[14px] text-emerald-900">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {justChanged ? "You're subscribed" : "You're already subscribed"} as{" "}
          <span className="break-words text-charcoal">{auth.status === "signed-in" ? auth.email : ""}</span>
        </p>
        <p className="mt-3 text-[11.5px] leading-relaxed text-stone">
          Changed your mind?{" "}
          <SubmitButton
            pendingLabel="Unsubscribing…"
            className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal disabled:opacity-60"
          >
            Unsubscribe
          </SubmitButton>{" "}
          here or from{" "}
          <Link href="/account" className="text-charcoal underline decoration-gold/60 underline-offset-4 hover:decoration-charcoal">
            your account
          </Link>
          .
        </p>
      </form>
    );
  } else {
    body = (
      <form action={action} className="mx-auto max-w-md">
        <input type="hidden" name="subscribe" value="1" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <p className="flex min-h-12 w-full items-center border border-line bg-paper px-5 text-left text-[15px] text-charcoal">
            <span className="sr-only">Subscribing as </span>
            <span className="truncate">{auth.email}</span>
          </p>
          <SubmitButton pendingLabel="Subscribing…" className={primaryButton}>
            Subscribe
          </SubmitButton>
        </div>
        <p role="status" aria-live="polite" className={`mt-3 text-[11.5px] leading-relaxed ${state.error ? "text-red-800" : "text-stone"}`}>
          {state.error ??
            (justChanged
              ? "You've unsubscribed. You can sign up again whenever you like."
              : "We'll send it to the email on your account. We never share it, and you can unsubscribe at any time.")}
        </p>
      </form>
    );
  }

  return (
    <section id="newsletter" className="fit-viewport scroll-mt-[var(--header-h)] py-[clamp(1.5rem,4svh,3rem)]">
      <Container className="flex flex-1 flex-col">
        <div
          data-reveal
          className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center overflow-hidden border border-line bg-parchment/60 px-6 py-16 text-center sm:px-12"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-12 w-[clamp(14rem,22vw,22rem)] opacity-[0.07]">
            <LogoMark className="w-full" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 -right-8 w-[clamp(16rem,26vw,26rem)] rotate-6 opacity-[0.07]">
            <LogoMark className="w-full" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              Stay Close
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
            </p>
            <h2 className="mt-5 text-balance text-[clamp(1.9rem,min(4.2vw,7svh),3.8rem)] leading-[1.06] text-charcoal">
              New arrivals, fragrance notes and the occasional promotion.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[clamp(15px,1.15vw,17px)] leading-relaxed text-stone">
              A short, considered email — nothing more. New fragrances, occasions worth knowing
              about, and the launches we genuinely recommend.
            </p>

            <div className="mt-10">{body}</div>
            <p className="mx-auto mt-6 inline-flex max-w-md items-center gap-2 text-[11px] leading-relaxed text-muted">
              <span className="shrink-0 rounded-full border border-gold/50 px-2 py-0.5 uppercase tracking-[0.14em] text-gold-deep">
                In development
              </span>
              <span className="text-left">Newsletter emails aren&apos;t being sent yet. Your choice is saved for when they start.</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
