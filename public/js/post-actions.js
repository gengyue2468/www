document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a[data-copy-markdown], a[data-copy-url]");
  if (!(link instanceof HTMLAnchorElement)) return;

  event.preventDefault();
  const isMarkdown = link.hasAttribute("data-copy-markdown");

  void (async () => {
    try {
      const text = isMarkdown
        ? await (async () => {
            const response = await fetch(link.href);
            if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
            return response.text();
          })()
        : link.href;
      await navigator.clipboard.writeText(text);

      const originalText = link.textContent || (isMarkdown ? "Copy Markdown" : "Copy URL");
      link.textContent = isMarkdown ? "Copied Markdown" : "Copied URL";
      window.setTimeout(() => {
        link.textContent = originalText;
      }, 1600);
    } catch {
      if (isMarkdown) window.location.href = link.href;
    }
  })();
});
