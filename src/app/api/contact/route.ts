import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Customer enquiry endpoint.
 *
 * Checks the message, then saves it through the database function
 * `submit_enquiry` (which checks it again and limits how often one address
 * can write). Admins read and answer enquiries under Admin → Messages.
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
      delivered: true,
      message: "Thank you — your message has been received.",
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

  const supabase = await createClient();
  const { data: reference, error } = await supabase.rpc("submit_enquiry", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_order_reference: orderReference || null,
    p_message: message,
  });

  if (error || typeof reference !== "string") {
    const tooMany = error?.message === "too_many_enquiries";
    return NextResponse.json<ContactResponse>(
      {
        ok: false,
        delivered: false,
        message: tooMany
          ? "You've sent a few messages in a short time. Please wait a few minutes before sending another."
          : "We couldn't send your message just now. Please try again, or email us directly.",
      },
      { status: tooMany ? 429 : 500 },
    );
  }

  const firstName = name.split(" ")[0];
  return NextResponse.json<ContactResponse>({
    ok: true,
    delivered: true,
    reference,
    message: `Thanks, ${firstName} — we've received your message and will reply to ${email} within two business days.`,
  });
}
