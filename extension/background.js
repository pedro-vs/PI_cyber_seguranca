/* global browser, PrivacyLens */
"use strict";
const P = PrivacyLens, pages = new Map();
const cookieHistory = P.createCookieHistory();
const cookieDiagnostics = P.createCookieDiagnostics();
const cookieIngress = [];
let cookieIngressDropped = 0;
let cookieTasks = Promise.resolve(), cookieProcessingErrors = 0;
let resolveDomain, startupError = null, readyStatus = "pending";
const ready = fetch(browser.runtime.getURL("vendor/public_suffix_list.dat"))
  .then(r => { if (!r.ok) throw new Error("Não foi possível ler a Public Suffix List"); return r.text(); })
  .then(text => { resolveDomain = P.createDomainResolver(text); readyStatus = "ready"; })
  .catch(error => { startupError = error.message; readyStatus = "error"; });
// Listeners de rede precisam existir antes da leitura assíncrona da PSL.
installObservers();

function stateFor(tabId, url, requestId = null, timestamp) {
  const reduced = P.safeUrl(url);
  const state = P.newPage(tabId, reduced.url, requestId, timestamp);
  state.pageQueryKeys = reduced.queryKeys;
  state.tracking = P.newTrackingPage(state, pages.get(tabId));
  state.cookieBaseline = cookieHistory.before(state.startedAt);
  cookieDiagnostics.navigation(state, Date.now());
  pages.set(tabId, state);
  state.storeStatus = "pending";
  state.storeReady = browser.tabs.get(tabId).then(tab => {
    state.storeId = tab.cookieStoreId; state.storeStatus = state.storeId ? "ready" : "unavailable";
  }).catch(() => { state.storeStatus = "error"; });
  // Firefox pode entregar onChanged antes de onBeforeRequest, mesmo quando o
  // timestamp original da requisição é anterior ao evento. Reavalia só eventos
  // reais já recebidos, na mesma janela, contra o host do novo main_frame.
  for (const receipt of cookieIngress) {
    const {event, trace} = receipt;
    if (!P.inCookieWindow(state, event.at)) continue;
    const context = contextFor(state, event.at), decision = cookieDiagnostics.decision(trace, state, context, "navigation-start-replay", Date.now());
    correlateCookieEvent(receipt, [{state, context, decision}]);
  }
  return state;
}

function contextFor(state, at = Infinity) {
  const hostEvidence = [...state.hostFirstSeen.values()].filter(h => h.at <= at);
  const hosts = new Set(hostEvidence.map(h => h.host));
  // Inventário continua abrangendo os frames atuais. Correlação usa somente
  // hosts com início de requisição comprovado até o horário original do evento.
  if (at === Infinity) for (const host of [P.host(state.topUrl), ...[...state.frames.values()].map(f => P.host(f.origin))]) {
    if (host) hosts.add(host);
  }
  return {topUrl:state.topUrl, storeId:state.storeId, hosts, hostEvidence};
}

function replayCookieHost(state, host) {
  const evidence = state.hostFirstSeen.get(host);
  if (!evidence) return;
  for (const receipt of cookieIngress) {
    const {event, trace, countedStates} = receipt, domain = P.normalizeHost(event.domain);
    if (countedStates.has(state) || !P.inCookieWindow(state, event.at) || evidence.at > event.at) continue;
    if (!(event.hostOnly ? host === domain : host === domain || host.endsWith(`.${domain}`))) continue;
    const context = contextFor(state, event.at);
    const decision = cookieDiagnostics.decision(trace, state, context, "host-request-replay", Date.now());
    correlateCookieEvent(receipt, [{state, context, decision}]);
  }
}

