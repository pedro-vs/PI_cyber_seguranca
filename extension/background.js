/* global browser, PrivacyLens */
"use strict";
const P = PrivacyLens, pages = new Map();
let resolveDomain, startupError = null;
const ready = fetch(browser.runtime.getURL("vendor/public_suffix_list.dat"))
  .then(r => { if (!r.ok) throw new Error("Não foi possível ler a Public Suffix List"); return r.text(); })
  .then(text => { resolveDomain = P.createDomainResolver(text); })
  .catch(error => { startupError = error.message; });
// Listeners de rede precisam existir antes da leitura assíncrona da PSL.
installObservers();

function stateFor(tabId, url, requestId = null, timestamp) {
  const state = P.newPage(tabId, url, requestId, timestamp);
  pages.set(tabId, state);
  state.storeReady = browser.tabs.get(tabId).then(tab => { state.storeId = tab.cookieStoreId; }).catch(() => {});
  return state;
}

function contextFor(state) {
  return {topUrl: state.topUrl, storeId: state.storeId,
    hosts: new Set([P.host(state.topUrl), ...state.requests.map(r => r.host),
      ...[...state.frames.values()].map(f => P.host(f.origin))].filter(Boolean))};
}

function installObservers() {
  browser.webRequest.onBeforeRequest.addListener(d => {
    if (d.tabId < 0) return;
    let state = pages.get(d.tabId);
    if (d.type === "main_frame") {
      if (!state || state.navigationRequestId !== d.requestId) state = stateFor(d.tabId, d.url, d.requestId, d.timeStamp);
      state.topUrl = d.url;
    }
    if (!state) return; // A página precisa ser recarregada após instalar.
    P.recordRequest(state, d);
  }, {urls: ["<all_urls>"]});

  browser.webRequest.onHeadersReceived.addListener(d => {
    const state = pages.get(d.tabId), req = state?.latestRequest.get(d.requestId);
    if (!req || req.at > d.timeStamp) return;
    req.statusCode = d.statusCode;
    for (const header of d.responseHeaders || []) {
      if (header.name.toLowerCase() !== "set-cookie") continue;
      // Firefox pode reunir vários campos Set-Cookie separados por newline.
      for (const line of (header.value || "").split(/\r?\n/)) {
        const equals = line.indexOf("=");
        if (equals < 1) continue;
        if (state.setCookies.length >= 2000) { state.droppedCookieHeaders++; continue; }
        state.setCookies.push({at: d.timeStamp, requestId: d.requestId, host: P.host(d.url),
          url: P.safeUrl(d.url).url, name: line.slice(0, equals).trim()});
      }
    }
  }, {urls: ["<all_urls>"]}, ["responseHeaders"]);

  browser.webRequest.onBeforeRedirect.addListener(d => {
    const state = pages.get(d.tabId), req = state?.latestRequest.get(d.requestId);
    if (!req || req.at > d.timeStamp) return;
    req.status = "redirect"; req.redirectTo = P.safeUrl(d.redirectUrl).url;
    req.statusCode = d.statusCode;
  }, {urls: ["<all_urls>"]});

  browser.webRequest.onCompleted.addListener(d => finishRequest(d, "completed"), {urls: ["<all_urls>"]});
  browser.webRequest.onErrorOccurred.addListener(d => finishRequest(d, "error"), {urls: ["<all_urls>"]});

  browser.cookies.onChanged.addListener(change => {
    if (change.removed) return;
    const metadata = P.cookieMetadata(change.cookie), now = Date.now();
    const candidates = [...pages.values()].filter(state => now >= state.startedAt && now - state.startedAt <= 30000);
    // Aguarda PSL/store sem perder eventos precoces; mantém a navegação candidata.
    ready.then(() => Promise.all(candidates.map(async state => {
      await state.storeReady;
      if (startupError || pages.get(state.tabId) !== state) return;
      // onChanged não contém tabId: correlação temporal, nunca causalidade confirmada.
      if (!P.cookieMatches(metadata, contextFor(state), resolveDomain)) return;
      state.cookieWriteEvents++;
      const key = P.cookieKey(metadata);
      if (state.cookieWrites.has(key) || state.cookieWrites.size < 2000) state.cookieWrites.set(key, {...metadata, at: now, cause: change.cause});
      else state.droppedCookieWrites++;
    }))).catch(() => {});
  });
}

