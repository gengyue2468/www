import type { DateConfig } from "../types.js";
import config from "../config.js";

export function parseCalendarDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return undefined;
  return date;
}

export function formatDate(
  dateString: string | undefined,
  dateConfig: DateConfig = config.date
): string {
  if (!dateString) return "";
  const date = parseCalendarDate(dateString) || new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateString}`);
    return "";
  }
  const options = { ...dateConfig.options, timeZone: "UTC" } satisfies Intl.DateTimeFormatOptions;
  return date.toLocaleDateString(dateConfig.locale, options);
}
