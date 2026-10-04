const COMPONENT_TAG = "now-playing-card";

const COMPONENT_TEMPLATE = `
<style>
  :host {
    display: block;
    width: 100%;
    margin-block: 1.8rem;
    color: inherit;
    font-family: inherit;
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
  }

  .status {
    margin: 0;
    font-style: italic;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .card {
    margin: 0;
    padding: 0.75rem;
    border: 1px solid var(--accent);
    box-sizing: border-box;
    transition: opacity 0.2s ease;
  }

  .card[data-state="recent"] {
    opacity: 0.6;
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    color: inherit;
    text-decoration: none;
  }

  .cover {
    display: block;
    flex: 0 0 5rem;
    order: 0;
    width: 5rem;
    height: 5rem;
    border: 1px solid var(--accent);
    box-sizing: border-box;
    overflow: hidden;
    border-radius: 2px;
    background-color: var(--accent);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23909090' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'/%3E%3Ccircle cx='6' cy='18' r='3'/%3E%3Ccircle cx='18' cy='16' r='3'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 52%;
  }

  .cover img {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    border: 0;
    object-fit: cover;
  }

  .cover img[hidden] {
    display: none;
  }

  .copy {
    min-width: 0;
    flex: 1 1 0%;
    order: 1;
  }

  .marquee {
    --marquee-gap: 2rem;
    --marquee-delay: 1.8s;
    display: block;
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-lane {
    display: flex;
    width: max-content;
    column-gap: var(--marquee-gap);
  }

  .marquee-text {
    flex: 0 0 auto;
  }

  .marquee-clone[hidden] {
    display: none;
  }

  .marquee[data-scrolling] .marquee-lane {
    /* One pass per turn; animationend hands control to the next long line. */
    animation: now-playing-marquee var(--marquee-duration) linear var(--marquee-delay);
  }

  .card[data-marquee-paused] .marquee-lane,
  .link:focus-within .marquee-lane {
    animation-play-state: paused;
  }

  @media (hover: hover) {
    .link:hover .marquee-lane {
      animation-play-state: paused;
    }
  }

  @keyframes now-playing-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-1 * var(--marquee-distance))); }
  }

  .meta {
    display: block;
    opacity: 0.65;
    font-size: 0.9em;
    font-style: italic;
  }

  .wave {
    flex: 0 0 auto;
    order: 2;
    margin-inline-end: 0.4rem;
    opacity: 0.4;
  }

  .wave rect {
    transform-box: fill-box;
    transform-origin: center;
  }

  .card[data-state="playing"] .wave {
    opacity: 0.7;
  }

  .card[data-state="playing"] .wave rect:nth-child(1) {
    animation: now-playing-wave 0.8s ease-in-out infinite;
  }

  .card[data-state="playing"] .wave rect:nth-child(2) {
    animation: now-playing-wave 0.6s ease-in-out 0.2s infinite;
  }

  .card[data-state="playing"] .wave rect:nth-child(3) {
    animation: now-playing-wave 0.7s ease-in-out 0.1s infinite;
  }

  .card[data-state="playing"] .wave rect:nth-child(4) {
    animation: now-playing-wave 0.5s ease-in-out 0.3s infinite;
  }

  @keyframes now-playing-wave {
    0%, 100% { transform: scaleY(0.2); }
    50% { transform: scaleY(1.8); }
  }

  @media (prefers-reduced-motion: reduce) {
    .wave rect,
    .marquee-lane {
      animation: none !important;
    }

    .marquee {
      overflow-x: auto;
      scrollbar-width: none;
    }

    .marquee-clone {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .link {
      position: relative;
      display: grid;
      grid-template-areas: "cover copy";
      grid-template-columns: 4rem minmax(0, 1fr);
      column-gap: 0.85rem;
      align-items: center;
    }

    .cover {
      grid-area: cover;
      width: 4rem;
      height: 4rem;
      filter: brightness(0.55);
    }

    .copy {
      grid-area: copy;
      align-self: center;
    }

    .wave {
      grid-area: cover;
      position: absolute;
      inset: 0;
      z-index: 1;
      margin: auto;
      color: #fff;
      opacity: 0.8;
      pointer-events: none;
    }

    .card[data-state="playing"] .wave {
      opacity: 1;
    }
  }
</style>
<p class="status"><span data-status>Now playing:</span><span data-played-at-caption hidden> (At <time data-played-at></time>):</span></p>
<a class="card link" data-card data-link target="_blank" rel="noopener noreferrer" aria-live="polite" aria-busy="true">
  <span class="cover" aria-hidden="true"><img data-image alt="" width="80" height="80" loading="eager" hidden></span>
  <span class="copy">
    <strong class="track marquee" data-marquee>
      <span class="marquee-lane" data-marquee-lane>
        <span class="marquee-text" data-marquee-source data-track>Loading...</span>
        <span class="marquee-text marquee-clone" data-marquee-clone aria-hidden="true" hidden></span>
      </span>
    </strong>
    <span class="meta marquee" data-marquee>
      <span class="marquee-lane" data-marquee-lane>
        <span class="marquee-text" data-marquee-source data-meta>Fetching...</span>
        <span class="marquee-text marquee-clone" data-marquee-clone aria-hidden="true" hidden></span>
      </span>
    </span>
  </span>
  <svg class="wave" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="32" height="32">
    <rect x="2.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="8.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="14.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="20.5" y="6" width="2" height="12" rx="0.5"/>
  </svg>
</a>`;

