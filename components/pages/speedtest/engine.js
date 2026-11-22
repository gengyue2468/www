// Browser-to-edge measurements. No backend proxy, analytics submission, or
// background test: the caller explicitly owns each run and its abort signal.
export const CLOUDFLARE_DOWNLOAD = "https://speed.cloudflare.com/__down";
export const CLOUDFLARE_UPLOAD = "https://speed.cloudflare.com/__up";
export const CLOUDFLARE_TRACE = "https://speed.cloudflare.com/cdn-cgi/trace";
export const MIB = 1024 * 1024;

const DEFAULTS = {
  sampleMs: 200,
  warmupSeconds: 1.5,
  minimumSeconds: 7,
  maximumSeconds: 15,
  windowSeconds: 4,
  stableSeconds: 2,
  tolerance: 0.05,
  requestTimeoutMs: 6000,
  pingIntervalMs: 1500,
  idlePingIntervalMs: 400,
  phasePauseMs: 1000,
  streamStaggerMs: 250,
  maxRateLimitRetries: 3,
  latencyBudgetMs: 5000,
  downloadInitial: MIB,
  downloadMaximum: 8 * MIB,
  uploadInitial: 256 * 1024,
  uploadMaximum: 8 * MIB,
  targetRequestSeconds: 2,
};
const FETCH_OPTIONS = {
  mode: "cors",
  credentials: "omit",
  cache: "no-store",
  referrerPolicy: "no-referrer",
};
let cooldownUntil = 0;

export function speedtestCooldownMs() { return Math.max(0, cooldownUntil - Date.now()); }

async function edgeRequest(request, url, options) {
  checkSignal(options.signal);
  if (speedtestCooldownMs()) throw new Error("Cloudflare cooldown is active. Please wait before trying again.");
  return request(url, options);
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function jitter(values) {
  if (values.length < 2) return null;
  return values.slice(1).reduce((sum, value, i) => sum + Math.abs(value - values[i]), 0) / (values.length - 1);
}

// Time-weighted throughput, retaining stalls and request-turnover gaps. Unlike
// deleting slow samples, this does not systematically inflate the result.
export function windowRate(samples, windowSeconds = 4, warmupSeconds = 1.5) {
  if (!samples.length) return 0;
  const end = samples.at(-1).end;
  const start = Math.max(end > warmupSeconds ? warmupSeconds : 0, end - windowSeconds);
  if (end <= start) return 0;
  let bytes = 0;
  for (const sample of samples) {
    const overlap = Math.max(0, Math.min(end, sample.end) - Math.max(start, sample.start));
    if (sample.end > sample.start) bytes += sample.bytes * overlap / (sample.end - sample.start);
  }
  return bytes * 8 / (end - start) / 1e6;
}

export function isStable(estimates, elapsed, settings = DEFAULTS) {
  if (elapsed < settings.minimumSeconds) return false;
  const recent = estimates.filter(point => point.time >= elapsed - settings.stableSeconds);
  const current = recent.at(-1)?.rate || 0;
  return current > 0 && recent.length >= 2
    && recent[0].time <= elapsed - settings.stableSeconds + settings.sampleMs / 1000 * 1.5
    && recent.every(point => Math.abs(point.rate - current) / current <= settings.tolerance);
}

// Reserve the complete body before opening a request. Failed/aborted requests
// are not refunded: retries must not silently exceed the user's payload budget.
export class PayloadBudget {
  constructor(limit) { this.limit = limit; this.used = 0; }
  take(wanted) {
    const bytes = Math.max(0, Math.min(Math.floor(wanted), this.limit - this.used));
    this.used += bytes;
    return bytes;
  }
}

function abortError() { return new DOMException("Test stopped", "AbortError"); }
function checkSignal(signal) { if (signal.aborted) throw signal.reason || abortError(); }
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason || abortError()); return; }
    const onAbort = () => { clearTimeout(timer); reject(signal.reason || abortError()); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function requestScope(parent, timeoutMs, callback) {
  checkSignal(parent);
  const controller = new AbortController();
  const onAbort = () => controller.abort(parent.reason);
  parent.addEventListener("abort", onAbort, { once: true });
  const transfer = typeof timeoutMs === "object" ? timeoutMs : null;
  let timer;
  const arm = (ms, message) => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(new Error(message)), ms);
  };
  arm(transfer?.responseTimeoutMs ?? timeoutMs, transfer ? "Timed out waiting for the server response." : "Cloudflare request timed out.");
  const touch = () => {
    if (transfer && !controller.signal.aborted) arm(transfer.idleTimeoutMs, "Download stalled: no data received before the idle timeout.");
  };
  try { return await callback(controller.signal, touch); }
  catch (error) {
    if (!parent.aborted && controller.signal.aborted) throw controller.signal.reason;
    throw error;
  }
  finally { clearTimeout(timer); parent.removeEventListener("abort", onAbort); }
}

