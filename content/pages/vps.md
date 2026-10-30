---
title: VPS
description: Servers, resource usage and network probes.
---

<vps-page>
  <div class="vps-main">
  <div class="vps-overview">
    <p data-vps-summary>My VPS</p>
    <p class="vps-connection" data-vps-message role="status" aria-live="polite">Connecting…</p>
  </div>
  <div class="vps-nodes" data-vps-nodes></div>
  <p class="vps-updated" data-vps-updated></p>
  <button class="vps-retry" data-vps-retry type="button" hidden>Retry</button>
  <p class="vps-empty" data-vps-empty hidden>No matching servers.</p>
  <noscript><p>Enable JavaScript to view servers.</p></noscript>
  </div>
  <aside class="vps-sidebar" aria-label="Server controls">
    <div class="vps-control">
      <span class="vps-control-label">Sort</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Sort servers"><span data-vps-sort-label>Name A–Z</span> <svg class="vps-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-vps-sort-options></div>
        </details>
      </site-dropdown>
    </div>
    <div class="vps-control">
      <span class="vps-control-label">Status</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Filter servers"><span data-vps-filter-label>All</span> <svg class="vps-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-vps-filter-options></div>
        </details>
      </site-dropdown>
    </div>
    <figure class="vps-map" data-vps-map hidden>
      <div data-vps-map-graphic></div>
    </figure>
  </aside>
</vps-page>
