import { el as element } from "../../ui/dom.js";
import { formatDateTimeSeconds, formatShortDateTime } from "../../ui/time.js";

export { formatShortDateTime };

const percentFormatter = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 2,
});

const latencyFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export function stateInfo(status) {
  if (status == null || status === "") return { className: "unknown", label: "Unknown" };
  switch (Number(status)) {
    case 1: return { className: "up", label: "Operational" };
    case 0: return { className: "down", label: "Down" };
    case 2: return { className: "pending", label: "Pending" };
    case 3: return { className: "maintenance", label: "Maintenance" };
    default: return { className: "unknown", label: "Unknown" };
  }
}

function parseUtcDate(value) {
  if (typeof value !== "string" || !value.trim()) return new Date(NaN);
  const iso = value.trim().replace(" ", "T");
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}Z`);
}

export function formatCheckedAt(value) {
  if (typeof value !== "string") return "";
  const date = parseUtcDate(value);
  return Number.isFinite(date.getTime()) ? formatShortDateTime(date) : value;
}

export function formatUptime(value) {
  const uptime = Number(value);
  return Number.isFinite(uptime) ? percentFormatter.format(Math.max(0, Math.min(1, uptime))) : "—";
}

export function formatLatency(value) {
  const latency = Number(value);
  return value != null && Number.isFinite(latency) ? `${latencyFormatter.format(latency)} ms` : "Unavailable";
}

export function renderIncident(item) {
  const article = element("article", "status-incident");
  const heading = element("div", "status-incident-header");
  heading.append(element("h3", "status-incident-title", typeof item.title === "string" && item.title.trim() ? item.title : "Incident"));
  if (typeof item.style === "string" && item.style.trim()) heading.append(element("span", "status-incident-style", item.style));
  article.append(heading);
  if (typeof item.content === "string" && item.content.trim()) article.append(element("p", "status-incident-content", item.content));
  const meta = element("div", "status-incident-meta");
  for (const [label, value] of [["Created", item.createdDate], ["Updated", item.lastUpdatedDate]]) {
    if (typeof value !== "string" || !value.trim()) continue;
    const date = parseUtcDate(value);
    const row = element("span");
    row.append(document.createTextNode(`${label}: `));
    const time = element("time", "", Number.isFinite(date.getTime()) ? formatDateTimeSeconds(date) : value);
    if (Number.isFinite(date.getTime())) time.dateTime = date.toISOString();
    row.append(time);
    meta.append(row);
  }
  if (meta.childElementCount) article.append(meta);
  return article;
}

export function renderMonitor(monitor, history) {
  const info = stateInfo(monitor?.status);
  const row = element("article", `status-service is-${info.className}`);
  const heading = element("div", "status-service-heading");
  heading.append(element("span", "status-service-name", String(monitor?.name || "Unnamed service")));
  heading.append(element("span", "status-service-state", info.label));
  row.append(heading);

  const checks = Array.isArray(history) ? history.slice(-50) : [];
  if (checks.length) {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const heartbeat = document.createElementNS(svgNamespace, "svg");
    heartbeat.setAttribute("class", "status-heartbeat");
    heartbeat.setAttribute("viewBox", `0 0 ${checks.length * 10} 16`);
    heartbeat.setAttribute("preserveAspectRatio", "none");
    const levels = "▁▂▃▄▅▆▇█";
    const maxPing = Math.max(1, ...checks.map(check => Number(check?.ping) || 0));
    heartbeat.setAttribute("role", "img");
    const operational = checks.filter(check => check?.status === 1).length;
    heartbeat.setAttribute("aria-label", `${monitor?.name || "Service"}: ${operational} of the last ${checks.length} checks operational, oldest to newest`);
    for (const [index, check] of checks.entries()) {
      const state = stateInfo(check?.status);
      const ping = Math.max(0, Number(check?.ping) || 0);
      const level = state.className === "up" ? Math.min(7, Math.round(ping / maxPing * 7)) : 0;
      const dot = document.createElementNS(svgNamespace, "text");
      dot.setAttribute("class", `status-heartbeat-dot is-${state.className} notranslate`);
      dot.setAttribute("translate", "no");
      dot.setAttribute("x", String(index * 10));
      dot.setAttribute("y", "14");
      dot.setAttribute("textLength", "10");
      dot.setAttribute("lengthAdjust", "spacingAndGlyphs");
      dot.textContent = levels[level];
      dot.setAttribute("aria-hidden", "true");
      const title = document.createElementNS(svgNamespace, "title");
      title.textContent = `${state.label} · ${formatLatency(check?.ping)} · ${formatCheckedAt(check?.time)}`;
      dot.append(title);
      heartbeat.append(dot);
    }
    row.append(heartbeat);
  }

  const meta = element("div", "status-service-meta");
  meta.append(element("span", "status-service-uptime", `24h ${formatUptime(monitor?.uptime24h)}`));
  meta.append(element("span", "status-service-ping", formatLatency(monitor?.ping)));
  row.append(meta);
  if (monitor?.message) row.append(element("p", "status-service-message", String(monitor.message)));
  return row;
}