function checkResponse(response) {
  if (response.ok) return;
  void response.body?.cancel().catch(() => {});
  const retryAfter = response.headers.get("retry-after");
  const delay = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter || "") - Date.now();
  const retryMs = Math.max(1000, Number.isFinite(delay) ? delay : 5000);
  const error = new Error(response.status === 429
    ? "Cloudflare is limiting requests. Wait at least a minute before retrying."
    : response.status === 403
      ? "Cloudflare refused this request. Wait before retrying; your IP or route may be blocked."
      : `Cloudflare returned HTTP ${response.status}.`);
  error.httpStatus = response.status;
  error.retryMs = retryMs;
  throw error;
}

function responseHeader(response, ...names) {
  for (const name of names) {
    const value = response.headers.get(name);
    if (value) return value;
  }
  return "";
}

function parseTrace(body) {
  return Object.fromEntries(body.split(/\r?\n/).flatMap(line => {
    const separator = line.indexOf("=");
    return separator > 0 ? [[line.slice(0, separator), line.slice(separator + 1)]] : [];
  }));
}

function entityName(entity) {
  const fields = entity?.vcardArray?.[1];
  const field = Array.isArray(fields) && fields.find(item => item?.[0] === "fn");
  return typeof field?.[3] === "string" ? field[3] : "";
}

function rdapProvider(data) {
  const entities = [];
  const collect = entity => {
    if (!entity || typeof entity !== "object") return;
    entities.push(entity);
    for (const nested of entity.entities || []) collect(nested);
  };
  for (const entity of data?.entities || []) collect(entity);
  const named = entities.map(entity => ({ name: entityName(entity), roles: entity.roles || [] }))
    .filter(entity => entity.name);
  return named.find(entity => /private customer/i.test(entity.name))?.name
    || named.find(entity => entity.roles.includes("registrant"))?.name
    || named.find(entity => entity.roles.includes("administrative"))?.name
    || data?.name
    || "";
}

