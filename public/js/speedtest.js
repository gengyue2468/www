import { MIB, fetchCloudflareClientInfo, runSpeedTest, speedtestCooldownMs } from "./speedtest-engine.js";

// Trusted static markup: forms in Markdown are deliberately removed by the
// site's sanitizer. Build the controls here without weakening that policy.
const SPEEDTEST_CONTROLS = `
<form class="speedtest-controls" data-speedtest-form>
  <fieldset data-speedtest-settings>
    <legend>Test options</legend>
    <label class="speedtest-mode"><input type="radio" name="streams" value="1" aria-label="Single transfer stream" checked><span>Single</span></label>
    <label class="speedtest-mode"><input type="radio" name="streams" value="4" aria-label="Four concurrent transfer streams"><span>Multi</span></label>
  </fieldset>
  <div class="speedtest-actions">
    <button type="submit" data-speedtest-start>Start</button>
    <button type="button" data-speedtest-stop hidden>Stop</button>
  </div>
  <p class="speedtest-status" data-speedtest-status role="status" aria-live="polite">Ready when you are.</p>
</form>`;

(() => {
  const tagName = "speedtest-page";
  if (customElements.get(tagName)) return;
  const format = value => Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—";
  const countryName = code => {
    if (!code) return "";
    try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; }
    catch { return code; }
  };

  class SpeedtestPage extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      const controls = this.querySelector("[data-speedtest-controls]");
      if (controls && !controls.querySelector("form")) controls.innerHTML = SPEEDTEST_CONTROLS;
      this.form = this.querySelector("[data-speedtest-form]");
      if (!this.form) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.form.addEventListener("submit", event => { event.preventDefault(); void this.startTest(); }, options);
      this.querySelector("[data-speedtest-stop]").addEventListener("click", () => this.stopTest("Stopped."), { signal: this.controller.signal });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.stopTest("Paused tab. Test stopped.");
      }, { signal: this.controller.signal });
      window.addEventListener("pagehide", () => this.stopTest("Stopped."), { signal: this.controller.signal });
      void this.loadClientInfo();
    }

    disconnectedCallback() {
      this.stopTest("Stopped.");
      this.controller?.abort();
      this.controller = null;
    }

    text(selector, value) {
      const element = this.querySelector(selector);
      element.textContent = value;
      element.removeAttribute("title");
    }

    async loadClientInfo() {
      try {
        const info = await fetchCloudflareClientInfo({ signal: this.controller.signal });
        if (!this.controller?.signal.aborted) this.showClientInfo(info);
      } catch {
        // Client details are optional; a blocked lookup must not affect testing.
      }
    }

    showClientInfo(info) {
      if (info.colo) this.text("[data-speedtest-edge]", info.colo);
      this.text("[data-speedtest-client-ip]", info.ip || "—");
      const location = [info.city, countryName(info.country)].filter(Boolean).join(", ");
      this.text("[data-speedtest-client-location]", location || "—");
      this.text("[data-speedtest-client-provider]", info.provider || "—");
    }

    busy(running) {
      this.querySelector("[data-speedtest-settings]").disabled = running;
      this.querySelector("[data-speedtest-start]").disabled = running;
      this.querySelector("[data-speedtest-start]").hidden = running;
      this.querySelector("[data-speedtest-stop]").hidden = !running;
      this.toggleAttribute("data-running", running);
    }

    stopTest(message) {
      if (!this.testController) return;
      this.testController.abort();
      this.testController = null;
      this.busy(false);
      this.text("[data-speedtest-status]", message);
      for (const row of this.querySelectorAll("[data-speedtest-direction][data-active]")) {
        row.removeAttribute("data-active");
        row.querySelector("[data-speedtest-caption]").textContent = "Stopped — incomplete";
      }
    }

    async startTest() {
      if (this.testController) return;
      const cooldown = speedtestCooldownMs();
      if (cooldown) {
        this.text("[data-speedtest-status]", `Retry in ${Math.ceil(cooldown / 1000)}s.`);
        return;
      }
      if (!globalThis.ReadableStream || !globalThis.AbortController || !globalThis.crypto?.getRandomValues) {
        this.text("[data-speedtest-status]", "Browser unsupported.");
        return;
      }
      const form = new FormData(this.form);
      const streams = Number(form.get("streams"));
      if (![1, 4].includes(streams)) return;
      const controller = new AbortController();
      this.testController = controller;
      this.trends = { download: [], upload: [] };
      this.phase = null;
      this.busy(true);
      this.text("[data-speedtest-latency]", "—");
      this.text("[data-speedtest-jitter]", "—");
      for (const row of this.querySelectorAll("[data-speedtest-direction]")) {
        row.querySelector("[data-speedtest-rate]").textContent = "—";
        row.querySelector("[data-speedtest-bytes]").textContent = "0 MiB";
        row.querySelector("[data-speedtest-loaded]").textContent = "—";
        row.querySelector("[data-speedtest-caption]").textContent = "Waiting…";
        row.querySelector(".speedtest-curve").setAttribute("d", "");
        row.removeAttribute("data-active");
      }
      try {
        const result = await runSpeedTest({ streams, signal: controller.signal,
          onUpdate: update => { if (this.testController === controller) this.showUpdate(update); } });
        if (this.testController !== controller) return;
        this.text("[data-speedtest-status]", result.download.reason === "interrupted" || result.upload.reason === "interrupted"
          ? "Incomplete."
          : result.download.degraded || result.upload.degraded
            ? "Complete. Reduced concurrency."
            : "Complete.");
      } catch (error) {
        if (this.testController !== controller || controller.signal.aborted) return;
        const detail = error instanceof Error ? error.message : "Test failed.";
        const phase = /^(Download|Upload)\b/.exec(detail)?.[1];
        const message = error.httpStatus ? `HTTP ${error.httpStatus}.`
          : /timeout|timed out|stalled/i.test(detail) ? "Timed out."
          : /network|cors|fetch/i.test(detail) ? "Connection failed."
          : /payload|safety limit/i.test(detail) ? "Data limit reached."
          : /cooldown/i.test(detail) ? "Wait before retrying."
          : /no .*data/i.test(detail) ? "No data."
          : "Test failed.";
        this.text("[data-speedtest-status]", phase ? `${phase}: ${message}` : message);
        this.querySelector("[data-speedtest-status]").title = detail;
        for (const row of this.querySelectorAll("[data-speedtest-direction][data-active]")) {
          row.querySelector("[data-speedtest-caption]").textContent = "Incomplete";
        }
      } finally {
        if (this.testController === controller) {
          this.testController = null;
          this.busy(false);
          for (const row of this.querySelectorAll("[data-speedtest-direction]")) row.removeAttribute("data-active");
        }
      }
    }

    showUpdate(update) {
      if (update.server) this.text("[data-speedtest-edge]", update.server);
      if (update.retrying) {
        this.text("[data-speedtest-status]", `Rate limited. Retry in ${Math.ceil(update.retryMs / 1000)}s…`);
        this.phase = null;
        return;
      }
      if (this.phase !== update.phase) {
        this.phase = update.phase;
        const captions = { latency: "Measuring latency…", download: "Downloading…", upload: "Uploading…" };
        this.text("[data-speedtest-status]", captions[update.phase]);
      }
      if (update.phase === "latency") {
        this.text("[data-speedtest-latency]", format(update.latency));
        this.text("[data-speedtest-jitter]", format(update.jitter));
        return;
      }
      if (update.degraded && !update.final) {
        this.text("[data-speedtest-status]", `${update.phase === "download" ? "Download" : "Upload"}: ${update.streams} stream${update.streams === 1 ? "" : "s"} (reduced).`);
      }
      const row = this.querySelector(`[data-speedtest-direction="${update.phase}"]`);
      if (update.elapsed === 0 && !update.final) this.trends[update.phase] = [];
      row.toggleAttribute("data-active", !update.final);
      row.querySelector("[data-speedtest-rate]").textContent = format(update.rate);
      row.querySelector("[data-speedtest-loaded]").textContent = format(update.loadedLatency);
      row.querySelector("[data-speedtest-bytes]").textContent = `${format(update.bytes / MIB)} MiB`;
      const duration = `${format(update.elapsed)}s`;
      const state = update.final
        ? `${update.reason === "interrupted" ? "Incomplete" : update.qualified ? "Measured" : "Short sample"} (${{ stable: "settled", time: "time limit", limit: "payload limit", interrupted: "request failures" }[update.reason]})`
        : update.elapsed < 1.5 ? "Warming up" : "Sampling";
      const label = update.degraded ? `${state} / ${update.streams} stream${update.streams === 1 ? "" : "s"}` : state;
      row.querySelector("[data-speedtest-caption]").replaceChildren(...[label, duration].map(text => {
        const span = document.createElement("span");
        span.textContent = text;
        return span;
      }));
      if (Number.isFinite(update.rate)) {
        const values = this.trends[update.phase];
        values.push(update.rate);
        const peak = Math.max(1, ...values);
        const denominator = update.final ? Math.max(1, values.length - 1) : Math.max(74, values.length - 1);
        row.querySelector(".speedtest-curve").setAttribute("d", values.map((value, i) => `${i ? "L" : "M"}${(i / denominator * 300).toFixed(1)} ${(61 - value / peak * 54).toFixed(1)}`).join(" "));
      }
    }
  }
  customElements.define(tagName, SpeedtestPage);
})();
