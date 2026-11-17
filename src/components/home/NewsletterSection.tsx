"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/brand/Logo";
import { features } from "@/lib/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();

    if (!value) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setStatus("error");
      setMessage("That does not look like a valid email address.");
      return;
    }

    setStatus("done");
    setMessage(
      features.newsletter
        ? "Thank you — you are on the list."
        : "Your address is valid, but sign-ups are not being stored yet. No email provider is connected to Common Scents, so nothing has been sent.",
    );
    setEmail("");
  };

  return (
    <section className="fit-viewport py-[clamp(1.5rem,4svh,3rem)]">
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

          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md" noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "idle") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="you@example.co.za"
                aria-invalid={status === "error"}
                aria-describedby="newsletter-status"
                className={`w-full border bg-paper px-5 py-4 text-[15px] text-charcoal transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:border-gold-deep focus:shadow-[0_2px_0_0_var(--color-gold)] focus:outline-none ${
                  status === "error" ? "border-red-800/50" : "border-line"
                }`}
              />
              <button
                type="submit"
                className="sheen shrink-0 bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-ivory transition-[background-color,transform] duration-300 hover:bg-noir active:scale-[0.98]"
              >
                Subscribe
              </button>
            </div>

            <p
              id="newsletter-status"
              role="status"
              aria-live="polite"
              className={`mt-3 text-[11.5px] leading-relaxed ${
                status === "error" ? "text-red-800" : "text-stone"
              }`}
            >
              {status === "idle"
                ? "We will never share your address. Unsubscribe at any time."
                : message}
            </p>
          </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
