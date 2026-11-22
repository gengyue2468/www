---
title: Status
description: Service status and availability.
---

<status-page class="ui-editorial">
  <div class="ui-editorial-main">
  <p class="status-message" data-status-message role="status" aria-live="polite">Loading status…</p>
  <div class="status-overview" data-status-overview></div>
  <section class="status-current-incidents" data-status-current hidden aria-label="Current incidents"></section>
  <div class="status-notices" data-status-notices></div>
  <div class="status-groups" data-status-groups></div>
  <p class="status-updated" data-status-updated hidden></p>
  <button class="ui-link-btn status-retry" data-status-retry type="button" hidden>Retry</button>
  <p class="status-empty" data-status-empty hidden>No matching services.</p>
  <noscript><p>Enable JavaScript to view status.</p></noscript>
  </div>
  <aside class="ui-editorial-aside status-history" aria-label="Incident history">
    <h2 class="ui-rule-heading">Incident history</h2>
    <div data-status-history></div>
    <p class="status-history-message" data-status-history-message role="status" aria-live="polite">Loading incidents…</p>
    <div class="status-history-pagination" data-status-history-pagination hidden>
      <button class="ui-link-btn" data-status-history-prev type="button">Previous</button>
      <span data-status-history-page></span>
      <button class="ui-link-btn" data-status-history-next type="button">Next</button>
    </div>
    <button class="ui-link-btn" data-status-history-retry type="button" hidden>Retry</button>
  </aside>
  <aside class="ui-editorial-aside ui-editorial-aside--dock status-sidebar" aria-label="Service controls">
    <div class="ui-control">
      <span class="ui-control-label">Sort</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Sort services"><span data-status-sort-label>Default</span> <svg class="ui-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-status-sort-options></div>
        </details>
      </site-dropdown>
    </div>
    <div class="ui-control">
      <span class="ui-control-label">Status</span>
      <site-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" aria-label="Filter services"><span data-status-filter-label>All</span> <svg class="ui-chevron" aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg></summary>
          <div class="nav-dropdown-menu" data-status-filter-options></div>
        </details>
      </site-dropdown>
    </div>
  </aside>
</status-page>
