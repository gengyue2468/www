(() => {
  const tagName = "image-viewer";
  if (customElements.get(tagName)) return;

  // A single, lazily created native dialog serves every image on the page.
  let dialog;
  let enlargedImage;
  let trigger;

  function getDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "image-viewer-dialog";
    dialog.setAttribute("aria-label", "图片查看器");
    enlargedImage = document.createElement("img");
    enlargedImage.decoding = "async";
    dialog.append(enlargedImage);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const { left, right, top, bottom } = dialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      enlargedImage.removeAttribute("src");
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      trigger = null;
    });
    document.body.append(dialog);
    return dialog;
  }

  class ImageViewer extends HTMLElement {
    connectedCallback() {
      if (this.controller || typeof HTMLDialogElement === "undefined"
        || typeof HTMLDialogElement.prototype.showModal !== "function") return;
      this.link = this.querySelector(":scope > a.image-viewer-link");
      const image = this.link?.querySelector("img");
      if (!image) return;
      this.controller = new AbortController();
      this.link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const viewer = getDialog();
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt;
        try {
          if (!viewer.open) viewer.showModal();
          trigger = this.link;
          event.preventDefault();
        } catch {
          // Keep the native original-image link if a modal cannot be opened.
          enlargedImage.removeAttribute("src");
        }
      }, { signal: this.controller.signal });
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      if (trigger === this.link) dialog?.close();
    }
  }

  customElements.define(tagName, ImageViewer);
})();
