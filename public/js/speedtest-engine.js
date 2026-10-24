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
  pingIntervalMs: 600,
  latencyBudgetMs: 5000,
  downloadInitial: MIB,
  downloadMaximum: 16 * MIB,
  uploadInitial: 256 * 1024,
  uploadMaximum: 8 * MIB,
  targetRequestSeconds: 0.8,
};
const FETCH_OPTIONS = {
  mode: "cors",
  credentials: "omit",
  cache: "no-store",
  referrerPolicy: "no-referrer",
};

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
  const timer = setTimeout(() => controller.abort(new Error("Cloudflare request timed out.")), timeoutMs);
  try { return await callback(controller.signal); }
  finally { clearTimeout(timer); parent.removeEventListener("abort", onAbort); }
}

function checkResponse(response) {
  if (response.ok) return;
  void response.body?.cancel().catch(() => {});
  const error = new Error(response.status === 429
    ? "Cloudflare is limiting requests. Please wait before trying again."
    : `Cloudflare returned HTTP ${response.status}.`);
  error.httpStatus = response.status;
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
    const response = await request(CLOUDFLARE_TRACE, { ...FETCH_OPTIONS, signal: requestSignal });
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
      const response = await request(`${CLOUDFLARE_DOWNLOAD}?bytes=0&nonce=client-${Date.now()}`, {
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
  signal.addEventListener("abort", onAbort, { once: true });
  let sequence = 0;
  let server = "";
  const report = update => { if (!run.signal.aborted) onUpdate({ ...update, server }); };
  const nonce = () => `${Date.now()}-${sequence++}`;

  async function ping(parent) {
    return requestScope(parent, settings.requestTimeoutMs, async requestSignal => {
      const url = `${CLOUDFLARE_DOWNLOAD}?bytes=0&nonce=${nonce()}`;
      const started = clock();
      const response = await request(url, { ...FETCH_OPTIONS, signal: requestSignal });
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

  async function measure(direction) {
    const phase = new AbortController();
    const stop = () => phase.abort();
    run.signal.addEventListener("abort", stop, { once: true });
    const budget = new PayloadBudget(budgetBytes);
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
      snapshot = { phase: direction, rate, bytes, reservedBytes: budget.used, elapsed,
        loadedLatency: median(loadedPings.slice(-20)), qualified: elapsed >= settings.minimumSeconds,
        final, reason: final ? reason : null };
      report(snapshot);
      return elapsed;
    };

    async function worker() {
      let wanted = direction === "download" ? settings.downloadInitial : settings.uploadInitial;
      let consecutiveFailures = 0;
      try {
        while (!phase.signal.aborted) {
          const size = budget.take(wanted);
          if (!size) return;
          try {
            const began = clock();
            await requestScope(phase.signal, settings.requestTimeoutMs, async requestSignal => {
              if (direction === "download") {
                const response = await request(`${CLOUDFLARE_DOWNLOAD}?bytes=${size}&nonce=${nonce()}`, { ...FETCH_OPTIONS, signal: requestSignal });
                checkResponse(response);
                server = responseHeader(response, "cf-meta-colo", "colo") || server;
                if (!response.body) throw new Error("Streaming downloads are unavailable in this browser.");
                const reader = response.body.getReader();
                let received = 0;
                try {
                  for (;;) {
                    const chunk = await reader.read();
                    if (chunk.done) break;
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
                const response = await request(CLOUDFLARE_UPLOAD, { ...FETCH_OPTIONS, method: "POST", body: payload.subarray(0, size), signal: requestSignal });
                checkResponse(response);
                await response.body?.cancel();
                checkSignal(requestSignal);
                // Count only server-acknowledged payloads, never XHR upload
                // progress (which may merely describe a local proxy buffer).
                bytes += size;
              }
            });
            consecutiveFailures = 0;
            const seconds = Math.max(0.001, (clock() - began) / 1000);
            const maximum = direction === "download" ? settings.downloadMaximum : settings.uploadMaximum;
            wanted = Math.min(maximum, Math.max(64 * 1024, Math.round(size / seconds * settings.targetRequestSeconds)));
          } catch (error) {
            if (phase.signal.aborted) return;
            if (error.httpStatus || ++consecutiveFailures >= 3) throw error;
            wanted = Math.max(64 * 1024, Math.floor(wanted / 2));
            await sleep(300, phase.signal);
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
          try { loadedPings.push(await ping(phase.signal)); }
          catch (error) { if (error.httpStatus) { failure = error; stop(); } }
        }
      } catch { /* The phase owns this task and aborts it on every exit. */ }
    })();
    const deadline = setTimeout(stop, settings.maximumSeconds * 1000);
    report({ phase: direction, rate: null, bytes: 0, elapsed: 0, final: false });
    const workers = Array.from({ length: streams }, worker);
    try {
      while (!phase.signal.aborted) {
        await sleep(settings.sampleMs, phase.signal);
        const elapsed = sample(false);
        if (workersLeft === 0) { reason = "limit"; break; }
        if (isStable(estimates, elapsed, settings)) { reason = "stable"; break; }
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
    if (failure) throw failure;
    if (bytes === 0) throw new Error(`No ${direction} data was confirmed. Check your connection and try again.`);
    sample(true);
    return snapshot;
  }

  try {
    report({ phase: "latency", latency: null, jitter: null });
    await ping(run.signal); // Warm up the connection; exclude DNS/TLS setup.
    const points = [];
    const began = clock();
    while (points.length < 10 && (points.length < 3 || clock() - began < Math.min(2000, settings.latencyBudgetMs))) {
      if (clock() - began >= settings.latencyBudgetMs) break;
      points.push(await ping(run.signal));
      report({ phase: "latency", latency: median(points), jitter: jitter(points) });
    }
    const download = await measure("download");
    checkSignal(run.signal);
    const upload = await measure("upload");
    return { latency: median(points), jitter: jitter(points), server, download, upload };
  } finally {
    run.abort();
    signal.removeEventListener("abort", onAbort);
  }
}
