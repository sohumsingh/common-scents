import { ImageResponse } from "next/og";
import { cacheLife } from "next/cache";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";
import { logo } from "@/lib/logo";

/**
 * Site-wide share image.
 *
 * This is what WhatsApp, Facebook, LinkedIn and X show when someone shares a
 * Common Scents link. Every page uses it until a page provides its own (for
 * example product pages, once real photography exists). It carries the
 * signature logo itself.
 */

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const IVORY = "#F4F0E8";
const CHARCOAL = "#292725";
const BEIGE = "#D8CBB8";
const GOLD = "#B8A17B";

const WORDMARK = site.name;
const HEADLINE = site.headline;
const EYEBROW = "South African fragrance retail";
const FOOTER = site.tagline;

/**
 * Fetch just the glyphs needed from Google Fonts, as TrueType (the format the
 * image renderer reads). Cached so the image is built once, not per request.
 * Returns null if Google Fonts is unreachable; the image then falls back to
 * the renderer's default typeface rather than failing.
 */
async function loadGoogleFont(family: string, text: string): Promise<Uint8Array | null> {
  "use cache";
  cacheLife("max");
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const response = await fetch(match[1]);
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * The signature logo as a data URL, read once and cached so the image can
 * still be prerendered (an uncached file read would make it dynamic).
 */
async function loadLogoDataUrl(): Promise<string> {
  "use cache";
  cacheLife("max");
  const bytes = await readFile(join(process.cwd(), "public", logo.full.charcoal));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

const LOGO_WIDTH = 540;

export default async function OpengraphImage() {
  const [logoSrc, display, sans] = await Promise.all([
    loadLogoDataUrl(),
    loadGoogleFont("Cormorant+Garamond:wght@400", HEADLINE),
    loadGoogleFont("Jost:wght@400", `${EYEBROW}${FOOTER}`.toUpperCase()),
  ]);

  const fonts = [
    display && { name: "Display", data: toArrayBuffer(display), weight: 400 as const, style: "normal" as const },
    sans && { name: "Sans", data: toArrayBuffer(sans), weight: 400 as const, style: "normal" as const },
  ].filter((font): font is NonNullable<typeof font> => Boolean(font));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: IVORY, padding: 30 }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          border: `1px solid ${BEIGE}`,
          padding: "26px 50px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Sans",
            fontSize: 20,
            letterSpacing: "0.32em",
            color: GOLD,
            marginTop: 18,
          }}
        >
          {EYEBROW.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not HTML */}
          <img
            src={logoSrc}
            alt={WORDMARK}
            width={LOGO_WIDTH}
            height={Math.round((LOGO_WIDTH * logo.full.height) / logo.full.width)}
          />
          <div style={{ display: "flex", width: 220, height: 1, background: GOLD, marginTop: 18 }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Display",
              fontSize: 46,
              color: CHARCOAL,
              marginTop: 30,
            }}
          >
            {HEADLINE}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Sans",
            fontSize: 18,
            letterSpacing: "0.3em",
            color: CHARCOAL,
            opacity: 0.7,
            marginBottom: 18,
          }}
        >
          {FOOTER.toUpperCase()}
        </div>
      </div>
      </div>
    ),
    { ...size, fonts },
  );
}
