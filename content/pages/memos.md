---
title: Memos
description: 碎碎念
---

<div class="ui-editorial">
<aside class="ui-editorial-aside ui-editorial-aside--sticky memos-calendar" data-memos-calendar aria-label="Calendar" hidden>
  <div class="memos-calendar-header">
    <button class="ui-icon-btn memos-calendar-nav" data-calendar-prev type="button" aria-label="Previous month">←</button>
    <strong class="memos-calendar-month" data-calendar-month></strong>
    <button class="ui-icon-btn memos-calendar-nav" data-calendar-next type="button" aria-label="Next month">→</button>
  </div>
  <div class="memos-calendar-weekdays" data-calendar-weekdays aria-hidden="true"></div>
  <div class="memos-calendar-grid" data-calendar-grid role="grid" aria-label="View by date"></div>
  <div class="memos-tag-cloud" data-memos-tags hidden>
    <h2>Tags</h2>
    <button class="memos-tag-open" data-memos-tags-open type="button" aria-label="View all tags" hidden><span class="memos-tag-list" data-memos-tags-list></span></button>
    <p class="memos-tag-message" data-memos-tags-message role="status"></p>
    <button class="ui-link-btn" data-memos-tags-retry type="button" hidden>Retry</button>
  </div>
</aside>
<site-dialog data-memos-tags-dialog>
  <dialog class="ui-dialog memos-tag-dialog" aria-label="All memo tags">
    <button class="ui-dialog-close" data-dialog-close type="button" aria-label="Close tags"><svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 3 10 10M13 3 3 13"></path></svg></button>
    <h2>Tags</h2>
    <div class="memos-tag-list memos-tag-dialog-list" data-memos-tags-all></div>
  </dialog>
</site-dialog>

<memos-feed class="ui-editorial-main">
  <div class="memos-date-filter" data-memos-date-filter hidden>
    <time data-memos-filter-date></time>
    <button class="ui-icon-btn memos-filter-clear" data-memos-filter-clear type="button" aria-label="清除筛选">×</button>
  </div>
  <div class="memos-list" data-memos-list></div>
  <p class="memos-status" data-memos-status role="status" aria-live="polite">Loading Memos...</p>
  <div class="memos-sentinel" data-memos-sentinel aria-hidden="true" hidden></div>
  <div class="memos-controls">
    <button class="ui-link-btn" data-memos-retry type="button" hidden>重试</button>
  </div>
  <noscript><p>Enabled JavaScript to load memos.</p></noscript>
</memos-feed>
</div>
