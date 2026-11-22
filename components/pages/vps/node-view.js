import { MarqueeController, createMarquee } from "../../ui/marquee.js";
import { el as element } from "../../ui/dom.js";
import {
  bytes,
  capacity,
  cpuFields,
  finite,
  ioFields,
  latency,
  loadNumber,
  nodeStatus,
  number,
  percent,
  rate,
  stale,
  text,
  timeLabel,
  uptime,
  write,
  writeName,
} from "./format.js";

// Keep nodes, disclosures and rows alive between full snapshots. Only changed
// text is written: one-second updates must not reset focus, selection or scroll.
export function syncItems(parent, cache, items, keyOf, create, update) {
  const keys = new Set();
  let cursor = parent.firstElementChild;
  for (const item of items) {
    const key = keyOf(item);
    if (keys.has(key)) continue;
    keys.add(key);
    let view = cache.get(key);
    if (!view) { view = create(item); cache.set(key, view); }
    update(view, item);
    if (view.root !== cursor) parent.insertBefore(view.root, cursor);
    cursor = view.root.nextElementSibling;
  }
  for (const [key, view] of cache) {
    if (!keys.has(key)) { view.marquee?.disconnect(); view.root.remove(); cache.delete(key); }
  }
}

function disclosure(parent, label) {
  const details = element("details", "vps-details");
  details.append(element("summary", "", label));
  const content = element("div", "vps-details-content");
  details.append(content);
  parent.append(details);
  return content;
}

function table(parent, headings, label) {
  const scroll = element("div", "vps-table-scroll");
  scroll.tabIndex = 0;
  scroll.setAttribute("role", "region");
  scroll.setAttribute("aria-label", label);
  const root = element("table", "vps-table");
  const head = element("thead");
  const row = element("tr");
  for (const heading of headings) {
    const cell = element("th", "", heading);
    cell.scope = "col";
    row.append(cell);
  }
  head.append(row);
  const body = element("tbody");
  root.append(head, body);
  scroll.append(root);
  parent.append(scroll);
  return body;
}

function tableRow(count) {
  const root = element("tr");
  const cells = Array.from({ length: count }, (_, index) => {
    const cell = element(index === 0 ? "th" : "td");
    if (index === 0) cell.scope = "row";
    root.append(cell);
    return cell;
  });
  return { root, cells };
}

function metricRow(label) {
  const root = element("div");
  const value = element("dd");
  const content = createMarquee();
  value.append(content.root);
  root.append(element("dt", "", label), value);
  return { root, value: content.source };
}

