import type { Plugin } from "./plugin.js";

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
    text-underline-offset: var(--text-underline-offset);
    text-decoration-thickness: var(--text-decoration-thickness);
  }

  .cover {
    display: block;
    flex: 0 0 5rem;
    order: 0;
    width: 5rem;
    height: 5rem;
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
    flex: 1 1 auto;
    order: 1;
  }

  .track,
  .meta {
    overflow-wrap: anywhere;
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
    0%, 100% { transform: scaleY(0.35); }
    50% { transform: scaleY(1.35); }
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

    .track {
      display: block;
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
<p class="status" data-status>Now playing:</p>
<p class="card" data-card aria-live="polite" aria-busy="true">
  <a class="link" data-link target="_blank" rel="noopener noreferrer">
    <span class="cover" aria-hidden="true"><img data-image alt="" width="80" height="80" loading="eager" hidden></span>
    <span class="copy">
      <strong class="track" data-track>Loading...</strong>
      <span class="meta" data-meta>Fetching...</span>
    </span>
    <svg class="wave" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" width="32" height="32">
      <rect x="2.5" y="6" width="2" height="12" rx="0.5"/>
      <rect x="8.5" y="6" width="2" height="12" rx="0.5"/>
      <rect x="14.5" y="6" width="2" height="12" rx="0.5"/>
      <rect x="20.5" y="6" width="2" height="12" rx="0.5"/>
    </svg>
  </a>
</p>`;

export function hasNowPlayingCard(html: string): boolean {
  return /<now-playing-card(?:\s|>)/i.test(html);
}

export function nowPlayingScript(): string {
  const templateHtml = JSON.stringify(COMPONENT_TEMPLATE).replaceAll("<", "\\u003c");

  return `<script>
(() => {
  const tagName = ${JSON.stringify(COMPONENT_TAG)};
  if (customElements.get(tagName)) return;

  const template = document.createElement("template");
  template.innerHTML = ${templateHtml};

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
      this.image = root.querySelector("[data-image]");
      this.image?.addEventListener("error", () => {
        this.image.hidden = true;
        this.image.removeAttribute("src");
      });
    }

    connectedCallback() {
      const wasEmpty = cards.size === 0;
      cards.add(this);
      if (latestTrack) this.renderTrack(latestTrack);
      else if (isUnavailable) this.renderUnavailable();
      if (wasEmpty) refresh();
    }

    disconnectedCallback() {
      cards.delete(this);
      if (cards.size === 0) clearTimeout(pollTimer);
    }

    setText(selector, text) {
      const element = this.root.querySelector(selector);
      if (element && element.textContent !== text) element.textContent = text;
    }

    renderTrack(track) {
      const playing = !!track.nowplaying;
      this.setText("[data-status]", playing ? "Now playing:" : "Offline. Last played:");
      this.setText("[data-track]", track.name);
      this.setText(
        "[data-meta]",
        "By " + track.artist + (track.album ? " | " + track.album : ""),
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
    }

    renderUnavailable() {
      this.setText("[data-status]", "Offline.");
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
    }
  }

  document.addEventListener("visibilitychange", () => {
    clearTimeout(pollTimer);
    if (document.visibilityState === "visible" && cards.size > 0) refresh();
  });

  customElements.define(tagName, NowPlayingCard);
})();
</script>`;
}

function injectNowPlayingScript(html: string): string {
  if (!hasNowPlayingCard(html)) return html;
  const script = nowPlayingScript();
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd === -1) return `${html}\n${script}`;
  return `${html.slice(0, bodyEnd)}${script}\n${html.slice(bodyEnd)}`;
}

export const nowPlayingPlugin: Plugin = {
  name: "now-playing-card",
  hooks: {
    afterRenderPage: (_route, html) => injectNowPlayingScript(html),
    afterRenderPost: (_slug, html) => injectNowPlayingScript(html),
  },
};
