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

  .context-link {
    color: inherit;
    text-decoration: none;
  }

  .context-link[href]:hover,
  .context-link[href]:focus-visible {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
  }

  .card {
    position: relative;
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

  .progress {
    appearance: none;
    position: absolute;
    inset-inline-start: -1px;
    bottom: -1px;
    display: block;
    width: calc(100% + 2px);
    height: 1px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: currentColor;
    opacity: 0;
    pointer-events: none;
  }

  .progress[hidden] { display: none; }

  /* A transformed border fill interpolates consistently across browsers;
     the invisible native progress element retains accessible values. */
  .card[data-progress-active]::after {
    content: "";
    position: absolute;
    inset-inline-start: -1px;
    bottom: -1px;
    width: calc(100% + 2px);
    height: 1px;
    background: currentColor;
    transform: scaleX(var(--playback-progress, 0));
    transform-origin: left;
    transition: transform 1s linear;
    pointer-events: none;
  }

  .activity {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex: 0 0 auto;
    order: 2;
    margin-inline-end: 0.4rem;
  }

  .mode-icon {
    display: block;
    flex: none;
    width: 14px;
    height: 14px;
    opacity: 0.5;
  }

  .mode-icon[hidden] { display: none; }

  .wave {
    flex: none;
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
    .card[data-progress-active]::after { transition: none; }

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

    .activity {
      grid-area: cover;
      position: absolute;
      inset: 0;
      z-index: 1;
      width: fit-content;
      height: fit-content;
      gap: 0.15rem;
      margin: auto;
      color: #fff;
      pointer-events: none;
    }

    .mode-icon { width: 12px; height: 12px; }
    .wave { opacity: 0.8; }

    .card[data-state="playing"] .wave {
      opacity: 1;
    }
  }
</style>
<p class="status"><a class="context-link" data-context-link target="_blank" rel="noopener noreferrer"><span data-status>Now playing:</span></a><span data-played-at-caption hidden> (At <time data-played-at></time>):</span></p>
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
  <progress class="progress" data-playback data-progress max="1" value="0" aria-label="Playback progress" aria-live="off" hidden></progress>
  <span class="activity">
    <svg class="mode-icon" data-shuffle role="img" aria-label="Shuffle on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" hidden>
      <path d="m18 3 3 3-3 3M18 15l3 3-3 3M3 6h3c5 0 7 12 12 12h3M3 18h3c1.8 0 3.2-1.5 4.5-3.5M13.5 9.5C14.8 7.5 16.2 6 18 6h3"/>
    </svg>
    <svg class="mode-icon" data-repeat role="img" aria-label="Repeat all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" hidden>
      <path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>
    </svg>
    <svg class="mode-icon" data-repeat-one role="img" aria-label="Repeat one" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" hidden>
      <path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3m7-8 2-1v6"/>
    </svg>
    <svg class="wave" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="32" height="32">
    <rect x="2.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="8.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="14.5" y="6" width="2" height="12" rx="0.5"/>
    <rect x="20.5" y="6" width="2" height="12" rx="0.5"/>
    </svg>
  </span>
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
  const artistText = (track) => {
    const artists = Array.isArray(track.artists)
      ? track.artists.filter((artist) => typeof artist === "string" && artist.trim()).join(", ")
      : "";
    return artists || (typeof track.artist === "string" ? track.artist : "");
  };
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const cards = new Set();
  const playingInterval = 10_000;
  const idleInterval = 30_000;
  const maxErrorInterval = 60_000;
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
  let retryNotBefore = 0;
  let failures = 0;

  const notify = () => {
    for (const card of cards) {
      if (latestTrack) card.renderTrack(latestTrack);
      else if (isUnavailable) card.renderUnavailable();
    }
  };

  const schedule = (delay) => {
    clearTimeout(pollTimer);
    if (cards.size > 0 && document.visibilityState === "visible") {
      pollTimer = setTimeout(refresh, Math.min(Math.max(0, delay), 2_147_483_647));
    }
  };

  const refresh = () => {
    if (cards.size === 0 || document.visibilityState !== "visible" || pendingRequest) return;
    if (Date.now() < retryNotBefore) {
      schedule(retryNotBefore - Date.now());
      return;
    }

    const controller = new AbortController();
    let timedOut = false;
    let rateLimited = false;
    let nextInterval = idleInterval;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    pendingRequest = fetch("/api/spotify/now", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 429) {
          rateLimited = true;
          const header = response.headers.get("Retry-After");
          const body = header?.trim() ? null : await response.json().catch(() => null);
          const retryAfter = header?.trim() || body?.retryAfter;
          const seconds = retryAfter == null || retryAfter === "" ? NaN : Number(retryAfter);
          const deadline = Number.isFinite(seconds) ? Date.now() + seconds * 1000 : Date.parse(retryAfter);
          nextInterval = Number.isFinite(deadline) ? Math.max(1000, deadline - Date.now()) : idleInterval;
          retryNotBefore = Date.now() + nextInterval;
        }
        if (!response.ok) throw new Error("Spotify request failed");
        if (response.status === 204) return null;
        return response.json();
      })
      .then((track) => {
        if (track == null || (typeof track === "object" && !track.name)) {
          latestTrack = null;
          hasSuccessfulResult = true;
          isUnavailable = true;
          failures = 0;
          retryNotBefore = 0;
          nextInterval = idleInterval;
          notify();
          return;
        }
        if (typeof track?.name !== "string" || !track.name.trim() || !artistText(track)) {
          throw new Error("Invalid Spotify response");
        }

        latestTrack = track;
        hasSuccessfulResult = true;
        isUnavailable = false;
        failures = 0;
        retryNotBefore = 0;
        nextInterval = track.nowplaying && !track.playbackStale ? playingInterval : idleInterval;
        notify();
      })
      .catch(() => {
        if (!rateLimited) {
          failures = Math.min(failures + 1, 3);
          nextInterval = Math.min(maxErrorInterval, idleInterval * 1.5 ** (failures - 1));
        }
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
      this.syncProgressClock();
      if (wasEmpty) refresh();
    }

    disconnectedCallback() {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
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

    syncProgressClock() {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
      if (!this.progressSample) return;
      this.updateProgress();
      if (this.isConnected && document.visibilityState === "visible"
        && this.progressSample.position < this.progressSample.duration) {
        this.progressTimer = setInterval(() => this.updateProgress(), 1000);
      }
    }

    updateProgress() {
      const sample = this.progressSample;
      const progress = this.root.querySelector("[data-progress]");
      if (!sample || !progress) return;
      const position = Math.min(sample.duration, sample.position + Math.max(0, Date.now() - sample.observedAt));
      progress.max = sample.duration;
      progress.value = position;
      this.root.querySelector("[data-card]")?.style.setProperty("--playback-progress", `${position / sample.duration}`);
      progress.setAttribute("aria-valuetext", `${formatDuration(position)} / ${formatDuration(sample.duration)}`);
      if (position >= sample.duration) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    }

    setProgress(track, playing) {
      const container = this.root.querySelector("[data-playback]");
      const valid = playing && Number.isFinite(track?.progressMs) && track.progressMs >= 0
        && Number.isFinite(track.durationMs) && track.durationMs > 0;
      this.progressSample = valid ? {
        position: Math.min(track.progressMs, track.durationMs),
        duration: track.durationMs,
        observedAt: Date.now(),
      } : null;
      if (container) container.hidden = !valid;
      const card = this.root.querySelector("[data-card]");
      card?.toggleAttribute("data-progress-active", valid);
      if (!valid) {
        card?.style.removeProperty("--playback-progress");
        const progress = this.root.querySelector("[data-progress]");
        if (progress) {
          progress.value = 0;
          progress.removeAttribute("aria-valuetext");
        }
      }
      this.syncProgressClock();
    }

    setPlaybackExtras(track, playing) {
      const contextLink = this.root.querySelector("[data-context-link]");
      const contextUrl = playing && typeof track?.contextUrl === "string"
        && /^https:\/\/open\.spotify\.com\//.test(track.contextUrl) ? track.contextUrl : null;
      if (contextLink) {
        if (contextUrl) {
          if (contextLink.getAttribute("href") !== contextUrl) contextLink.href = contextUrl;
          const source = ["playlist", "album", "artist"].includes(track.contextType) ? track.contextType : "source";
          contextLink.setAttribute("aria-label", `Now playing: open current ${source} on Spotify`);
        } else {
          contextLink.removeAttribute("href");
          contextLink.removeAttribute("aria-label");
        }
      }
      for (const [selector, active] of [
        ["[data-shuffle]", track?.shuffle === true],
        ["[data-repeat]", track?.repeat === "context"],
        ["[data-repeat-one]", track?.repeat === "track"],
      ]) {
        const icon = this.root.querySelector(selector);
        if (icon) icon.hidden = !playing || !active;
      }
    }

    renderTrack(track) {
      const playing = !!track.nowplaying && !track.playbackStale;
      this.setPlaybackExtras(track, playing);
      this.setProgress(track, playing);
      const hasPlayedAt = this.setPlayedAt(playing ? null : track.playedAt);
      this.setText(
        "[data-status]",
        playing ? "Now playing:" : hasPlayedAt ? "Offline. Last played" : "Offline. Last played:",
      );
      this.setText("[data-track]", track.name);
      this.setText(
        "[data-meta]",
        "By " + artistText(track) + (track.album ? " / " + track.album : ""),
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
      this.setPlaybackExtras(null, false);
      this.setProgress(null, false);
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
    for (const card of cards) {
      card.syncMarqueeVisibility();
      card.syncProgressClock();
    }
    if (document.visibilityState === "visible" && cards.size > 0) {
      for (const card of cards) card.scheduleMarquees();
      refresh();
    }
  });

  customElements.define(tagName, NowPlayingCard);
})();
