---
title: Memos
description: 碎碎念
---

<div class="memos-layout">
<aside class="memos-calendar" data-memos-calendar aria-label="日历" hidden>
  <div class="memos-calendar-header">
    <button class="memos-calendar-nav" data-calendar-prev type="button" aria-label="上月">←</button>
    <strong class="memos-calendar-month" data-calendar-month></strong>
    <button class="memos-calendar-nav" data-calendar-next type="button" aria-label="下月">→</button>
  </div>
  <div class="memos-calendar-weekdays" data-calendar-weekdays aria-hidden="true"></div>
  <div class="memos-calendar-grid" data-calendar-grid role="grid" aria-label="按日期查看"></div>
</aside>

<memos-feed>
  <div class="memos-date-filter" data-memos-date-filter hidden>
    <time data-memos-filter-date></time>
    <button class="memos-filter-clear" data-memos-filter-clear type="button" aria-label="清除筛选">×</button>
  </div>
  <div class="memos-list" data-memos-list></div>
  <p class="memos-status" data-memos-status role="status" aria-live="polite">Loading Memos...</p>
  <div class="memos-sentinel" data-memos-sentinel aria-hidden="true" hidden></div>
  <div class="memos-controls">
    <button class="nav-menu-label post-actions-button" data-memos-retry type="button" hidden>重试</button>
  </div>
  <noscript><p>Enabled JavaScript to load memos.</p></noscript>
</memos-feed>
</div>
