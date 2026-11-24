// Shared helper for dispatching global toast notifications.
export function formatErrorDetail(error) {
  if (typeof error === "string") return error.trim();
  if (error instanceof Error) return (error.message || error.name || "").trim();
  return "";
}

export function showToast(message, options = {}) {
  if (typeof message !== "string" || !message.trim()) return;
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function" || typeof CustomEvent !== "function") return;
  const detailText = typeof options.detail === "string" ? options.detail.trim() : "";
  const detail = {
    message: message.trim(),
    detail: detailText || undefined,
    tone: options.tone || "info",
    duration: options.duration,
  };
  if (typeof customElements === "undefined" || !customElements.get("site-toast")) {
    (window.__siteToastQueue ||= []).push(detail);
  }
  window.dispatchEvent(new CustomEvent("site-toast", { detail }));
}

export function notifyError(message, errorOrOptions, options = {}) {
  const isOptions = errorOrOptions && typeof errorOrOptions === "object" && !(errorOrOptions instanceof Error);
  const resolvedOptions = isOptions ? errorOrOptions : { ...options, detail: formatErrorDetail(errorOrOptions) };
  showToast(message, { ...resolvedOptions, tone: "error" });
}
