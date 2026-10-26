// Shared with Now Playing: overflow-only, constant-speed, sequential marquees.
export class MarqueeController {
  constructor(root, host = root, { preserveUpdates = false } = {}) {
    this.root = root;
    this.host = host;
    this.preserveUpdates = preserveUpdates;
    this.frame = null;
    this.queue = [];
    this.active = null;
    this.schedule = () => {
      if (!this.controller || this.frame !== null) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        if (this.controller && this.host.isConnected) this.measure();
      });
    };
  }

  connect() {
    if (this.controller) return;
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motion.addEventListener("change", this.schedule);
    this.items = [...this.root.querySelectorAll("[data-marquee]")].map(element => ({
      element, lane: element.querySelector("[data-marquee-lane]"),
      source: element.querySelector("[data-marquee-source]"), clone: element.querySelector("[data-marquee-clone]"),
      signature: null, distance: 0,
    })).filter(item => item.lane && item.source && item.clone);
    this.root.addEventListener("animationend", event => {
      const current = this.active;
      if (!current || event.target !== current.lane || this.motion.matches) return;
      const next = (this.queue.indexOf(current) + 1) % this.queue.length;
      current.element.removeAttribute("data-scrolling");
      this.active = null;
      this.start(this.queue[next]);
    }, options);
    this.root.addEventListener("toggle", this.schedule, { ...options, capture: true });
    document.addEventListener("visibilitychange", () => this.syncVisibility(), options);
    if (typeof ResizeObserver === "function") {
      this.observer = new ResizeObserver(this.schedule);
      for (const item of this.items) {
        this.observer.observe(item.element);
        this.observer.observe(item.source);
      }
    } else window.addEventListener("resize", this.schedule, options);
    if (typeof IntersectionObserver === "function") {
      this.viewport = new IntersectionObserver(entries => {
        this.offscreen = !entries[0]?.isIntersecting;
        this.syncVisibility();
      });
      this.viewport.observe(this.host);
    }
    document.fonts?.ready.then(this.schedule);
    this.syncVisibility();
    this.schedule();
  }

  syncVisibility() {
    const paused = document.visibilityState !== "visible" || this.offscreen;
    for (const item of this.items || []) item.element.toggleAttribute("data-marquee-paused", !!paused);
    if (!paused) this.schedule();
  }

  measure() {
    let changed = false;
    // Full snapshots can add/remove probe and interface rows after connect.
    // Retain existing turns while observing any newly introduced text fields.
    const elements = [...this.root.querySelectorAll("[data-marquee]")];
    if (elements.length !== this.items.length || elements.some((element, index) => element !== this.items[index]?.element)) {
      const previous = new Map(this.items.map(item => [item.element, item]));
      this.items = elements.map(element => {
        const existing = previous.get(element);
        if (existing) { previous.delete(element); return existing; }
        const item = { element, lane: element.querySelector("[data-marquee-lane]"),
          source: element.querySelector("[data-marquee-source]"), clone: element.querySelector("[data-marquee-clone]"),
          signature: null, distance: 0 };
        if (item.source) { this.observer?.observe(element); this.observer?.observe(item.source); }
        return item;
      }).filter(item => item.lane && item.source && item.clone);
      for (const item of previous.values()) {
        this.observer?.unobserve(item.element);
        this.observer?.unobserve(item.source);
        item.element.removeAttribute("data-scrolling");
      }
      changed = true;
    }
    for (const item of this.items) {
      const { element, lane, source, clone } = item;
      const text = source.textContent;
      if (element.title !== text) { element.title = text; element.scrollLeft = 0; }
      const available = element.clientWidth;
      const width = source.getBoundingClientRect().width;
      const overflowing = available > 0 && width > available + 1;
      const scrolling = !this.motion.matches && overflowing;
      element.tabIndex = overflowing ? 0 : -1;
      const gap = scrolling ? parseFloat(getComputedStyle(lane).columnGap) || 0 : 0;
      const distance = scrolling ? width + gap : 0;
      const signature = JSON.stringify([text, distance]);
      if (signature === item.signature) continue;
      changed = true;
      item.signature = signature;
      item.distance = distance;
      clone.hidden = !scrolling;
      clone.textContent = scrolling ? text : "";
      if (scrolling) {
        lane.style.setProperty("--marquee-distance", `${distance}px`);
        lane.style.setProperty("--marquee-duration", `${distance / 24}s`);
      } else {
        lane.style.removeProperty("--marquee-distance");
        lane.style.removeProperty("--marquee-duration");
      }
    }
    this.queue = this.items.filter(item => item.distance > 0);
    // Live numeric readings may change every second. Keep their current turn
    // running rather than repeatedly restarting the initial reading delay.
    if (changed && (!this.preserveUpdates || !this.queue.includes(this.active))) this.reset();
    if (!this.active) this.start(this.queue[0]);
  }

  reset() {
    for (const item of this.items || []) item.element.removeAttribute("data-scrolling");
    this.active = null;
  }

  start(item) {
    if (!item || !this.controller || !this.host.isConnected || this.motion.matches) return;
    this.active = item;
    void item.lane.offsetWidth;
    item.element.setAttribute("data-scrolling", "");
  }

  disconnect() {
    this.controller?.abort();
    this.controller = null;
    this.motion?.removeEventListener("change", this.schedule);
    this.observer?.disconnect();
    this.viewport?.disconnect();
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.reset();
    this.queue = [];
  }
}

export function createMarquee() {
  const root = document.createElement("span");
  root.className = "vps-marquee";
  root.setAttribute("data-marquee", "");
  const lane = document.createElement("span");
  lane.setAttribute("data-marquee-lane", "");
  const source = document.createElement("span");
  source.setAttribute("data-marquee-source", "");
  const clone = document.createElement("span");
  clone.setAttribute("data-marquee-clone", "");
  clone.setAttribute("aria-hidden", "true");
  clone.hidden = true;
  lane.append(source, clone);
  root.append(lane);
  return { root, source };
}