function installObservers() {
  browser.webRequest.onBeforeRequest.addListener(d => {
    if (d.tabId < 0) return;
    let state = pages.get(d.tabId);
    if (d.type === "main_frame") {
      if (!state || state.navigationRequestId !== d.requestId) state = stateFor(d.tabId, d.url, d.requestId, d.timeStamp);
      const reduced = P.safeUrl(d.url);
      state.topUrl = reduced.url; state.pageQueryKeys = reduced.queryKeys;
    }
    if (!state) return; // A página precisa ser recarregada após instalar.
    P.observeTrackingRequest(state.tracking, d);
    const host = P.host(d.url), previous = state.hostFirstSeen.get(host);
    P.recordRequest(state, d);
    if (state.hostFirstSeen.get(host) !== previous) replayCookieHost(state, host);
  }, {urls: ["<all_urls>"]});

  browser.webRequest.onHeadersReceived.addListener(d => {
    const state = pages.get(d.tabId), req = state?.latestRequest.get(d.requestId);
    if (!req || req.at > d.timeStamp) return;
    req.statusCode = d.statusCode;
    for (const header of d.responseHeaders || []) {
      if (header.name.toLowerCase() !== "set-cookie") continue;
      // Firefox pode reunir vários campos Set-Cookie separados por newline.
      for (const line of (header.value || "").split(/\r?\n/)) {
        const attempt = P.setCookieAttempt(line, d);
        if (!attempt) continue;
        if (state.setCookies.length >= 2000) { state.droppedCookieHeaders++; continue; }
        state.setCookies.push(attempt);
      }
    }
  }, {urls: ["<all_urls>"]}, ["responseHeaders"]);

  browser.webRequest.onBeforeRedirect.addListener(d => {
    const state = pages.get(d.tabId), req = state?.latestRequest.get(d.requestId);
    if (!req || req.at > d.timeStamp) return;
    req.status = "redirect"; req.redirectTo = P.safeUrl(d.redirectUrl).url;
    req.statusCode = d.statusCode;
    P.observeTrackingRedirect(state.tracking, d);
  }, {urls: ["<all_urls>"]});

  browser.webRequest.onCompleted.addListener(d => finishRequest(d, "completed"), {urls: ["<all_urls>"]});
  browser.webRequest.onErrorOccurred.addListener(d => finishRequest(d, "error"), {urls: ["<all_urls>"]});

  browser.cookies.onChanged.addListener(receiveCookieChange);
  cookieDiagnostics.registered(Date.now());
}

function receiveCookieChange(change) {
  const at = Date.now();
  // Entrada registrada antes da janela, dos filtros e de qualquer espera assíncrona.
  const trace = cookieDiagnostics.receive(change, at, readyStatus), candidates = [];
  try {
    for (const state of pages.values()) {
      const context = contextFor(state, at), decision = cookieDiagnostics.decision(trace, state, context);
      const reason = P.cookieWindowReason(state, at);
      if (reason) Object.assign(decision, {status:"discarded", reason});
      else candidates.push({state, context, decision});
    }
    // A cópia já sanitizada evita reter o valor no trabalho assíncrono.
    const event = cookieHistory.change({cookie:trace.cookie, removed:trace.removed, cause:trace.cause}, at);
    const receipt = {event, trace, countedStates:new WeakSet()};
    while (cookieIngress.length && cookieIngress[0].event.at < at - P.COOKIE_WINDOW_MS) cookieIngress.shift();
    cookieIngress.push(receipt);
    if (cookieIngress.length > 2000) { cookieIngress.shift(); cookieIngressDropped++; }
    correlateCookieEvent(receipt, candidates);
  } catch {
    cookieProcessingErrors++; trace.error = "synchronous-processing-error";
    for (const {decision} of candidates) if (decision.status === "pending") Object.assign(decision, {status:"discarded",reason:trace.error});
  }
}

function correlateCookieEvent({event, countedStates}, candidates) {
  cookieTasks = cookieTasks.then(async () => {
      await ready;
      await Promise.all(candidates.map(({state}) => state.storeReady));
      const matches = candidates.filter(({state, context, decision}) => {
        if (countedStates.has(state)) {
          Object.assign(decision, {status:"duplicate", reason:"already-counted"});
          return false;
        }
        context.storeId = state.storeId;
        Object.assign(decision, {storeIdAfterWait:state.storeId, storeStatusAfterWait:state.storeStatus,
          sameNavigation:pages.get(state.tabId) === state, processedAt:Date.now(), readyAfterWait:readyStatus});
        const reason = startupError ? "resolver-unavailable" : pages.get(state.tabId) !== state ? "navigation-replaced" :
          !state.storeId ? "store-unavailable" : P.cookieMatchReason(event, context, resolveDomain);
        if (reason) Object.assign(decision, {status:"discarded", reason});
        return !reason;
      });
      for (const {state, context, decision} of matches) {
        const associated = P.recordCookieEvent(state, event, context, resolveDomain, matches.length);
        countedStates.add(state);
        Object.assign(decision, {status:associated ? "associated" : "discarded", reason:associated ? null : "event-detail-limit"});
      }
    }).catch(() => {
      cookieProcessingErrors++;
      for (const {decision} of candidates) if (decision.status === "pending") Object.assign(decision, {status:"discarded",reason:"processing-error"});
    });
}

