"use client";

import { useState } from "react";
import type { ContactResponse } from "@/app/api/contact/route";

const SUBJECTS = [
  "Product enquiry",
  "Order enquiry",
  "Delivery question",
  "Returns and refunds",
  "Something else",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ContactResponse | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    orderReference: "",
    message: "",
    website: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrors({});
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) clientErrors.name = "Please tell us your name.";
    if (!EMAIL_PATTERN.test(form.email.trim()))
      clientErrors.email = "Please enter a valid email address.";
    if (form.message.trim().length < 15)
      clientErrors.message = "Please give us a little more detail (at least 15 characters).";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus("error");
      setResult(null);
      return;
    }

    setStatus("submitting");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as ContactResponse;

      if (!data.ok) {
        setErrors(data.errors ?? {});
        setStatus("error");
        setResult(data);
        return;
      }

      setStatus("success");
      setResult(data);
      setForm({
        name: "",
        email: "",
        subject: SUBJECTS[0],
        orderReference: "",
        message: "",
        website: "",
      });
    } catch {
      setStatus("error");
      setResult({
        ok: false,
        delivered: false,
        message: "Something went wrong sending your enquiry. Please try again, or email us directly.",
      });
    }
  };

  const fieldClass = (field: string) =>
    `w-full border bg-paper px-4 py-3.5 text-[14px] text-charcoal placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-charcoal/30 ${
      errors[field] ? "border-red-800/50" : "border-line"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="text-[11px] uppercase tracking-[0.18em] text-stone">
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Thandi Mokoena"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={fieldClass("name")}
          />
          {errors.name ? (
            <p id="contact-name-error" className="text-[11px] text-red-800">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="text-[11px] uppercase tracking-[0.18em] text-stone">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.co.za"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={fieldClass("email")}
          />
          {errors.email ? (
            <p id="contact-email-error" className="text-[11px] text-red-800">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-subject" className="text-[11px] uppercase tracking-[0.18em] text-stone">
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className={fieldClass("subject")}
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-order"
            className="text-[11px] uppercase tracking-[0.18em] text-stone"
          >
            Order reference <span className="text-muted">(optional)</span>
          </label>
          <input
            id="contact-order"
            name="orderReference"
            type="text"
            value={form.orderReference}
            onChange={(event) => update("orderReference", event.target.value)}
            placeholder="CS-XXXXXX"
            className={fieldClass("orderReference")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-[11px] uppercase tracking-[0.18em] text-stone">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Tell us what you need — the fragrance you are considering, the occasion, or your order."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
          className={`${fieldClass("message")} resize-y`}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-[11px] text-red-800">
            {errors.message}
          </p>
        ) : (
          <p id="contact-message-hint" className="text-[11px] text-muted">
            {form.message.trim().length} / 2000 characters
          </p>
        )}
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-start bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </button>

        <p role="status" aria-live="polite" className="text-[11.5px] leading-relaxed">
          {status === "success" && result?.reference ? (
            <span className="text-ink">
              Reference <span className="font-medium tabular-nums text-charcoal">{result.reference}</span>.{" "}
              {result.message}
            </span>
          ) : status === "error" && result?.message ? (
            <span className="text-red-800">{result.message}</span>
          ) : (
            <span className="text-muted">
              We use your details only to answer this enquiry. We never share them.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
