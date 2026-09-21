(() => {
  const tagName = "isso-comments";
  if (customElements.get(tagName)) return;

  const scripts = new Map();

  function loadScript(src, attributes = {}) {
    if (scripts.has(src)) return scripts.get(src);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      for (const [name, value] of Object.entries(attributes)) {
        script.setAttribute(name, value);
      }
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
      document.head.append(script);
    });

    const tracked = promise.catch(error => {
      scripts.delete(src);
      throw error;
    });
    scripts.set(src, tracked);
    return tracked;
  }

  class IssoComments extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;

      this.thread = this.querySelector("#isso-thread");
      if (!this.thread) return;

      this.controller = new AbortController();

      if ("IntersectionObserver" in window) {
        this.viewportObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            this.viewportObserver.disconnect();
            this.loadComments();
          }
        }, { rootMargin: "600px 0px" });
        this.viewportObserver.observe(this);
      } else {
        this.loadComments();
      }
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.viewportObserver?.disconnect();
      this.threadObserver?.disconnect();
      this.controller = null;
      this.viewportObserver = null;
      this.threadObserver = null;
    }

    async loadComments() {
      if (this.loaded || this.loading) return this.loading;

      this.loading = this.loadIsso()
        .then(() => {
          this.loaded = true;
          this.observeThread();
          void this.loadCap();
        })
        .catch(error => {
          console.error("Isso comments could not be loaded:", error);
        })
        .finally(() => {
          this.loading = null;
        });

      return this.loading;
    }

    async loadIsso() {
      const attributes = {
        "data-isso": this.dataset.issoEndpoint,
        "data-isso-css": "false",
        "data-isso-lang": "zh_CN",
        "data-isso-sorting": "newest",
        "data-isso-avatar": "false",
        "data-isso-vote": "true",
        "data-isso-page-author-hashes": this.dataset.issoPageAuthorHashes,
        "data-isso-comment-page-author-suffix-text-zh-cn": "Owner",
      };
      await loadScript(this.dataset.issoScript, attributes);
    }

    observeThread() {
      const options = { signal: this.controller.signal };
      const refresh = () => {
        this.enhanceVotes();
        this.sortComments();
        this.updateCount();
        this.bindPostboxes();
      };

      this.threadObserver = new MutationObserver(refresh);
      this.threadObserver.observe(this.thread, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      this.thread.addEventListener("click", event => this.handleSubmitClick(event), { ...options, capture: true });
      refresh();
    }

    bindPostboxes() {
      if (!this.capLoaded) return;
      this.thread.querySelectorAll(".isso-postbox").forEach(postbox => this.mountCap(postbox));
    }

    async loadCap() {
      if (!this.dataset.capEnabled || this.capLoaded) return;
      if (!this.capLoading) {
        this.capLoading = loadScript(this.dataset.capScript)
          .then(() => {
            this.capLoaded = true;
            this.bindPostboxes();
          })
          .catch(error => {
            console.error("CAP could not be loaded:", error);
          })
          .finally(() => {
            this.capLoading = null;
          });
      }
      return this.capLoading;
    }

    mountCap(postbox) {
      if (postbox.dataset.capMounted === "true") return;
      const textareaWrapper = postbox.querySelector(".isso-textarea-wrapper");
      if (!textareaWrapper) return;
      postbox.dataset.capMounted = "true";

      const gate = document.createElement("div");
      gate.className = "isso-cap-gate";
      gate.dataset.state = "required";
      gate.setAttribute("role", "group");
      gate.setAttribute("aria-label", "发布前人机验证");

      const widget = document.createElement("cap-widget");
      widget.setAttribute("required", "");
      widget.setAttribute("data-cap-api-endpoint", this.dataset.capEndpoint);
      widget.setAttribute("data-cap-disable-haptics", "");
      gate.append(widget);
      textareaWrapper.append(gate);

      widget.addEventListener("solve", () => {
        gate.dataset.state = "solved";
      });
      widget.addEventListener("reset", () => {
        gate.dataset.state = "required";
      });
      widget.addEventListener("error", () => {
        gate.dataset.state = "required";
      });
    }

    handleSubmitClick(event) {
      if (!this.dataset.capEnabled) return;
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "submit") return;

      const postbox = target.closest(".isso-postbox");
      if (!postbox) return;
      const gate = postbox.querySelector(".isso-cap-gate");
      if (gate?.dataset.state === "solved") return;

      event.preventDefault();
      event.stopPropagation();
      void this.loadCap().then(() => {
        postbox.querySelector(".isso-cap-gate")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    enhanceVotes() {
      this.thread.querySelectorAll(".isso-comment-footer").forEach(footer => {
        const score = footer.querySelector(":scope > .isso-votes");
        const upvote = footer.querySelector(":scope > .isso-upvote");
        if (!score || !upvote) return;

        footer.querySelector(":scope > .isso-downvote")?.remove();
        if (upvote.dataset.voteIcon !== "true") {
          upvote.dataset.voteIcon = "true";
          upvote.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" /><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" /></svg>';
        }

        let count = upvote.querySelector(":scope > .isso-vote-count");
        if (!count) {
          count = document.createElement("span");
          count.className = "isso-vote-count";
          upvote.append(count);
        }
        const nextCount = score.textContent?.trim() || "0";
        if (count.textContent !== nextCount) count.textContent = nextCount;
        if (score.getAttribute("aria-hidden") !== "true") score.setAttribute("aria-hidden", "true");
      });
    }

    sortComments() {
      const root = this.thread.querySelector("#isso-root");
      if (!root) return;

      const comments = [...root.children].filter(child => child.classList.contains("isso-comment"));
      const sorted = [...comments].sort((left, right) => {
        const leftTime = Date.parse(left.querySelector(".isso-comment-header time")?.getAttribute("datetime") || "");
        const rightTime = Date.parse(right.querySelector(".isso-comment-header time")?.getAttribute("datetime") || "");
        if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 0;
        return rightTime - leftTime;
      });

      if (sorted.every((comment, index) => comment === comments[index])) return;

      const fragment = document.createDocumentFragment();
      sorted.forEach(comment => fragment.append(comment));
      const anchor = [...root.children].find(child => !child.classList.contains("isso-comment"));
      root.insertBefore(fragment, anchor || null);
    }

    updateCount() {
      const count = this.querySelector(".post-comments-count");
      if (!count) return;
      const nextCount = `${this.thread.querySelectorAll("#isso-root .isso-comment").length} 条`;
      if (count.textContent !== nextCount) count.textContent = nextCount;
    }
  }

  customElements.define(tagName, IssoComments);
})();
