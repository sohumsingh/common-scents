"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  register,
  requestPasswordReset,
  signIn,
  updatePassword,
  updateProfile,
  type FormState,
} from "@/app/account/actions";

/* ------------------------------------------------------------------------ */
/* Building blocks                                                          */
/* ------------------------------------------------------------------------ */

const inputClass =
  "h-12 w-full border border-line bg-ivory/40 px-4 text-[15px] text-charcoal transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:border-gold-deep focus:shadow-[0_2px_0_0_var(--color-gold)] focus:outline-none";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  hint,
  aside,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  hint?: string;
  aside?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={name} className="text-[11px] uppercase tracking-[0.18em] text-stone">
          {label}
        </label>
        {aside}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className={`mt-2 ${inputClass}`}
        aria-describedby={hint ? `${name}-hint` : undefined}
      />
      {hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
  hint,
  aside,
}: {
  label: string;
  name: string;
  autoComplete: string;
  hint?: string;
  aside?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={name} className="text-[11px] uppercase tracking-[0.18em] text-stone">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative mt-2">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className={`${inputClass} pr-20`}
          aria-describedby={hint ? `${name}-hint` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 min-h-10 -translate-y-1/2 px-3 text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="sheen h-12 w-full bg-charcoal px-8 text-[11px] uppercase tracking-[0.2em] text-ivory shadow-[0_14px_30px_-18px_rgba(41,39,37,0.6)] transition-[background-color,opacity] duration-300 hover:bg-noir disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function Notice({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="border border-red-800/25 bg-red-800/[0.04] px-4 py-3 text-[13px] leading-relaxed text-red-900">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p role="status" className="border border-gold/40 bg-gold/10 px-4 py-3 text-[13px] leading-relaxed text-gold-deep">
        {state.message}
      </p>
    );
  }
  return null;
}

const linkClass = "text-charcoal underline decoration-gold/60 underline-offset-4 transition-colors hover:decoration-charcoal";

/* ------------------------------------------------------------------------ */
/* Forms                                                                    */
/* ------------------------------------------------------------------------ */

export function SignInForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const [state, action] = useActionState(signIn, {
    error: linkError ? "That link has expired or was already used. Please sign in, or request a new link." : undefined,
  });
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Notice state={state} />
      <Field label="Email address" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        aside={
          <Link href="/account/forgot-password" className="text-[12px] text-stone underline-offset-4 hover:text-charcoal hover:underline">
            Forgot password?
          </Link>
        }
      />
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(register, {});
  if (state.message) return <Notice state={state} />;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Notice state={state} />
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} />
      <Field label="Email address" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
      />
      <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" />
      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-stone">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-charcoal" />
        <span>
          I agree to the{" "}
          <Link href="/info/privacy" className={linkClass}>
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/info/terms" className={linkClass}>
            terms
          </Link>
          .
        </span>
      </label>
      <SubmitButton pendingLabel="Creating your account…">Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, {});
  if (state.message) return <Notice state={state} />;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Notice state={state} />
      <Field label="Email address" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Notice state={state} />
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number."
      />
      <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" />
      <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
    </form>
  );
}

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, action] = useActionState(updateProfile, { values: { fullName } });
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Notice state={state} />
      <Field label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName ?? fullName} />
      <div className="sm:w-48">
        <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
      </div>
    </form>
  );
}
