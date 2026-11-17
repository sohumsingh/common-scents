import { NextResponse } from "next/server";

/**
 * Customer enquiry endpoint.
 *
 * Validation and reference numbering are real. Email delivery is not: no
 * transactional email provider has been configured yet, so the response
 * says so explicitly rather than pretending the message was sent.
 *
 * TO CONNECT EMAIL DELIVERY
 *  1. Add the provider SDK (for example Resend, Postmark or SendGrid).
 *  2. Replace the `delivered: false` branch with the send call.
 *  3. Store the enquiry durably if you want a copy regardless of email.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SUBJECTS = [
  "Product enquiry",
  "Order enquiry",
  "Delivery question",
  "Returns and refunds",
  "Something else",
];

export type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  orderReference?: string;
  message?: string;
  /** Honeypot — real users never fill this in. */
  website?: string;
};

export type ContactResponse = {
  ok: boolean;
  delivered: boolean;
  reference?: string;
  errors?: Record<string, string>;
  message: string;
};

function buildReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const noise = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `CS-${stamp}${noise}`;
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json<ContactResponse>(
      {
        ok: false,
        delivered: false,
        message: "We could not read that submission. Please try again.",
      },
      { status: 400 },
    );
  }

  // Honeypot — accept silently so bots do not learn anything.
  if (payload.website) {
    return NextResponse.json<ContactResponse>({
      ok: true,
      delivered: false,
      reference: buildReference(),
      message: "Thank you — your enquiry has been received.",
    });
  }

  const errors: Record<string, string> = {};

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const orderReference = payload.orderReference?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email address.";
  if (!SUBJECTS.includes(subject)) errors.subject = "Please choose a subject.";
  if (message.length < 15) errors.message = "Please give us a little more detail (at least 15 characters).";
  if (message.length > 2000) errors.message = "Please keep your message under 2000 characters.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json<ContactResponse>(
      {
        ok: false,
        delivered: false,
        errors,
        message: "Please correct the highlighted fields.",
      },
      { status: 422 },
    );
  }

  /**
   * The validated enquiry. This is the record that gets handed to the email
   * provider (and stored, if the business wants an inbox copy) once delivery
   * is connected — the payload is already in the right shape.
   */
  const enquiry = {
    reference: buildReference(),
    receivedAt: new Date().toISOString(),
    name,
    email,
    subject,
    orderReference: orderReference || null,
    message,
  };

  // Delivery is intentionally not implemented yet.
  return NextResponse.json<ContactResponse>({
    ok: true,
    delivered: false,
    reference: enquiry.reference,
    message:
      "Your enquiry passed validation, but email delivery is not connected to Common Scents yet — nothing has been sent. Please use the email address on this page to reach us directly.",
  });
}
