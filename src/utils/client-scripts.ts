import { join } from "path";
import type { ClientScriptDefinition } from "../extensions/plugin.js";
import type { AssetManifest } from "../types.js";
import { readFileContent } from "./fs.js";
import { minifyHtmlTemplateConstant, minifyJavaScript } from "./minify.js";
import { AppError, ErrorCode } from "./errors.js";

// Only owned implementation details. Never include lifecycle hooks, DOM or
// dataset keys, server response fields, or interfaces used by vendor scripts.
// Apply after bundling so each component and its imports use the same mapping.
const INTERNAL_PROPERTIES = [
  "scheduleMarquees", "updateMarquees", "resetMarqueeCycle", "startMarquee", "advanceMarquee",
  "syncMarqueeVisibility", "marqueeQueue", "activeMarquee", "marqueeFrame", "marqueeDistance",
  "marqueeResizeObserver", "marquees", "motionQuery", "handleMotionChange",
  "setPlayedAt", "syncProgressClock", "updateProgress", "setProgress", "setPlaybackExtras",
  "renderTrack", "renderUnavailable", "progressTimer", "progressSample",
  "requestController", "feedbackTimer", "resetButton", "tabController",
  "viewportObserver", "threadObserver", "loadIsso", "observeThread", "bindPostboxes",
  "mountCap", "handleSubmitClick", "enhanceVotes", "sortComments", "updateCount",
  "capLoading", "capLoaded", "schedulePosition", "positionMenu", "releaseOpen",
  "openController", "positionFrame", "usePopover", "mediaChange",
  "scheduleRefresh", "refreshTimer", "renderOverview", "renderNotices", "renderMonitor",
  "showMessage", "showTracks", "revealHash", "noteIndex",
  "setupCalendarMedia", "enableCalendar", "disableCalendar", "renderCalendarWeekdays",
  "calendarMonthInRange", "moveCalendar", "loadCalendar", "renderCalendar", "selectDate",
  "clearDateFilter", "resetFeed", "observeNextPage", "renderMarkdown", "renderMemo",
  "calendarMonthLabel", "calendarPrevious", "calendarNext", "calendarWeekdays", "calendarGrid",
  "dateFilter", "filterDate", "filterClear", "calendarMonth", "calendarCache", "feedGeneration",
  "calendarMedia", "handleCalendarMedia", "calendarController", "calendarGeneration",
  "paginationFrame", "checkScroll",
] as const;

export async function loadClientScriptSource(
  definition: ClientScriptDefinition,
  assets: AssetManifest,
  publicDir: string,
  minify = false,
): Promise<string> {
  let source = definition.sourcePath
    ? await readFileContent(join(publicDir, definition.sourcePath))
    : await definition.source!(assets);
  source = definition.transform ? await definition.transform(source, assets) : source;
  if (!minify) return source;
  try {
    for (const name of definition.htmlTemplateConstants || []) {
      source = await minifyHtmlTemplateConstant(source, name);
    }
    return minifyJavaScript(source, { internalProperties: INTERNAL_PROPERTIES });
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.BUILD_ERROR, { key: definition.key, sourcePath: definition.sourcePath });
  }
}
