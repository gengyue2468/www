import { MarqueeController, createMarquee } from "../../ui/marquee.js";
import { bindDropdownChoices } from "../../ui/dom.js";
import { notifyError } from "../../ui/toast.js";
import {
  bytes,
  cpuAggregate,
  formatSnapshotDate,
  filterChoices,
  finite,
  flagCode,
  fleetValue,
  highestUsage,
  interfaceTotal,
  nameOrder,
  nameSortKey,
  nodeStatus,
  number,
  rate,
  sortChoices,
  stale,
  states,
  timestamp,
  write,
  writeName,
} from "./format.js";
import { applyMapTransform, createMap, mapPoint, resetMapTransform, updateMap, zoomMap } from "./map.js";
import { createNode, syncItems, updateNode } from "./node-view.js";

(() => {
  const tagName = "vps-page";
  if (customElements.get(tagName)) return;
  const API = "/api/beszel";

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
      this.fleet = this.querySelector("[data-vps-fleet]");
      if (this.fleet) {
        if (!this.fleetMarquee) {
          for (const value of this.fleet.querySelectorAll("dd")) {
            const content = createMarquee();
            content.source.textContent = value.textContent;
            value.replaceChildren(content.root);
          }
          this.fleetMarquee = new MarqueeController(this.fleet, this.fleet, { preserveUpdates: true });
        }
        this.fleetMarquee.connect();
      }
      if (mapRoot) {
        this.map ||= createMap(mapRoot);
        this.setupMapDialog(mapRoot);
        const mobile = window.matchMedia("(max-width: 760px)");
        const placeMap = () => {
          if (mobile.matches) {
            this.querySelector(".vps-overview")?.after(mapRoot);
            if (this.fleet) mapRoot.after(this.fleet);
          } else {
            this.querySelector(".vps-sidebar")?.append(mapRoot);
            if (this.fleet) this.querySelector(".vps-sidebar")?.append(this.fleet);
          }
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

    setupMapDialog(mapRoot) {
      if (this.mapDialog || !this.map) return;
      const dialog = this.querySelector("[data-vps-map-dialog]");
      const content = dialog?.querySelector("[data-vps-map-dialog-content]");
      const close = dialog?.querySelector("[data-dialog-close]");
      const zoomIn = dialog?.querySelector("[data-vps-map-zoom-in]");
      const zoomOut = dialog?.querySelector("[data-vps-map-zoom-out]");
      const zoomReset = dialog?.querySelector("[data-vps-map-zoom-reset]");
      if (!dialog || !content || !close || !zoomIn || !zoomOut || !zoomReset) return;
      this.mapDialog = dialog;
      const map = this.map;
      const { signal } = this.controller;
      const open = () => {
        if (dialog.open) return;
        this.mapRestore = { parent: mapRoot.parentNode, next: mapRoot.nextSibling };
        content.append(mapRoot);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        close.focus({ preventScroll: true });
      };
      const restore = () => {
        const target = this.mapRestore;
        if (target?.parent?.isConnected) target.parent.insertBefore(mapRoot, target.next?.parentNode === target.parent ? target.next : null);
        else this.querySelector(".vps-sidebar")?.append(mapRoot);
        this.mapRestore = null;
        resetMapTransform(map);
        mapRoot.focus({ preventScroll: true });
      };
      const zoom = factor => zoomMap(map, factor);
      mapRoot.addEventListener("click", open, { signal });
      mapRoot.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open();
      }, { signal });
      zoomIn.addEventListener("click", () => zoom(1.5), { signal });
      zoomOut.addEventListener("click", () => zoom(1 / 1.5), { signal });
      zoomReset.addEventListener("click", () => resetMapTransform(map), { signal });
      map.svg.addEventListener("wheel", event => {
        if (!dialog.open) return;
        event.preventDefault();
        zoomMap(map, Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
      }, { signal, passive: false });
      map.svg.addEventListener("pointerdown", event => {
        if (!dialog.open || event.button !== 0) return;
        const point = mapPoint(map.svg, event.clientX, event.clientY);
        if (!point) return;
        map.drag = { pointerId: event.pointerId, x: point.x, y: point.y, offsetX: map.offsetX, offsetY: map.offsetY };
        map.svg.setPointerCapture(event.pointerId);
        map.root.dataset.dragging = "";
      }, { signal });
      map.svg.addEventListener("pointermove", event => {
        if (map.drag?.pointerId !== event.pointerId) return;
        const point = mapPoint(map.svg, event.clientX, event.clientY);
        if (!point) return;
        map.offsetX = map.drag.offsetX + point.x - map.drag.x;
        map.offsetY = map.drag.offsetY + point.y - map.drag.y;
        applyMapTransform(map);
      }, { signal });
      const endDrag = event => {
        if (map.drag?.pointerId !== event.pointerId) return;
        map.drag = null;
        delete map.root.dataset.dragging;
        if (map.svg.hasPointerCapture(event.pointerId)) map.svg.releasePointerCapture(event.pointerId);
      };
      map.svg.addEventListener("pointerup", endDrag, { signal });
      map.svg.addEventListener("pointercancel", endDrag, { signal });
      dialog.addEventListener("keydown", event => {
        if (!dialog.open) return;
        if (event.key === "+" || event.key === "=") { event.preventDefault(); zoom(1.5); }
        else if (event.key === "-" || event.key === "_") { event.preventDefault(); zoom(1 / 1.5); }
        else if (event.key === "0") { event.preventDefault(); resetMapTransform(map); }
      }, { signal });
      dialog.addEventListener("site-dialog:close", restore, { signal });
      dialog.addEventListener("close", restore, { signal });
    }

    disconnectedCallback() {
      for (const view of this.nodeViews?.values() || []) view.marquee.disconnect();
      this.fleetMarquee?.disconnect();
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
      const isSort = kind === "sort";
      bindDropdownChoices(this, {
        menuSelector: `[data-vps-${kind}-options]`,
        labelSelector: `[data-vps-${kind}-label]`,
        choices,
        value: isSort ? this.sortKey : this.filterKey,
        signal: this.controller.signal,
        onChange: key => {
          if (isSort) this.sortKey = key;
          else this.filterKey = key;
          if (this.snapshot) this.applySnapshot(this.snapshot);
        },
      });
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
        } catch (error) {
          this.setConnection("Invalid snapshot. Keeping previous data.", true);
          notifyError("Invalid server snapshot.", error);
        }
      });
      source.addEventListener("unavailable", event => {
        if (this.streamSource === source) {
          this.setConnection(this.snapshot ? "Unavailable. Showing last snapshot." : "Data unavailable.", true);
          notifyError("Server data unavailable.", typeof event?.data === "string" ? event.data : undefined);
        }
      });
      source.onerror = () => {
        if (this.streamSource !== source) return;
        this.setConnection(this.snapshot ? "Reconnecting. Showing last snapshot." : "Connection unavailable. Reconnecting…", true);
        notifyError("Live stream disconnected.", `EventSource readyState=${source.readyState}`);
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
      } catch (error) {
        if (this.fallbackController === request && this.isConnected) {
          this.setConnection("Snapshot unavailable.", true);
          notifyError("Failed to load server status.", error);
        }
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
          if (!finite(left)) return finite(right) ? 1 : byName;
          if (!finite(right)) return -1;
          return right - left || byName;
        });
      const up = nodes.filter(node => node.status === "up").length;
      write(this.summary, nodes.length ? `${up} of ${nodes.length} servers up.` : "No servers.");
      if (this.fleet) {
        const recent = node => node.status === "up" && !stale(node.network?.sampledAt);
        const regions = new Set(nodes.map(node => flagCode(node.name)).filter(Boolean));
        const missingFlags = nodes.filter(node => !flagCode(node.name)).length;
        const otherStates = states.filter(state => state !== "up").map(state => [state, nodes.filter(node => nodeStatus(node) === state).length]).filter(([, count]) => count);
        const values = {
          servers: `${up} / ${nodes.length} online`,
          states: otherStates.map(([state, count]) => `${count} ${state}`).join(" · "),
          regions: `${regions.size || "—"}${missingFlags ? ` (${missingFlags} without flags)` : ""}`,
          "high-cpu": highestUsage(nodes, "cpuPercent"),
          "high-memory": highestUsage(nodes, "memoryPercent"),
          "high-disk": highestUsage(nodes, "diskPercent"),
          "cpu-usage": cpuAggregate(nodes, node => node.cpuPercent, true),
          load: [0, 1, 2].map(index => cpuAggregate(nodes, node => node.loadAverage?.[index], false)).join(" / "),
          cores: fleetValue(nodes, [node => node.cores], value => number.format(value)),
          memory: fleetValue(nodes, [node => node.memoryUsedBytes, node => node.memoryTotalBytes], bytes),
          disk: fleetValue(nodes, [node => node.diskUsedBytes, node => node.diskTotalBytes], bytes),
          inbound: fleetValue(nodes, [node => node.network?.rxBytesPerSecond], rate, recent),
          outbound: fleetValue(nodes, [node => node.network?.txBytesPerSecond], rate, recent),
          received: fleetValue(nodes, [node => interfaceTotal(node, "rxBytesTotal")], bytes),
          sent: fleetValue(nodes, [node => interfaceTotal(node, "txBytesTotal")], bytes),
        };
        for (const [key, value] of Object.entries(values)) {
          const target = this.fleet.querySelector(`[data-vps-fleet-${key}]`);
          const source = target?.querySelector("[data-marquee-source]");
          if (source) {
            if (key.startsWith("high-")) writeName(source, value);
            else write(source, value);
          }
        }
        const statesRow = this.fleet.querySelector("[data-vps-fleet-states-row]");
        if (statesRow) statesRow.hidden = otherStates.length === 0;
        this.fleet.hidden = false;
        this.fleetMarquee?.schedule();
      }
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
      write(this.updated, `Snapshot ${formatSnapshotDate(new Date(data.generatedAt))}`);
    }
  }
  customElements.define(tagName, VpsPage);
})();