export async function fetchCloudflareClientInfo({ signal, request = (...args) => fetch(...args) }) {
  checkSignal(signal);
  const trace = await requestScope(signal, 5000, async requestSignal => {
    const response = await edgeRequest(request, CLOUDFLARE_TRACE, { ...FETCH_OPTIONS, signal: requestSignal });
    checkResponse(response);
    return parseTrace(await response.text());
  });
  const info = {
    ip: trace.ip || "",
    colo: trace.colo || "",
    city: "",
    country: trace.loc || "",
    asn: "",
    provider: "",
  };

  // The zero-byte edge response exposes the city, country and ASN alongside
  // the trace's canonical client IP and colo fields.
  try {
    await requestScope(signal, 5000, async requestSignal => {
      const response = await edgeRequest(request, `${CLOUDFLARE_DOWNLOAD}?bytes=0&nonce=client-${Date.now()}`, {
        ...FETCH_OPTIONS,
        signal: requestSignal,
      });
      checkResponse(response);
      info.ip ||= responseHeader(response, "cf-meta-ip", "ip");
      info.colo ||= responseHeader(response, "cf-meta-colo", "colo");
      info.city ||= responseHeader(response, "cf-meta-city", "city");
      info.country ||= responseHeader(response, "cf-meta-country", "country");
      info.asn ||= responseHeader(response, "cf-meta-asn", "asn");
      await response.arrayBuffer();
    });
  } catch (error) {
    if (signal.aborted) throw error;
  }

  // RDAP supplies the human-readable network/registrant name when available;
  // the lookup is best-effort so blocked registry requests never block testing.
  if (info.ip) {
    try {
      const data = await requestScope(signal, 5000, async requestSignal => {
        const response = await request(`https://rdap.org/ip/${encodeURIComponent(info.ip)}`, {
          ...FETCH_OPTIONS,
          signal: requestSignal,
        });
        checkResponse(response);
        return response.json();
      });
      info.provider = rdapProvider(data);
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  info.provider ||= info.asn ? `AS${info.asn}` : "";
  return info;
}

function randomPayload(bytes) {
  const data = new Uint8Array(bytes);
  for (let i = 0; i < data.length; i += 65536) crypto.getRandomValues(data.subarray(i, i + 65536));
  return data;
}

export async function runSpeedTest({ streams = 1, budgetBytes = 256 * MIB, signal, onUpdate = () => {},
  request = (...args) => fetch(...args), clock = () => performance.now(), settings: overrides = {} }) {
  if (![1, 4].includes(streams) || !Number.isSafeInteger(budgetBytes) || budgetBytes <= 0) throw new Error("Invalid test settings.");
  const settings = { ...DEFAULTS, ...overrides };
  const run = new AbortController();
  const onAbort = () => run.abort(signal.reason);
  checkSignal(signal);
  if (speedtestCooldownMs()) throw new Error("Please wait for the cooldown before starting another test.");
  signal.addEventListener("abort", onAbort, { once: true });
  let sequence = 0;
  let server = "";
  let rateLimitRetries = 0;
  // Shared by lanes and retained across 429 phase retries. A successful small
  // request must not immediately ramp back into a size that already failed.
  const policies = Object.fromEntries(["download", "upload"].map(direction => [direction, {
    maximum: direction === "download" ? settings.downloadMaximum : settings.uploadMaximum,
    lanes: streams,
  }]));
  const report = update => { if (!run.signal.aborted) onUpdate({ ...update, server }); };
  const nonce = () => `${Date.now()}-${sequence++}`;

  async function pingOnce(parent) {
    return requestScope(parent, settings.requestTimeoutMs, async requestSignal => {
      const url = `${CLOUDFLARE_DOWNLOAD}?bytes=0&nonce=${nonce()}`;
      let started;
      const response = await edgeRequest((...args) => { started = clock(); return request(...args); }, url, { ...FETCH_OPTIONS, signal: requestSignal });
      checkResponse(response);
      const headersAt = clock();
      server = responseHeader(response, "cf-meta-colo", "colo") || server;
      await response.arrayBuffer();
      const timing = performance.getEntriesByName(url, "resource").at(-1);
      // Resource timing excludes DNS/TLS when the endpoint exposes it. The
      // warmed wall-clock TTFB is a fallback, not an ICMP ping measurement.
      return timing?.requestStart > 0 && timing?.responseStart > 0
        ? timing.responseStart - timing.requestStart : headersAt - started;
    });
  }

  async function waitForRateLimit(error, phase) {
    if (error.httpStatus !== 429 || rateLimitRetries++ >= settings.maxRateLimitRetries) {
      if (error.httpStatus === 429) cooldownUntil = Math.max(cooldownUntil, Date.now() + Math.max(60000, error.retryMs));
      throw error;
    }
    const retryMs = Math.max(error.retryMs, 5000 * 2 ** (rateLimitRetries - 1));
    report({ phase, retrying: true, retryMs });
    await sleep(retryMs, run.signal);
  }

  async function ping(parent) {
    let failures = 0;
    for (;;) {
      try { return await pingOnce(parent); }
      catch (error) {
        checkSignal(parent);
        if (!error.httpStatus || error.httpStatus === 403 || error.httpStatus >= 500) {
          if (++failures >= 3) return null;
          await sleep(500 * failures, parent);
          continue;
        }
        await waitForRateLimit(error, "latency");
      }
    }
  }

  async function measure(direction, budget = new PayloadBudget(budgetBytes), earlierBytes = 0) {
    const policy = policies[direction];
    const phase = new AbortController();
    const stop = () => phase.abort();
    run.signal.addEventListener("abort", stop, { once: true });
    const samples = [];
    const estimates = [];
    const loadedPings = [];
    const started = clock();
    let last = started;
    let bytes = 0;
    let previousBytes = 0;
    let workersLeft = streams;
    let reason = "time";
    let failure = null;
    let lastTransferError = null;
    const recovering = new Set();
    const payload = direction === "upload" ? randomPayload(Math.min(settings.uploadMaximum, budgetBytes)) : null;
    let snapshot;
    const sample = final => {
      const now = clock();
      if (now > last) samples.push({ start: (last - started) / 1000, end: (now - started) / 1000, bytes: bytes - previousBytes });
      previousBytes = bytes;
      last = now;
      const elapsed = (now - started) / 1000;
      const rate = windowRate(samples, settings.windowSeconds, settings.warmupSeconds);
      estimates.push({ time: elapsed, rate });
      snapshot = { phase: direction, rate, bytes: earlierBytes + bytes, reservedBytes: budget.used, elapsed,
        streams: policy.lanes, degraded: policy.lanes < streams,
        loadedLatency: median(loadedPings.slice(-20)), qualified: elapsed >= settings.minimumSeconds && recovering.size === 0,
        final, reason: final ? reason : null };
      report(snapshot);
      return elapsed;
    };

    async function worker(index) {
      let wanted = direction === "download" ? settings.downloadInitial : settings.uploadInitial;
      let consecutiveFailures = 0;
      try {
        if (index) await sleep(index * settings.streamStaggerMs, phase.signal);
        while (!phase.signal.aborted) {
          if (index >= policy.lanes) { recovering.delete(index); return; }
          const size = budget.take(Math.min(wanted, policy.maximum));
          if (!size) return;
          try {
            let began = clock();
            const transferRequest = (...args) => { began = clock(); return request(...args); };
            await requestScope(phase.signal, {
              // Upload acknowledgements arrive after the body is sent. Bound
              // them by the phase deadline rather than a short TTFB timeout.
              responseTimeoutMs: direction === "upload" ? settings.maximumSeconds * 1000 : settings.requestTimeoutMs,
              idleTimeoutMs: settings.requestTimeoutMs,
            }, async (requestSignal, touch) => {
              if (direction === "download") {
                const response = await edgeRequest(transferRequest, `${CLOUDFLARE_DOWNLOAD}?bytes=${size}&nonce=${nonce()}`, { ...FETCH_OPTIONS, signal: requestSignal });
                checkResponse(response);
                touch();
                server = responseHeader(response, "cf-meta-colo", "colo") || server;
                if (!response.body) throw new Error("Streaming downloads are unavailable in this browser.");
                const reader = response.body.getReader();
                let received = 0;
                try {
                  for (;;) {
                    const chunk = await reader.read();
                    if (chunk.done) break;
                    touch();
                    checkSignal(requestSignal);
                    received += chunk.value.byteLength;
                    if (received > size) throw new Error("Cloudflare sent an unexpected download size.");
                    bytes += chunk.value.byteLength;
                  }
                  if (received !== size) throw new Error("Cloudflare download was incomplete.");
                } finally {
                  await reader.cancel().catch(() => {});
                  reader.releaseLock();
                }
              } else {
                const response = await edgeRequest(transferRequest, `${CLOUDFLARE_UPLOAD}?bytes=${size}`, { ...FETCH_OPTIONS, method: "POST", body: payload.subarray(0, size), signal: requestSignal });
                checkResponse(response);
                await response.body?.cancel();
                checkSignal(requestSignal);
                // Count only server-acknowledged payloads, never XHR upload
                // progress (which may merely describe a local proxy buffer).
                bytes += size;
              }
            });
            consecutiveFailures = 0;
            recovering.delete(index);
            const seconds = Math.max(0.001, (clock() - began) / 1000);
            const maximum = policy.maximum;
            // Grow in bounded, power-of-two stages rather than jumping to an
            // arbitrary large body after one quick request. Hold a size once
            // it runs long enough, and shrink when a slow path needs it.
            const target = Math.max(64 * 1024, size / seconds * settings.targetRequestSeconds);
            wanted = Math.min(maximum, wanted * 2, 2 ** Math.ceil(Math.log2(target)));
            // Only pace very short requests at the maximum body size. Do not
            // impose an artificial request-rate ceiling on normal transfers.
            if (wanted === maximum && seconds < 0.1) await sleep(100, phase.signal);
          } catch (error) {
            if (phase.signal.aborted) return;
            const detail = error instanceof TypeError
              ? "Network/CORS failure; the browser did not expose an HTTP status."
              : error.message || "Request failed.";
            const contextual = new Error(`${direction === "download" ? "Download" : "Upload"} (${(size / MIB).toFixed(2)} MiB): ${detail}`, { cause: error });
            contextual.httpStatus = error.httpStatus;
            contextual.retryMs = error.retryMs;
            if (error.httpStatus && error.httpStatus !== 403 && error.httpStatus < 500) throw contextual;
            lastTransferError = contextual;
            recovering.add(index);
            ++consecutiveFailures;
            policy.maximum = Math.min(policy.maximum, Math.max(64 * 1024, Math.floor(size / 2)));
            wanted = Math.min(wanted, policy.maximum);
            if (consecutiveFailures >= 2 && policy.lanes > 1) {
              policy.lanes = Math.max(1, Math.ceil(policy.lanes / 2));
              estimates.length = 0;
            }
            // A rejected request is not a measurement. Retry this lane only,
            // bounded by the existing phase deadline and payload reservations.
            await sleep(Math.min(4000, 1000 * 2 ** (consecutiveFailures - 1)), phase.signal);
          }
        }
      } catch (error) {
        if (!phase.signal.aborted) { failure = error; stop(); }
      } finally { workersLeft--; }
    }

    // Loaded latency is a separate zero-body probe, not a transfer lane.
    const pinger = (async () => {
      try {
        while (!phase.signal.aborted) {
          await sleep(settings.pingIntervalMs, phase.signal);
          try { loadedPings.push(await pingOnce(phase.signal)); }
          catch (error) {
            if (error.httpStatus === 429) { failure = error; stop(); }
            // A missing loaded-latency probe does not invalidate transfers.
          }
        }
      } catch { /* The phase owns this task and aborts it on every exit. */ }
    })();
    const deadline = setTimeout(stop, settings.maximumSeconds * 1000);
    report({ phase: direction, rate: null, bytes: earlierBytes, elapsed: 0, final: false });
    const workers = Array.from({ length: streams }, (_, index) => worker(index));
    try {
      while (!phase.signal.aborted) {
        await sleep(settings.sampleMs, phase.signal);
        const elapsed = sample(false);
        if (workersLeft === 0) { reason = "limit"; break; }
        if (recovering.size === 0 && isStable(estimates, elapsed, settings)) { reason = "stable"; break; }
      }
    } catch (error) {
      if (!phase.signal.aborted) throw error;
    } finally {
      stop();
      clearTimeout(deadline);
      await Promise.allSettled([...workers, pinger]);
      run.signal.removeEventListener("abort", stop);
    }
    checkSignal(run.signal);
    if (failure) {
      // All lanes and probes have been aborted and joined before retrying.
      // Reuse reservations so failed attempts still consume the safety budget;
      // restart the sampling window so backoff never masquerades as bandwidth.
      await waitForRateLimit(failure, direction);
      if (budget.used >= budget.limit) throw new Error("Payload safety limit reached while retrying. Results are incomplete.");
      return measure(direction, budget, earlierBytes + bytes);
    }
    if (bytes === 0) throw lastTransferError || new Error(`No ${direction} data was confirmed before the time limit.`);
    if (recovering.size) reason = "interrupted";
    sample(true);
    return snapshot;
  }

  try {
    report({ phase: "latency", latency: null, jitter: null });
    await ping(run.signal); // Warm up the connection; exclude DNS/TLS setup.
    const points = [];
    const began = clock();
    while (points.length < 5 && (points.length < 3 || clock() - began < Math.min(2000, settings.latencyBudgetMs))) {
      if (clock() - began >= settings.latencyBudgetMs) break;
      await sleep(settings.idlePingIntervalMs, run.signal);
      const latency = await ping(run.signal);
      if (Number.isFinite(latency)) points.push(latency);
      report({ phase: "latency", latency: median(points), jitter: jitter(points) });
    }
    const download = await measure("download");
    checkSignal(run.signal);
    await sleep(settings.phasePauseMs, run.signal);
    const upload = await measure("upload");
    return { latency: median(points), jitter: jitter(points), server, download, upload };
  } finally {
    cooldownUntil = Math.max(cooldownUntil, Date.now() + 10000);
    run.abort();
    signal.removeEventListener("abort", onAbort);
  }
}
