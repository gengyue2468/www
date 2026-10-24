import MarkdownIt from "markdown-it";
import "./image-viewer.js";
import "./code-block.js";

(() => {
  const tagName = "memos-feed";
  if (customElements.get(tagName)) return;

  const markdown = new MarkdownIt({ html: false, breaks: true, linkify: true });
  const linkOpen = markdown.renderer.rules.link_open;
  markdown.renderer.rules.link_open = (
    tokens,
    index,
    options,
    env,
    renderer,
  ) => {
    tokens[index].attrSet("target", "_blank");
    tokens[index].attrSet("rel", "noopener noreferrer");
    return linkOpen
      ? linkOpen(tokens, index, options, env, renderer)
      : renderer.renderToken(tokens, index, options);
  };
  // Memo headings belong under the page's single h1.
  for (const type of ["heading_open", "heading_close"]) {
    markdown.renderer.rules[type] = (
      tokens,
      index,
      options,
      _env,
      renderer,
    ) => {
      tokens[index].tag =
        `h${Math.min(6, Number(tokens[index].tag.slice(1)) + 1)}`;
      return renderer.renderToken(tokens, index, options);
    };
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const calendarMonthFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const calendarDateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const calendarWeekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: "UTC",
  });
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      // Keep attachments same-origin so the local preview can proxy them too.
      return url.hostname === "www.gengyue.dev" &&
        url.pathname.startsWith("/api/memos/attachments/")
        ? url.pathname + url.search
        : url.href;
    } catch {
      return null;
    }
  };
  const getTimeZone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  };
  const getMonthForNow = (timeZone) => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
      }).formatToParts(new Date());
      const year = parts.find((part) => part.type === "year")?.value;
      const month = parts.find((part) => part.type === "month")?.value;
      if (year && month) return `${year}-${month}`;
    } catch {
      /* Fall through to the browser's local calendar. */
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const monthDate = (month) => {
    const [year, number] = month.split("-").map(Number);
    return new Date(Date.UTC(year, number - 1, 1));
  };
  const shiftMonth = (month, amount) => {
    const date = monthDate(month);
    date.setUTCMonth(date.getUTCMonth() + amount);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const monthOf = (date) =>
    typeof date === "string" && datePattern.test(date)
      ? date.slice(0, 7)
      : null;
  const validDate = (date) =>
    typeof date === "string" && datePattern.test(date);
  const validMonth = (month) =>
    typeof month === "string" && monthPattern.test(month);

  class MemosFeed extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.list = this.querySelector("[data-memos-list]");
      this.status = this.querySelector("[data-memos-status]");
      this.button = this.querySelector("[data-memos-retry]");
      this.sentinel = this.querySelector("[data-memos-sentinel]");
      const calendarRoot = this.closest?.("section") || this;
      this.calendar = calendarRoot.querySelector("[data-memos-calendar]");
      this.calendarMonthLabel = calendarRoot.querySelector(
        "[data-calendar-month]",
      );
      this.calendarPrevious = calendarRoot.querySelector(
        "[data-calendar-prev]",
      );
      this.calendarNext = calendarRoot.querySelector("[data-calendar-next]");
      this.calendarWeekdays = calendarRoot.querySelector(
        "[data-calendar-weekdays]",
      );
      this.calendarGrid = calendarRoot.querySelector("[data-calendar-grid]");
      this.dateFilter = this.querySelector("[data-memos-date-filter]");
      this.filterDate = this.querySelector("[data-memos-filter-date]");
      this.filterClear = this.querySelector("[data-memos-filter-clear]");
      if (!this.list || !this.status || !this.button || !this.sentinel) return;
      this.controller = new AbortController();
      this.seen ||= new Set();
      this.nextPageToken ||= "";
      this.timeZone ||= getTimeZone();
      this.calendarMonth ||= getMonthForNow(this.timeZone);
      this.calendarCache ||= new Map();
      this.feedGeneration ||= 0;
      this.button.addEventListener("click", () => this.load(), {
        signal: this.controller.signal,
      });
      this.calendarPrevious?.addEventListener(
        "click",
        () => this.moveCalendar(-1),
        { signal: this.controller.signal },
      );
      this.calendarNext?.addEventListener("click", () => this.moveCalendar(1), {
        signal: this.controller.signal,
      });
      this.filterClear?.addEventListener(
        "click",
        () => this.clearDateFilter(),
        { signal: this.controller.signal },
      );
      this.setupCalendarMedia();
      const controller = this.controller;
      if (typeof IntersectionObserver === "function") {
        this.observer = new IntersectionObserver(
          (entries) => {
            if (
              this.controller === controller &&
              !this.loading &&
              !this.failed &&
              this.nextPageToken &&
              entries.some((entry) => entry.isIntersecting)
            )
              void this.load();
          },
          { rootMargin: "600px 0px" },
        );
      } else {
        this.checkScroll = () => {
          if (this.paginationFrame != null) return;
          this.paginationFrame = requestAnimationFrame(() => {
            this.paginationFrame = null;
            if (
              this.controller !== controller ||
              this.sentinel.hidden ||
              this.loading ||
              this.failed
            )
              return;
            if (
              this.sentinel.getBoundingClientRect().top <=
              window.innerHeight + 600
            )
              void this.load();
          });
        };
        window.addEventListener("scroll", this.checkScroll, {
          passive: true,
          signal: controller.signal,
        });
        window.addEventListener("resize", this.checkScroll, {
          signal: controller.signal,
        });
      }
      if (!this.loaded) void this.load();
      else this.observeNextPage();
    }

    disconnectedCallback() {
      this.disableCalendar();
      if (this.calendarMedia && this.handleCalendarMedia) {
        if (this.calendarMedia.removeEventListener)
          this.calendarMedia.removeEventListener(
            "change",
            this.handleCalendarMedia,
          );
        else this.calendarMedia.removeListener?.(this.handleCalendarMedia);
      }
      this.calendarMedia = null;
      this.handleCalendarMedia = null;
      this.requestController?.abort();
      this.controller?.abort();
      this.controller = null;
      this.loading = false;
      this.observer?.disconnect();
      this.observer = null;
      if (this.paginationFrame != null)
        cancelAnimationFrame(this.paginationFrame);
      this.paginationFrame = null;
      this.checkScroll = null;
      if (this.button) {
        this.button.disabled = false;
      }
      this.list?.setAttribute("aria-busy", "false");
    }

    setupCalendarMedia() {
      if (
        !this.calendar ||
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
      ) {
        if (this.calendar) this.enableCalendar();
        return;
      }
      this.calendarMedia = window.matchMedia("(min-width: 761px)");
      this.handleCalendarMedia = (event) =>
        event.matches ? this.enableCalendar() : this.disableCalendar();
      if (this.calendarMedia.addEventListener)
        this.calendarMedia.addEventListener("change", this.handleCalendarMedia);
      else this.calendarMedia.addListener?.(this.handleCalendarMedia);
      if (this.calendarMedia.matches) this.enableCalendar();
      else this.disableCalendar();
    }

    enableCalendar() {
      if (!this.calendar) return;
      this.calendarEnabled = true;
      this.calendar.hidden = false;
      this.renderCalendarWeekdays();
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
      this.calendarRequestController = null;
      if (this.calendar) this.calendar.hidden = true;
    }

    renderCalendarWeekdays() {
      if (!this.calendarWeekdays || this.calendarWeekdays.childElementCount)
        return;
      for (let day = 0; day < 7; day += 1) {
        const weekday = element(
          "span",
          "memos-calendar-weekday",
          calendarWeekdayFormatter.format(new Date(Date.UTC(2021, 7, day + 1))),
        );
        this.calendarWeekdays.append(weekday);
      }
    }

    calendarMonthInRange(month) {
      if (!this.calendarRange) return false;
      const first = this.calendarRange?.firstDate
        ? monthOf(this.calendarRange.firstDate)
        : null;
      const last = this.calendarRange?.lastDate
        ? monthOf(this.calendarRange.lastDate)
        : null;
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
        const response = await fetch(`/api/memos/calendar?${query}`, {
          signal: request.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || requestId !== this.calendarRequestId)
          return;
        if (
          !data ||
          data.month !== month ||
          !data.days ||
          typeof data.days !== "object"
        )
          throw new Error("Invalid calendar response");
        const days = {};
        for (const [date, count] of Object.entries(data.days)) {
          if (
            date.startsWith(`${month}-`) &&
            validDate(date) &&
            Number.isFinite(Number(count)) &&
            Number(count) > 0
          )
            days[date] = Number(count);
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
      } catch {
        if (request.signal.aborted || requestId !== this.calendarRequestId)
          return;
        this.calendarError = true;
        this.calendarDays = {};
        this.renderCalendar();
      } finally {
        if (this.calendarRequestController === request)
          this.calendarRequestController = null;
        if (requestId === this.calendarRequestId) {
          this.calendarLoading = false;
          this.renderCalendar();
        }
      }
    }

    renderCalendar() {
      if (this.dateFilter && this.filterDate) {
        this.dateFilter.hidden = !this.selectedDate;
        this.filterDate.textContent = this.selectedDate
          ? calendarDateFormatter.format(
              new Date(`${this.selectedDate}T00:00:00Z`),
            )
          : "";
        this.filterDate.dateTime = this.selectedDate || "";
      }
      if (
        !this.calendarGrid ||
        !validMonth(this.calendarMonth) ||
        !this.calendarMonthLabel
      )
        return;
      this.calendarMonthLabel.textContent = calendarMonthFormatter.format(
        monthDate(this.calendarMonth),
      );
      if (this.calendarPrevious)
        this.calendarPrevious.disabled =
          this.calendarLoading ||
          !this.calendarMonthInRange(shiftMonth(this.calendarMonth, -1));
      if (this.calendarNext)
        this.calendarNext.disabled =
          this.calendarLoading ||
          !this.calendarMonthInRange(shiftMonth(this.calendarMonth, 1));
      this.calendarGrid.replaceChildren();
      const [year, month] = this.calendarMonth.split("-").map(Number);
      const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const maxCount = Math.max(1, ...Object.values(this.calendarDays || {}));
      // Always fill six weeks, including the adjoining months' muted dates.
      for (let index = 0; index < 42; index += 1) {
        const day = index - leading + 1;
        if (day < 1 || day > daysInMonth) {
          const adjacent = new Date(Date.UTC(year, month - 1, day));
          const outside = element(
            "span",
            "memos-calendar-day is-outside-month",
            String(adjacent.getUTCDate()),
          );
          outside.setAttribute("aria-hidden", "true");
          this.calendarGrid.append(outside);
          continue;
        }
        const date = `${this.calendarMonth}-${String(day).padStart(2, "0")}`;
        const count = this.calendarDays?.[date] || 0;
        const dayNode = element(
          count ? "button" : "span",
          `memos-calendar-day${count ? " has-memos" : ""}${this.selectedDate === date ? " is-selected" : ""}`,
        );
        dayNode.setAttribute("role", "gridcell");
        const number = element(
          "span",
          "memos-calendar-day-number",
          String(day),
        );
        dayNode.append(number);
        if (count) {
          dayNode.type = "button";
          dayNode.setAttribute(
            "aria-pressed",
            String(this.selectedDate === date),
          );
          dayNode.setAttribute(
            "aria-label",
            `${calendarDateFormatter.format(new Date(Date.UTC(year, month - 1, day)))}，${count} memo`,
          );
          dayNode.title = `${count} memo`;
          dayNode.style.setProperty(
            "--memo-day-shade",
            `${8 + (24 * count) / maxCount}%`,
          );
          if (this.controller)
            dayNode.addEventListener("click", () => this.selectDate(date), {
              signal: this.controller.signal,
            });
        } else {
          dayNode.setAttribute("aria-hidden", "true");
        }
        this.calendarGrid.append(dayNode);
      }
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
      this.sentinel.hidden =
        !this.controller ||
        !this.loaded ||
        !this.nextPageToken ||
        this.failed ||
        this.loading;
      if (this.sentinel.hidden) return;
      // Re-observe after each append: short pages still fill the viewport, but
      // a long page moves the sentinel away and stops further requests.
      if (this.observer) this.observer.observe(this.sentinel);
      else this.checkScroll?.();
    }

    renderMarkdown(content) {
      return markdown.render(content);
    }

    image(url, alt = "") {
      const viewer = element("image-viewer");
      const link = element("a", "image-viewer-link");
      link.href = url;
      link.setAttribute(
        "aria-label",
        alt ? `查看大图：${alt}` : "查看附件大图",
      );
      const image = element("img");
      image.src = url;
      image.alt = alt;
      image.loading = "lazy";
      image.decoding = "async";
      link.append(image);
      viewer.append(link);
      return viewer;
    }

    renderMemo(memo) {
      const entry = element("article", "memo-entry");
      entry.id = `memo-${memo.name.slice(6)}`;
      const meta = element("header", "memo-meta");
      const date = new Date(memo.createTime);
      if (Number.isFinite(date.getTime())) {
        const permalink = element("a");
        permalink.href = `#${entry.id}`;
        const time = element("time", "", formatter.format(date));
        time.dateTime = date.toISOString();
        permalink.append(time);
        meta.append(permalink);
      }
      if (memo.pinned === true)
        meta.append(element("span", "memo-pinned", "置顶"));
      if (
        memo.updateTime &&
        memo.updateTime !== memo.createTime &&
        Number.isFinite(Date.parse(memo.updateTime))
      ) {
        const edited = element("time", "memo-edited", "已编辑");
        edited.dateTime = new Date(memo.updateTime).toISOString();
        meta.append(edited);
      }
      entry.append(meta);

      const tags = [
        ...new Set(
          (Array.isArray(memo.tags) ? memo.tags : []).filter(
            (tag) => typeof tag === "string" && tag.trim(),
          ),
        ),
      ];
      let content =
        typeof memo.content === "string" ? memo.content.trimEnd() : "";
      // A trailing tag-only paragraph is represented once in the quiet footer.
      const tail = content.match(/(?:^|\n\s*\n)([^\n]+)$/);
      if (
        tail &&
        tags.length &&
        tail[1]
          .trim()
          .split(/\s+/)
          .every((word) => word.startsWith("#") && tags.includes(word.slice(1)))
      ) {
        content = content.slice(0, tail.index).trimEnd();
      }
      const body = element("div", "memo-content");
      body.innerHTML = this.renderMarkdown(content);
      for (const image of body.querySelectorAll("img")) {
        image.loading = "lazy";
        image.decoding = "async";
        if (image.closest("a")) continue;
        const url = safeUrl(image.getAttribute("src"));
        if (url) image.replaceWith(this.image(url, image.alt));
      }
      for (const pre of body.querySelectorAll("pre")) {
        const block = element("code-block");
        pre.replaceWith(block);
        block.append(pre);
      }
      entry.append(body);

      const images = element("div", "memo-images");
      const files = element("div", "memo-files");
      for (const attachment of Array.isArray(memo.attachments)
        ? memo.attachments
        : []) {
        const url = safeUrl(attachment?.url);
        if (!url) continue;
        const type = typeof attachment.type === "string" ? attachment.type : "";
        if (type.startsWith("image/")) images.append(this.image(url));
        else if (type.startsWith("audio/") || type.startsWith("video/")) {
          const media = element(type.startsWith("audio/") ? "audio" : "video");
          media.controls = true;
          media.preload = "metadata";
          media.playsInline = true;
          media.src = url;
          files.append(media);
        } else {
          const link = element(
            "a",
            "memo-file",
            typeof attachment.filename === "string"
              ? attachment.filename
              : "下载附件",
          );
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          files.append(link);
        }
      }
      if (images.childElementCount) entry.append(images);
      if (files.childElementCount) entry.append(files);
      if (tags.length)
        entry.append(
          element(
            "footer",
            "memo-tags",
            tags.map((tag) => `#${tag}`).join(" "),
          ),
        );
      return entry;
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
        const response = await fetch(
          `/api/memos${query.toString() ? `?${query}` : ""}`,
          {
            signal: request.signal,
            cache: "no-store",
          },
        );
        if (!response.ok) throw new Error(`Memos HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data?.memos))
          throw new Error("Invalid memos response");
        if (
          controller.signal.aborted ||
          request.signal.aborted ||
          generation !== this.feedGeneration
        )
          return;
        const entries = [];
        for (const memo of data.memos) {
          if (
            !memo ||
            typeof memo.name !== "string" ||
            !/^memos\/[A-Za-z0-9_-]+$/.test(memo.name) ||
            this.seen.has(memo.name)
          )
            continue;
          entries.push({ name: memo.name, node: this.renderMemo(memo) });
        }
        const next =
          typeof data.nextPageToken === "string" ? data.nextPageToken : "";
        if (token && next && (next === token || entries.length === 0))
          throw new Error("Pagination did not advance");
        for (const entry of entries) {
          if (this.seen.has(entry.name)) continue;
          this.list.append(entry.node);
          this.seen.add(entry.name);
        }
        this.nextPageToken = next;
        this.loaded = true;
        this.setStatus(this.seen.size ? "" : "Nothing here");
        if (retryFocused)
          entries[0]?.node
            .querySelector(".memo-meta a")
            ?.focus({ preventScroll: true });
      } catch {
        if (
          controller.signal.aborted ||
          request.signal.aborted ||
          generation !== this.feedGeneration
        )
          return;
        this.failed = true;
        this.setStatus(this.loaded ? "Not loaded" : "Load failed");
        this.button.hidden = false;
        this.button.textContent = "重试";
      } finally {
        clearTimeout(timeout);
        controller.signal.removeEventListener("abort", abort);
        if (this.requestController === request) this.requestController = null;
        if (
          this.controller === controller &&
          generation === this.feedGeneration
        ) {
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
