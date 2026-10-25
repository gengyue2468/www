(() => {
  const tagName = "vps-page";
  if (customElements.get(tagName)) return;
  const API = "/api/beszel";
  const STALE_MS = 180000;
  const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  const loadNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
  const nameOrder = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const text = value => typeof value === "string" && value ? value : "—";
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
  const timeLabel = (node, value, prefix = "") => {
    write(node, `${prefix}${age(value)}`);
    if (Number.isFinite(timestamp(value))) {
      node.dateTime = value;
      node.title = dateFormat.format(new Date(value));
    } else {
      node.removeAttribute("datetime");
      node.removeAttribute("title");
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
      if (!keys.has(key)) { view.root.remove(); cache.delete(key); }
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

  function createNode() {
    const root = element("article", "vps-node");
    const heading = element("div", "vps-node-heading");
    const name = element("h2");
    const state = element("span", "vps-state");
    heading.append(name, state);
    const hardware = element("p", "vps-hardware");
    const resources = element("dl", "vps-resources");
    const values = ["CPU", "Memory", "Disk"].map(label => {
      const group = element("div");
      const value = element("dd", "", "—");
      group.append(element("dt", "", label), value);
      resources.append(group);
      return value;
    });
    const traffic = element("div", "vps-traffic");
    const networkGroup = element("span", "vps-network-group");
    const rx = element("span");
    const tx = element("span");
    networkGroup.append(element("span", "vps-network-label", "Network"), rx, tx);
    const meta = element("div", "vps-node-meta");
    const running = element("span");
    const uptimeValue = element("span");
    running.append(element("span", "vps-uptime-label", "Uptime "), uptimeValue);
    const updated = element("time");
    traffic.append(networkGroup, running);
    meta.append(updated);
    root.append(heading, hardware, resources, traffic);
    const system = disclosure(root, "System");
    const systemList = element("dl", "vps-system");
    const fields = {};
    for (const label of ["OS", "Kernel", "CPU", "Cores / threads", "Load average", "Agent"]) {
      const group = element("div");
      const value = element("dd");
      group.append(element("dt", "", label), value);
      systemList.append(group);
      fields[label] = value;
    }
    system.append(systemList);
    const network = disclosure(root, "Interfaces");
    const networkTime = element("time", "vps-sample-time");
    network.append(networkTime);
    const interfaces = table(network, ["Interface", "Receive", "Send", "Received total", "Sent total"], "Network interfaces");
    network.append(element("p", "vps-table-note", "Totals are cumulative, not monthly."));
    const probes = disclosure(root, "Probes");
    const monitorRows = table(probes, ["Target", "Now", "1h avg", "1h min–max", "1h loss"], "Network probes");
    const emptyProbes = element("p", "vps-table-note", "No probes.");
    probes.append(emptyProbes);
    root.append(meta);
    return { root, name, state, hardware, values, rx, tx, running, uptimeValue, updated, fields,
      networkTime, interfaces, interfaceViews: new Map(), monitorRows, monitorViews: new Map(), emptyProbes };
  }

  function updateNode(view, node) {
    const status = nodeStatus(node);
    view.root.dataset.state = status;
    view.root.toggleAttribute("data-stale", stale(node.updatedAt));
    write(view.name, text(node.name));
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
    timeLabel(view.networkTime, node.network?.sampledAt, stale(node.network?.sampledAt) ? "Older network sample: " : "Network sample: ");
    const interfaces = node.network?.interfaces && typeof node.network.interfaces === "object" ? Object.entries(node.network.interfaces) : [];
    syncItems(view.interfaces, view.interfaceViews, interfaces, item => item[0], () => tableRow(5), (row, [name, data]) => {
      [name, rate(data?.rxBytesPerSecond), rate(data?.txBytesPerSecond), bytes(data?.rxBytesTotal), bytes(data?.txBytesTotal)]
        .forEach((value, index) => write(row.cells[index], value));
    });
    const monitors = Array.isArray(node.monitors) ? node.monitors.filter(item => item && typeof item.id === "string") : [];
    view.emptyProbes.hidden = monitors.length !== 0;
    syncItems(view.monitorRows, view.monitorViews, monitors, item => item.id, () => {
      const row = tableRow(5);
      row.target = element("span");
      row.info = element("small", "vps-probe-info");
      row.sample = element("time", "vps-probe-info");
      row.cells[0].append(row.target, row.info, row.sample);
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
      this.nodeViews ||= new Map();
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
          const byName = nameOrder.compare(text(a.name), text(b.name)) || nameOrder.compare(a.id, b.id);
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
      for (const node of nodes) {
        const shown = this.filterKey === "all" || nodeStatus(node) === this.filterKey;
        this.nodeViews.get(node.id).root.hidden = !shown;
        if (shown) visible++;
      }
      const empty = this.querySelector("[data-vps-empty]");
      if (empty) empty.hidden = !nodes.length || visible !== 0;
      write(this.updated, `Snapshot ${dateFormat.format(new Date(data.generatedAt))}`);
    }
  }
  customElements.define(tagName, VpsPage);
})();
