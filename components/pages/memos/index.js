import "../../content/image-viewer.js";
import "../../content/code-block.js";
import { notifyError } from "../../ui/toast.js";
import { renderMemo } from "./markdown.js";
import {
  fitTagList,
  formatCalendarDate,
  formatCalendarMonth,
  getMonthForNow,
  getTimeZone,
  monthOf,
  renderCalendarGrid,
  renderTagItems,
  renderWeekdays,
  shiftMonth,
  validDate,
  validMonth,
} from "./calendar.js";

(() => {
  const tagName = "memos-feed";
  if (customElements.get(tagName)) return;

  class MemosFeed extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.list = this.querySelector("[data-memos-list]");
      this.status = this.querySelector("[data-memos-status]");
      this.button = this.querySelector("[data-memos-retry]");
      this.sentinel = this.querySelector("[data-memos-sentinel]");
      const calendarRoot = this.closest?.("section") || this;
      this.calendar = calendarRoot.querySelector("[data-memos-calendar]");
      this.calendarMonthLabel = calendarRoot.querySelector("[data-calendar-month]");
      this.calendarPrevious = calendarRoot.querySelector("[data-calendar-prev]");
      this.calendarNext = calendarRoot.querySelector("[data-calendar-next]");
      this.calendarWeekdays = calendarRoot.querySelector("[data-calendar-weekdays]");
      this.calendarGrid = calendarRoot.querySelector("[data-calendar-grid]");
      this.tagsRoot = calendarRoot.querySelector("[data-memos-tags]");
      this.tagsList = calendarRoot.querySelector("[data-memos-tags-list]");
      this.tagsOpen = calendarRoot.querySelector("[data-memos-tags-open]");
      this.tagsDialog = calendarRoot.querySelector("[data-memos-tags-dialog]");
      this.tagsAll = calendarRoot.querySelector("[data-memos-tags-all]");
      this.tagsMessage = calendarRoot.querySelector("[data-memos-tags-message]");
      this.tagsRetry = calendarRoot.querySelector("[data-memos-tags-retry]");
      this.dateFilter = this.querySelector("[data-memos-date-filter]");
      this.filterDate = this.querySelector("[data-memos-filter-date]");
      this.filterClear = this.querySelector("[data-memos-filter-clear]");
      if (!this.list || !this.status || !this.button || !this.sentinel) return;

      this.controller = new AbortController();
      const { signal } = this.controller;
      this.seen ||= new Set();
      this.nextPageToken ||= "";
      this.timeZone ||= getTimeZone();
      this.calendarMonth ||= getMonthForNow(this.timeZone);
      this.calendarCache ||= new Map();
      this.feedGeneration ||= 0;

      this.button.addEventListener("click", () => this.load(), { signal });
      this.calendarPrevious?.addEventListener("click", () => this.moveCalendar(-1), { signal });
      this.calendarNext?.addEventListener("click", () => this.moveCalendar(1), { signal });
      this.tagsRetry?.addEventListener("click", () => { void this.loadTags(); }, { signal });
      this.tagsOpen?.addEventListener("click", () => {
        if (!this.tagsDialog || typeof this.tagsDialog.showModal !== "function" || this.tagsDialog.open) return;
        this.tagsDialog.showModal();
        this.scheduleTagFit();
      }, { signal });
      this.filterClear?.addEventListener("click", () => this.clearDateFilter(), { signal });

      if (this.tagsList && typeof ResizeObserver === "function") {
        const widths = new WeakMap();
        this.tagsResizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            if (width && width !== widths.get(entry.target)) {
              widths.set(entry.target, width);
              this.scheduleTagFit();
            }
          }
        });
        this.tagsResizeObserver.observe(this.tagsList);
        if (this.tagsAll) this.tagsResizeObserver.observe(this.tagsAll);
      } else if (this.tagsList) {
        window.addEventListener("resize", () => this.scheduleTagFit(), { signal });
      }
      document.fonts?.ready.then(() => this.scheduleTagFit());
      this.setupCalendarMedia();

      const controller = this.controller;
      if (typeof IntersectionObserver === "function") {
        this.observer = new IntersectionObserver(entries => {
          if (this.controller === controller && !this.loading && !this.failed && this.nextPageToken
            && entries.some(entry => entry.isIntersecting)) void this.load();
        }, { rootMargin: "600px 0px" });
      } else {
        this.checkScroll = () => {
          if (this.paginationFrame != null) return;
          this.paginationFrame = requestAnimationFrame(() => {
            this.paginationFrame = null;
            if (this.controller !== controller || this.sentinel.hidden || this.loading || this.failed) return;
            if (this.sentinel.getBoundingClientRect().top <= window.innerHeight + 600) void this.load();
          });
        };
        window.addEventListener("scroll", this.checkScroll, { passive: true, signal });
        window.addEventListener("resize", this.checkScroll, { signal });
      }

      if (!this.loaded) void this.load();
      else this.observeNextPage();
    }

    disconnectedCallback() {
      this.disableCalendar();
      if (this.calendarMedia && this.handleCalendarMedia) {
        if (this.calendarMedia.removeEventListener) this.calendarMedia.removeEventListener("change", this.handleCalendarMedia);
        else this.calendarMedia.removeListener?.(this.handleCalendarMedia);
      }
      this.calendarMedia = null;
      this.handleCalendarMedia = null;
      this.tagsResizeObserver?.disconnect();
      this.tagsResizeObserver = null;
      if (this.tagsFitFrame != null) cancelAnimationFrame(this.tagsFitFrame);
      this.tagsFitFrame = null;
      this.requestController?.abort();
      this.controller?.abort();
      this.controller = null;
      this.loading = false;
      this.observer?.disconnect();
      this.observer = null;
      if (this.paginationFrame != null) cancelAnimationFrame(this.paginationFrame);
      this.paginationFrame = null;
      this.checkScroll = null;
      if (this.button) this.button.disabled = false;
      this.list?.setAttribute("aria-busy", "false");
    }

    setupCalendarMedia() {
      if (!this.calendar || typeof window === "undefined" || typeof window.matchMedia !== "function") {
        if (this.calendar) this.enableCalendar();
        return;
      }
      this.calendarMedia = window.matchMedia("(min-width: 761px)");
      this.handleCalendarMedia = event => (event.matches ? this.enableCalendar() : this.disableCalendar());
      if (this.calendarMedia.addEventListener) this.calendarMedia.addEventListener("change", this.handleCalendarMedia);
      else this.calendarMedia.addListener?.(this.handleCalendarMedia);
      if (this.calendarMedia.matches) this.enableCalendar();
      else this.disableCalendar();
    }

    enableCalendar() {
      if (!this.calendar) return;
      this.calendarEnabled = true;
      this.calendar.hidden = false;
      if (this.tagsRoot) {
        this.tagsRoot.hidden = false;
        if (!this.tagsLoaded && !this.tagsLoading) void this.loadTags();
        else if (this.tagsLoaded) this.scheduleTagFit();
      }
      renderWeekdays(this.calendarWeekdays);
      this.renderCalendar();
      if (this.calendarCache?.has(this.calendarMonth)) {
        const cached = this.calendarCache.get(this.calendarMonth);
        this.calendarDays = cached.days;
        this.calendarRange = cached.range;
        this.calendarError = false;
        this.renderCalendar();
      } else if (!this.calendarLoading) {
        void this.loadCalendar(this.calendarMonth);
      }
    }

    disableCalendar() {
      this.calendarEnabled = false;
      this.calendarRequestId = (this.calendarRequestId || 0) + 1;
      this.calendarLoading = false;
      this.calendarRequestController?.abort();
      this.tagsRequestController?.abort();
      this.tagsRequestController = null;
      this.tagsLoading = false;
      if (this.tagsDialog?.open) this.tagsDialog.close();
      this.calendarRequestController = null;
      if (this.calendar) this.calendar.hidden = true;
    }

    async loadTags() {
      if (!this.calendarEnabled || !this.tagsRoot || !this.tagsList || !this.tagsOpen || !this.tagsAll || !this.tagsMessage || !this.tagsRetry || this.tagsLoading) return;
      const request = new AbortController();
      this.tagsRequestController = request;
      this.tagsLoading = true;
      this.tagsMessage.textContent = "Loading tags…";
      this.tagsRetry.hidden = true;
      try {
        const response = await fetch("/api/memos/tags", { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Tags HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || this.tagsRequestController !== request) return;
        if (!Array.isArray(data?.tags)) throw new Error("Invalid tags response");
        const { count, topNodes, allNodes } = renderTagItems(data.tags);
        this.tagsList.replaceChildren(...topNodes);
        this.tagsAll.replaceChildren(...allNodes);
        this.tagsOpen.hidden = !count;
        this.tagsMessage.textContent = count ? "" : "No tags.";
        this.tagsLoaded = true;
        this.scheduleTagFit();
      } catch (error) {
        if (request.signal.aborted || this.tagsRequestController !== request) return;
        this.tagsMessage.textContent = "Tags unavailable.";
        this.tagsRetry.hidden = false;
        notifyError("Failed to load tags.", error);
      } finally {
        if (this.tagsRequestController === request) {
          this.tagsRequestController = null;
          this.tagsLoading = false;
        }
      }
    }

    scheduleTagFit() {
      if (!this.controller || !this.calendarEnabled || !this.tagsList || this.tagsFitFrame != null) return;
      this.tagsFitFrame = requestAnimationFrame(() => {
        this.tagsFitFrame = null;
        if (!this.controller || !this.calendarEnabled) return;
        fitTagList(this.tagsList, false);
        if (this.tagsDialog?.open) fitTagList(this.tagsAll, true);
      });
    }

    calendarMonthInRange(month) {
      if (!this.calendarRange) return false;
      const first = this.calendarRange?.firstDate ? monthOf(this.calendarRange.firstDate) : null;
      const last = this.calendarRange?.lastDate ? monthOf(this.calendarRange.lastDate) : null;
      if (!first && !last) return false;
      return (!first || month >= first) && (!last || month <= last);
    }

    moveCalendar(amount) {
      const next = shiftMonth(this.calendarMonth, amount);
      if (!this.calendarMonthInRange(next)) return;
      this.calendarMonth = next;
      if (this.selectedDate) {
        this.selectedDate = null;
        this.resetFeed();
        void this.load();
      }
      void this.loadCalendar(next);
    }

    async loadCalendar(month) {
      if (!this.calendar || !this.calendarEnabled || !validMonth(month)) return;
      this.calendarRequestController?.abort();
      this.calendarMonth = month;
      const cached = this.calendarCache?.get(month);
      if (cached) {
        this.calendarRequestId = (this.calendarRequestId || 0) + 1;
        this.calendarLoading = false;
        this.calendarDays = cached.days;
        this.calendarRange = cached.range;
        this.calendarError = false;
        this.renderCalendar();
        return;
      }
      const request = new AbortController();
      const requestId = (this.calendarRequestId || 0) + 1;
      this.calendarRequestId = requestId;
      this.calendarRequestController = request;
      this.calendarLoading = true;
      this.calendarError = false;
      this.calendarDays = {};
      this.renderCalendar();
      try {
        const query = new URLSearchParams({ month, timeZone: this.timeZone });
        const response = await fetch(`/api/memos/calendar?${query}`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || requestId !== this.calendarRequestId) return;
        if (!data || data.month !== month || !data.days || typeof data.days !== "object") throw new Error("Invalid calendar response");
        const days = {};
        for (const [date, count] of Object.entries(data.days)) {
          if (date.startsWith(`${month}-`) && validDate(date) && Number.isFinite(Number(count)) && Number(count) > 0) {
            days[date] = Number(count);
          }
        }
        const range = {
          firstDate: validDate(data.firstDate) ? data.firstDate : null,
          lastDate: validDate(data.lastDate) ? data.lastDate : null,
        };
        this.calendarDays = days;
        this.calendarRange = range;
        this.calendarCache.set(month, { days, range });
        this.calendarError = false;
        this.renderCalendar();
      } catch (error) {
        if (request.signal.aborted || requestId !== this.calendarRequestId) return;
        this.calendarError = true;
        this.calendarDays = {};
        this.renderCalendar();
        notifyError("Failed to load calendar.", error);
      } finally {
        if (this.calendarRequestController === request) this.calendarRequestController = null;
        if (requestId === this.calendarRequestId) {
          this.calendarLoading = false;
          this.renderCalendar();
        }
      }
    }

    renderCalendar() {
      if (this.dateFilter && this.filterDate) {
        this.dateFilter.hidden = !this.selectedDate;
        this.filterDate.textContent = this.selectedDate ? formatCalendarDate(this.selectedDate) : "";
        this.filterDate.dateTime = this.selectedDate || "";
      }
      if (!this.calendarGrid || !validMonth(this.calendarMonth) || !this.calendarMonthLabel) return;
      this.calendarMonthLabel.textContent = formatCalendarMonth(this.calendarMonth);
      if (this.calendarPrevious) {
        this.calendarPrevious.disabled = this.calendarLoading || !this.calendarMonthInRange(shiftMonth(this.calendarMonth, -1));
      }
      if (this.calendarNext) {
        this.calendarNext.disabled = this.calendarLoading || !this.calendarMonthInRange(shiftMonth(this.calendarMonth, 1));
      }
      renderCalendarGrid(this.calendarGrid, {
        month: this.calendarMonth,
        days: this.calendarDays,
        selectedDate: this.selectedDate,
        signal: this.controller?.signal,
        onSelectDate: date => this.selectDate(date),
      });
    }

    selectDate(date) {
      if (!validDate(date) || this.selectedDate === date) return;
      this.selectedDate = date;
      this.renderCalendar();
      this.resetFeed();
      void this.load();
    }

    clearDateFilter() {
      if (!this.selectedDate) return;
      this.selectedDate = null;
      this.renderCalendar();
      this.resetFeed();
      void this.load();
    }

    resetFeed() {
      this.requestController?.abort();
      this.requestController = null;
      this.feedGeneration += 1;
      this.loading = false;
      this.loaded = false;
      this.failed = false;
      this.seen = new Set();
      this.nextPageToken = "";
      this.observer?.disconnect();
      if (this.list.replaceChildren) this.list.replaceChildren();
      else this.list.textContent = "";
      this.button.hidden = true;
      this.button.disabled = false;
      this.button.textContent = "重试";
      this.sentinel.hidden = true;
    }

    setStatus(message) {
      this.status.textContent = message;
      this.status.hidden = !message;
    }

    observeNextPage() {
      this.observer?.disconnect();
      if (!this.sentinel) return;
      this.sentinel.hidden = !this.controller || !this.loaded || !this.nextPageToken || this.failed || this.loading;
      if (this.sentinel.hidden) return;
      if (this.observer) this.observer.observe(this.sentinel);
      else this.checkScroll?.();
    }

    async load() {
      if (this.loading || !this.controller) return;
      const controller = this.controller;
      const generation = this.feedGeneration;
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(abort, 12000);
      const token = this.nextPageToken || "";
      const retryFocused = document.activeElement === this.button;
      this.loading = true;
      this.failed = false;
      this.observer?.disconnect();
      this.requestController = request;
      this.button.disabled = true;
      this.button.hidden = true;
      this.list.setAttribute("aria-busy", "true");
      this.setStatus(this.loaded ? "Loading more..." : "Loading Memos...");
      try {
        const query = new URLSearchParams();
        if (this.selectedDate) {
          query.set("date", this.selectedDate);
          query.set("timeZone", this.timeZone);
        }
        if (token) query.set("token", token);
        const response = await fetch(`/api/memos${query.toString() ? `?${query}` : ""}`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Memos HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data?.memos)) throw new Error("Invalid memos response");
        if (controller.signal.aborted || request.signal.aborted || generation !== this.feedGeneration) return;
        const entries = [];
        for (const memo of data.memos) {
          if (!memo || typeof memo.name !== "string" || !/^memos\/[A-Za-z0-9_-]+$/.test(memo.name) || this.seen.has(memo.name)) continue;
          entries.push({ name: memo.name, node: renderMemo(memo) });
        }
        const next = typeof data.nextPageToken === "string" ? data.nextPageToken : "";
        if (token && next && (next === token || entries.length === 0)) throw new Error("Pagination did not advance");
        for (const entry of entries) {
          if (this.seen.has(entry.name)) continue;
          this.list.append(entry.node);
          this.seen.add(entry.name);
        }
        this.nextPageToken = next;
        this.loaded = true;
        this.setStatus(this.seen.size ? "" : "Nothing here");
        if (retryFocused) entries[0]?.node.querySelector(".memo-meta a")?.focus({ preventScroll: true });
      } catch (error) {
        if (controller.signal.aborted || request.signal.aborted || generation !== this.feedGeneration) return;
        this.failed = true;
        this.setStatus(this.loaded ? "Not loaded" : "Load failed");
        this.button.hidden = false;
        this.button.textContent = "重试";
        notifyError(this.loaded ? "Failed to load more memos." : "Failed to load memos.", error);
      } finally {
        clearTimeout(timeout);
        controller.signal.removeEventListener("abort", abort);
        if (this.requestController === request) this.requestController = null;
        if (this.controller === controller && generation === this.feedGeneration) {
          this.loading = false;
          this.list.setAttribute("aria-busy", "false");
          this.button.disabled = false;
          this.observeNextPage();
        }
      }
    }
  }

  customElements.define(tagName, MemosFeed);
})();
