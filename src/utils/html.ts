const REMOVED_ELEMENTS = new Set([
  "base",
  "embed",
  "form",
  "link",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "template",
  "textarea",
  "button",
  "animate",
  "animatemotion",
  "animatetransform",
  "image",
  "foreignobject",
  "set",
]);

const SVG_ALLOWED_ELEMENTS = new Set([
  "svg",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "g",
  "title",
  "desc",
]);

const SVG_ALLOWED_ATTRIBUTES = new Set([
  "xmlns",
  "viewbox",
  "width",
  "height",
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "stroke-dashoffset",
  "d",
  "points",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "transform",
  "opacity",
  "preserveaspectratio",
  "vector-effect",
  "role",
  "aria-hidden",
  "aria-label",
  "aria-labelledby",
  "focusable",
  "class",
]);

const URL_ATTRIBUTES = new Set([
  "action",
  "cite",
  "formaction",
  "href",
  "poster",
  "src",
  "xlink:href",
]);

const REMOVED_ATTRIBUTES = new Set(["srcdoc", "srcset", "imagesrcset"]);

function isSafeUrl(value: string): boolean {
  const normalized = value
    .replace(/[\u0000-\u0020\u007f-\u009f]/g, "")
    .trim()
    .toLowerCase();
  if (!normalized) return true;
  if (/^(?:javascript|vbscript|data):/.test(normalized)) return false;

  try {
    const protocol = new URL(value, "https://content.invalid").protocol;
    return ["http:", "https:", "mailto:", "tel:"].includes(protocol);
  } catch {
    return false;
  }
}

function isSafeInlineStyle(value: string): boolean {
  return !/(?:url\s*\(|expression\s*\(|@import|javascript\s*:)/i.test(value);
}

function isSafeSvgAttribute(name: string, value: string): boolean {
  const normalizedName = name.toLowerCase();
  if (!SVG_ALLOWED_ATTRIBUTES.has(normalizedName)) return false;
  if (normalizedName.startsWith("on") || normalizedName === "style") return false;
  if (/(?:url\s*\(|javascript\s*:|vbscript\s*:|data\s*:)/i.test(value)) return false;

  if (normalizedName === "class") {
    return /^[A-Za-z0-9 _:-]+$/.test(value);
  }

  return true;
}

function sanitizeSvgElement(element: HTMLRewriterTypes.Element, tagName: string): void {
  if (!SVG_ALLOWED_ELEMENTS.has(tagName)) {
    element.remove();
    return;
  }

  for (const [name, value] of element.attributes) {
    if (!isSafeSvgAttribute(name, value)) element.removeAttribute(name);
  }
}

export function sanitizeHtml(html: string): string {
  const rewriter = new HTMLRewriter();
  let svgDepth = 0;

  for (const tag of REMOVED_ELEMENTS) {
    rewriter.on(tag, {
      element(element) {
        element.remove();
      },
    });
  }

  rewriter.on("*", {
    element(element) {
      const tagName = element.tagName.toLowerCase();
      const insideSvg = svgDepth > 0 || tagName === "svg";
      if (insideSvg) {
        if (tagName === "svg") {
          svgDepth++;
          try {
            element.onEndTag(() => {
              svgDepth--;
            });
          } catch {
            svgDepth = Math.max(0, svgDepth - 1);
          }
        }
        sanitizeSvgElement(element, tagName);
        return;
      }

      if (element.tagName === "input" && !["checkbox", "radio"].includes(element.getAttribute("type")?.toLowerCase() || "")) {
        element.remove();
        return;
      }

      if (element.tagName === "iframe") {
        const src = element.getAttribute("src");
        if (src && !isSafeUrl(src)) {
          element.remove();
          return;
        }
      }

      for (const [name, value] of element.attributes) {
        const normalizedName = name.toLowerCase();
        if (normalizedName.startsWith("on") || REMOVED_ATTRIBUTES.has(normalizedName)) {
          element.removeAttribute(name);
        } else if (URL_ATTRIBUTES.has(normalizedName) && !isSafeUrl(value)) {
          element.removeAttribute(name);
        } else if (normalizedName === "style" && !isSafeInlineStyle(value)) {
          element.removeAttribute(name);
        }
      }
    },
  });

  return rewriter.transform(html);
}
