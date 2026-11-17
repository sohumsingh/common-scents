import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className = "",
  reveal = false,
  tone = "light",
  titleClassName = "text-[clamp(1.9rem,min(3.8vw,6svh),3.2rem)]",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
  /** Fade the heading in as it scrolls into view. */
  reveal?: boolean;
  /** `dark` for headings on the noir sections. */
  tone?: "light" | "dark";
  /** Font size for the title (defaults to the standard section size). */
  titleClassName?: string;
}) {
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const dark = tone === "dark";

  return (
    <div
      data-reveal={reveal ? "" : undefined}
      className={`flex flex-col gap-[clamp(0.9rem,2svh,1.25rem)] ${alignment} ${action ? "md:flex-row md:items-end md:justify-between" : ""} ${className}`}
    >
      <div className={`flex flex-col gap-[clamp(0.6rem,1.6svh,1rem)] ${align === "center" ? "items-center" : "items-start"}`}>
        {eyebrow ? (
          <span className={`eyebrow flex items-center gap-3 ${dark ? "!text-gold" : ""}`}>
            <span aria-hidden="true" className={`scroll-draw h-px w-8 origin-left ${dark ? "bg-gold/60" : "bg-gold"}`} />
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={`max-w-2xl text-balance ${titleClassName} leading-[1.06] ${dark ? "text-ivory" : "text-charcoal"}`}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={`max-w-xl text-[0.98rem] leading-relaxed ${dark ? "text-ivory/65" : "text-stone"} ${align === "center" ? "mx-auto" : ""}`}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
