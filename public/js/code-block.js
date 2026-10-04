(() => {
  const tagName = "code-block";
  if (customElements.get(tagName)) return;

  const copyIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 6V2.75h10.25V13H14"/><rect x="2.75" y="6.75" width="10.5" height="10.5" rx=".5"/></svg>';
  const checkIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m4 10 4 4 8-9"/></svg>';

  class CodeBlock extends HTMLElement {
    connectedCallback() {
      if (this.controller || !navigator.clipboard?.writeText) return;
      const pre = this.querySelector(":scope > pre");
      if (!pre) return;
      this.source = pre.querySelector(":scope > code") || pre;
      this.controller = new AbortController();
      this.button = document.createElement("button");
      this.button.type = "button";
      this.button.className = "code-copy";
      this.resetButton();
      this.status = document.createElement("span");
      this.status.className = "component-status";
      this.status.setAttribute("role", "status");
      this.append(this.button, this.status);
      this.button.addEventListener("click", () => { void this.copy(); }, { signal: this.controller.signal });
    }

    resetButton() {
      this.button.innerHTML = copyIcon;
      this.button.title = "复制代码";
      this.button.setAttribute("aria-label", "复制代码");
    }

    async copy() {
      if (this.copying) return;
      const controller = this.controller;
      this.copying = true;
      clearTimeout(this.feedbackTimer);
      this.status.textContent = "";
      try {
        await navigator.clipboard.writeText(this.source.textContent || "");
        if (controller !== this.controller) return;
        this.button.innerHTML = checkIcon;
        this.button.title = "已复制";
        this.button.setAttribute("aria-label", "已复制");
        this.status.textContent = "代码已复制";
      } catch {
        if (controller !== this.controller) return;
        this.button.title = "复制失败，请手动选择代码";
        this.button.setAttribute("aria-label", this.button.title);
        this.status.textContent = this.button.title;
      } finally {
        if (controller === this.controller) {
          this.copying = false;
          this.feedbackTimer = setTimeout(() => {
            this.resetButton();
            this.status.textContent = "";
          }, 1600);
        }
      }
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      this.copying = false;
      clearTimeout(this.feedbackTimer);
      this.button?.remove();
      this.status?.remove();
    }
  }

  customElements.define(tagName, CodeBlock);
})();
