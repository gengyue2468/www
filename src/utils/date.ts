import type { DateConfig } from "../types.js";
import config from "../config.js";

/**
 * Format a date string according to the configured locale and options
 */
export function formatDate(
  dateString: string | undefined,
  dateConfig: DateConfig = config.date
): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(dateConfig.locale, dateConfig.options);
}

/**
 * Format a date string for RSS feed (UTC format)
 */
export function formatDateForRSS(dateString: string | undefined): string {
  if (!dateString) return new Date().toUTCString();
  return new Date(dateString).toUTCString();
}

