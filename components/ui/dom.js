// Shared lightweight DOM and interactive UI helpers for client components.

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Populate a <site-dropdown> menu with mutually-exclusive choice buttons
 * and keep the trigger label and aria-pressed state synchronized.
 */
export function bindDropdownChoices(root, { menuSelector, labelSelector, choices, value, signal, onChange }) {
  const menu = root.querySelector(menuSelector);
  const label = labelSelector ? root.querySelector(labelSelector) : null;
  if (!menu) return;

  let current = value;
  const setLabel = text => {
    if (label && label.textContent !== text) label.textContent = text;
  };
  const initial = choices.find(([key]) => key === current);
  if (initial) setLabel(initial[1]);

  menu.replaceChildren(...choices.map(([key, text]) => {
    const button = el("button", "", text);
    button.type = "button";
    button.dataset.value = key;
    button.setAttribute("aria-pressed", String(key === current));
    button.addEventListener("click", () => {
      current = key;
      setLabel(text);
      for (const option of menu.querySelectorAll("button")) {
        option.setAttribute("aria-pressed", String(option.dataset.value === key));
      }
      menu.closest("details")?.removeAttribute("open");
      onChange?.(key, text);
    }, signal ? { signal } : undefined);
    return button;
  }));
}