function finishRequest(d, status) {
  const req = pages.get(d.tabId)?.latestRequest.get(d.requestId);
  if (!req || req.at > d.timeStamp) return;
  Object.assign(req, {status, finishedAt:d.timeStamp, statusCode: d.statusCode ?? req.statusCode ?? null,
    error: d.error || null, fromCache: d.fromCache ?? null});
}

browser.tabs.onRemoved.addListener(tabId => pages.delete(tabId));
browser.webNavigation.onCommitted.addListener(d => {
  const state = pages.get(d.tabId);
  if (!state) return;
  if (d.frameId === 0) {
    if (!P.isWeb(d.url)) { pages.delete(d.tabId); return; }
    P.commitTrackingNavigation(state.tracking, d);
    const reduced = P.safeUrl(d.url);
    state.topUrl = reduced.url; state.pageQueryKeys = reduced.queryKeys;
    state.frames.clear();
    state.canvasFrames.clear();
  } else { state.frames.delete(d.frameId); state.canvasFrames.delete(d.frameId); }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (!message || sender.id !== browser.runtime.id) return undefined;
  if (message.type === "storage-snapshot" && sender.tab) return receiveStorage(message, sender);
  if (message.type === "canvas-snapshot" && sender.tab) return receiveCanvas(message, sender);
  // Somente páginas internas podem solicitar inventários completos da aba.
  if (sender.tab && !sender.url?.startsWith(browser.runtime.getURL(""))) return undefined;
  if (message.type === "report" && Number.isInteger(message.tabId)) return report(message.tabId, message.refresh);
  return undefined;
});

async function receiveCanvas(message, sender) {
  await ready;
  const state = pages.get(sender.tab.id);
  if (!state || !P.isWeb(sender.url) || !Number.isFinite(message.timeOrigin) ||
    message.timeOrigin < state.startedAt - 100 || !Number.isInteger(message.sequence)) return;
  const observation = message.observation, instrumentation = message.instrumentation;
  if (!observation || observation.ruleVersion !== "canvas-sequence-v1" || !instrumentation ||
    !Array.isArray(observation.samples) || observation.samples.length > 40 ||
    !Array.isArray(observation.canvases) || observation.canvases.length > 100) return;
  let frame;
  try { frame = await browser.webNavigation.getFrame({tabId:sender.tab.id,frameId:sender.frameId}); } catch { return; }
  if (!frame || frame.url !== sender.url || pages.get(sender.tab.id) !== state) return;
  const previous = state.canvasFrames.get(sender.frameId);
  if (previous?.timeOrigin === message.timeOrigin && previous.sequence >= message.sequence) return;
  state.canvasFrames.set(sender.frameId, {frameId:sender.frameId, origin:new URL(sender.url).origin,
    url:P.safeUrl(sender.url).url, timeOrigin:message.timeOrigin, sequence:message.sequence,
    at:Date.now(), observation, instrumentation});
}

async function receiveStorage(message, sender) {
  await ready;
  const state = pages.get(sender.tab.id);
  if (!state || !P.isWeb(sender.url) || message.timeOrigin < state.startedAt - 100) return;
  // Confere se o frame ainda corresponde ao documento que enviou a coleta.
  let frame;
  try { frame = await browser.webNavigation.getFrame({tabId: sender.tab.id, frameId: sender.frameId}); } catch { return; }
  if (!frame || frame.url !== sender.url || pages.get(sender.tab.id) !== state) return;
  state.frames.set(sender.frameId, {frameId: sender.frameId, origin: new URL(sender.url).origin,
    topOrigin:new URL(state.topUrl).origin,
    at: Date.now(), localStorage: message.localStorage, sessionStorage: message.sessionStorage,
    indexedDB: message.indexedDB});
}

