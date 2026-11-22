import { el as element } from "../../ui/dom.js";

const calendarMonthFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});
const calendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const calendarWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function getMonthForNow(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(new Date());
    const year = parts.find(part => part.type === "year")?.value;
    const month = parts.find(part => part.type === "month")?.value;
    if (year && month) return `${year}-${month}`;
  } catch { /* Fall through to local calendar. */ }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const monthDate = month => {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1, 1));
};

export const shiftMonth = (month, amount) => {
  const date = monthDate(month);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const monthOf = date => (typeof date === "string" && datePattern.test(date) ? date.slice(0, 7) : null);
export const validDate = date => typeof date === "string" && datePattern.test(date);
export const validMonth = month => typeof month === "string" && monthPattern.test(month);

export function formatCalendarDate(date) {
  return calendarDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function formatCalendarMonth(month) {
  return calendarMonthFormatter.format(monthDate(month));
}

export function renderWeekdays(container) {
  if (!container || container.childElementCount) return;
  for (let day = 0; day < 7; day += 1) {
    container.append(element("span", "memos-calendar-weekday", calendarWeekdayFormatter.format(new Date(Date.UTC(2021, 7, day + 1)))));
  }
}

export function renderCalendarGrid(grid, { month, days, selectedDate, signal, onSelectDate }) {
  grid.replaceChildren();
  const [year, monthNumber] = month.split("-").map(Number);
  const leading = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const maxCount = Math.max(1, ...Object.values(days || {}));

  // Always fill six weeks, including the adjoining months' muted dates.
  for (let index = 0; index < 42; index += 1) {
    const day = index - leading + 1;
    if (day < 1 || day > daysInMonth) {
      const adjacent = new Date(Date.UTC(year, monthNumber - 1, day));
      const outside = element("span", "memos-calendar-day is-outside-month", String(adjacent.getUTCDate()));
      outside.setAttribute("aria-hidden", "true");
      grid.append(outside);
      continue;
    }
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const count = days?.[date] || 0;
    const dayNode = element(
      count ? "button" : "span",
      `memos-calendar-day${count ? " has-memos" : ""}${selectedDate === date ? " is-selected" : ""}`,
    );
    dayNode.setAttribute("role", "gridcell");
    dayNode.append(element("span", "memos-calendar-day-number", String(day)));
    if (count) {
      dayNode.type = "button";
      dayNode.setAttribute("aria-pressed", String(selectedDate === date));
      dayNode.setAttribute("aria-label", `${calendarDateFormatter.format(new Date(Date.UTC(year, monthNumber - 1, day)))}, ${count} memo${count === 1 ? "" : "s"}`);
      dayNode.title = `${count} memo`;
      dayNode.style.setProperty("--memo-day-shade", `${8 + (24 * count) / maxCount}%`);
      if (signal) dayNode.addEventListener("click", () => onSelectDate(date), { signal });
    } else {
      dayNode.setAttribute("aria-hidden", "true");
    }
    grid.append(dayNode);
  }
}

export function renderTagItems(rawTags) {
  const hash = name => {
    let value = 2166136261;
    for (const char of name) value = Math.imul(value ^ char.codePointAt(0), 16777619);
    return value >>> 0;
  };
  const compare = (a, b) => hash(a.name) - hash(b.name) || a.name.localeCompare(b.name);
  const tags = rawTags.filter(tag => typeof tag?.name === "string" && tag.name.trim() && Number.isInteger(tag.count) && tag.count > 0);
  const top = [...tags].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 32).sort(compare);
  tags.sort(compare);
  const max = Math.max(1, ...tags.map(tag => tag.count));
  const min = Math.min(max, ...tags.map(tag => tag.count));
  const build = tag => {
    const item = element("span", "memos-tag", `#${tag.name}`);
    const weight = max === min ? 0.5 : (Math.log(tag.count) - Math.log(min)) / (Math.log(max) - Math.log(min));
    item.style.setProperty("--tag-size", `${(0.55 + weight * 1.45).toFixed(3)}em`);
    item.title = `${tag.count} ${tag.count === 1 ? "memo" : "memos"}`;
    return item;
  };
  return { count: tags.length, topNodes: top.map(build), allNodes: tags.map(build) };
}

export function fitTagList(list, focusableWhenOverflowing = false) {
  if (!list?.clientWidth) return;
  let low = 0.001;
  let high = 1;
  for (let i = 0; i < 14; i++) {
    const scale = (low + high) / 2;
    list.style.fontSize = `${scale}em`;
    if (list.scrollHeight > list.clientHeight) high = scale;
    else low = scale;
  }
  list.style.fontSize = `${low}em`;
  list.classList.toggle("is-overflowing", list.scrollHeight > list.clientHeight);
  if (list.classList.contains("is-overflowing") && focusableWhenOverflowing) list.tabIndex = 0;
  else list.removeAttribute("tabindex");
}
