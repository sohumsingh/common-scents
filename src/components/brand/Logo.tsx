import Image from "next/image";
import { logo } from "@/lib/logo";

type Tone = "charcoal" | "ivory";

/**
 * The Common Scents signature logo.
 *
 * `animate` writes the signature in from left to right on load (skipped for
 * reduced motion). Width is set by the caller through `className`.
 */
export function Logo({
  tone = "charcoal",
  className = "w-32",
  animate = false,
  priority = false,
  sizes = "200px",
}: {
  tone?: Tone;
  className?: string;
  animate?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={logo.full[tone]}
      alt={logo.alt}
      width={logo.full.width}
      height={logo.full.height}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      className={`h-auto select-none ${animate ? "signature-reveal" : ""} ${className}`}
      draggable={false}
    />
  );
}

/** The compact "CS" monogram, cut from the signature's own C and S. */
export function LogoMark({
  tone = "charcoal",
  className = "w-10",
  decorative = true,
}: {
  tone?: Tone;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src={logo.monogram[tone]}
      alt={decorative ? "" : logo.alt}
      aria-hidden={decorative ? true : undefined}
      width={logo.monogram.width}
      height={logo.monogram.height}
      sizes="160px"
      className={`h-auto select-none ${className}`}
      draggable={false}
    />
  );
}
