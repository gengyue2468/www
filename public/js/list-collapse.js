(() => {
  const tagName = "list-collapse";
  if (customElements.get(tagName)) return;
  let nextId = 0;

  class ListCollapse extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      const raw = this.getAttribute("limit");
      const limit = Number(raw);
      if (!/^(0|[1-9]\d*)$/.test(raw || "") || !Number.isSafeInteger(limit)) return;
      this.controller = new AbortController();
      this.groups = [];

      // Only direct lists and direct items: a sublist belongs to its parent item.
      for (const list of this.querySelectorAll(":scope > ul, :scope > ol")) {
        const items = [...list.children].filter(item => item.tagName === "LI" && !item.hidden);
        const overflow = items.slice(limit);
        if (overflow.length === 0) continue;
        let generatedId = null;
        if (!list.id) {
          do { generatedId = `list-collapse-${++nextId}`; } while (document.getElementById(generatedId));
          list.id = generatedId;
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "nav-menu-label post-actions-button list-collapse-toggle";
        button.setAttribute("aria-controls", list.id);
        const group = { list, overflow, button, generatedId, expanded: false };
        const setExpanded = expanded => {
          group.expanded = expanded;
          for (const item of overflow) item.hidden = !expanded;
          button.setAttribute("aria-expanded", String(expanded));
          button.textContent = expanded ? "收起" : `展开剩余 ${overflow.length} 项`;
        };
        group.expand = () => setExpanded(true);
        button.addEventListener("click", () => setExpanded(!group.expanded), { signal: this.controller.signal });
        list.after(button);
        this.groups.push(group);
        setExpanded(false);
      }

      // Anchor navigation should not land on a hidden item.
      this.revealHash = () => {
        let id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
        const target = id && document.getElementById(id);
        if (!target) return;
        let revealed = false;
        for (const group of this.groups) {
          if (!group.expanded && group.overflow.some(item => item.contains(target))) {
            group.expand();
            revealed = true;
          }
        }
        if (revealed) target.scrollIntoView({ block: "nearest" });
      };
      window.addEventListener("hashchange", this.revealHash, { signal: this.controller.signal });
      this.revealHash();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      for (const { list, overflow, button, generatedId } of this.groups || []) {
        for (const item of overflow) item.hidden = false;
        button.remove();
        if (generatedId && list.id === generatedId) list.removeAttribute("id");
      }
      this.groups = [];
    }
  }

  customElements.define(tagName, ListCollapse);
})();
