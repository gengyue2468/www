import sharp from "sharp";
import { join } from "path";
import { ensureDir } from "../utils/fs.js";
import config from "../config.js";
import { readFile } from "fs/promises";

// Use dynamic import for satori (ESM module)
let satori: typeof import("satori").default;
async function loadSatori() {
  if (!satori) {
    const mod = await import("satori");
    satori = mod.default;
  }
  return satori;
}

// OG Image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Color scheme - dark mode
const COLORS = {
  bg: "#151515",
  text: "#fffff8",
  muted: "#888888",
  accent: "#a6a6a6",
};

// Font cache
let etBookRomanBuffer: Buffer | null = null;
let etBookItalicBuffer: Buffer | null = null;
/** 中文 fallback：将 NotoSansSC-Regular.otf 放到 public/fonts/ 即可（可用 Google Fonts 下载） */
let cjkFallbackBuffer: Buffer | null = null;
const CJK_FONT_NAME = "Noto Sans SC";

/**
 * Load and cache font files
 * - ET Book 使用现有 ttf
 * - 中文只支持单一文件名：NotoSansSC-Regular.otf（可选）
 */
async function loadFonts(): Promise<void> {
  if (etBookRomanBuffer && etBookItalicBuffer) {
    return;
  }

  const fontsDir = join(process.cwd(), "public", "fonts");
  const [romanFont, italicFont, cjkFont] = await Promise.all([
    readFile(join(fontsDir, "et-book-roman-line-figures.ttf")),
    readFile(join(fontsDir, "et-book-display-italic-old-style-figures.ttf")),
    readFile(join(fontsDir, "NotoSansSC-Regular.otf")).catch(() => null),
  ]);

  etBookRomanBuffer = romanFont;
  etBookItalicBuffer = italicFont;
  if (cjkFont) cjkFallbackBuffer = cjkFont;
}

/** 正文 fontFamily：有 CJK fallback 时优先用，否则仅 ET Book */
function getFontFamily(): string {
  return cjkFallbackBuffer ? `ET Book, ${CJK_FONT_NAME}, serif` : "ET Book, serif";
}

/** 斜体用 fontFamily（CJK 用正体 fallback） */
function getFontFamilyItalic(): string {
  return cjkFallbackBuffer ? `ET Book Italic, ${CJK_FONT_NAME}, serif` : "ET Book Italic, serif";
}

/**
 * Generate default OG image with logo
 */
async function generateDefaultOgImageBase(): Promise<Buffer> {
  await loadFonts();
  const satoriRender = await loadSatori();

  const domain = new URL(config.site.url).hostname;

  const fontFamily = getFontFamily();
  const fonts = [
    { name: "ET Book", data: etBookRomanBuffer!, weight: 400 as const, style: "normal" as const },
    { name: "ET Book Italic", data: etBookItalicBuffer!, weight: 400 as const, style: "italic" as const },
    ...(cjkFallbackBuffer
      ? [{ name: CJK_FONT_NAME, data: cjkFallbackBuffer, weight: 400 as const, style: "normal" as const }]
      : []),
  ];

  const svg = await satoriRender(
    {
      type: "div",
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          backgroundColor: COLORS.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          fontFamily,
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: 68,
                color: COLORS.text,
                fontWeight: "normal",
                marginBottom: 16,
                fontFamily,
              },
              children: config.site.title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: 26,
                color: COLORS.muted,
                fontStyle: "italic",
                fontFamily: getFontFamilyItalic(),
              },
              children: "Personal website & blog",
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: 50,
                left: 80,
                fontSize: 18,
                color: COLORS.text,
                fontStyle: "italic",
                fontFamily: getFontFamilyItalic(),
              },
              children: domain,
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    }
  );

  return Buffer.from(svg);
}

const MAX_TITLE_CHARS = 36; // 约两行内
const TITLE_FONT_SIZE = 56;
const TITLE_FONT_SIZE_SMALL = 44;

/**
 * Generate post-specific OG image (title + date + tags + domain)
 */
