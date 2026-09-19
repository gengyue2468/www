export function recentTracksScript(): string {
  return `<script>
(() => {
  const marker = document.querySelector("[data-recent-tracks-loading]");
  const body = marker?.closest("tbody");
  if (!body) return;

  const showMessage = (message) => {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = message;
    row.append(cell);
    body.replaceChildren(row);
  };

  fetch("/api/lastfm/recent", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((tracks) => {
      if (!Array.isArray(tracks) || tracks.length === 0) {
        showMessage("No recent tracks.");
        return;
      }

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

      if (rows.childNodes.length === 0) showMessage("No recent tracks.");
      else body.replaceChildren(rows);
    })
    .catch(() => showMessage("Recent tracks could not be loaded."));
})();
</script>`;
}
