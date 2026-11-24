import { MarqueeController, createMarquee } from "../../ui/marquee.js";
import { el } from "../../ui/dom.js";
import { notifyError } from "../../ui/toast.js";
import { formatShortDateTime } from "../../ui/time.js";

(() => {
  const tagName = "track-page";
  if (customElements.get(tagName)) return;

  const pageSize = 20;
  const safeImage = value => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  const trackKey = (track, index) => `${track?.trackId || track?.name || "track"}:${track?.playedAt || "unknown"}:${index}`;
  const hashKey = value => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return hash >>> 0;
  };

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
      this.marquees = [];
      this.before = null;
      this.hasMore = true;
      this.tileIndex = 0;
      this.sinceFeatured = 0;
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
      for (const marquee of this.marquees || []) marquee.disconnect();
      this.marquees = [];
      this.loading = false;
    }

    setMessage(message) {
      this.message.textContent = message;
      this.message.hidden = !message;
    }

    shouldFeature(key, hasImage) {
      const index = this.tileIndex++;
      if (!hasImage) { this.sinceFeatured++; return false; }
      if (index === 0) { this.sinceFeatured = 0; return true; }
      const gap = 4 + (hashKey(key) % 4);
      if (this.sinceFeatured >= gap) {
        this.sinceFeatured = 0;
        return true;
      }
      this.sinceFeatured++;
      return false;
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
          const entry = this.renderTrack(track, key);
          this.list.append(entry);
          const marquee = new MarqueeController(entry, entry);
          marquee.connect();
          this.marquees.push(marquee);
          this.seen.add(key);
        }

        const nextBefore = Number.isFinite(Number(data.before)) ? Number(data.before) : null;
        if (this.before != null && nextBefore != null && nextBefore >= this.before) throw new Error("Pagination did not move backward");
        this.before = nextBefore;
        this.hasMore = data.hasMore === true && nextBefore != null;
        this.loaded = true;
        this.setMessage(this.seen.size ? "" : "No recently played tracks.");
      } catch (error) {
        if (request.signal.aborted || this.controller !== controller) return;
        this.failed = true;
        this.setMessage(this.loaded ? "Could not load more tracks. The loaded tracks are still here." : "Recent tracks are unavailable. Please try again.");
        this.retry.hidden = false;
        notifyError(this.loaded ? "Failed to load more tracks." : "Failed to load tracks.", error);
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

    renderTrack(track, key) {
      const imageUrl = safeImage(track.image);
      const featured = this.shouldFeature(key, Boolean(imageUrl));
      const entry = el("article", featured ? "track-entry is-featured" : "track-entry");

      const url = typeof track.url === "string" && /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+/.test(track.url)
        ? track.url : track.trackId ? `https://open.spotify.com/track/${encodeURIComponent(track.trackId)}` : null;
      const link = el(url ? "a" : "div", "track-link");
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `在 Spotify 打开：${track.name}`);
      }

      if (imageUrl) {
        const image = el("img", "track-art");
        image.src = imageUrl;
        image.alt = `${track.album || track.name} album artwork`;
        image.loading = "lazy";
        image.decoding = "async";
        link.append(image);
      } else {
        link.append(el("span", "track-art track-art-empty", "♪"));
      }

      const date = Number(track.playedAt) > 0 ? new Date(Number(track.playedAt) * 1000) : null;
      if (date && Number.isFinite(date.getTime())) {
        const played = el("time", "track-played", formatShortDateTime(date));
        played.dateTime = date.toISOString();
        link.append(played);
      }

      const overlay = el("span", "track-overlay");
      const title = createMarquee({ tag: "strong", className: "track-title", text: track.name });
      overlay.append(title.root);
      const artists = Array.isArray(track.artists) ? track.artists.join(", ") : "Unknown artist";
      const meta = createMarquee({ className: "track-meta", text: `${artists}${track.album ? ` · ${track.album}` : ""}` });
      overlay.append(meta.root);
      link.append(overlay);
      entry.append(link);
      return entry;
    }
  }

  customElements.define(tagName, TrackPage);
})();
