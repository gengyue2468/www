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
  "preserveUpdates", "syncVisibility", "offscreen",
  "setPlayedAt", "syncProgressClock", "updateProgress", "setProgress", "setPlaybackExtras",
  "renderTrack", "renderUnavailable", "renderedTrackKey", "progressTimer", "progressSample",
  "requestController", "feedbackTimer", "resetButton", "tabController",
  "viewportObserver", "threadObserver", "loadIsso", "observeThread", "bindPostboxes",
  "mountCap", "handleSubmitClick", "enhanceVotes", "sortComments", "updateCount",
  "capLoading", "capLoaded", "schedulePosition", "positionMenu", "releaseOpen",
  "openController", "positionFrame", "usePopover", "mediaChange",
  "scheduleRefresh", "refreshTimer", "renderOverview", "renderNotices", "renderMonitor",
  "incidentCurrent", "incidentPages", "incidentPageIndex", "incidentLoading", "incidentLoaded",
  "incidentRequest", "incidentRetryCursor", "incidentRetryPage", "loadIncidents", "renderIncidents", "moveIncidentPage",
  "setupChoices", "sortKey", "filterKey",
  "mapDialog", "mapRestore", "fleetMarquee", "nodeViews", "streamSource", "fallbackController",
  "reconnectTimer", "ageTimer", "applySnapshot", "connectStream", "loadSnapshot", "closeStream", "setupMapDialog", "setConnection",
  "showMessage", "showTracks", "revealHash", "noteIndex",
  "setupCalendarMedia", "enableCalendar", "disableCalendar", "renderCalendarWeekdays",
  "calendarMonthInRange", "moveCalendar", "loadCalendar", "renderCalendar", "selectDate",
  "clearDateFilter", "resetFeed", "observeNextPage", "renderMarkdown", "renderMemo",
  "calendarMonthLabel", "calendarPrevious", "calendarNext", "calendarWeekdays", "calendarGrid",
  "calendarEnabled", "calendarRequestId", "calendarLoading", "calendarDays", "calendarRange", "calendarError", "calendarRequestController",
  "tagsRoot", "tagsList", "tagsOpen", "tagsDialog", "tagsAll", "tagsMessage", "tagsRetry",
  "tagsLoaded", "tagsLoading", "tagsRequestController", "tagsResizeObserver", "tagsFitFrame", "loadTags", "scheduleTagFit",
  "dateFilter", "filterDate", "filterClear", "selectedDate", "calendarMonth", "calendarCache", "feedGeneration",
  "calendarMedia", "handleCalendarMedia", "calendarController", "calendarGeneration",
  "paginationFrame", "checkScroll",
  "pauseDismiss", "scheduleDismiss",
] as const;

export async function loadClientScriptSource(
  definition: ClientScriptDefinition,
  assets: AssetManifest,
  componentsDir: string,
  minify = false,
): Promise<string> {
  let source = definition.sourcePath
    ? await readFileContent(join(componentsDir, definition.sourcePath))
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
