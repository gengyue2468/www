// Unified HKT (Asia/Hong_Kong, UTC+8) date and time formatters.
export const HKT_TIME_ZONE = "Asia/Hong_Kong";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: HKT_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateTimeSecondsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: HKT_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: HKT_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDateTime(date) {
  return `${dateTimeFormatter.format(date)} HKT`;
}

export function formatDateTimeSeconds(date) {
  return `${dateTimeSecondsFormatter.format(date)} HKT`;
}

export function formatShortDateTime(date) {
  return `${shortDateTimeFormatter.format(date)} HKT`;
}