async function collectCookies(state) {
  await state.storeReady;
  await cookieTasks;
  const context = contextFor(state), results = new Map(), errors = [];
  const requestedRevision = cookieHistory.revision;
  const domains = [...new Set([...context.hosts].map(resolveDomain))];
  // Domínios observados e cookie store da aba; não consulta todo o perfil.
  if (!context.storeId) errors.push("Cookie store indisponível: inventário não consultado.");
  await Promise.all((context.storeId ? domains.slice(0, 256) : []).map(async domain => {
    try {
      const found = await browser.cookies.getAll({domain, storeId: context.storeId,
        firstPartyDomain: null, partitionKey: {}});
      for (const cookie of found) {
        if (P.cookieMatches(cookie, context, resolveDomain)) results.set(P.cookieKey(cookie), P.cookieMetadata(cookie));
      }
    } catch { errors.push(`${domain}: inventário indisponível`); }
  }));
  if (domains.length > 256) errors.push("Inventário limitado aos primeiros 256 sites observados.");
  cookieHistory.inventory([...results.values()], Date.now(), requestedRevision);
  await cookieTasks;
  const summary = P.summarizeCookies(state, [...results.values()], context, resolveDomain);
  return {...summary, errors,
    diagnostics:cookieDiagnostics.report(state, context, summary, browser.cookies.onChanged.hasListener(receiveCookieChange), readyStatus),
    historyDropped: cookieHistory.dropped, ingressDropped:cookieIngressDropped, processingErrors: cookieProcessingErrors,
    inventoryChangedDuringQuery: requestedRevision !== cookieHistory.revision};
}

async function report(tabId, refresh) {
  await ready;
  if (startupError) return {error: startupError};
  const tab = await browser.tabs.get(tabId);
  if (!P.isWeb(tab.url)) return {error: "Abra uma página HTTP ou HTTPS. Páginas internas do Firefox não são monitoradas."};
  let state = pages.get(tabId);
  if (!state) state = stateFor(tabId, tab.url);
  state.storeId = tab.cookieStoreId;
  if (refresh) {
    const frames = await browser.webNavigation.getAllFrames({tabId}).catch(() => null);
    const activeIds = new Set((frames || []).map(frame => frame.frameId));
    state.activeFrameIds = frames === null ? null : activeIds;
    for (const id of state.canvasFrames.keys()) if (!activeIds.has(id)) state.canvasFrames.delete(id);
    await Promise.all((frames || []).flatMap(frame => ["collect-storage", "collect-canvas"].map(type =>
      browser.tabs.sendMessage(tabId, {type}, {frameId:frame.frameId}).catch(() => {}))));
  }
  const cookies = await collectCookies(state);
  let advancedTracking;
  if (!state.tracking) advancedTracking = P.unavailableTrackingReport("state-missing");
  else {
    try { advancedTracking = P.normalizeTrackingReport(await P.summarizeTracking(state.tracking, resolveDomain)); }
    catch {
      // Preserva as outras medições, mas não transforma falha do detector em zero.
      // Não exporta a exceção bruta: ela pode conter URLs ou identificadores.
      advancedTracking = P.unavailableTrackingReport("collection-failed");
    }
  }
  if (pages.get(tabId) !== state) return {error: "A página mudou durante a coleta. Clique em Atualizar."};
  const network = P.summarizeNetwork(state, resolveDomain);
  return {schemaVersion: 3, extensionVersion: browser.runtime.getManifest().version,
    generatedAt: new Date().toISOString(), browser: await browser.runtime.getBrowserInfo(),
    page: {...P.safeUrl(state.topUrl), queryKeys:state.pageQueryKeys || [],
      site: resolveDomain(P.host(state.topUrl)), startedAt: state.startedAt},
    network: {...network, requests: state.requests.map(r => ({...r, party: P.party(r.host, P.host(state.topUrl), resolveDomain)}))},
    cookies, advancedTracking,
    storage: [...state.frames.values()].map(frame => ({...frame,
      party:P.party(P.host(frame.origin), P.host(frame.topOrigin || state.topUrl), resolveDomain),
      context:frame.frameId === 0 ? "top-level" : "embedded",
      activeAtRefresh:state.activeFrameIds?.has(frame.frameId) ?? null,
      partitioning:"not-established-by-snapshot"})), canvas:P.summarizeCanvas([...state.canvasFrames.values()]),
    score: {status: "not-implemented", value: null},
    coverage: {partial: state.partial, droppedRequests: state.droppedRequests, droppedCookieHeaders: state.droppedCookieHeaders,
      droppedCookieWrites: state.droppedCookieWrites,
      storage: "Snapshots por frame HTTP(S); contagem de chaves e de bancos, não de registros IndexedDB.",
      cookies: "Inventário atual; preexistência somente com observação anterior. Eventos em 30s são correlação, não autoria; explicit sem overwrite infere criação. Set-Cookie é tentativa, não aceite. Baseline parcial; consulte eventos e perdas.",
      network: "Requisições observadas não equivalem a conexões TCP, nem confirmam rastreamento.",
      privacy: "Valores de cookies, storage, queries e fragmentos não são exportados. Caminhos e nomes podem ser sensíveis."}};
}
