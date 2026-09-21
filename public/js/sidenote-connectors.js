(() => {
  const tagName = "sidenote-connectors";
  if (customElements.get(tagName)) return;

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const DESKTOP_QUERY = "(min-width: 761px)";
  const sourceSelector = ".note-connector-source[data-note-target]";

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pointFromRect(rect, rootRect, edge) {
    return {
      x: (edge === "right" ? rect.right : rect.left) - rootRect.left,
      y: rect.top + rect.height / 2 - rootRect.top,
    };
  }

  function formatPoint(point) {
    return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }

  function createPath(from, to, seed) {
    const rawDx = to.x - from.x;
    const rawDy = to.y - from.y;
    const rawLength = Math.max(Math.hypot(rawDx, rawDy), 1);
    const trim = Math.min(10, rawLength * 0.22);
    const unit = { x: rawDx / rawLength, y: rawDy / rawLength };
    from = { x: from.x + unit.x * trim, y: from.y + unit.y * trim };
    to = { x: to.x - unit.x * trim, y: to.y - unit.y * trim };

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const direction = dx < 0 ? -1 : 1;
    const normal = { x: -dy / length, y: dx / length };
    const random = seededRandom(seed);
    const handleRatio = 0.34 + random() * 0.1;
    const handle = clamp(Math.abs(dx) * handleRatio, 28, 124);
    const bendLimit = clamp(length * 0.12, 8, 32);
    const bend = (random() * 2 - 1) * bendLimit;
    const bendTo = bend * (0.65 + random() * 0.2);
    const controlRise = dy * (0.08 + random() * 0.08);
    const controlFrom = {
      x: from.x + direction * handle + normal.x * bend,
      y: from.y + controlRise + normal.y * bend,
    };
    const controlTo = {
      x: to.x - direction * handle + normal.x * bendTo,
      y: to.y - controlRise + normal.y * bendTo,
    };

    return `M ${formatPoint(from)} C ${formatPoint(controlFrom)}, ${formatPoint(controlTo)}, ${formatPoint(to)}`;
  }

  function svgElement(tag) {
    return document.createElementNS(SVG_NAMESPACE, tag);
  }

  function renderConnectors(section, svg) {
    const rootRect = section.getBoundingClientRect();
    const paths = [];

    for (const source of section.querySelectorAll(sourceSelector)) {
      const targetId = source.dataset.noteTarget;
      const target = targetId ? section.querySelector(`#${CSS.escape(targetId)}`) : null;
      const targetAnchor = target?.querySelector(".note-connector-target");
      if (!targetAnchor) continue;

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      if ((!sourceRect.width && !sourceRect.height) || (!targetRect.width && !targetRect.height)) continue;

      const path = svgElement("path");
      path.setAttribute("d", createPath(
        pointFromRect(sourceRect, rootRect, "right"),
        pointFromRect(targetRect, rootRect, "left"),
        hashSeed(targetId),
      ));
      path.setAttribute("marker-end", "url(#sidenote-arrowhead)");
      paths.push(path);
    }

    const defs = svgElement("defs");
    const marker = svgElement("marker");
    marker.setAttribute("id", "sidenote-arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("markerUnits", "userSpaceOnUse");
    marker.setAttribute("orient", "auto");
    const head = svgElement("path");
    head.setAttribute("d", "M 0 0 L 10 5 L 0 10 Z");
    head.setAttribute("fill", "currentColor");
    marker.append(head);
    defs.append(marker);

    svg.replaceChildren(defs, ...paths);
    svg.setAttribute("viewBox", `0 0 ${Math.max(rootRect.width, 1)} ${Math.max(rootRect.height, 1)}`);
    section.classList.toggle("sidenote-connectors-ready", paths.length > 0);
  }

  class SidenoteConnectors extends HTMLElement {
    connectedCallback() {
      if (this.section) return;
      const section = this.closest("main article section");
      if (!section || !section.querySelector(sourceSelector)) return;

      this.section = section;
      this.media = window.matchMedia(DESKTOP_QUERY);
      this.svg = svgElement("svg");
      this.svg.classList.add("sidenote-connectors");
      this.svg.setAttribute("aria-hidden", "true");
      this.svg.setAttribute("focusable", "false");
      section.append(this.svg);

      this.schedule = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          if (this.media.matches) renderConnectors(section, this.svg);
          else {
            this.svg.replaceChildren();
            section.classList.remove("sidenote-connectors-ready");
          }
        });
      };

      this.mediaChange = this.schedule;
      this.media.addEventListener("change", this.mediaChange);
      if (typeof ResizeObserver === "function") {
        this.resizeObserver = new ResizeObserver(this.schedule);
        this.resizeObserver.observe(section);
      }
      document.fonts?.ready?.then(this.schedule);
      this.schedule();
    }

    disconnectedCallback() {
      if (!this.section) return;
      this.media.removeEventListener("change", this.mediaChange);
      this.resizeObserver?.disconnect();
      cancelAnimationFrame(this.frame);
      this.svg?.remove();
      this.section.classList.remove("sidenote-connectors-ready");
      this.section = null;
    }
  }

  customElements.define(tagName, SidenoteConnectors);
})();