export function createNode() {
  const root = element("article", "vps-node");
  const heading = element("div", "vps-node-heading");
  const name = element("h2");
  const nameText = createMarquee();
  name.append(nameText.root);
  const state = element("span", "vps-state");
  heading.append(name, state);
  const hardware = element("p", "vps-hardware");
  const hardwareText = createMarquee();
  hardware.append(hardwareText.root);
  const resources = element("dl", "vps-resources");
  const values = ["CPU", "Memory", "Disk"].map(label => {
    const group = element("div");
    const value = element("dd");
    const content = createMarquee();
    content.source.textContent = "—";
    value.append(content.root);
    group.append(element("dt", "", label), value);
    resources.append(group);
    return content.source;
  });
  const traffic = element("div", "vps-traffic");
  const networkGroup = element("span", "vps-network-group");
  const networkText = createMarquee();
  const rx = element("span");
  const tx = element("span");
  networkText.source.append(rx, document.createTextNode(" "), tx);
  networkGroup.append(element("span", "vps-network-label", "Network"), networkText.root);
  const meta = element("div", "vps-node-meta");
  const running = element("span", "vps-uptime-group");
  const uptimeText = createMarquee();
  running.append(element("span", "vps-uptime-label", "Uptime"), uptimeText.root);
  const updatedContainer = element("time");
  const updatedText = createMarquee();
  updatedContainer.append(updatedText.root);
  traffic.append(networkGroup, running);
  meta.append(updatedContainer);
  root.append(heading, hardware, resources, traffic);

  const system = disclosure(root, "System");
  const systemList = element("dl", "vps-system");
  const fields = {};
  for (const label of ["OS", "Kernel", "CPU", "Cores / threads", "Load average", "Agent"]) {
    const group = element("div");
    const value = element("dd");
    const content = createMarquee();
    value.append(content.root);
    group.append(element("dt", "", label), value);
    systemList.append(group);
    fields[label] = content.source;
  }
  system.append(systemList);
  const swap = metricRow("Swap");
  systemList.append(swap.root);
  const thermal = element("div", "vps-extra");
  thermal.append(element("p", "vps-subtitle", "Temperatures"));
  const temperatures = element("dl", "vps-system vps-temperatures");
  thermal.append(temperatures);
  system.append(thermal);

  const processor = disclosure(root, "CPU");
  const breakdown = element("dl", "vps-cpu-breakdown");
  const breakdownViews = new Map(cpuFields.map(([key, label]) => {
    const row = metricRow(label);
    breakdown.append(row.root);
    return [key, row];
  }));
  processor.append(breakdown);
  const perCpu = element("div", "vps-extra");
  perCpu.append(element("p", "vps-subtitle", "Per CPU"));
  const coreList = element("dl", "vps-core-usage");
  perCpu.append(coreList);
  processor.append(perCpu);

  const storage = disclosure(root, "Storage");
  const filesystemGroup = element("div", "vps-extra");
  const filesystemRows = table(filesystemGroup, ["Filesystem", "Used", "Total", "Usage"], "Filesystems");
  storage.append(filesystemGroup);
  const ioGroup = element("div", "vps-extra");
  ioGroup.append(element("p", "vps-subtitle", "Disk I/O"));
  const ioList = element("dl", "vps-io-metrics");
  const ioViews = new Map(ioFields.map(([key, label]) => {
    const row = metricRow(label);
    ioList.append(row.root);
    return [key, row];
  }));
  ioGroup.append(ioList);
  storage.append(ioGroup);

  const network = disclosure(root, "Interfaces");
  const networkTimeContainer = element("time", "vps-sample-time");
  const networkTimeText = createMarquee();
  networkTimeContainer.append(networkTimeText.root);
  network.append(networkTimeContainer);
  const interfaces = table(network, ["Interface", "Receive", "Send", "Received total", "Sent total"], "Network interfaces");
  const probes = disclosure(root, "Probes");
  const monitorRows = table(probes, ["Target", "Now", "1h avg", "1h min–max", "1h loss"], "Network probes");
  const emptyProbes = element("p", "vps-table-note", "No probes.");
  probes.append(emptyProbes);
  root.append(meta);

  return {
    root, name: nameText.source, state, hardware: hardwareText.source, values, rx, tx, running,
    uptimeValue: uptimeText.source, updated: updatedText.source, updatedContainer, fields,
    swap, thermal, temperatures, temperatureViews: new Map(), processor, breakdown, breakdownViews,
    perCpu, coreList, coreViews: new Map(), storage, filesystemGroup, filesystemRows, filesystemViews: new Map(), ioGroup, ioViews,
    marquee: new MarqueeController(root, root, { preserveUpdates: true }),
    networkTime: networkTimeText.source, networkTimeContainer, interfaces, interfaceViews: new Map(), monitorRows, monitorViews: new Map(), emptyProbes,
  };
}

