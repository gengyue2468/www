// Global paper-style toast stack for concise error and status notifications.
(() => {
  const tagName = "site-toast";
  if (customElements.get(tagName)) return;

  const DEFAULT_DURATION = 4500;
  const MAX_TOASTS = 3;
  const MAX_DETAIL_LEN = 240;

  function normalizeDetail(value) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.length > MAX_DETAIL_LEN ? `${trimmed.slice(0, MAX_DETAIL_LEN)}…` : trimmed;
  }

  class SiteToast extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      this.items = new Map();
      this.classList.add("ui-toast-stack");

      const { signal } = this.controller;
      window.addEventListener("site-toast", event => {
        const detail = event?.detail;
        if (typeof detail === "string") this.show(detail);
        else if (detail && typeof detail.message === "string") this.show(detail.message, detail);
      }, { signal });

      const queued = Array.isArray(window.__siteToastQueue) ? window.__siteToastQueue.splice(0) : [];
      for (const item of queued) {
        if (typeof item === "string") this.show(item);
        else if (item && typeof item.message === "string") this.show(item.message, item);
      }
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      if (this.items) {
        for (const entry of this.items.values()) clearTimeout(entry.timer);
        this.items.clear();
      }
      this.replaceChildren();
    }

    show(rawMessage, options = {}) {
      if (!this.controller) return;
      const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
      if (!message) return;

      const tone = options.tone === "error" ? "error" : "info";
      const detail = normalizeDetail(options.detail);
      const duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : DEFAULT_DURATION;
      const key = `${tone}:${message}:${detail}`;

      const existing = this.items.get(key);
      if (existing) {
        clearTimeout(existing.timer);
        existing.remaining = duration;
        this.scheduleDismiss(key, existing);
        return;
      }

      while (this.items.size >= MAX_TOASTS) {
        const oldestKey = this.items.keys().next().value;
        if (oldestKey !== undefined) this.dismiss(oldestKey);
        else break;
      }

      const node = document.createElement("div");
      node.className = "ui-toast";
      node.dataset.tone = tone;
      node.setAttribute("role", tone === "error" ? "alert" : "status");
      node.setAttribute("aria-live", tone === "error" ? "assertive" : "polite");
      node.setAttribute("aria-atomic", "true");

      const header = document.createElement("div");
      header.className = "ui-toast-header";

      const text = document.createElement("span");
      text.className = "ui-toast-message";
      text.textContent = message;

      const close = document.createElement("button");
      close.type = "button";
      close.className = "ui-toast-close";
      close.setAttribute("aria-label", "Dismiss");
      close.textContent = "×";

      header.append(text, close);
      node.append(header);

      if (detail) {
        const code = document.createElement("code");
        code.className = "ui-toast-code";
        code.textContent = detail;
        node.append(code);
      }

      this.append(node);

      const entry = { node, timer: null, remaining: duration, startedAt: 0 };
      this.items.set(key, entry);

      const { signal } = this.controller;
      close.addEventListener("click", () => this.dismiss(key), { signal });
      node.addEventListener("pointerenter", () => this.pauseDismiss(entry), { signal });
      node.addEventListener("pointerleave", () => this.scheduleDismiss(key, entry), { signal });
      node.addEventListener("focusin", () => this.pauseDismiss(entry), { signal });
      node.addEventListener("focusout", () => this.scheduleDismiss(key, entry), { signal });

      this.scheduleDismiss(key, entry);
    }

    pauseDismiss(entry) {
      if (!entry.timer) return;
      clearTimeout(entry.timer);
      entry.timer = null;
      const elapsed = Date.now() - entry.startedAt;
      entry.remaining = Math.max(800, entry.remaining - elapsed);
    }

    scheduleDismiss(key, entry) {
      clearTimeout(entry.timer);
      entry.startedAt = Date.now();
      entry.timer = setTimeout(() => {
        entry.timer = null;
        this.dismiss(key);
      }, entry.remaining);
    }

    dismiss(key) {
      const entry = this.items?.get(key);
      if (!entry) return;
      clearTimeout(entry.timer);
      this.items.delete(key);
      entry.node.remove();
    }
  }

  customElements.define(tagName, SiteToast);
})();
