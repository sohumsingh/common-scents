import { useId } from "react";
import type { ProductVisual as ProductVisualType } from "@/lib/types";

type ShapeSpec = {
  body: string;
  neck: { x: number; top: number; bottom: number; width: number };
  capBottom: number;
  capWidth: number;
  label: { x: number; y: number; width: number; height: number };
  shoulder: number;
};

const shapes: Record<ProductVisualType["shape"], ShapeSpec> = {
  flacon: {
    body: "M142 400 L142 236 C142 206 164 191 186 186 L186 176 L214 176 L214 186 C236 191 258 206 258 236 L258 400 Z",
    neck: { x: 186, top: 166, bottom: 180, width: 28 },
    capBottom: 168,
    capWidth: 46,
    label: { x: 158, y: 258, width: 84, height: 82 },
    shoulder: 236,
  },
  classic: {
    body: "M118 400 L118 254 C118 226 138 212 160 206 L160 194 L240 194 L240 206 C262 212 282 226 282 254 L282 400 Z",
    neck: { x: 182, top: 184, bottom: 198, width: 36 },
    capBottom: 186,
    capWidth: 58,
    label: { x: 140, y: 268, width: 120, height: 82 },
    shoulder: 254,
  },
  tall: {
    body: "M160 400 L160 204 C160 176 176 162 192 155 L192 144 L208 144 L208 155 C224 162 240 176 240 204 L240 400 Z",
    neck: { x: 186, top: 134, bottom: 148, width: 22 },
    capBottom: 136,
    capWidth: 34,
    label: { x: 172, y: 250, width: 56, height: 76 },
    shoulder: 204,
  },
  orb: {
    body: "M200 172 C256 172 298 212 298 264 C298 318 256 354 200 354 C144 354 102 318 102 264 C102 212 144 172 200 172 Z",
    neck: { x: 184, top: 158, bottom: 176, width: 32 },
    capBottom: 160,
    capWidth: 46,
    label: { x: 158, y: 244, width: 84, height: 74 },
    shoulder: 0,
  },
  square: {
    body: "M140 400 L140 214 L260 214 L260 400 Z",
    neck: { x: 184, top: 202, bottom: 216, width: 32 },
    capBottom: 204,
    capWidth: 50,
    label: { x: 156, y: 258, width: 88, height: 84 },
    shoulder: 214,
  },
};

/**
 * Generated bottle artwork.
 *
 * The catalogue does not yet have product photography, so each fragrance is
 * represented by a drawn bottle that reflects its character — glass tint,
 * liquid colour, silhouette and cap. It is deliberately illustrative rather
 * than photorealistic, and it is replaced automatically as soon as a real
 * image is attached to a product.
 */
