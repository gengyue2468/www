import mapUnits from "./map.json";
import { finite } from "./format.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

// Natural Earth map units and label points; points indicate regions, not server locations.
export function createMap(root) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 360 145");
  svg.setAttribute("role", "img");
  const world = document.createElementNS(SVG_NS, "g");
  world.setAttribute("data-vps-map-world", "");
  svg.append(world);
  const land = new Map();
  const points = new Map();
  for (const [code, path, x, y] of mapUnits) {
    const shape = document.createElementNS(SVG_NS, "path");
    shape.setAttribute("d", path);
    shape.setAttribute("class", "vps-map-land");
    shape.setAttribute("fill-rule", "evenodd");
    world.append(shape);
    if (code) {
      if (!land.has(code)) land.set(code, []);
      land.get(code).push(shape);
      if (!points.has(code) && finite(x) && finite(y)) points.set(code, [x, y]);
    }
  }
  const markers = document.createElementNS(SVG_NS, "g");
  world.append(markers);
  root.querySelector("[data-vps-map-graphic]").replaceChildren(svg);
  root.tabIndex = 0;
  root.setAttribute("role", "button");
  root.setAttribute("aria-label", "Enlarge server map");
  return { root, svg, world, markers, land, points, signature: null, scale: 1, offsetX: 0, offsetY: 0 };
}

export function mapPoint(svg, clientX, clientY) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  return new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
}

export function applyMapTransform(map) {
  const width = 360 * map.scale;
  const height = 145 * map.scale;
  map.offsetX = map.scale === 1 ? 0 : clamp(map.offsetX, 360 - width, 0);
  map.offsetY = map.scale === 1 ? 0 : clamp(map.offsetY, 145 - height, 0);
  map.world.setAttribute("transform", `translate(${map.offsetX} ${map.offsetY}) scale(${map.scale})`);
}

export function resetMapTransform(map) {
  map.scale = 1;
  map.offsetX = 0;
  map.offsetY = 0;
  applyMapTransform(map);
}

export function zoomMap(map, factor, clientX, clientY) {
  const nextScale = clamp(map.scale * factor, 1, 8);
  if (nextScale === map.scale) return;
  const pointer = Number.isFinite(clientX) && Number.isFinite(clientY) ? mapPoint(map.svg, clientX, clientY) : null;
  const anchorX = pointer ? (pointer.x - map.offsetX) / map.scale : 180;
  const anchorY = pointer ? (pointer.y - map.offsetY) / map.scale : 72.5;
  const targetX = pointer?.x ?? 180;
  const targetY = pointer?.y ?? 72.5;
  map.scale = nextScale;
  map.offsetX = targetX - anchorX * nextScale;
  map.offsetY = targetY - anchorY * nextScale;
  applyMapTransform(map);
}

export function updateMap(map, countries) {
  const codes = [...countries].sort();
  const signature = JSON.stringify(codes);
  map.root.hidden = false;
  if (signature === map.signature) return;
  map.signature = signature;
  for (const [code, shapes] of map.land) {
    for (const shape of shapes) shape.toggleAttribute("data-active", countries.has(code));
  }
  map.markers.replaceChildren();
  for (const code of codes) {
    const point = map.points.get(code);
    if (!point) continue;
    const marker = document.createElementNS(SVG_NS, "circle");
    marker.setAttribute("class", "vps-map-marker");
    marker.setAttribute("cx", point[0]);
    marker.setAttribute("cy", point[1]);
    marker.setAttribute("r", "2");
    map.markers.append(marker);
  }
  const names = codes.map(code => regionNames?.of(code.toUpperCase()) || code.toUpperCase());
  map.svg.setAttribute("aria-label", names.length ? `Server regions from name flags: ${names.join(", ")}.` : "No country flags in visible server names.");
}
