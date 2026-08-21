(() => {
  "use strict";

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
    const bendFrom = bend;
    const bendTo = bend * (0.65 + random() * 0.2);
    const controlRise = dy * (0.08 + random() * 0.08);

    const controlFrom = {
      x: from.x + direction * handle + normal.x * bendFrom,
      y: from.y + controlRise + normal.y * bendFrom,
    };
    const controlTo = {
      x: to.x - direction * handle + normal.x * bendTo,
      y: to.y - controlRise + normal.y * bendTo,
    };

    return `M ${formatPoint(from)} C ${formatPoint(controlFrom)}, ${formatPoint(controlTo)}, ${formatPoint(to)}`;
  }

  function createSvgElement(tagName) {
    return document.createElementNS(SVG_NAMESPACE, tagName);
  }

  function createArrowHead() {
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker");
    marker.setAttribute("id", "sidenote-arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("markerUnits", "userSpaceOnUse");
    marker.setAttribute("orient", "auto");

    const head = createSvgElement("path");
    head.setAttribute("d", "M 0 0 L 10 5 L 0 10 Z");
    head.setAttribute("fill", "currentColor");
    head.setAttribute("stroke", "none");

    marker.appendChild(head);
    defs.appendChild(marker);
    return defs;
  }

  function renderConnectors(section, svg) {
    const rootRect = section.getBoundingClientRect();
    const sources = Array.from(section.querySelectorAll(sourceSelector));
    const paths = [];

    for (const source of sources) {
      const targetId = source.dataset.noteTarget;
      if (!targetId) continue;

      const target = document.getElementById(targetId);
      const targetAnchor = target?.querySelector(".note-connector-target");
      if (!targetAnchor) continue;

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      if (!sourceRect.width && !sourceRect.height) continue;
      if (!targetRect.width && !targetRect.height) continue;

      const from = pointFromRect(sourceRect, rootRect, "right");
      const to = pointFromRect(targetRect, rootRect, "left");
      const path = createSvgElement("path");
      path.setAttribute("d", createPath(from, to, hashSeed(targetId)));
      path.setAttribute("marker-end", "url(#sidenote-arrowhead)");
      paths.push(path);
    }

    svg.replaceChildren(createArrowHead(), ...paths);
    svg.setAttribute("viewBox", `0 0 ${Math.max(rootRect.width, 1)} ${Math.max(rootRect.height, 1)}`);
    section.classList.toggle("sidenote-connectors-ready", paths.length > 0);
  }

  function setup() {
    const section = document.querySelector("main article section");
    const media = window.matchMedia(DESKTOP_QUERY);
    if (!section || !section.querySelector(sourceSelector)) return;

    const svg = createSvgElement("svg");
    svg.classList.add("sidenote-connectors");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    section.appendChild(svg);

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (media.matches) {
          renderConnectors(section, svg);
        } else {
          svg.replaceChildren();
          section.classList.remove("sidenote-connectors-ready");
        }
      });
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("load", schedule, { once: true });
    media.addEventListener("change", schedule);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(schedule);
      observer.observe(section);
      for (const source of section.querySelectorAll(sourceSelector)) observer.observe(source);
      for (const target of section.querySelectorAll(".note-connector-target")) observer.observe(target);
    }

    if (document.fonts?.ready) document.fonts.ready.then(schedule);
  }

  setup();
})();
