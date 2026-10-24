import "./site-dropdown.js";
import { MIB, fetchCloudflareClientInfo, runSpeedTest } from "./speedtest-engine.js";

// Trusted static markup: forms in Markdown are deliberately removed by the
// site's sanitizer. Build the controls here without weakening that policy.
const SPEEDTEST_CONTROLS = `
<form class="speedtest-controls" data-speedtest-form>
  <fieldset data-speedtest-settings>
    <legend>Test options</legend>
    <label class="speedtest-mode"><input type="radio" name="streams" value="1" aria-label="Single transfer stream" checked><span>Single</span></label>
    <label class="speedtest-mode"><input type="radio" name="streams" value="4" aria-label="Four concurrent transfer streams"><span>Multi</span></label>
    <span class="speedtest-budget"><span>Limit</span>
      <input type="hidden" name="budget" value="256" data-speedtest-budget-value>
      <site-dropdown class="speedtest-budget-dropdown" data-speedtest-budget-dropdown>
        <details class="nav-dropdown">
          <summary class="nav-menu-label" data-speedtest-budget-trigger aria-label="Payload limit for each direction">
            <span data-speedtest-budget-label>256 MiB / way</span>
            <svg class="speedtest-chevron" aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5"></path></svg>
          </summary>
          <div class="nav-dropdown-menu" role="listbox" aria-label="Payload limit for each direction">
            <button type="button" role="option" data-speedtest-budget-option data-value="64" aria-selected="false">64 MiB / way</button>
            <button type="button" role="option" data-speedtest-budget-option data-value="256" aria-selected="true">256 MiB / way</button>
            <button type="button" role="option" data-speedtest-budget-option data-value="512" aria-selected="false">512 MiB / way</button>
          </div>
        </details>
      </site-dropdown>
    </span>
  </fieldset>
  <div class="speedtest-actions">
    <button type="submit" data-speedtest-start>Start</button>
    <button type="button" data-speedtest-stop hidden>Stop</button>
  </div>
  <p class="speedtest-status" data-speedtest-status role="status" aria-live="polite"></p>
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
      this.form.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const option = target.closest("[data-speedtest-budget-option]");
        if (!option || this.testController) return;
        this.setBudget(option.dataset.value, option.textContent.trim());
      }, options);
      this.querySelector("[data-speedtest-budget-trigger]")?.addEventListener("click", event => {
        if (this.testController) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, options);
      this.querySelector("[data-speedtest-stop]").addEventListener("click", () => this.stopTest("Stopped."), { signal: this.controller.signal });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.stopTest("Stopped because the page was hidden. Keep this tab visible while testing.");
      }, { signal: this.controller.signal });
      window.addEventListener("pagehide", () => this.stopTest("Stopped."), { signal: this.controller.signal });
      void this.loadClientInfo();
    }

    disconnectedCallback() {
      this.stopTest("Stopped.");
      this.controller?.abort();
      this.controller = null;
    }

    text(selector, value) { this.querySelector(selector).textContent = value; }

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
      const trigger = this.querySelector("[data-speedtest-budget-trigger]");
      trigger?.setAttribute("aria-disabled", String(running));
      this.toggleAttribute("data-running", running);
    }

    setBudget(value, label) {
      if (!value || !label) return;
      this.querySelector("[data-speedtest-budget-value]").value = value;
      const trigger = this.querySelector("[data-speedtest-budget-trigger]");
      this.querySelector("[data-speedtest-budget-label]").textContent = label;
      trigger.setAttribute("aria-label", `Payload limit: ${label}`);
      for (const option of this.querySelectorAll("[data-speedtest-budget-option]")) {
        option.setAttribute("aria-selected", String(option.dataset.value === value));
      }
    }

    stopTest(message) {
      if (!this.testController) return;
      this.testController.abort();
      this.testController = null;
      this.busy(false);
      this.text("[data-speedtest-status]", message);
      for (const row of this.querySelectorAll("[data-speedtest-direction][data-active]")) {
        row.removeAttribute("data-active");
        row.querySelector("[data-speedtest-caption]").textContent = "Incomplete · stopped";
      }
    }

    async startTest() {
      if (this.testController) return;
      if (!globalThis.ReadableStream || !globalThis.AbortController || !globalThis.crypto?.getRandomValues) {
        this.text("[data-speedtest-status]", "This browser does not support the APIs needed for this test.");
        return;
      }
      const form = new FormData(this.form);
      const streams = Number(form.get("streams"));
      const budgetBytes = Number(form.get("budget")) * MIB;
      if (![1, 4].includes(streams) || ![64, 256, 512].includes(budgetBytes / MIB)) return;
      const controller = new AbortController();
      this.testController = controller;
      this.trends = { download: [], upload: [] };
      this.phase = null;
      this.busy(true);
      this.text("[data-speedtest-latency]", "—");
      this.text("[data-speedtest-jitter]", "—");
      this.text("[data-speedtest-edge]", "Automatic");
      this.querySelector("[data-speedtest-progress]").style.width = "0%";
      for (const row of this.querySelectorAll("[data-speedtest-direction]")) {
        row.querySelector("[data-speedtest-rate]").textContent = "—";
        row.querySelector("[data-speedtest-bytes]").textContent = "0 MiB";
        row.querySelector("[data-speedtest-loaded]").textContent = "—";
        row.querySelector("[data-speedtest-caption]").textContent = "Waiting…";
        row.querySelector(".speedtest-curve").setAttribute("d", "");
        row.removeAttribute("data-active");
      }
      try {
        await runSpeedTest({ streams, budgetBytes, signal: controller.signal,
          onUpdate: update => { if (this.testController === controller) this.showUpdate(update, budgetBytes); } });
        if (this.testController !== controller) return;
        this.text("[data-speedtest-status]", "Complete.");
        this.querySelector("[data-speedtest-progress]").style.width = "100%";
      } catch (error) {
        if (this.testController !== controller || controller.signal.aborted) return;
        this.text("[data-speedtest-status]", error.httpStatus ? error.message : "The test could not finish. Check your connection, VPN or browser blocking, then try again.");
        for (const row of this.querySelectorAll("[data-speedtest-direction][data-active]")) {
          row.querySelector("[data-speedtest-caption]").textContent = "Incomplete · request failed";
        }
      } finally {
        if (this.testController === controller) {
          this.testController = null;
          this.busy(false);
          for (const row of this.querySelectorAll("[data-speedtest-direction]")) row.removeAttribute("data-active");
        }
      }
    }

    showUpdate(update, budgetBytes) {
      if (update.server) this.text("[data-speedtest-edge]", update.server);
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
      const row = this.querySelector(`[data-speedtest-direction="${update.phase}"]`);
      row.toggleAttribute("data-active", !update.final);
      row.querySelector("[data-speedtest-rate]").textContent = format(update.rate);
      row.querySelector("[data-speedtest-loaded]").textContent = format(update.loadedLatency);
      row.querySelector("[data-speedtest-bytes]").textContent = `${format(update.bytes / MIB)} MiB`;
      const duration = `${format(update.elapsed)}s`;
      row.querySelector("[data-speedtest-caption]").textContent = update.final
        ? `${update.qualified ? "Measured" : "Short sample"} · ${duration} · ${{ stable: "settled", time: "time limit", limit: "payload limit" }[update.reason]}`
        : `${duration} · ${update.elapsed < 1.5 ? "warming up" : "sampling"}`;
      if (Number.isFinite(update.rate)) {
        const values = this.trends[update.phase];
        values.push(update.rate);
        const peak = Math.max(1, ...values);
        const denominator = update.final ? Math.max(1, values.length - 1) : Math.max(74, values.length - 1);
        row.querySelector(".speedtest-curve").setAttribute("d", values.map((value, i) => `${i ? "L" : "M"}${(i / denominator * 300).toFixed(1)} ${(61 - value / peak * 54).toFixed(1)}`).join(" "));
      }
      const progress = Math.min(1, Math.max(update.elapsed / 15, (update.reservedBytes || 0) / budgetBytes));
      const base = update.phase === "download" ? 5 : 52;
      this.querySelector("[data-speedtest-progress]").style.width = `${base + (update.final ? 1 : Math.min(0.98, progress)) * 47}%`;
    }
  }
  customElements.define(tagName, SpeedtestPage);
})();
