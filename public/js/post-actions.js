(() => {
  const tagName = "post-actions";
  if (customElements.get(tagName)) return;

  class PostActions extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      this.addEventListener("click", this.handleClick, { signal: this.controller.signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
    }

    handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[data-copy-markdown], a[data-copy-url]");
      if (!(link instanceof HTMLAnchorElement) || !this.contains(link)) return;

      event.preventDefault();
      void this.copy(link);
    };

    async copy(link) {
      const isMarkdown = link.hasAttribute("data-copy-markdown");

      try {
        let text = link.href;
        if (isMarkdown) {
          const response = await fetch(link.href);
          if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
          text = await response.text();
        }

        await navigator.clipboard.writeText(text);
        const originalText = link.textContent || (isMarkdown ? "Copy Markdown" : "Copy URL");
        link.textContent = isMarkdown ? "Copied Markdown" : "Copied URL";
        window.setTimeout(() => {
          link.textContent = originalText;
        }, 1600);
      } catch {
        if (isMarkdown) window.location.href = link.href;
      }
    }
  }

  customElements.define(tagName, PostActions);
})();