export function updateNode(view, node) {
  const status = nodeStatus(node);
  view.root.dataset.state = status;
  view.root.toggleAttribute("data-stale", stale(node.updatedAt));
  writeName(view.name, text(node.name));
  write(view.state, status[0].toUpperCase() + status.slice(1));
  write(view.hardware, text(node.cpuModel));
  [percent(node.cpuPercent), capacity(node.memoryUsedBytes, node.memoryTotalBytes, node.memoryPercent),
    capacity(node.diskUsedBytes, node.diskTotalBytes, node.diskPercent)]
    .forEach((value, index) => write(view.values[index], value));
  write(view.rx, `${rate(node.network?.rxBytesPerSecond)} ↓`);
  write(view.tx, `↑ ${rate(node.network?.txBytesPerSecond)}`);
  write(view.uptimeValue, uptime(node.uptimeSeconds));
  timeLabel(view.updated, node.updatedAt, "Updated ");
  const fields = [text(node.os), text(node.kernel), text(node.cpuModel),
    `${finite(node.cores) ? node.cores : "—"} / ${finite(node.threads) ? node.threads : "—"}`,
    Array.isArray(node.loadAverage) ? node.loadAverage.map(value => (finite(value) ? loadNumber.format(value) : "—")).join(" / ") : "—",
    text(node.agentVersion)];
  Object.values(view.fields).forEach((field, index) => write(field, fields[index]));
  view.swap.root.hidden = !finite(node.swapUsedBytes) && !finite(node.swapTotalBytes);
  write(view.swap.value, capacity(node.swapUsedBytes, node.swapTotalBytes, null));
  const sensors = node.temperaturesCelsius && typeof node.temperaturesCelsius === "object" && !Array.isArray(node.temperaturesCelsius)
    ? Object.entries(node.temperaturesCelsius).filter(([, value]) => finite(value)) : [];
  view.thermal.hidden = !sensors.length;
  syncItems(view.temperatures, view.temperatureViews, sensors, item => item[0], ([name]) => {
    const row = metricRow("");
    const label = createMarquee();
    label.source.textContent = name;
    row.root.firstElementChild.append(label.root);
    return row;
  }, (row, [, value]) => {
    write(row.value, `${number.format(value)} °C`);
  });

  const cpu = node.cpuBreakdown || {};
  const hasBreakdown = cpuFields.some(([key]) => finite(cpu[key]));
  view.breakdown.hidden = !hasBreakdown;
  for (const [key, row] of view.breakdownViews) {
    row.root.hidden = !finite(cpu[key]);
    write(row.value, percent(cpu[key]));
  }
  const cores = Array.isArray(node.cpuCorePercents) ? node.cpuCorePercents.map((value, index) => ({ index, value })) : [];
  view.perCpu.hidden = !cores.some(core => finite(core.value));
  view.processor.parentElement.hidden = !hasBreakdown && view.perCpu.hidden;
  syncItems(view.coreList, view.coreViews, cores, item => item.index, item => metricRow(`CPU ${item.index}`), (row, item) => {
    write(row.value, percent(item.value));
  });

  const filesystems = Array.isArray(node.filesystems) ? node.filesystems.filter(fs => fs && typeof fs.name === "string") : [];
  view.filesystemGroup.hidden = !filesystems.length;
  syncItems(view.filesystemRows, view.filesystemViews, filesystems, fs => fs.name, () => {
    const row = tableRow(4);
    const name = createMarquee();
    row.cells[0].append(name.root);
    row.label = name.source;
    return row;
  }, (row, fs) => {
    write(row.label, text(fs.name));
    const usedPercent = finite(fs.usedBytes) && fs.usedBytes >= 0 && finite(fs.totalBytes) && fs.totalBytes > 0
      ? fs.usedBytes / fs.totalBytes * 100 : null;
    [bytes(fs.usedBytes), bytes(fs.totalBytes), percent(usedPercent)].forEach((value, index) => write(row.cells[index + 1], value));
  });
  const io = node.diskIo || {};
  view.ioGroup.hidden = !ioFields.some(([key]) => finite(io[key]));
  for (const [key, , format] of ioFields) write(view.ioViews.get(key).value, format(io[key]));
  view.storage.parentElement.hidden = view.filesystemGroup.hidden && view.ioGroup.hidden;

  timeLabel(view.networkTime, node.network?.sampledAt, stale(node.network?.sampledAt) ? "Older network sample: " : "Network sample: ");
  const interfaces = node.network?.interfaces && typeof node.network.interfaces === "object" ? Object.entries(node.network.interfaces) : [];
  syncItems(view.interfaces, view.interfaceViews, interfaces, item => item[0], () => {
    const row = tableRow(5);
    const label = createMarquee();
    row.cells[0].append(label.root);
    row.label = label.source;
    return row;
  }, (row, [name, data]) => {
    write(row.label, name);
    [rate(data?.rxBytesPerSecond), rate(data?.txBytesPerSecond), bytes(data?.rxBytesTotal), bytes(data?.txBytesTotal)]
      .forEach((value, index) => write(row.cells[index + 1], value));
  });

  const monitors = Array.isArray(node.monitors) ? node.monitors.filter(item => item && typeof item.id === "string") : [];
  view.emptyProbes.hidden = monitors.length !== 0;
  syncItems(view.monitorRows, view.monitorViews, monitors, item => item.id, () => {
    const row = tableRow(5);
    const target = createMarquee();
    const info = createMarquee();
    const sample = createMarquee();
    info.root.classList.add("vps-probe-info");
    sample.root.classList.add("vps-probe-info");
    row.target = target.source;
    row.info = info.source;
    row.sample = element("time");
    sample.source.append(row.sample);
    row.cells[0].append(target.root, info.root, sample.root);
    return row;
  }, (row, monitor) => {
    write(row.target, text(monitor.target));
    const protocol = text(monitor.protocol).toUpperCase();
    const endpoint = `${protocol}${finite(monitor.port) ? ` :${monitor.port}` : ""}`;
    write(row.info, `${endpoint}${finite(monitor.intervalSeconds) ? ` / ${monitor.intervalSeconds}s` : ""}${monitor.enabled === false ? " / Disabled" : ""}`);
    timeLabel(row.sample, monitor.updatedAt, stale(monitor.updatedAt) ? "Older sample: " : "");
    row.root.toggleAttribute("data-disabled", monitor.enabled === false);
    [latency(monitor.responseMs), latency(monitor.averageResponseMs1h),
      `${latency(monitor.minimumResponseMs1h)} – ${latency(monitor.maximumResponseMs1h)}`, percent(monitor.packetLossPercent1h)]
      .forEach((value, index) => write(row.cells[index + 1], value));
  });
  view.marquee.connect();
  view.marquee.schedule();
}
