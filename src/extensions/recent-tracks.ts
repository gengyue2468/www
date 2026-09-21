import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "recent-tracks-loader";

export function recentTracksScript(): string {
  return `
(() => {
  const tagName = ${JSON.stringify(COMPONENT_TAG)};
  if (customElements.get(tagName)) return;

  class RecentTracksLoader extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;

      const body = this.closest("tbody");
      if (!body) return;

      this.body = body;
      this.controller = new AbortController();
      void this.load(this.controller.signal);
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      this.body = null;
    }

    async load(signal) {
      try {
        const response = await fetch("/api/lastfm/recent", {
          cache: "no-store",
          signal,
        });
        if (!response.ok) throw new Error("Recent tracks request failed");

        const tracks = await response.json();
        if (!Array.isArray(tracks) || tracks.length === 0) {
          this.showMessage("No recent tracks.");
          return;
        }

        this.showTracks(tracks);
      } catch (error) {
        if (error?.name !== "AbortError") {
          this.showMessage("Recent tracks could not be loaded.");
        }
      }
    }

    showMessage(message) {
      if (!this.body) return;

      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = message;
      row.append(cell);
      this.body.replaceChildren(row);
    }

    showTracks(tracks) {
      if (!this.body) return;

      const rows = document.createDocumentFragment();
      for (const track of tracks) {
        if (!track?.name || !track?.artist) continue;

        const row = document.createElement("tr");
        const trackCell = row.insertCell();
        if (track.url) {
          const link = document.createElement("a");
          link.href = track.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = track.name;
          trackCell.append(link);
        } else {
          trackCell.textContent = track.name;
        }

        row.insertCell().textContent = track.artist;
        row.insertCell().textContent = track.album || "—";

        const playedCell = row.insertCell();
        if (track.nowplaying) {
          playedCell.textContent = "Now playing";
        } else if (Number.isFinite(track.playedAt)) {
          const date = new Date(track.playedAt * 1000);
          const time = document.createElement("time");
          time.dateTime = date.toISOString();
          time.textContent = new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(date);
          playedCell.append(time);
        } else {
          playedCell.textContent = "—";
        }

        rows.append(row);
      }

      if (rows.childNodes.length === 0) this.showMessage("No recent tracks.");
      else this.body.replaceChildren(rows);
    }
  }

  customElements.define(tagName, RecentTracksLoader);
})();`;
}

export const recentTracksPlugin: Plugin = {
  name: "recent-tracks",
  clientScripts: [{
    key: "recent-tracks",
    fileName: "recent-tracks",
    source: () => recentTracksScript(),
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "recent-tracks",
  }],
};
