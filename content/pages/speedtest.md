---
title: Speedtest
description: 测速测速
---

<speedtest-page>
  <div class="speedtest-main">
  <div data-speedtest-controls></div>
  <dl class="speedtest-latency">
    <div><dt>Latency</dt><dd><span data-speedtest-latency>—</span> <small>ms</small></dd></div>
    <div><dt>Jitter</dt><dd><span data-speedtest-jitter>—</span> <small>ms</small></dd></div>
    <div class="speedtest-edge"><dt>Cloudflare</dt><dd data-speedtest-edge>Automatic</dd></div>
  </dl>
  <div class="speedtest-results">
    <div class="speedtest-direction" data-speedtest-direction="download">
      <h2>Download</h2>
      <p class="speedtest-reading"><span data-speedtest-rate>—</span> <span class="speedtest-unit">Mbps</span></p>
      <svg class="speedtest-chart" viewBox="0 0 300 64" preserveAspectRatio="none" role="img" aria-label="Download speed over time">
        <path class="speedtest-chart-baseline" d="M0 63 H300"></path>
        <path class="speedtest-curve" d=""></path>
      </svg>
      <p class="speedtest-caption" data-speedtest-caption></p>
      <p class="speedtest-detail"><span class="speedtest-transfer"><span data-speedtest-bytes>0 MiB</span> received</span> · <span class="speedtest-loaded"><span data-speedtest-loaded>—</span> ms loaded</span></p>
    </div>
    <div class="speedtest-direction" data-speedtest-direction="upload">
      <h2>Upload</h2>
      <p class="speedtest-reading"><span data-speedtest-rate>—</span> <span class="speedtest-unit">Mbps</span></p>
      <svg class="speedtest-chart" viewBox="0 0 300 64" preserveAspectRatio="none" role="img" aria-label="Upload speed over time">
        <path class="speedtest-chart-baseline" d="M0 63 H300"></path>
        <path class="speedtest-curve" d=""></path>
      </svg>
      <p class="speedtest-caption" data-speedtest-caption></p>
      <p class="speedtest-detail"><span class="speedtest-transfer"><span data-speedtest-bytes>0 MiB</span> acknowledged</span> · <span class="speedtest-loaded"><span data-speedtest-loaded>—</span> ms loaded</span></p>
    </div>
  </div>
  <noscript><p>JavaScript is required. No test runs until you select Start test.</p></noscript>
  </div>
  <aside class="speedtest-client-info" data-speedtest-client-info aria-label="Client information">
    <dl>
      <div><dt>IP address</dt><dd data-speedtest-client-ip>—</dd></div>
      <div><dt>Location</dt><dd data-speedtest-client-location>—</dd></div>
      <div><dt>Provider</dt><dd data-speedtest-client-provider>—</dd></div>
    </dl>
  </aside>
</speedtest-page>
