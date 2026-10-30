import { MarqueeController, createMarquee } from "./marquee.js";
import flags from "./vps-flags.json";
import mapUnits from "./vps-map.json";

(() => {
  const tagName = "vps-page";
  if (customElements.get(tagName)) return;
  const API = "/api/beszel";
  const STALE_MS = 180000;
  const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  const loadNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
  const preciseNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });
  const nameOrder = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const text = value => typeof value === "string" && value ? value : "—";
  const flagCode = value => {
    const match = typeof value === "string" && value.match(/^([\u{1F1E6}-\u{1F1FF}]{2})/u);
    return match ? [...match[1]].map(char => String.fromCharCode(char.codePointAt(0) - 0x1f1e6 + 97)).join("") : null;
  };
  const nameSortKey = node => text(node.name).normalize("NFKC").replace(/^[^\p{L}]+/u, "").trim();
  const percent = value => finite(value) ? `${number.format(value)}%` : "—";
  const states = ["up", "down", "paused", "pending", "unknown"];
  const nodeStatus = node => states.includes(node.status) ? node.status : "unknown";
  const sortChoices = [
    ["name-asc", "Name A–Z"], ["name-desc", "Name Z–A"],
    ["cpuPercent", "CPU ↓"], ["memoryPercent", "Memory ↓"],
    ["diskPercent", "Disk ↓"], ["uptimeSeconds", "Uptime ↓"],
  ];
  const filterChoices = [["all", "All"], ...states.map(state => [state, state[0].toUpperCase() + state.slice(1)])];
  const latency = value => finite(value) ? `${number.format(value)} ms` : "—";
  const cpuFields = [
    ["userPercent", "User"], ["systemPercent", "System"], ["iowaitPercent", "I/O wait"],
    ["stealPercent", "Steal"], ["idlePercent", "Idle"], ["irqPercent", "IRQ"],
    ["softirqPercent", "Soft IRQ"], ["nicePercent", "Nice"],
  ];
  const bytes = value => {
    if (!finite(value) || value < 0) return "—";
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
    const index = value > 0 ? Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024))) : 0;
    return `${number.format(value / 1024 ** index)} ${units[index]}`;
  };
  const rate = value => finite(value) && value >= 0 ? `${bytes(value)}/s` : "—";
  // Optional capacity fields are bytes, never inferred from percentages.
  const capacity = (used, total, value) => {
    if (!(finite(used) && used >= 0) && !(finite(total) && total >= 0)) return percent(value);
    return `${bytes(used)} / ${bytes(total)}${finite(value) ? ` (${percent(value)})` : ""}`;
  };
  const ioFields = [
    ["readBytesPerSecond", "Read", rate], ["writeBytesPerSecond", "Write", rate],
    ["readBytesTotal", "Read total", bytes], ["writeBytesTotal", "Written total", bytes],
    ["utilizationPercent", "Utilization", percent], ["readTimePercent", "Read time", percent],
    ["writeTimePercent", "Write time", percent], ["readAwaitMs", "Read await", latency],
    ["writeAwaitMs", "Write await", latency],
    ["queueDepth", "Queue depth", value => finite(value) ? preciseNumber.format(value) : "—"],
  ];
  const uptime = value => {
    if (!finite(value) || value < 0) return "—";
    const minutes = Math.floor(value / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return days ? `${days}d ${hours % 24}h` : hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };
  const timestamp = value => typeof value === "string" ? Date.parse(value) : NaN;
  const age = value => {
    const time = timestamp(value);
    if (!Number.isFinite(time)) return "—";
    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    return seconds < 60 ? "Just now" : seconds < 3600 ? `${Math.floor(seconds / 60)}m ago`
      : seconds < 86400 ? `${Math.floor(seconds / 3600)}h ago` : `${Math.floor(seconds / 86400)}d ago`;
  };
  const stale = value => !Number.isFinite(timestamp(value)) || Date.now() - timestamp(value) > STALE_MS;
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const write = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  function writeName(node, value) {
    if (node.textContent === value) return;
    const match = value.match(/^([\u{1F1E6}-\u{1F1FF}]{2})/u);
    const code = flagCode(value);
    const flag = code && flags[code];
    if (!flag) { node.textContent = value; return; }
    const icon = element("span", "vps-flag", match[1]);
    icon.style.setProperty("--flag-x", `${flag[0]}px`);
    icon.style.setProperty("--flag-y", `${flag[1]}px`);
    icon.style.setProperty("--flag-width", `${flag[2]}px`);
    icon.style.setProperty("--flag-height", `${flag[3]}px`);
    node.replaceChildren(icon, document.createTextNode(value.slice(match[1].length)));
  }

  // Natural Earth map units and label points; points indicate regions, not server locations.
  function createMap(root) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 360 145");
    svg.setAttribute("role", "img");
    const land = new Map();
    const points = new Map();
    for (const [code, path, x, y] of mapUnits) {
      const shape = document.createElementNS(namespace, "path");
      shape.setAttribute("d", path);
      shape.setAttribute("class", "vps-map-land");
      shape.setAttribute("fill-rule", "evenodd");
      svg.append(shape);
      if (code) {
        if (!land.has(code)) land.set(code, []);
        land.get(code).push(shape);
        if (!points.has(code) && finite(x) && finite(y)) points.set(code, [x, y]);
      }
    }
    const markers = document.createElementNS(namespace, "g");
    svg.append(markers);
    root.querySelector("[data-vps-map-graphic]").replaceChildren(svg);
    return { root, svg, markers, land, points, signature: null };
  }

  const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
  function updateMap(map, countries) {
    const codes = [...countries].sort();
    const signature = JSON.stringify(codes);
    map.root.hidden = false;
    if (signature === map.signature) return;
    map.signature = signature;
    for (const [code, shapes] of map.land) for (const shape of shapes) shape.toggleAttribute("data-active", countries.has(code));
    map.markers.replaceChildren();
    for (const code of codes) {
      const point = map.points.get(code);
      if (!point) continue;
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      marker.setAttribute("class", "vps-map-marker");
      marker.setAttribute("cx", point[0]);
      marker.setAttribute("cy", point[1]);
      marker.setAttribute("r", "2");
      map.markers.append(marker);
    }
    const names = codes.map(code => regionNames?.of(code.toUpperCase()) || code.toUpperCase());
    map.svg.setAttribute("aria-label", names.length ? `Server regions from name flags: ${names.join(", ")}.` : "No country flags in visible server names.");
  }
  const timeLabel = (node, value, prefix = "") => {
    write(node, `${prefix}${age(value)}`);
    const time = node.closest("time") || node;
    if (Number.isFinite(timestamp(value))) {
      time.dateTime = value;
      time.title = dateFormat.format(new Date(value));
    } else {
      time.removeAttribute("datetime");
      time.removeAttribute("title");
    }
  };

  // Keep nodes, disclosures and rows alive between full snapshots. Only changed
  // text is written: one-second updates must not reset focus, selection or scroll.
  function syncItems(parent, cache, items, keyOf, create, update) {
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

  function createNode() {
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
    return { root, name: nameText.source, state, hardware: hardwareText.source, values, rx, tx, running,
      uptimeValue: uptimeText.source, updated: updatedText.source, updatedContainer, fields,
      swap, thermal, temperatures, temperatureViews: new Map(), processor, breakdown, breakdownViews,
      perCpu, coreList, coreViews: new Map(), storage, filesystemGroup, filesystemRows, filesystemViews: new Map(), ioGroup, ioViews,
      marquee: new MarqueeController(root, root, { preserveUpdates: true }),
      networkTime: networkTimeText.source, networkTimeContainer, interfaces, interfaceViews: new Map(), monitorRows, monitorViews: new Map(), emptyProbes };
  }

  function updateNode(view, node) {
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
      Array.isArray(node.loadAverage) ? node.loadAverage.map(value => finite(value) ? loadNumber.format(value) : "—").join(" / ") : "—",
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

  class VpsPage extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.list = this.querySelector("[data-vps-nodes]");
      this.message = this.querySelector("[data-vps-message]");
      this.retry = this.querySelector("[data-vps-retry]");
      this.updated = this.querySelector("[data-vps-updated]");
      this.summary = this.querySelector("[data-vps-summary]");
      if (!this.list || !this.message || !this.retry || !this.summary || !this.updated) return;
      this.controller = new AbortController();
      const mapRoot = this.querySelector("[data-vps-map]");
      if (mapRoot) {
        this.map ||= createMap(mapRoot);
        const mobile = window.matchMedia("(max-width: 760px)");
        const placeMap = () => {
          if (mobile.matches) this.querySelector(".vps-overview")?.after(mapRoot);
          else this.querySelector(".vps-sidebar")?.append(mapRoot);
        };
        mobile.addEventListener("change", placeMap, { signal: this.controller.signal });
        placeMap();
      }
      this.nodeViews ||= new Map();
      for (const view of this.nodeViews.values()) view.marquee.connect();
      this.sortKey ||= "name-asc";
      this.filterKey ||= "all";
      this.setupChoices("sort", sortChoices);
      this.setupChoices("filter", filterChoices);
      this.retry.addEventListener("click", () => this.connectStream(), { signal: this.controller.signal });
      window.addEventListener("pagehide", () => this.closeStream(), { signal: this.controller.signal });
      window.addEventListener("pageshow", () => { if (!this.streamSource) this.connectStream(); }, { signal: this.controller.signal });
      this.ageTimer = setInterval(() => { if (this.snapshot) this.applySnapshot(this.snapshot); }, 30000);
      this.connectStream();
    }

    disconnectedCallback() {
      for (const view of this.nodeViews?.values() || []) view.marquee.disconnect();
      this.closeStream();
      this.controller?.abort();
      this.controller = null;
      clearInterval(this.ageTimer);
    }

    closeStream() {
      this.streamSource?.close();
      this.streamSource = null;
      this.fallbackController?.abort();
      this.fallbackController = null;
      clearTimeout(this.reconnectTimer);
    }

    setConnection(message, retry = false) {
      write(this.message, message);
      this.retry.hidden = !retry;
    }

    setupChoices(kind, choices) {
      const menu = this.querySelector(`[data-vps-${kind}-options]`);
      if (!menu) return;
      menu.replaceChildren(...choices.map(([key, label]) => {
        const button = element("button", "", label);
        button.type = "button";
        button.dataset.value = key;
        button.setAttribute("aria-pressed", String(key === this[`${kind}Key`]));
        button.addEventListener("click", () => {
          this[`${kind}Key`] = key;
          write(this.querySelector(`[data-vps-${kind}-label]`), label);
          for (const option of menu.querySelectorAll("button")) option.setAttribute("aria-pressed", String(option.dataset.value === key));
          if (this.snapshot) this.applySnapshot(this.snapshot);
        }, { signal: this.controller.signal });
        return button;
      }));
    }

    connectStream() {
      this.closeStream();
      if (!this.controller || !this.isConnected) return;
      this.setConnection(this.snapshot ? "Reconnecting…" : "Connecting…");
      if (typeof EventSource !== "function") { void this.loadSnapshot(); return; }
      const source = new EventSource(`${API}/events`);
      this.streamSource = source;
      source.addEventListener("snapshot", event => {
        if (this.streamSource !== source) return;
        try {
          const data = JSON.parse(event.data);
          this.applySnapshot(data);
          this.snapshot = data;
          this.setConnection("Live");
        } catch { this.setConnection("Invalid snapshot. Keeping previous data.", true); }
      });
      source.addEventListener("unavailable", () => {
        if (this.streamSource === source) this.setConnection(this.snapshot ? "Unavailable. Showing last snapshot." : "Data unavailable.", true);
      });
      source.onerror = () => {
        if (this.streamSource !== source) return;
        this.setConnection(this.snapshot ? "Reconnecting. Showing last snapshot." : "Connection unavailable. Reconnecting…", true);
        // CONNECTING is retried natively, including the server's retry: 3000.
        // HTTP 502/503 can put EventSource in CLOSED instead; reconnect that
        // case explicitly, without starting a second connection in parallel.
        if (source.readyState === EventSource.CLOSED) {
          source.close();
          this.streamSource = null;
          this.reconnectTimer = setTimeout(() => this.connectStream(), 3000);
        }
      };
    }

    async loadSnapshot() {
      const request = new AbortController();
      this.fallbackController = request;
      const timeout = setTimeout(() => request.abort(), 15000);
      try {
        const response = await fetch(API, { signal: request.signal, cache: "no-store", credentials: "omit" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (this.fallbackController !== request || !this.isConnected) return;
        this.applySnapshot(data);
        this.snapshot = data;
        this.setConnection("Snapshot only. Refresh to update.", true);
      } catch {
        if (this.fallbackController === request && this.isConnected) this.setConnection("Snapshot unavailable.", true);
      } finally {
        clearTimeout(timeout);
        if (this.fallbackController === request) this.fallbackController = null;
      }
    }

    applySnapshot(data) {
      if (!data || !Array.isArray(data.nodes) || !Number.isFinite(timestamp(data.generatedAt))) throw new Error("Invalid snapshot");
      const nodes = data.nodes.filter(node => node && typeof node.id === "string")
        .sort((a, b) => {
          const byName = nameOrder.compare(nameSortKey(a), nameSortKey(b)) || nameOrder.compare(a.id, b.id);
          if (this.sortKey === "name-desc") return -byName;
          if (this.sortKey === "name-asc") return byName;
          const left = a[this.sortKey];
          const right = b[this.sortKey];
          // Missing values always come last; zero remains a real sortable value.
          if (!finite(left)) return finite(right) ? 1 : byName;
          if (!finite(right)) return -1;
          return right - left || byName;
        });
      const up = nodes.filter(node => node.status === "up").length;
      write(this.summary, nodes.length ? `${up} of ${nodes.length} servers up.` : "No servers.");
      syncItems(this.list, this.nodeViews, nodes, node => node.id, createNode, updateNode);
      let visible = 0;
      const countries = new Set();
      for (const node of nodes) {
        const shown = this.filterKey === "all" || nodeStatus(node) === this.filterKey;
        this.nodeViews.get(node.id).root.hidden = !shown;
        if (shown) {
          visible++;
          const code = flagCode(node.name);
          if (code) countries.add(code);
        }
      }
      if (this.map) updateMap(this.map, countries);
      const empty = this.querySelector("[data-vps-empty]");
      if (empty) empty.hidden = !nodes.length || visible !== 0;
      write(this.updated, `Snapshot ${dateFormat.format(new Date(data.generatedAt))}`);
    }
  }
  customElements.define(tagName, VpsPage);
})();