export function ProductVisual({
  visual,
  brand,
  name,
  className = "",
}: {
  visual: ProductVisualType;
  brand: string;
  name: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const spec = shapes[visual.shape];

  const glassGradient = `glass-${uid}`;
  const liquidGradient = `liquid-${uid}`;
  const capGradient = `cap-${uid}`;
  const bodyClip = `clip-${uid}`;
  const shadowBlur = `shadow-${uid}`;

  const capTop = spec.capBottom - spec.capWidth * 0.95;

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={`${brand} ${name} bottle illustration`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={glassGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={visual.glass} stopOpacity="0.95" />
          <stop offset="42%" stopColor={visual.glass} stopOpacity="0.72" />
          <stop offset="100%" stopColor={visual.glass} stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id={liquidGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={visual.accent} stopOpacity="0.62" />
          <stop offset="100%" stopColor={visual.accent} stopOpacity="0.92" />
        </linearGradient>

        <linearGradient id={capGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A453E" />
          <stop offset="38%" stopColor="#8E8578" />
          <stop offset="62%" stopColor="#5C564D" />
          <stop offset="100%" stopColor="#332F2A" />
        </linearGradient>

        <clipPath id={bodyClip}>
          <path d={spec.body} />
        </clipPath>

        <filter id={shadowBlur} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>

      {/* Backdrop wash */}
      <rect width="400" height="500" fill={visual.wash} opacity="0.55" />
      <ellipse
        cx="200"
        cy="250"
        rx="190"
        ry="210"
        fill={visual.accent}
        opacity="0.09"
      />

      {/* Floor shadow */}
      <ellipse
        cx="200"
        cy="404"
        rx="86"
        ry="15"
        fill={visual.accent}
        opacity="0.24"
        filter={`url(#${shadowBlur})`}
      />

      {/* Glass body */}
      <path d={spec.body} fill={`url(#${glassGradient})`} />

      {/* Liquid inside the bottle */}
      <g clipPath={`url(#${bodyClip})`}>
        <rect
          x="80"
          y={spec.shoulder ? spec.shoulder + 34 : 250}
          width="240"
          height="200"
          fill={`url(#${liquidGradient})`}
        />
      </g>

      {/* Glass edge and highlight */}
      <path
        d={spec.body}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.34"
        strokeWidth="1.1"
      />
      <path
        d={`M${spec.label.x - 4} ${spec.shoulder ? spec.shoulder + 10 : 210} C ${
          spec.label.x - 9
        } ${spec.shoulder ? spec.shoulder + 70 : 290} ${spec.label.x - 8} 340 ${
          spec.label.x - 2
        } 382`}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.38"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect
        x={spec.neck.x}
        y={spec.neck.top}
        width={spec.neck.width}
        height={spec.neck.bottom - spec.neck.top + 10}
        fill={visual.glass}
        opacity="0.9"
      />
      <rect
        x={spec.neck.x}
        y={spec.neck.top}
        width={spec.neck.width}
        height={spec.neck.bottom - spec.neck.top + 10}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.3"
      />

      {/* Cap */}
      {visual.cap === "faceted" ? (
        <polygon
          points={`${200 - spec.capWidth / 2},${spec.capBottom} ${200 - spec.capWidth / 2 + 8},${capTop} ${
            200 + spec.capWidth / 2 - 8
          },${capTop} ${200 + spec.capWidth / 2},${spec.capBottom}`}
          fill={`url(#${capGradient})`}
        />
      ) : (
        <rect
          x={200 - spec.capWidth / 2}
          y={capTop}
          width={spec.capWidth}
          height={spec.capBottom - capTop}
          rx={visual.cap === "cylindrical" ? 7 : 3}
          fill={`url(#${capGradient})`}
        />
      )}
      <rect
        x={200 - spec.capWidth / 2 + 5}
        y={capTop + 5}
        width={spec.capWidth * 0.16}
        height={spec.capBottom - capTop - 10}
        rx="2"
        fill="#FFFFFF"
        opacity="0.22"
      />

      {/* Label */}
      <rect
        x={spec.label.x}
        y={spec.label.y}
        width={spec.label.width}
        height={spec.label.height}
        fill="#F7F3EA"
        opacity="0.94"
      />
      <rect
        x={spec.label.x}
        y={spec.label.y}
        width={spec.label.width}
        height={spec.label.height}
        fill="none"
        stroke={visual.accent}
        strokeOpacity="0.4"
        strokeWidth="0.8"
      />
      <text
        x={200}
        y={spec.label.y + 22}
        textAnchor="middle"
        fill={visual.accent}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "7px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
        textLength={spec.label.width - 16}
        lengthAdjust="spacingAndGlyphs"
      >
        {brand}
      </text>
      <text
        x={200}
        y={spec.label.y + 48}
        textAnchor="middle"
        fill="#3A362F"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "15px",
        }}
        textLength={spec.label.width - 20}
        lengthAdjust="spacingAndGlyphs"
      >
        {name}
      </text>
      <line
        x1={spec.label.x + spec.label.width * 0.32}
        y1={spec.label.y + 58}
        x2={spec.label.x + spec.label.width * 0.68}
        y2={spec.label.y + 58}
        stroke={visual.accent}
        strokeWidth="0.7"
        opacity="0.55"
      />
      <text
        x={200}
        y={spec.label.y + 71}
        textAnchor="middle"
        fill="#8B857A"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "5.5px",
          letterSpacing: "0.22em",
        }}
      >
        EAU DE PARFUM
      </text>
    </svg>
  );
}
