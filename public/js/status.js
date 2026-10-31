(() => {
  const tagName = "status-page";
  if (customElements.get(tagName)) return;

  const checkedAtFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const percentFormatter = new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2,
  });
  const latencyFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  const nameOrder = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const sortChoices = [["default", "Default"], ["name-asc", "Name A–Z"], ["name-desc", "Name Z–A"],
    ["uptime", "24h uptime ↓"], ["latency", "Latency ↑"]];
  const filterChoices = [["all", "All"], ["up", "Operational"], ["down", "Down"],
    ["pending", "Pending"], ["maintenance", "Maintenance"], ["unknown", "Unknown"]];

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const stateInfo = status => {
    if (status == null || status === "") return { className: "unknown", label: "Unknown" };
    switch (Number(status)) {
      case 1: return { className: "up", label: "Operational" };
      case 0: return { className: "down", label: "Down" };
      case 2: return { className: "pending", label: "Pending" };
      case 3: return { className: "maintenance", label: "Maintenance" };
      default: return { className: "unknown", label: "Unknown" };
    }
  };

  const formatCheckedAt = value => {
    if (typeof value !== "string") return "";
    const date = new Date(value.replace(" ", "T"));
    return Number.isFinite(date.getTime()) ? checkedAtFormatter.format(date) : value;
  };

  const formatUptime = value => {
    const uptime = Number(value);
    return Number.isFinite(uptime) ? percentFormatter.format(Math.max(0, Math.min(1, uptime))) : "—";
  };

  const formatLatency = value => {
    const latency = Number(value);
    return value != null && Number.isFinite(latency) ? `${latencyFormatter.format(latency)} ms` : "Unavailable";
  };

  class StatusPage extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.heading = this.closest("section")?.querySelector(":scope > h1");
      this.overview = this.querySelector("[data-status-overview]");
      this.notices = this.querySelector("[data-status-notices]");
      this.groups = this.querySelector("[data-status-groups]");
      this.updated = this.querySelector("[data-status-updated]");
      this.message = this.querySelector("[data-status-message]");
      this.retry = this.querySelector("[data-status-retry]");
      this.empty = this.querySelector("[data-status-empty]");
      if (!this.overview || !this.notices || !this.groups || !this.message || !this.retry) return;
      this.controller = new AbortController();
      this.sortKey ||= "default";
      this.filterKey ||= "all";
      this.setupChoices("sort", sortChoices);
      this.setupChoices("filter", filterChoices);
      this.retry.addEventListener("click", () => { void this.load(); }, { signal: this.controller.signal });
      void this.load();
    }

    disconnectedCallback() {
      this.requestController?.abort();
      this.controller?.abort();
      this.controller = null;
      this.loading = false;
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    setMessage(message) {
      this.message.textContent = message;
      this.message.hidden = !message;
    }

    setupChoices(kind, choices) {
      const menu = this.querySelector(`[data-status-${kind}-options]`);
      const label = this.querySelector(`[data-status-${kind}-label]`);
      if (!menu || !label) return;
      label.textContent = choices.find(([key]) => key === this[`${kind}Key`])?.[1] || choices[0][1];
      menu.replaceChildren(...choices.map(([key, text]) => {
        const button = element("button", "", text);
        button.type = "button";
        button.dataset.value = key;
        button.setAttribute("aria-pressed", String(key === this[`${kind}Key`]));
        button.addEventListener("click", () => {
          this[`${kind}Key`] = key;
          label.textContent = text;
          for (const option of menu.querySelectorAll("button")) option.setAttribute("aria-pressed", String(option.dataset.value === key));
          if (this.data) this.render(this.data);
        }, { signal: this.controller.signal });
        return button;
      }));
    }

    scheduleRefresh() {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => { void this.load(); }, 60000);
    }

    async load() {
      if (this.loading || !this.controller) return;
      const controller = this.controller;
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      this.requestController = request;
      this.loading = true;
      this.retry.hidden = true;
      if (!this.loaded) this.setMessage("Loading status…");

      try {
        const response = await fetch("/api/uptime/status", { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Status HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || this.controller !== controller) return;
        if (!data || !Array.isArray(data.publicGroupList) || !data.summary || !data.overall) throw new Error("Invalid status response");
        this.data = data;
        this.render(data);
        if (this.updated) {
          const time = element("time", "", checkedAtFormatter.format(new Date()));
          time.dateTime = new Date().toISOString();
          this.updated.replaceChildren(document.createTextNode("Last updated at "), time);
          this.updated.hidden = false;
        }
        this.loaded = true;
        this.setMessage("");
        this.scheduleRefresh();
      } catch {
        if (request.signal.aborted || this.controller !== controller) return;
        this.setMessage(this.loaded ? "Update failed. Showing the last available results." : "Status is unavailable. Please try again.");
        this.retry.hidden = false;
        this.scheduleRefresh();
      } finally {
        controller.signal.removeEventListener("abort", abort);
        if (this.requestController === request) this.requestController = null;
        if (this.controller === controller) {
          this.loading = false;
        }
      }
    }

    render(data) {
      this.renderOverview(data);
      this.renderNotices(data);
      this.groups.replaceChildren();
      const heartbeatList = data.heartbeatList && typeof data.heartbeatList === "object" ? data.heartbeatList : {};
      let visible = 0;
      for (const groupData of data.publicGroupList) {
        const allMonitors = Array.isArray(groupData?.monitorList) ? groupData.monitorList : [];
        const monitors = allMonitors.filter(monitor => this.filterKey === "all" || stateInfo(monitor?.status).className === this.filterKey);
        if (!monitors.length && this.filterKey !== "all") continue;
        if (this.sortKey !== "default") monitors.sort((a, b) => {
          const byName = nameOrder.compare(String(a?.name || ""), String(b?.name || ""));
          if (this.sortKey === "name-asc") return byName;
          if (this.sortKey === "name-desc") return -byName;
          const field = this.sortKey === "uptime" ? "uptime24h" : "ping";
          const left = a?.[field];
          const right = b?.[field];
          const leftValid = typeof left === "number" && Number.isFinite(left) && left >= 0;
          const rightValid = typeof right === "number" && Number.isFinite(right) && right >= 0;
          if (!leftValid) return rightValid ? 1 : byName;
          if (!rightValid) return -1;
          return (this.sortKey === "uptime" ? right - left : left - right) || byName;
        });
        const group = element("section", "status-group");
        const heading = element("h2", "status-group-title", typeof groupData?.name === "string" ? groupData.name : "Services");
        group.append(heading);
        const list = element("div", "status-service-list");
        for (const monitor of monitors) list.append(this.renderMonitor(monitor, heartbeatList[String(monitor?.id)]));
        visible += monitors.length;
        if (list.childElementCount) group.append(list);
        else group.append(element("p", "status-empty", "No services to display."));
        this.groups.append(group);
      }
      if (this.empty) this.empty.hidden = this.filterKey === "all" || visible > 0;
    }

    renderOverview(data) {
      const label = typeof data.overall?.label === "string" ? data.overall.label.trim() : "";
      const summary = data.summary || {};
      if (this.heading) this.heading.textContent = label || "Status unknown";
      this.overview.replaceChildren(element("p", "status-summary", `${summary.up || 0} of ${summary.total || 0} services operational.`));
    }

    renderNotices(data) {
      this.notices.replaceChildren();
      const incidents = Array.isArray(data.incidents) ? data.incidents : [];
      const maintenance = Array.isArray(data.maintenanceList) ? data.maintenanceList : [];
      const notices = [
        ...incidents.map(item => ({ item, className: "incident", label: "Incident" })),
        ...maintenance.map(item => ({ item, className: "maintenance", label: "Maintenance" })),
      ];
      this.notices.hidden = notices.length === 0;
      for (const notice of notices) {
        const item = notice.item || {};
        const article = element("article", `status-notice is-${notice.className}`);
        article.append(element("strong", "status-notice-kind", notice.label));
        article.append(element("span", "status-notice-title", String(item.title || item.name || item.message || "Status update")));
        const description = item.description || item.message;
        if (description && description !== item.title && description !== item.name) article.append(element("p", "status-notice-description", String(description)));
        this.notices.append(article);
      }
    }

    renderMonitor(monitor, history) {
      const info = stateInfo(monitor?.status);
      const row = element("article", `status-service is-${info.className}`);
      const heading = element("div", "status-service-heading");
      heading.append(element("span", "status-service-name", String(monitor?.name || "Unnamed service")));
      heading.append(element("span", "status-service-state", info.label));
      row.append(heading);

      const checks = Array.isArray(history) ? history.slice(-30) : [];
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
  }

  customElements.define(tagName, StatusPage);
})();