function finishRequest(d, status) {
  const req = pages.get(d.tabId)?.latestRequest.get(d.requestId);
  if (!req || req.at > d.timeStamp) return;
  Object.assign(req, {status, statusCode: d.statusCode ?? req.statusCode ?? null,
    error: d.error || null, fromCache: d.fromCache ?? null});
}

browser.tabs.onRemoved.addListener(tabId => pages.delete(tabId));
browser.webNavigation.onCommitted.addListener(d => {
  const state = pages.get(d.tabId);
  if (!state) return;
  if (d.frameId === 0) {
    if (!P.isWeb(d.url)) { pages.delete(d.tabId); return; }
    state.topUrl = d.url;
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
    at: Date.now(), localStorage: message.localStorage, sessionStorage: message.sessionStorage,
    indexedDB: message.indexedDB});
}

async function collectCookies(state) {
  const context = contextFor(state), results = new Map(), errors = [];
  const domains = [...new Set([...context.hosts].map(resolveDomain))];
  // Domínios observados e cookie store da aba; não consulta todo o perfil.
  await Promise.all(domains.slice(0, 256).map(async domain => {
    try {
      const found = await browser.cookies.getAll({domain, storeId: context.storeId,
        firstPartyDomain: null, partitionKey: {}});
      for (const cookie of found) {
        if (P.cookieMatches(cookie, context, resolveDomain)) results.set(P.cookieKey(cookie), P.cookieMetadata(cookie));
      }
    } catch (error) { errors.push(`${domain}: ${error.message}`); }
  }));
  if (domains.length > 256) errors.push("Inventário limitado aos primeiros 256 sites observados.");
  const items = [...results.values()].map(c => ({...c, party: P.party(P.normalizeHost(c.domain), P.host(state.topUrl), resolveDomain)}));
  return {items, errors, totals: {total: items.length, first: items.filter(c => c.party === "first").length,
    third: items.filter(c => c.party === "third").length, session: items.filter(c => c.session).length,
    persistent: items.filter(c => !c.session).length, partitioned: items.filter(c => c.partitionKey?.topLevelSite).length},
    correlatedWrites: [...state.cookieWrites.values()], correlatedWriteEvents: state.cookieWriteEvents,
    setCookieAttempts: [...state.setCookies], observationWindowMs: 30000};
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
    const frames = await browser.webNavigation.getAllFrames({tabId}).catch(() => []);
    const activeIds = new Set((frames || []).map(frame => frame.frameId));
    for (const id of state.canvasFrames.keys()) if (!activeIds.has(id)) state.canvasFrames.delete(id);
    await Promise.all((frames || []).flatMap(frame => ["collect-storage", "collect-canvas"].map(type =>
      browser.tabs.sendMessage(tabId, {type}, {frameId:frame.frameId}).catch(() => {}))));
  }
  const cookies = await collectCookies(state);
  if (pages.get(tabId) !== state) return {error: "A página mudou durante a coleta. Clique em Atualizar."};
  const network = P.summarizeNetwork(state, resolveDomain);
  return {schemaVersion: 2, extensionVersion: browser.runtime.getManifest().version,
    generatedAt: new Date().toISOString(), browser: await browser.runtime.getBrowserInfo(),
    page: {...P.safeUrl(state.topUrl), site: resolveDomain(P.host(state.topUrl)), startedAt: state.startedAt},
    network: {...network, requests: state.requests.map(r => ({...r, party: P.party(r.host, P.host(state.topUrl), resolveDomain)}))},
    cookies, storage: [...state.frames.values()], canvas:P.summarizeCanvas([...state.canvasFrames.values()]),
    score: {status: "not-implemented", value: null},
    coverage: {partial: state.partial, droppedRequests: state.droppedRequests, droppedCookieHeaders: state.droppedCookieHeaders,
      droppedCookieWrites: state.droppedCookieWrites,
      storage: "Snapshots por frame HTTP(S); contagem de chaves e de bancos, não de registros IndexedDB.",
      cookies: "Inventário atual; gravações correlacionadas em 30s não provam a aba de origem. Set-Cookie é tentativa, não aceite.",
      network: "Requisições observadas não equivalem a conexões TCP, nem confirmam rastreamento.",
      privacy: "Valores de cookies, storage, queries e fragmentos não são exportados. Caminhos e nomes podem ser sensíveis."}};
}
