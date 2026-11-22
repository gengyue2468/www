---
title: VPS
description: Servers, resource usage and network probes.
---

<vps-page class="ui-editorial">
  <div class="ui-editorial-main">
  <div class="vps-overview">
    <p data-vps-summary>My VPS</p>
    <p class="vps-connection" data-vps-message role="status" aria-live="polite">Connecting…</p>
  </div>
  <div class="vps-nodes" data-vps-nodes></div>
  <p class="vps-updated" data-vps-updated></p>
  <button class="ui-link-btn" data-vps-retry type="button" hidden>Retry</button>
  <p class="vps-empty" data-vps-empty hidden>No matching servers.</p>
  <noscript><p>Enable JavaScript to view servers.</p></noscript>
  </div>
  <aside class="ui-editorial-aside ui-editorial-aside--sticky ui-editorial-aside--dock vps-sidebar" aria-label="Server controls">
    <div class="ui-control">
      <span class="ui-control-label">Sort</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Sort servers"><span data-vps-sort-label>Name A–Z</span> <svg class="ui-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-vps-sort-options></div>
        </details>
      </site-dropdown>
    </div>
    <div class="ui-control">
      <span class="ui-control-label">Status</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Filter servers"><span data-vps-filter-label>All</span> <svg class="ui-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-vps-filter-options></div>
        </details>
      </site-dropdown>
    </div>
    <figure class="vps-map" data-vps-map hidden>
      <div data-vps-map-graphic></div>
    </figure>
    <div class="vps-fleet" data-vps-fleet hidden aria-label="Fleet overview">
      <div class="vps-fleet-section">
        <h2>Resources</h2>
        <dl>
          <div><dt>Servers</dt><dd data-vps-fleet-servers></dd></div>
          <div data-vps-fleet-states-row hidden><dt>Other states</dt><dd data-vps-fleet-states></dd></div>
          <div><dt title="Regions inferred from flag emoji in server names.">Regions</dt><dd data-vps-fleet-regions></dd></div>
          <div><dt>CPU cores</dt><dd data-vps-fleet-cores></dd></div>
          <div><dt title="CPU usage weighted by logical CPU threads for online servers with recent data.">CPU usage</dt><dd data-vps-fleet-cpu-usage></dd></div>
          <div><dt title="1 / 5 / 15 minute load averages per logical CPU, for online servers with recent data.">Load / CPU</dt><dd data-vps-fleet-load></dd></div>
          <div><dt>Memory</dt><dd data-vps-fleet-memory></dd></div>
          <div><dt>Disk</dt><dd data-vps-fleet-disk></dd></div>
        </dl>
      </div>
      <div class="vps-fleet-section">
        <h2 title="Online servers with recent node data.">Highest usage</h2>
        <dl>
          <div><dt>CPU</dt><dd data-vps-fleet-high-cpu></dd></div>
          <div><dt>Memory</dt><dd data-vps-fleet-high-memory></dd></div>
          <div><dt>Disk</dt><dd data-vps-fleet-high-disk></dd></div>
        </dl>
      </div>
      <div class="vps-fleet-section">
        <h2>Traffic</h2>
        <dl>
          <div><dt>Inbound</dt><dd data-vps-fleet-inbound></dd></div>
          <div><dt>Outbound</dt><dd data-vps-fleet-outbound></dd></div>
          <div><dt title="Sum of reported interface counters, including virtual interfaces; counters can reset.">Interface RX total</dt><dd data-vps-fleet-received></dd></div>
          <div><dt title="Sum of reported interface counters, including virtual interfaces; counters can reset.">Interface TX total</dt><dd data-vps-fleet-sent></dd></div>
        </dl>
      </div>
    </div>
  </aside>
  <site-dialog data-vps-map-dialog>
    <dialog class="ui-dialog vps-map-dialog" aria-label="Expanded server map">
      <button class="ui-dialog-close" data-dialog-close type="button" aria-label="Close map">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 3 10 10M13 3 3 13"></path></svg>
      </button>
      <div class="vps-map-tools" aria-label="Map controls">
        <button data-vps-map-zoom-in type="button" aria-label="Zoom in"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"></path></svg></button>
        <button data-vps-map-zoom-out type="button" aria-label="Zoom out"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h10"></path></svg></button>
        <button data-vps-map-zoom-reset type="button" aria-label="Reset map zoom"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 6V3h3M3.5 3.5A5.5 5.5 0 1 1 2.7 10"></path></svg></button>
      </div>
      <div data-vps-map-dialog-content></div>
    </dialog>
  </site-dialog>
</vps-page>
