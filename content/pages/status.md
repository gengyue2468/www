---
title: Status
description: Service status and availability.
---

<status-page>
  <div class="status-main">
  <p class="status-message" data-status-message role="status" aria-live="polite">Loading status…</p>
  <div class="status-overview" data-status-overview></div>
  <div class="status-notices" data-status-notices></div>
  <div class="status-groups" data-status-groups></div>
  <p class="status-updated" data-status-updated hidden></p>
  <button class="status-retry" data-status-retry type="button" hidden>Retry</button>
  <p class="status-empty" data-status-empty hidden>No matching services.</p>
  <noscript><p>Enable JavaScript to view status.</p></noscript>
  </div>
  <aside class="status-sidebar" aria-label="Service controls">
    <div class="status-control">
      <span class="status-control-label">Sort</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Sort services"><span data-status-sort-label>Default</span> <svg class="status-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-status-sort-options></div>
        </details>
      </site-dropdown>
    </div>
    <div class="status-control">
      <span class="status-control-label">Status</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Filter services"><span data-status-filter-label>All</span> <svg class="status-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-status-filter-options></div>
        </details>
      </site-dropdown>
    </div>
  </aside>
</status-page>