(() => {
  const tagName = COMPONENT_TAG;
  if (customElements.get(tagName)) return;

  const template = document.createElement("template");
  template.innerHTML = COMPONENT_TEMPLATE;

  const placeholderHashes = [
    "2a96cbd8b46e442fc41c2b86b821562f",
    "4128a6eb29f94943c9d206c08e625904",
    "c6f59c1e5e7240a4c0d427abd71f3dbb",
  ];
  const coverUrl = (url) =>
    url && !placeholderHashes.some((hash) => url.includes(hash)) ? url : null;

  const cards = new Set();
  const playingInterval = 60_000;
  const idleInterval = 180_000;
  const marqueeSpeed = 24; // Pixels per second, regardless of text length.
  const playedAtFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  let latestTrack = null;
  let hasSuccessfulResult = false;
  let isUnavailable = false;
  let pollTimer;
  let pendingRequest = null;

  const notify = () => {
    for (const card of cards) {
      if (latestTrack) card.renderTrack(latestTrack);
      else if (isUnavailable) card.renderUnavailable();
    }
  };

  const schedule = (delay) => {
    clearTimeout(pollTimer);
    if (cards.size > 0 && document.visibilityState === "visible") {
      pollTimer = setTimeout(refresh, delay);
    }
  };

  const refresh = () => {
    if (cards.size === 0 || document.visibilityState !== "visible" || pendingRequest) return;

    const controller = new AbortController();
    let timedOut = false;
    let nextInterval = idleInterval;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    pendingRequest = fetch("/api/lastfm/now", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Last.fm request failed");
        return response.json();
      })
      .then((tracks) => {
        const track = Array.isArray(tracks) ? tracks[0] : null;
        if (!track?.name || !track?.artist) throw new Error("Invalid Last.fm response");

        latestTrack = track;
        hasSuccessfulResult = true;
        isUnavailable = false;
        nextInterval = track.nowplaying ? playingInterval : idleInterval;
        notify();
      })
      .catch(() => {
        if (!hasSuccessfulResult && (!controller.signal.aborted || timedOut)) {
          isUnavailable = true;
          notify();
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        pendingRequest = null;
        schedule(nextInterval);
      });
  };

  class NowPlayingCard extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.append(template.content.cloneNode(true));
      this.root = root;
      this.marquees = [...root.querySelectorAll("[data-marquee]")].map((element) => ({
        element,
        lane: element.querySelector("[data-marquee-lane]"),
        source: element.querySelector("[data-marquee-source]"),
        clone: element.querySelector("[data-marquee-clone]"),
        signature: null,
        distance: 0,
      }));
      this.marqueeQueue = [];
      this.activeMarquee = null;
      root.addEventListener("animationend", (event) => this.advanceMarquee(event));
      this.marqueeFrame = null;
      this.scheduleMarquees = () => {
        if (!this.isConnected || this.marqueeFrame !== null) return;
        this.marqueeFrame = requestAnimationFrame(() => {
          this.marqueeFrame = null;
          if (this.isConnected) this.updateMarquees();
        });
      };
      this.image = root.querySelector("[data-image]");
      this.image?.addEventListener("error", () => {
        this.image.hidden = true;
        this.image.removeAttribute("src");
      });
    }

    connectedCallback() {
      this.motionQuery ||= window.matchMedia?.("(prefers-reduced-motion: reduce)");
      this.motionQuery?.addEventListener("change", this.scheduleMarquees);
      this.syncMarqueeVisibility();
      if (typeof ResizeObserver === "function") {
        this.resizeObserver ||= new ResizeObserver(this.scheduleMarquees);
        for (const { element, source } of this.marquees) {
          this.resizeObserver.observe(element);
          this.resizeObserver.observe(source);
        }
      } else {
        window.addEventListener("resize", this.scheduleMarquees);
      }
      document.fonts?.ready?.then(this.scheduleMarquees);
      this.scheduleMarquees();

      const wasEmpty = cards.size === 0;
      cards.add(this);
      if (latestTrack) this.renderTrack(latestTrack);
      else if (isUnavailable) this.renderUnavailable();
      if (wasEmpty) refresh();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.motionQuery?.removeEventListener("change", this.scheduleMarquees);
      window.removeEventListener("resize", this.scheduleMarquees);
      if (this.marqueeFrame !== null) cancelAnimationFrame(this.marqueeFrame);
      this.marqueeFrame = null;
      this.resetMarqueeCycle();
      this.marqueeQueue = [];
      cards.delete(this);
      if (cards.size === 0) clearTimeout(pollTimer);
    }

    setText(selector, text) {
      const element = this.root.querySelector(selector);
      if (element && element.textContent !== text) element.textContent = text;
    }

    updateMarquees() {
      let changed = false;
      for (const marquee of this.marquees) {
        const { element, lane, source, clone } = marquee;
        const text = source.textContent;
        if (element.title !== text) {
          element.title = text;
          element.scrollLeft = 0;
        }
        const width = source.getBoundingClientRect().width;
        const available = element.clientWidth;
        const scrolling = !this.motionQuery?.matches && available > 0 && width > available + 1;
        const gap = scrolling ? parseFloat(getComputedStyle(lane).columnGap) || 0 : 0;
        const distance = scrolling ? width + gap : 0;
        const signature = JSON.stringify([text, distance]);
        if (signature === marquee.signature) continue;

        changed = true;
        marquee.signature = signature;
        marquee.distance = distance;

        if (!scrolling) {
          clone.hidden = true;
          clone.textContent = "";
          lane.style.removeProperty("--marquee-distance");
          lane.style.removeProperty("--marquee-duration");
          continue;
        }

        element.scrollLeft = 0;
        clone.textContent = text;
        clone.hidden = false;
        lane.style.setProperty("--marquee-distance", `${distance}px`);
        lane.style.setProperty("--marquee-duration", `${distance / marqueeSpeed}s`);
      }

      this.marqueeQueue = this.marquees.filter(({ distance }) => distance > 0);
      // Preserve the active turn on unchanged polling results or resizes that
      // leave the same lines overflowing; changed text or font metrics restart.
      if (changed) this.resetMarqueeCycle();
      if (!this.activeMarquee) this.startMarquee(this.marqueeQueue[0]);
    }

    resetMarqueeCycle() {
      for (const { element } of this.marquees) element.removeAttribute("data-scrolling");
      this.activeMarquee = null;
    }

    startMarquee(marquee) {
      if (!marquee || !this.isConnected || this.motionQuery?.matches) return;
      this.activeMarquee = marquee;
      // Flush the stopped state, including when a single long line repeats.
      void marquee.lane.offsetWidth;
      marquee.element.setAttribute("data-scrolling", "");
    }

    advanceMarquee(event) {
      const current = this.activeMarquee;
      if (!this.isConnected || this.motionQuery?.matches || !current
        || event.animationName !== "now-playing-marquee" || event.target !== current.lane) return;

      const nextIndex = (this.marqueeQueue.indexOf(current) + 1) % this.marqueeQueue.length;
      current.element.removeAttribute("data-scrolling");
      this.activeMarquee = null;
      // The duplicate finishes at the original's starting position, so resetting
      // is visually seamless. The next CSS animation includes its own read pause.
      this.startMarquee(this.marqueeQueue[nextIndex]);
    }

    syncMarqueeVisibility() {
      this.root.querySelector("[data-card]")?.toggleAttribute(
        "data-marquee-paused", document.visibilityState !== "visible",
      );
    }

    setPlayedAt(timestamp) {
      const time = this.root.querySelector("[data-played-at]");
      const caption = this.root.querySelector("[data-played-at-caption]");
      if (!time || !caption) return false;

      const date = Number.isFinite(timestamp) ? new Date(timestamp * 1000) : null;
      const iso = date && Number.isFinite(date.getTime()) ? date.toISOString() : "";
      caption.hidden = !iso;
      time.textContent = iso ? playedAtFormatter.format(date) : "";
      if (iso) time.dateTime = iso;
      else time.removeAttribute("datetime");
      return !!iso;
    }

    renderTrack(track) {
      const playing = !!track.nowplaying;
      const hasPlayedAt = this.setPlayedAt(playing ? null : track.playedAt);
      this.setText(
        "[data-status]",
        playing ? "Now playing:" : hasPlayedAt ? "Offline. Last played" : "Offline. Last played:",
      );
      this.setText("[data-track]", track.name);
      this.setText(
        "[data-meta]",
        "By " + track.artist + (track.album ? " / " + track.album : ""),
      );

      const cover = coverUrl(track.image);
      if (this.image) {
        if (cover) {
          this.image.hidden = false;
          if (this.image.getAttribute("src") !== cover) this.image.src = cover;
        } else {
          this.image.hidden = true;
          this.image.removeAttribute("src");
        }
      }

      const link = this.root.querySelector("[data-link]");
      if (link) {
        if (track.url && link.getAttribute("href") !== track.url) link.href = track.url;
        else if (!track.url) link.removeAttribute("href");
      }

      const card = this.root.querySelector("[data-card]");
      if (card) {
        card.dataset.state = playing ? "playing" : "recent";
        card.setAttribute("aria-busy", "false");
      }
      this.scheduleMarquees();
    }

    renderUnavailable() {
      this.setText("[data-status]", "Offline.");
      this.setPlayedAt(null);
      this.setText("[data-track]", "Unavailable");
      this.setText("[data-meta]", "Listening activity could not be loaded.");
      if (this.image) {
        this.image.hidden = true;
        this.image.removeAttribute("src");
      }

      const link = this.root.querySelector("[data-link]");
      link?.removeAttribute("href");
      const card = this.root.querySelector("[data-card]");
      if (card) {
        card.dataset.state = "recent";
        card.setAttribute("aria-busy", "false");
      }
      this.scheduleMarquees();
    }
  }

  document.addEventListener("visibilitychange", () => {
    clearTimeout(pollTimer);
    for (const card of cards) card.syncMarqueeVisibility();
    if (document.visibilityState === "visible" && cards.size > 0) {
      for (const card of cards) card.scheduleMarquees();
      refresh();
    }
  });

  customElements.define(tagName, NowPlayingCard);
})();
