import { el as element } from "../../ui/dom.js";
import { formatDateTimeSeconds } from "../../ui/time.js";
import flags from "./flags.json";

export const STALE_MS = 180000;
export const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
export const loadNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
export const preciseNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });
export const nameOrder = new Intl.Collator("en", { sensitivity: "base", numeric: true });
export const formatSnapshotDate = formatDateTimeSeconds;

export const states = ["up", "down", "paused", "pending", "unknown"];
export const sortChoices = [
  ["name-asc", "Name A–Z"], ["name-desc", "Name Z–A"],
  ["cpuPercent", "CPU ↓"], ["memoryPercent", "Memory ↓"],
  ["diskPercent", "Disk ↓"], ["uptimeSeconds", "Uptime ↓"],
];
export const filterChoices = [["all", "All"], ...states.map(state => [state, state[0].toUpperCase() + state.slice(1)])];

export const cpuFields = [
  ["userPercent", "User"], ["systemPercent", "System"], ["iowaitPercent", "I/O wait"],
  ["stealPercent", "Steal"], ["idlePercent", "Idle"], ["irqPercent", "IRQ"],
  ["softirqPercent", "Soft IRQ"], ["nicePercent", "Nice"],
];

export const finite = value => typeof value === "number" && Number.isFinite(value);
export const text = value => (typeof value === "string" && value ? value : "—");
export const nodeStatus = node => (states.includes(node.status) ? node.status : "unknown");
export const percent = value => (finite(value) ? `${number.format(value)}%` : "—");
export const latency = value => (finite(value) ? `${number.format(value)} ms` : "—");
export const nameSortKey = node => text(node.name).normalize("NFKC").replace(/^[^\p{L}]+/u, "").trim();

export function flagCode(value) {
  const match = typeof value === "string" && value.match(/^([\u{1F1E6}-\u{1F1FF}]{2})/u);
  return match ? [...match[1]].map(char => String.fromCharCode(char.codePointAt(0) - 0x1f1e6 + 97)).join("") : null;
}

export function bytes(value) {
  if (!finite(value) || value < 0) return "—";
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  const index = value > 0 ? Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024))) : 0;
  return `${number.format(value / 1024 ** index)} ${units[index]}`;
}

export const rate = value => (finite(value) && value >= 0 ? `${bytes(value)}/s` : "—");

export function capacity(used, total, value) {
  if (!(finite(used) && used >= 0) && !(finite(total) && total >= 0)) return percent(value);
  return `${bytes(used)} / ${bytes(total)}${finite(value) ? ` (${percent(value)})` : ""}`;
}

export const ioFields = [
  ["readBytesPerSecond", "Read", rate], ["writeBytesPerSecond", "Write", rate],
  ["readBytesTotal", "Read total", bytes], ["writeBytesTotal", "Written total", bytes],
  ["utilizationPercent", "Utilization", percent], ["readTimePercent", "Read time", percent],
  ["writeTimePercent", "Write time", percent], ["readAwaitMs", "Read await", latency],
  ["writeAwaitMs", "Write await", latency],
  ["queueDepth", "Queue depth", value => (finite(value) ? preciseNumber.format(value) : "—")],
];

export function uptime(value) {
  if (!finite(value) || value < 0) return "—";
  const minutes = Math.floor(value / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days ? `${days}d ${hours % 24}h` : hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export const timestamp = value => (typeof value === "string" ? Date.parse(value) : NaN);

export function age(value) {
  const time = timestamp(value);
  if (!Number.isFinite(time)) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  return seconds < 60 ? "Just now" : seconds < 3600 ? `${Math.floor(seconds / 60)}m ago`
    : seconds < 86400 ? `${Math.floor(seconds / 3600)}h ago` : `${Math.floor(seconds / 86400)}d ago`;
}

export const stale = value => !Number.isFinite(timestamp(value)) || Date.now() - timestamp(value) > STALE_MS;

export const write = (node, value) => {
  if (node.textContent !== value) node.textContent = value;
};

export function writeName(node, value) {
  if (node.textContent === value) return;
  const match = value.match(/^([\u{1F1E6}-\u{1F1FF}]{2})/u);
  const code = flagCode(value);
  const flag = code && flags[code];
  if (!match || !flag) { node.textContent = value; return; }
  const icon = element("span", "vps-flag", match[1]);
  icon.style.setProperty("--flag-x", `${flag[0]}px`);
  icon.style.setProperty("--flag-y", `${flag[1]}px`);
  icon.style.setProperty("--flag-width", `${flag[2]}px`);
  icon.style.setProperty("--flag-height", `${flag[3]}px`);
  node.replaceChildren(icon, document.createTextNode(value.slice(match[1].length)));
}

export function timeLabel(node, value, prefix = "") {
  write(node, `${prefix}${age(value)}`);
  const time = node.closest("time") || node;
  if (Number.isFinite(timestamp(value))) {
    time.dateTime = value;
    time.title = dateFormat.format(new Date(value));
  } else {
    time.removeAttribute("datetime");
    time.removeAttribute("title");
  }
}

export function fleetValue(nodes, fields, format, eligible = () => true) {
  const totals = fields.map(() => 0);
  let count = 0;
  for (const node of nodes) {
    const values = fields.map(field => field(node));
    if (!eligible(node) || !values.every(value => finite(value) && value >= 0)) continue;
    values.forEach((value, index) => { totals[index] += value; });
    count++;
  }
  return count ? totals.map(format).join(" / ") : "—";
}

export function interfaceTotal(node, field) {
  const interfaces = node.network?.interfaces;
  if (!interfaces || typeof interfaces !== "object" || Array.isArray(interfaces)) return null;
  const values = Object.values(interfaces).map(item => item?.[field]);
  if (!values.length || !values.every(value => finite(value) && value >= 0)) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function cpuAggregate(nodes, getValue, weighted) {
  let sum = 0;
  let threads = 0;
  let count = 0;
  for (const node of nodes) {
    const value = getValue(node);
    if (nodeStatus(node) !== "up" || stale(node.updatedAt) || !finite(node.threads) || node.threads <= 0 || !finite(value) || value < 0) continue;
    sum += weighted ? value * node.threads : value;
    threads += node.threads;
    count++;
  }
  return count ? (weighted ? percent(sum / threads) : loadNumber.format(sum / threads)) : "—";
}

export function highestUsage(nodes, field) {
  const candidates = nodes.filter(node => nodeStatus(node) === "up" && !stale(node.updatedAt) && finite(node[field]) && node[field] >= 0);
  candidates.sort((a, b) => b[field] - a[field] || nameOrder.compare(nameSortKey(a), nameSortKey(b)) || nameOrder.compare(a.id, b.id));
  const node = candidates[0];
  return node ? `${text(node.name)} · ${percent(node[field])}` : "—";
}
