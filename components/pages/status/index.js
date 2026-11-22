import { bindDropdownChoices, el as element } from "../../ui/dom.js";
import { checkedAtFormatter, renderIncident, renderMonitor, stateInfo } from "./render.js";

(() => {
  const tagName = "status-page";
  if (customElements.get(tagName)) return;

  const nameOrder = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const sortChoices = [["default", "Default"], ["name-asc", "Name A–Z"], ["name-desc", "Name Z–A"],
    ["uptime", "24h uptime ↓"], ["latency", "Latency ↑"]];
  const filterChoices = [["all", "All"], ["up", "Operational"], ["down", "Down"],
    ["pending", "Pending"], ["maintenance", "Maintenance"], ["unknown", "Unknown"]];

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
      this.currentIncidents = this.querySelector("[data-status-current]");
      this.history = this.querySelector("[data-status-history]");
      this.historyMessage = this.querySelector("[data-status-history-message]");
      this.historyPagination = this.querySelector("[data-status-history-pagination]");
      this.historyPrev = this.querySelector("[data-status-history-prev]");
      this.historyNext = this.querySelector("[data-status-history-next]");
      this.historyPage = this.querySelector("[data-status-history-page]");
      this.historyRetry = this.querySelector("[data-status-history-retry]");
      if (!this.overview || !this.notices || !this.groups || !this.message || !this.retry) return;
      this.controller = new AbortController();
      this.sortKey ||= "default";
      this.filterKey ||= "all";
      this.setupChoices("sort", sortChoices);
      this.setupChoices("filter", filterChoices);
      this.retry.addEventListener("click", () => { void this.load(); }, { signal: this.controller.signal });
      this.historyPrev?.addEventListener("click", () => this.moveIncidentPage(-1), { signal: this.controller.signal });
      this.historyNext?.addEventListener("click", () => this.moveIncidentPage(1), { signal: this.controller.signal });
      this.historyRetry?.addEventListener("click", () => { void this.loadIncidents(this.incidentRetryCursor, this.incidentRetryPage); }, { signal: this.controller.signal });
      void this.load();
    }

    disconnectedCallback() {
      this.requestController?.abort();
      this.incidentRequest?.abort();
      this.controller?.abort();
      this.controller = null;
      this.loading = false;
      this.incidentLoading = false;
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    setMessage(message) {
      this.message.textContent = message;
      this.message.hidden = !message;
    }

    setupChoices(kind, choices) {
      bindDropdownChoices(this, {
        menuSelector: `[data-status-${kind}-options]`,
        labelSelector: `[data-status-${kind}-label]`,
        choices,
        value: this[`${kind}Key`],
        signal: this.controller.signal,
        onChange: key => {
          this[`${kind}Key`] = key;
          if (this.data) this.render(this.data);
        },
      });
    }

    scheduleRefresh() {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(() => { void this.load(); }, 60000);
    }

    async load() {
      if (this.loading || !this.controller) return;
      void this.loadIncidents();
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
        if (this.controller === controller) this.loading = false;
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
        group.append(element("h2", "ui-rule-heading status-group-title", typeof groupData?.name === "string" ? groupData.name : "Services"));
        const list = element("div", "status-service-list");
        for (const monitor of monitors) list.append(renderMonitor(monitor, heartbeatList[String(monitor?.id)]));
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
      const maintenance = Array.isArray(data.maintenanceList) ? data.maintenanceList : [];
      const notices = maintenance.map(item => ({ item, className: "maintenance", label: "Maintenance" }));
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

    moveIncidentPage(direction) {
      if (this.incidentLoading) return;
      const index = (this.incidentPageIndex || 0) + direction;
      if (index < 0) return;
      if (this.incidentPages?.[index]) {
        this.incidentPageIndex = index;
        this.historyRetry.hidden = true;
        this.renderIncidents();
      } else {
        const page = this.incidentPages?.[this.incidentPageIndex || 0];
        if (direction === 1 && page?.hasMore) void this.loadIncidents(page.nextCursor, index);
      }
    }

    async loadIncidents(cursor = null, pageIndex = null) {
      if (!this.controller || !this.currentIncidents || !this.history || !this.historyMessage || !this.historyPagination || !this.historyPrev || !this.historyNext || !this.historyPage || !this.historyRetry || this.incidentLoading) return;
      const controller = this.controller;
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      this.incidentRequest = request;
      this.incidentLoading = true;
      this.historyPrev.disabled = true;
      this.historyNext.disabled = true;
      this.historyRetry.disabled = true;
      if (!this.incidentLoaded || pageIndex !== null) this.historyMessage.textContent = "Loading incidents…";
      try {
        const query = cursor === null ? "" : `?${new URLSearchParams({ cursor })}`;
        const response = await fetch(`/api/uptime/incident${query}`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Incidents HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || this.controller !== controller) return;
        if (!data || !Array.isArray(data.current) || !Array.isArray(data.history) || typeof data.hasMore !== "boolean" ||
          (data.hasMore && (typeof data.nextCursor !== "string" || !data.nextCursor || data.nextCursor === cursor))) throw new Error("Invalid incident response");
        this.incidentCurrent = data.current;
        this.incidentPages ||= [];
        if (!this.incidentLoaded || pageIndex !== null) {
          const index = pageIndex ?? 0;
          this.incidentPages[index] = { history: data.history, hasMore: data.hasMore, nextCursor: data.nextCursor };
          this.incidentPageIndex = index;
        } else if (this.incidentPages.length === 1) {
          this.incidentPages[0] = { history: data.history, hasMore: data.hasMore, nextCursor: data.nextCursor };
        }
        this.incidentLoaded = true;
        this.historyRetry.hidden = true;
        this.renderIncidents();
      } catch {
        if (request.signal.aborted || this.controller !== controller) return;
        this.incidentRetryCursor = cursor;
        this.incidentRetryPage = pageIndex;
        this.historyMessage.textContent = this.incidentLoaded ? "Could not update incidents. Showing available results." : "Incidents unavailable.";
        this.historyRetry.hidden = false;
      } finally {
        controller.signal.removeEventListener("abort", abort);
        if (this.incidentRequest === request) this.incidentRequest = null;
        if (this.controller === controller) {
          this.incidentLoading = false;
          this.historyRetry.disabled = false;
          const page = this.incidentPages?.[this.incidentPageIndex || 0];
          this.historyPrev.disabled = !this.incidentPageIndex;
          this.historyNext.disabled = !page?.hasMore;
        }
      }
    }

    renderIncidents() {
      const current = this.incidentCurrent.filter(item => item && item.id != null);
      const currentIds = new Set(current.map(item => String(item.id)));
      this.currentIncidents.hidden = !current.length;
      this.currentIncidents.replaceChildren();
      if (current.length) {
        this.currentIncidents.append(element("h2", "ui-rule-heading status-incident-heading", "Current incidents"));
        for (const item of current) this.currentIncidents.append(renderIncident(item));
      }
      const index = this.incidentPageIndex || 0;
      const page = this.incidentPages[index];
      const seen = new Set(currentIds);
      const history = page.history.filter(item => {
        if (item?.id == null || seen.has(String(item.id))) return false;
        seen.add(String(item.id));
        return true;
      });
      this.history.replaceChildren(...history.map(item => renderIncident(item)));
      this.historyMessage.textContent = history.length ? "" : index || page.hasMore ? "No other incidents on this page." : "No past incidents.";
      this.historyPagination.hidden = index === 0 && !page.hasMore;
      this.historyPage.textContent = `Page ${index + 1}`;
      this.historyPrev.disabled = index === 0;
      this.historyNext.disabled = !page.hasMore;
    }
  }

  customElements.define(tagName, StatusPage);
})();
