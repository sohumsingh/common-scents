import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-none font-normal uppercase tracking-[0.18em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "sheen bg-charcoal text-ivory hover:bg-noir focus-visible:bg-noir shadow-[0_14px_30px_-18px_rgba(41,39,37,0.6)] hover:shadow-[0_18px_36px_-16px_rgba(41,39,37,0.65)] active:scale-[0.98]",
  secondary:
    "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory active:scale-[0.98]",
  ghost:
    "text-charcoal underline decoration-gold/60 underline-offset-[6px] hover:decoration-charcoal",
  light:
    "border border-ivory/40 text-ivory hover:bg-ivory hover:text-charcoal",
};

const sizes: Record<Size, string> = {
  sm: "text-[11px] px-5 py-3",
  md: "text-[11px] px-7 py-4",
  lg: "text-xs px-9 py-5",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...rest
  } = props as CommonProps & {
    href?: string;
    [key: string]: unknown;
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (typeof props.href === "string") {
    const { href, ...anchorRest } = rest as { href: string } & Record<string, unknown>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
