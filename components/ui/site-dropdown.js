(() => {
  const tagName = "site-dropdown";
  if (customElements.get(tagName)) return;

  let activeDropdown = null;
  const positionProperties = ["--dropdown-left", "--dropdown-top", "--dropdown-max-width", "--dropdown-max-height"];
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  class SiteDropdown extends HTMLElement {
    controller = null;
    openController = null;
    positionFrame = null;

    connectedCallback() {
      if (this.controller) return;
      this.details = this.querySelector(":scope > details");
      this.summary = this.details?.querySelector(":scope > summary");
      this.menu = this.details?.querySelector(":scope > .nav-dropdown-menu");
      if (!this.summary || !this.menu) return;

      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.setAttribute("data-enhanced", "");
      // The top layer avoids clipping by surrounding scroll containers. Older
      // browsers use the same viewport positioning without the Popover API.
      // Do not use `this.popover` for state: HTMLElement reflects that property
      // to the host's native popover attribute (and its default border/styles).
      this.usePopover = typeof this.menu.showPopover === "function";
      if (this.usePopover) this.menu.setAttribute("popover", "manual");
      this.details.addEventListener("toggle", () => this.syncOpen(), options);
      this.menu.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const item = target.closest("a[href], button");
        if (!item || !this.menu.contains(item) || item.closest("[data-dropdown-keep-open]")) return;
        this.close(true);
      }, options);
      this.syncOpen();
      document.fonts?.ready.then(() => this.schedulePosition());
    }

    syncOpen() {
      if (!this.details.open) {
        this.releaseOpen();
        return;
      }
      if (this.openController) {
        this.schedulePosition();
        return;
      }
      activeDropdown?.close();
      activeDropdown = this;
      this.openController = new AbortController();
      const options = { signal: this.openController.signal };

      if (this.usePopover) {
        try {
          this.menu.showPopover();
        } catch {
          this.usePopover = false;
          this.menu.removeAttribute("popover");
        }
      }
      document.addEventListener("pointerdown", (event) => {
        if (!event.composedPath().includes(this)) this.close();
      }, { ...options, capture: true });
      document.addEventListener("focusin", (event) => {
        if (!event.composedPath().includes(this)) this.close();
      }, options);
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        event.preventDefault();
        this.close(true);
      }, options);
      window.addEventListener("resize", this.schedulePosition, options);
      window.addEventListener("scroll", this.schedulePosition, { ...options, capture: true, passive: true });
      window.visualViewport?.addEventListener("resize", this.schedulePosition, options);
      window.visualViewport?.addEventListener("scroll", this.schedulePosition, options);
      if (typeof ResizeObserver === "function") {
        this.resizeObserver = new ResizeObserver(this.schedulePosition);
        this.resizeObserver.observe(this.summary);
        this.resizeObserver.observe(this.menu);
      }
      this.positionMenu();
    }

    schedulePosition = (event) => {
      if (event?.target === this.menu || !this.isConnected || !this.details?.open || this.positionFrame !== null) return;
      this.positionFrame = requestAnimationFrame(() => {
        this.positionFrame = null;
        if (this.isConnected && this.details.open) this.positionMenu();
      });
    };

    positionMenu() {
      const viewport = window.visualViewport;
      const viewportLeft = viewport?.offsetLeft || 0;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportWidth = viewport?.width || document.documentElement.clientWidth;
      const viewportHeight = viewport?.height || document.documentElement.clientHeight;
      const rect = this.summary.getBoundingClientRect();
      if (rect.bottom <= viewportTop || rect.top >= viewportTop + viewportHeight
        || rect.right <= viewportLeft || rect.left >= viewportLeft + viewportWidth) {
        this.close();
        return;
      }

      const inset = Math.min(8, viewportWidth / 4, viewportHeight / 4);
      const leftEdge = viewportLeft + inset;
      const rightEdge = viewportLeft + viewportWidth - inset;
      const topEdge = viewportTop + inset;
      const bottomEdge = viewportTop + viewportHeight - inset;
      const gap = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 14) * 0.3;
      this.menu.style.setProperty("--dropdown-max-width", `${rightEdge - leftEdge}px`);

      // scrollHeight retains the full content height while the panel is limited.
      // Never reset max-height while measuring: that would reset scrollTop too.
      const width = this.menu.offsetWidth;
      const naturalHeight = this.menu.scrollHeight + this.menu.offsetHeight - this.menu.clientHeight;
      const above = Math.max(0, Math.min(rect.top - gap, bottomEdge) - topEdge);
      const below = Math.max(0, bottomEdge - Math.max(rect.bottom + gap, topEdge));
      const opensAbove = naturalHeight > below && (naturalHeight <= above || above > below);
      let maxHeight = opensAbove ? above : below;
      // If the trigger occupies the whole visible height, use the viewport
      // rather than making the menu impossible to access.
      if (maxHeight < 1) maxHeight = bottomEdge - topEdge;
      const height = Math.min(naturalHeight, maxHeight);
      const top = clamp(opensAbove ? rect.top - gap - height : rect.bottom + gap, topEdge, bottomEdge - height);

      const prefersEnd = this.getAttribute("align") === "end";
      const start = rect.left;
      const end = rect.right - width;
      const fits = value => value >= leftEdge && value + width <= rightEdge;
      let alignment = prefersEnd ? "end" : "start";
      let left = prefersEnd ? end : start;
      const alternative = prefersEnd ? start : end;
      if (!fits(left) && fits(alternative)) {
        left = alternative;
        alignment = prefersEnd ? "start" : "end";
      }
      left = clamp(left, leftEdge, rightEdge - width);

      this.menu.style.setProperty("--dropdown-left", `${left}px`);
      this.menu.style.setProperty("--dropdown-top", `${top}px`);
      this.menu.style.setProperty("--dropdown-max-height", `${maxHeight}px`);
      this.setAttribute("data-placement", opensAbove ? "top" : "bottom");
      this.setAttribute("data-align", alignment);
      this.setAttribute("data-positioned", "");
    }

    close(restoreFocus = false) {
      this.details.open = false;
      this.releaseOpen();
      if (restoreFocus && this.isConnected) this.summary.focus({ preventScroll: true });
    }

    releaseOpen() {
      this.openController?.abort();
      this.openController = null;
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      if (this.positionFrame !== null) cancelAnimationFrame(this.positionFrame);
      this.positionFrame = null;
      if (this.usePopover && this.menu.isConnected) this.menu.hidePopover();
      this.removeAttribute("data-positioned");
      this.removeAttribute("data-placement");
      this.removeAttribute("data-align");
      for (const property of positionProperties) this.menu.style.removeProperty(property);
      if (activeDropdown === this) activeDropdown = null;
    }

    disconnectedCallback() {
      if (!this.controller) return;
      this.controller.abort();
      this.controller = null;
      this.close();
      this.menu.removeAttribute("popover");
      this.removeAttribute("data-enhanced");
    }
  }

  customElements.define(tagName, SiteDropdown);
})();
