(() => {
  const tagName = "track-page";
  if (customElements.get(tagName)) return;

  const pageSize = 20;
  const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeImage = value => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  const trackKey = (track, index) => `${track?.trackId || track?.name || "track"}:${track?.playedAt || "unknown"}:${index}`;

  class TrackPage extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.list = this.querySelector("[data-track-list]");
      this.message = this.querySelector("[data-track-message]");
      this.sentinel = this.querySelector("[data-track-sentinel]");
      this.retry = this.querySelector("[data-track-retry]");
      if (!this.list || !this.message || !this.sentinel || !this.retry) return;
      this.controller = new AbortController();
      this.seen = new Set();
      this.before = null;
      this.hasMore = true;
      this.noteIndex = 0;
      this.addEventListener("animationend", event => this.advanceMarquee(event), { signal: this.controller.signal });
      this.marqueeFrame = null;
      this.motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      this.handleMotionChange = () => this.scheduleMarquees();
      if (this.motionQuery?.addEventListener) this.motionQuery.addEventListener("change", this.handleMotionChange);
      else this.motionQuery?.addListener?.(this.handleMotionChange);
      if (typeof ResizeObserver === "function") {
        this.marqueeResizeObserver = new ResizeObserver(() => this.scheduleMarquees());
        this.marqueeResizeObserver.observe(this.list);
      } else {
        window.addEventListener("resize", this.handleMotionChange, { signal: this.controller.signal });
      }
      document.fonts?.ready?.then(() => this.scheduleMarquees());
      this.retry.addEventListener("click", () => { void this.load(); }, { signal: this.controller.signal });
      const controller = this.controller;
      this.observer = new IntersectionObserver(entries => {
        if (this.controller === controller && !this.loading && !this.failed && this.hasMore
          && entries.some(entry => entry.isIntersecting)) void this.load();
      }, { rootMargin: "600px 0px" });
      void this.load();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.requestController?.abort();
      this.controller = null;
      this.observer?.disconnect();
      this.observer = null;
      this.marqueeResizeObserver?.disconnect();
      this.marqueeResizeObserver = null;
      if (this.motionQuery?.removeEventListener) this.motionQuery.removeEventListener("change", this.handleMotionChange);
      else this.motionQuery?.removeListener?.(this.handleMotionChange);
      if (this.marqueeFrame !== null) cancelAnimationFrame(this.marqueeFrame);
      this.marqueeFrame = null;
      this.loading = false;
    }

    setMessage(message) {
      this.message.textContent = message;
      this.message.hidden = !message;
    }

    async load() {
      if (this.loading || !this.controller || !this.hasMore) return;
      const controller = this.controller;
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      this.requestController = request;
      this.loading = true;
      this.failed = false;
      this.retry.hidden = true;
      this.observer?.disconnect();
      this.sentinel.hidden = true;
      this.setMessage(this.loaded ? "Loading more tracks…" : "Loading tracks…");

      try {
        const query = new URLSearchParams({ limit: String(pageSize) });
        if (this.before != null) query.set("before", String(this.before));
        const response = await fetch(`/api/spotify/recent?${query}`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`Recent tracks HTTP ${response.status}`);
        const data = await response.json();
        if (request.signal.aborted || this.controller !== controller) return;
        if (!data || !Array.isArray(data.tracks)) throw new Error("Invalid recent tracks response");

        const tracks = data.tracks.filter(track => track && typeof track.name === "string");
        for (const [index, track] of tracks.entries()) {
          const key = trackKey(track, index);
          if (this.seen.has(key)) continue;
          const entry = this.renderTrack(track);
          this.list.append(entry);
          this.seen.add(key);
        }
        this.scheduleMarquees();

        const nextBefore = Number.isFinite(Number(data.before)) ? Number(data.before) : null;
        if (this.before != null && nextBefore != null && nextBefore >= this.before) throw new Error("Pagination did not move backward");
        this.before = nextBefore;
        this.hasMore = data.hasMore === true && nextBefore != null;
        this.loaded = true;
        this.setMessage(this.seen.size ? "" : "No recently played tracks.");
      } catch {
        if (request.signal.aborted || this.controller !== controller) return;
        this.failed = true;
        this.setMessage(this.loaded ? "Could not load more tracks. The loaded tracks are still here." : "Recent tracks are unavailable. Please try again.");
        this.retry.hidden = false;
      } finally {
        controller.signal.removeEventListener("abort", abort);
        if (this.requestController === request) this.requestController = null;
        if (this.controller === controller) {
          this.loading = false;
          this.sentinel.hidden = !this.hasMore || this.failed;
          if (!this.sentinel.hidden) this.observer?.observe(this.sentinel);
        }
      }
    }

    scheduleMarquees() {
      if (this.marqueeFrame !== null || !this.controller) return;
      this.marqueeFrame = requestAnimationFrame(() => {
        this.marqueeFrame = null;
        if (this.controller) {
          this.updateMarquees();
        }
      });
    }

    updateMarquees() {
      for (const entry of this.list.querySelectorAll(".track-entry")) {
        let changed = false;
        const queue = [];
        for (const marquee of entry.querySelectorAll(".track-marquee")) {
        const lane = marquee.querySelector(".track-marquee-lane");
        const text = marquee.querySelector(".track-marquee-text");
        if (!lane || !text) continue;

        let clone = lane.querySelector(".track-marquee-clone");
        if (!clone) {
          clone = text.cloneNode(true);
          clone.classList.add("track-marquee-clone");
          clone.setAttribute("aria-hidden", "true");
          lane.append(clone);
        }

        const width = text.getBoundingClientRect().width;
        const available = marquee.clientWidth;
        const scrolling = !this.motionQuery?.matches && available > 0 && width > available + 1;
        const gap = parseFloat(getComputedStyle(lane).columnGap) || 0;
        const distance = scrolling ? width + gap : 0;
        if (marquee.marqueeDistance !== distance) changed = true;
        marquee.marqueeDistance = distance;
        marquee.title = text.textContent;
        if (!scrolling) {
          marquee.removeAttribute("data-scrolling");
          clone.hidden = true;
          clone.textContent = "";
          marquee.style.removeProperty("--track-marquee-distance");
          marquee.style.removeProperty("--track-marquee-duration");
          continue;
        }

        clone.hidden = false;
        clone.textContent = text.textContent;
        marquee.style.setProperty("--track-marquee-distance", `${distance}px`);
        marquee.style.setProperty("--track-marquee-duration", `${distance / 24}s`);
        queue.push(marquee);
        }
        entry.marqueeQueue = queue;
        if (changed) {
          for (const marquee of entry.querySelectorAll(".track-marquee")) marquee.removeAttribute("data-scrolling");
          entry.activeMarquee = null;
        }
        if (!entry.activeMarquee) this.startMarquee(entry, queue[0]);
      }
    }

    startMarquee(entry, marquee) {
      if (!marquee || this.motionQuery?.matches) return;
      entry.activeMarquee = marquee;
      void marquee.querySelector(".track-marquee-lane").offsetWidth;
      marquee.setAttribute("data-scrolling", "");
    }

    advanceMarquee(event) {
      if (event.animationName !== "track-page-marquee") return;
      const entry = event.target.closest(".track-entry");
      const current = entry?.activeMarquee;
      if (!current || event.target !== current.querySelector(".track-marquee-lane")) return;
      current.removeAttribute("data-scrolling");
      entry.activeMarquee = null;
      this.startMarquee(entry, entry.marqueeQueue[(entry.marqueeQueue.indexOf(current) + 1) % entry.marqueeQueue.length]);
    }

    marquee(text, className = "") {
      const marquee = element(className === "track-title" ? "strong" : "span", `track-marquee${className ? ` ${className}` : ""}`);
      const lane = element("span", "track-marquee-lane");
      lane.append(element("span", "track-marquee-text", text));
      marquee.append(lane);
      return marquee;
    }

    renderTrack(track) {
      const entry = element("article", "track-entry");
      const noteId = `track-time-${this.noteIndex++}`;
      const noteLabel = element("label", "margin-toggle track-time-toggle", "⊕");
      noteLabel.htmlFor = noteId;
      noteLabel.setAttribute("aria-controls", `${noteId}-content`);
      noteLabel.setAttribute("aria-label", "展开播放时间");
      const noteToggle = element("input", "margin-toggle");
      noteToggle.type = "checkbox";
      noteToggle.id = noteId;
      noteToggle.setAttribute("aria-controls", `${noteId}-content`);
      noteToggle.setAttribute("aria-label", "展开播放时间");
      const playedNote = element("span", "marginnote track-played");
      playedNote.id = `${noteId}-content`;
      playedNote.setAttribute("role", "note");
      const played = element("time");
      const date = Number(track.playedAt) > 0 ? new Date(Number(track.playedAt) * 1000) : null;
      if (date && Number.isFinite(date.getTime())) {
        played.dateTime = date.toISOString();
        played.textContent = formatter.format(date);
      } else played.textContent = "—";
      playedNote.append(played);
      entry.append(noteLabel, noteToggle, playedNote);

      const imageUrl = safeImage(track.image);
      const url = typeof track.url === "string" && /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+/.test(track.url)
        ? track.url : track.trackId ? `https://open.spotify.com/track/${encodeURIComponent(track.trackId)}` : null;
      const link = element(url ? "a" : "div", "track-link");
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `在 Spotify 打开：${track.name}`);
      }
      if (imageUrl) {
        const image = element("img", "track-art");
        image.src = imageUrl;
        image.alt = `${track.album || ""} album artwork`;
        image.loading = "lazy";
        image.decoding = "async";
        link.append(image);
      } else {
        link.append(element("span", "track-art track-art-empty", "♪"));
      }

      const details = element("span", "track-details");
      const title = this.marquee(track.name, "track-title");
      details.append(title);
      const artists = Array.isArray(track.artists) ? track.artists.join(", ") : "Unknown artist";
      details.append(this.marquee(`By ${artists}${track.album ? ` / ${track.album}` : ""}`, "track-meta"));
      link.append(details);
      entry.append(link);
      return entry;
    }
  }

  customElements.define(tagName, TrackPage);
})();
