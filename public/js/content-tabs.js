(() => {
  const tagName = "content-tabs";
  if (customElements.get(tagName)) return;

  class ContentTabs extends HTMLElement {
    connectedCallback() {
      if (this.tabController) return;

      const list = this.querySelector(":scope > .tab-list");
      if (!list) return;

      const tabs = Array.from(list.children).filter(item =>
        item instanceof HTMLButtonElement && item.getAttribute("role") === "tab"
      );
      const panels = new Map(
        Array.from(this.querySelectorAll(":scope > .tab-panels > [role='tabpanel']"))
          .map(panel => [panel.id, panel])
      );
      if (tabs.length === 0) return;

      const activate = (tab, moveFocus = false) => {
        for (const item of tabs) {
          const selected = item === tab;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          const panel = panels.get(item.getAttribute("aria-controls") || "");
          if (panel) panel.hidden = !selected;
        }
        if (moveFocus) tab.focus();
      };

      const selected = tabs.find(tab => tab.getAttribute("aria-selected") === "true") || tabs[0];
      activate(selected);

      this.tabController = new AbortController();
      const options = { signal: this.tabController.signal };

      list.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const tab = target.closest("[role='tab']");
        if (tab instanceof HTMLButtonElement && tabs.includes(tab)) activate(tab);
      }, options);

      list.addEventListener("keydown", event => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement) || !tabs.includes(target)) return;

        const index = tabs.indexOf(target);
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
        else if (event.key === "Home") next = tabs[0];
        else if (event.key === "End") next = tabs[tabs.length - 1];

        if (next) {
          event.preventDefault();
          activate(next, true);
        }
      }, options);
    }

    disconnectedCallback() {
      this.tabController?.abort();
      this.tabController = null;
    }
  }

  customElements.define(tagName, ContentTabs);
})();
