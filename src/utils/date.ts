import type { DateConfig } from "../types.js";
import config from "../config.js";

export function formatDate(
  dateString: string | undefined,
  dateConfig: DateConfig = config.date
): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}`);
    return "";
  }
  return date.toLocaleDateString(dateConfig.locale, dateConfig.options);
}