async function generatePostOgImageBase(title: string, date?: string, tags?: string[]): Promise<Buffer> {
  await loadFonts();
  const satoriRender = await loadSatori();

  const domain = new URL(config.site.url).hostname;
  const fontFamily = getFontFamily();
  const fonts = [
    { name: "ET Book", data: etBookRomanBuffer!, weight: 400 as const, style: "normal" as const },
    { name: "ET Book Italic", data: etBookItalicBuffer!, weight: 400 as const, style: "italic" as const },
    ...(cjkFallbackBuffer
      ? [{ name: CJK_FONT_NAME, data: cjkFallbackBuffer, weight: 400 as const, style: "normal" as const }]
      : []),
  ];

  const displayTitle =
    title.length > MAX_TITLE_CHARS ? title.slice(0, MAX_TITLE_CHARS - 2) + "…" : title;
  const titleFontSize = title.length > 24 ? TITLE_FONT_SIZE_SMALL : TITLE_FONT_SIZE;
  const tagText =
    tags && tags.length > 0
      ? tags
          .slice(0, 3)
          .map((t) => `#${t}`)
          .join(" · ")
      : undefined;

  const svg = await satoriRender(
    {
      type: "div",
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          backgroundColor: COLORS.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          fontFamily,
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: titleFontSize,
                color: COLORS.text,
                fontWeight: "normal",
                marginBottom: 12,
                fontFamily,
                lineHeight: 1.35,
              },
              children: displayTitle,
            },
          },
          ...(date
            ? [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 22,
                      color: COLORS.muted,
                      fontStyle: "italic",
                      fontFamily: getFontFamilyItalic(),
                      marginBottom: 8,
                    },
                    children: date,
                  },
                },
              ]
            : []),
          ...(tagText
            ? [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 20,
                      color: COLORS.accent,
                      fontFamily,
                      marginBottom: 4,
                    },
                    children: tagText,
                  },
                },
              ]
            : []),
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: 50,
                left: 80,
                fontSize: 18,
                color: COLORS.muted,
                fontStyle: "italic",
                fontFamily: getFontFamilyItalic(),
              },
              children: config.site.title + " · " + domain,
            },
          },
        ],
      },
    },
    { width: WIDTH, height: HEIGHT, fonts }
  );

  return Buffer.from(svg);
}

/**
 * Generate default OG image with logo overlay
 */
export async function generateDefaultOgImage(): Promise<string> {
  const ogDir = join(config.dirs.dist, "static", "og");
  await ensureDir(ogDir);

  const svgBuffer = await generateDefaultOgImageBase();
  const basePng = await sharp(svgBuffer)
    .png({ compressionLevel: 9 })
    .toBuffer();

  const logoPath = join(process.cwd(), "public", "static", "logo.webp");
  const logoBuffer = await readFile(logoPath);
  const size = 120;
  const resizedLogo = await sharp(logoBuffer)
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();

  const circleMaskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
  );
  const circleMask = await sharp(circleMaskSvg).png().toBuffer();

  const circularLogo = await sharp(resizedLogo)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const finalBuffer = await sharp(basePng)
    .composite([
      { input: circularLogo, gravity: "southeast", left: 80, top: 50 },
    ])
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toBuffer();

  const imagePath = join(ogDir, "default.webp");
  await sharp(finalBuffer).toFile(imagePath);
  return `/static/og/default.webp`;
}

/**
 * Format date for OG image display (e.g. 2026-01-02 -> 2026年1月2日)
 */
function formatOgDate(isoDate: string | undefined): string | undefined {
  if (!isoDate) return undefined;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Generate unique OG image for a blog post (title + date + tags + domain)
 */
export async function generateOgImage(
  slug: string,
  title: string,
  date?: string,
  tags?: string[]
): Promise<string> {
  const ogDir = join(config.dirs.dist, "static", "og");
  await ensureDir(ogDir);

  const displayDate = formatOgDate(date);
  const svgBuffer = await generatePostOgImageBase(title, displayDate, tags);

  const imagePath = join(ogDir, `${slug}.webp`);
  await sharp(svgBuffer)
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(imagePath);

  return `/static/og/${slug}.webp`;
}
