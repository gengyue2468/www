// Reusable paper-style modal dialog built on top of native <dialog>.
(() => {
  const tagName = "site-dialog";
  if (customElements.get(tagName)) return;

  class SiteDialog extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.dialog = this.querySelector(":scope > dialog");
      if (!this.dialog) return;
      this.controller = new AbortController();
      const { signal } = this.controller;

      for (const closeButton of this.dialog.querySelectorAll("[data-dialog-close]")) {
        closeButton.addEventListener("click", () => this.close(), { signal });
      }
      this.dialog.addEventListener("click", event => {
        if (event.target === this.dialog) this.close();
      }, { signal });
      this.dialog.addEventListener("close", () => {
        this.dispatchEvent(new CustomEvent("site-dialog:close", { bubbles: true }));
      }, { signal });
    }

    disconnectedCallback() {
      if (this.dialog?.open) this.dialog.close();
      this.controller?.abort();
      this.controller = null;
    }

    get open() {
      return Boolean(this.dialog?.open);
    }

    showModal() {
      if (!this.dialog || typeof this.dialog.showModal !== "function" || this.dialog.open) return false;
      this.dialog.showModal();
      this.dispatchEvent(new CustomEvent("site-dialog:open", { bubbles: true }));
      return true;
    }

    close() {
      if (this.dialog?.open) this.dialog.close();
    }
  }

  customElements.define(tagName, SiteDialog);
})();
