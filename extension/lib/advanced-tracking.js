/* Heurísticas observacionais. Nenhum valor de cookie é lido/comparado aqui. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens, secrets = new WeakMap();
  const LIMITS = {observations:512, parameters:24, valueLength:256, urlLength:16384,
    hashes:4096, hops:32, previousHops:8, findings:128, bounceMs:10000};
  const campaign = /^(utm_(source|medium|campaign|term|content|id)|fb_source)$/i;
  const clickId = /^(fbclid|gclid|dclid|msclkid|twclid|ttclid|yclid)$/i;
  const identifier = /^(uid|user_?id|visitor_?id|device_?id|adid|matchid|cid|gid|bounceUID(localStorage|cookie))$/i;
  const functional = /^(page|p|q|query|search|lang|locale|sort|order|size|limit|offset|v|version|format|callback|cb|cachebust|_|t|ts|timestamp|random|rnd|destination|url|redirect_?uri|redirect_?url|return_?to|code|state|nonce|csrf|token|access_token|password|email|session_?id)$/i;
  const syncPath = /(?:^|\/)(?:cookie[-_]?sync|user[-_]?sync|sync|match)(?:\/|\.|$)/i;
  const nameFor = name => P.queryName(name);
  const safe = value => ({url:P.safeUrl(value).url, host:P.host(value)});
  function highEntropy(value) {
    if (value.length < 16 || value.length > 256 || !/^[a-z0-9_-]+$/i.test(value)) return false;
    const frequencies = new Map();
    for (const char of value) frequencies.set(char, (frequencies.get(char) || 0) + 1);
    const entropy = [...frequencies.values()].reduce((sum, n) => sum - n/value.length * Math.log2(n/value.length), 0);
    return frequencies.size >= 8 && entropy >= 3.3 && /[a-z]/i.test(value) && /[0-9]/.test(value);
  }
  function route(tracking) {
    if (!tracking?.hops.length) return [];
    const incoming = tracking.hops[0].incoming;
    const before = ["client-redirect","client-redirect-inferred"].includes(incoming) ? tracking.previousRoute :
      ["link", "document-initiated"].includes(incoming) ? tracking.previousRoute.slice(-1) : [];
    return [...before, ...tracking.hops];
  }
  P.newTrackingPage = (state, previous, limits = {}) => {
    const cap = {...LIMITS, ...limits};
    if (previous?.tabId !== state.tabId) previous = undefined;
    const previousRoute = route(previous?.tracking).map(h => ({...h, parameters:h.parameters.map(p => ({...p})),
      cookieWrites: (previous?.cookieEvents || []).filter(e => !e.removed && P.normalizeHost(e.domain) === h.host &&
        e.at >= h.at && e.at <= state.startedAt).map(e => ({name:e.name, at:e.at, cause:e.cause})).slice(0,16),
      storageObserved: [...(previous?.frames?.values() || [])].filter(f => P.host(f.origin) === h.host &&
        f.at >= h.at && f.at <= state.startedAt).map(f => ({frameId:f.frameId, at:f.at,
          localStorage:f.localStorage, sessionStorage:f.sessionStorage, indexedDB:f.indexedDB})).slice(0,8)}));
    const tracking = {startedAt:state.startedAt, partial:state.partial, requestId:state.navigationRequestId,
      observations:[], hops:[], previousRoute:cap.previousHops ? previousRoute.slice(-cap.previousHops) : [], cap,
      dropped:{observations:0, parameters:0, values:0, hashes:0, hops:0, previousHops:Math.max(0,previousRoute.length-cap.previousHops), outOfOrder:0},
      hashErrors:0};
    // Chave diferente por aba/navegação, não exportável. Nem HMACs saem no JSON.
    let key;
    try { key = globalThis.crypto.subtle.generateKey({name:"HMAC", hash:"SHA-256"}, false, ["sign"]).catch(() => null); }
    catch { key = Promise.resolve(null); }
    secrets.set(tracking, {key, tasks:[], fingerprints:new WeakMap(), hashes:0, pending:0});
    return tracking;
  };
  function parameters(tracking, url) {
    const result = [], hidden = secrets.get(tracking);
    let parsed;
    try { parsed = new URL(url); } catch { return result; }
    if (url.length > tracking.cap.urlLength) { tracking.dropped.values++; return result; }
    let count = 0;
    for (const [name, value] of parsed.searchParams) {
      if (++count > tracking.cap.parameters) { tracking.dropped.parameters++; continue; }
      const functionalName = functional.test(name), entropy = !functionalName && !campaign.test(name) && highEntropy(value);
      const reasons = [];
      if (value && campaign.test(name)) reasons.push("campaign-parameter");
      if (value && clickId.test(name)) reasons.push("known-click-identifier");
      if (value && identifier.test(name)) reasons.push("identifier-like-name");
      if (entropy) reasons.push("high-entropy-shape");
      const item = {name:nameFor(name), length:value.length, shape:!value ? "empty" : /^\d+$/.test(value) ? "numeric" :
        /^[a-f0-9-]+$/i.test(value) ? "hex-like" : /^[a-z0-9_-]+$/i.test(value) ? "alphanumeric" : "other", reasons};
      result.push(item);
      // Ignora credenciais, controles funcionais, valores curtos e campanhas na comparação.
      if (functionalName || value.length < 8 || (!entropy && !identifier.test(name) && !clickId.test(name))) continue;
      if (value.length > tracking.cap.valueLength) { tracking.dropped.values++; continue; }
      if (hidden.hashes++ >= tracking.cap.hashes) { tracking.dropped.hashes++; continue; }
      const bytes = new TextEncoder().encode(value);
      hidden.pending++;
      hidden.tasks.push(hidden.key.then(async key => {
        if (!key) throw Error("unavailable");
        const digest = await globalThis.crypto.subtle.sign("HMAC", key, bytes);
        hidden.fingerprints.set(item, Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join(""));
      }).catch(() => { tracking.hashErrors++; }).finally(() => { bytes.fill(0); hidden.pending--; }));
    }
    return result;
  }
  P.observeTrackingRequest = (tracking, details) => {
    if (!tracking || !Number.isFinite(details.timeStamp) || details.timeStamp < tracking.startedAt) return;
    if (tracking.observations.length >= tracking.cap.observations) { tracking.dropped.observations++; return; }
    const prior = tracking.hops.filter(h => h.at <= details.timeStamp).at(-1);
    const item = {...safe(details.url), requestId:details.requestId, at:details.timeStamp,
      frameId:details.frameId, type:details.type, source:"request", parameters:parameters(tracking, details.url),
      topHostAtEvent:details.type === "main_frame" ? P.host(details.url) : prior?.host || "",
      syncEndpoint:syncPath.test(new URL(details.url).pathname)};
    tracking.observations.push(item);
    if (details.type !== "main_frame") return;
    if (tracking.hops.length >= tracking.cap.hops) { tracking.dropped.hops++; return; }
    if (tracking.hops.at(-1)?.at > item.at) { tracking.dropped.outOfOrder++; return; }
    const last = tracking.hops.at(-1), previous = tracking.previousRoute.at(-1);
    const redirect = last?.redirect;
    const fromDocument = previous && P.host(details.documentUrl || details.originUrl) === previous.host && previous.at <= item.at;
    tracking.hops.push({...item, initiatorHost:P.host(details.documentUrl || details.originUrl),
      parameters:item.parameters.map(p => ({...p})), incoming:
      redirect && redirect.url === item.url && redirect.at <= item.at ? "http-redirect" :
        !last && fromDocument ? "document-initiated" : "start"});
  };
  P.observeTrackingRedirect = (tracking, details) => {
    if (!tracking) return;
    const source = tracking.observations.findLast(o => o.source === "request" && o.requestId === details.requestId &&
      o.url === safe(details.url).url && o.at <= details.timeStamp);
    if (!source) return;
    const target = {...safe(details.redirectUrl), at:details.timeStamp, statusCode:details.statusCode};
    source.redirect = target;
    const hop = tracking.hops.findLast(h => h.requestId === details.requestId && h.url === source.url && h.at === source.at);
    if (hop) hop.redirect = target;
    if (tracking.observations.length >= tracking.cap.observations) { tracking.dropped.observations++; return; }
    tracking.observations.push({...target, source:"redirect-target", requestId:details.requestId,
      type:details.type || source.type, frameId:source.frameId, topHostAtEvent:source.topHostAtEvent,
      parameters:parameters(tracking, details.redirectUrl), syncEndpoint:syncPath.test(new URL(details.redirectUrl).pathname)});
  };
  P.commitTrackingNavigation = (tracking, details) => {
    if (!tracking || details.frameId !== 0 || !tracking.hops.length) return;
    const last = tracking.hops.at(-1), first = tracking.hops[0];
    if (last.url !== safe(details.url).url || details.timeStamp < last.at) return;
    last.committedAt = details.timeStamp;
    last.transitionType = details.transitionType || "unknown";
    last.transitionQualifiers = (details.transitionQualifiers || []).slice();
    const previous = tracking.previousRoute.at(-1);
    if (!previous || previous.at > first.at) return;
    if (last.transitionQualifiers.includes("client_redirect") && first.at - previous.at <= tracking.cap.bounceMs)
      first.incoming = "client-redirect";
    else if (details.transitionType === "link") {
      // Firefox pode omitir client_redirect em location.href. Só infere quando
      // o iniciador é o documento intermediário já ligado à origem, em <=10s.
      // Continua indistinguível de cliques rápidos: confiança baixa, explícita.
      first.incoming = first.initiatorHost === previous.host && previous.incoming !== "start" &&
        first.at - previous.at <= tracking.cap.bounceMs ? "client-redirect-inferred" : "link";
    }
    else if (["typed","reload","auto_bookmark"].includes(details.transitionType) || last.transitionQualifiers.includes("forward_back"))
      first.incoming = "start";
  };
  P.summarizeTracking = async (tracking, resolve) => {
    const hidden = secrets.get(tracking);
    await Promise.all(hidden.tasks);
    const findings = [], sync = [], groups = new Map(), endpointHints = [];
    let omittedFindings = 0;
    const put = (array, item) => { if (array.length < tracking.cap.findings) array.push(item); else omittedFindings++; };
    const observations = tracking.observations.slice().sort((a,b) => a.at-b.at);
    for (const o of observations) {
      const party = P.party(o.host, o.topHostAtEvent, resolve);
      if (o.syncEndpoint) put(endpointHints, {domain:o.host, url:o.url, at:o.at, requestId:o.requestId,
        reason:"sync-endpoint-name", confidence:"low"});
      for (const p of o.parameters) {
        if (p.reasons.length) put(findings, {domain:o.host, url:o.url, requestId:o.requestId, at:o.at,
          frameId:o.frameId, context:o.type, source:o.source, party, parameter:p.name, length:p.length, shape:p.shape,
          reasons:p.reasons, confidence:p.reasons.includes("known-click-identifier") ? "moderate" : "low"});
        const fingerprint = hidden.fingerprints.get(p);
        if (!fingerprint || o.source !== "request") continue;
        const entries = groups.get(fingerprint) || [];
        entries.push({o, p, party}); groups.set(fingerprint, entries);
      }
    }
    let sequence = 0;
    for (const entries of groups.values()) {
      const first = entries[0];
      const later = entries.find(e => e.o.at >= first.o.at && resolve(e.o.host) !== resolve(first.o.host));
      if (!later) continue;
      const crossSiteContext = entries.some(e => e.party === "third") || entries.some(e => e.o.redirect);
      if (!crossSiteContext) continue;
      const occurrences = entries.slice(0,16).map(({o,p,party}) => ({domain:o.host, parameter:p.name,
        at:o.at, requestId:o.requestId, context:o.type, party}));
      put(sync, {id:`comparison-${++sequence}`, evidence:"same-identifier-across-sites",
        confidence:entries.some(e => e.o.syncEndpoint || identifier.test(e.p.name)) ? "moderate" : "low",
        domains:[...new Set(occurrences.map(o => o.domain))], occurrences, omittedOccurrences:Math.max(0,entries.length-16),
        reason:"Mesmo identificador pseudonimizado em requisições para sites distintos na mesma navegação.",
        cookieValueCompared:false, limitation:"Compatível com cookie sync; origem em cookie e intenção de rastrear não estabelecidas."});
      for (const {o,p,party} of entries.slice(0,16)) put(findings, {domain:o.host, url:o.url, requestId:o.requestId,
        at:o.at, context:o.type, source:o.source, party, parameter:p.name, reasons:["cross-site-reuse"],
        comparison:`comparison-${sequence}`, confidence:"moderate"});
    }
    const hops = route(tracking), bounces = [];
    for (let i=1; i<hops.length-1; i++) {
      const [origin, middle, destination] = hops.slice(i-1,i+2);
      const dwellMs = destination.at-middle.at;
      if (origin.at > middle.at || dwellMs < 0 || dwellMs > tracking.cap.bounceMs ||
        !["http-redirect","client-redirect","client-redirect-inferred"].includes(destination.incoming) || middle.incoming === "start" ||
        resolve(middle.host) === resolve(origin.host) || resolve(middle.host) === resolve(destination.host)) continue;
      const querySignals = [...middle.parameters,...destination.parameters].filter(p => p.reasons.some(r =>
        ["known-click-identifier","identifier-like-name","high-entropy-shape"].includes(r)));
      const cookieWrites = middle.cookieWrites || [];
      const indicator = querySignals.length > 0 || cookieWrites.length > 0;
      const inferred = destination.incoming === "client-redirect-inferred";
      if (inferred && !indicator) continue;
      put(bounces, {status:indicator ? "indicator" : "sequence-observed", confidence:indicator && !inferred ? "moderate" : "low",
        domains:[origin.host,middle.host,destination.host], startedAt:origin.at, intermediateAt:middle.at,
        destinationAt:destination.at, dwellMs, redirectType:destination.incoming,
        parameters:[...new Set(querySignals.map(p => p.name))], cookieWrites, storageObserved:middle.storageObserved || [],
        reason:inferred ? "Navegação curta iniciada pelo documento intermediário e sinal de identificador; redirect JS inferido, sem flag client_redirect da API." :
          indicator ? "Passagem curta por site intermediário, redirect e sinal adicional de identificador ou gravação correlacionada." :
          "Sequência de bounce observada; sem sinal adicional suficiente para inferir tracking.",
        limitation:"SSO, pagamentos e cliques rápidos podem produzir a mesma sequência. Redirect JS inferido não comprova automatismo. Correlação não prova autoria."});
    }
    const dropped = {...tracking.dropped, findings:omittedFindings};
    return {version:"advanced-tracking-v1", bounce:{status:bounces.some(b => b.status === "indicator") ? "indicator" :
      bounces.length ? "sequence-observed" : "insufficient-evidence", sequences:bounces,
      route:hops.map(h => ({domain:h.host, url:h.url, at:h.at, requestId:h.requestId, incoming:h.incoming, initiatorHost:h.initiatorHost,
        transitionType:h.transitionType, transitionQualifiers:h.transitionQualifiers, redirect:h.redirect}))},
      cookieSync:{status:sync.length ? "indicator" : "not-observed", indicators:sync, endpointHints,
        limitation:"Sem leitura/comparação de valores de cookies; endpoint com nome sync, isoladamente, é evidência insuficiente."},
      queryParameters:{status:findings.length ? "potential-tracking" : "not-observed", findings,
        limitation:"Campanha, formato semelhante a ID e reutilização são sinais, não tracking confirmado. Parâmetros funcionais são excluídos da comparação."},
      coverage:{partial:tracking.partial || Object.values(dropped).some(Boolean) || tracking.hashErrors > 0 || hidden.pending > 0,
        dropped, hashErrors:tracking.hashErrors, pendingComparisons:hidden.pending,
        limits:tracking.cap, observedRequests:observations.filter(o => o.source === "request").length,
        comparison:"HMAC-SHA-256 com chave efêmera por navegação; valores, chaves e hashes não exportados. Nenhuma comparação entre abas.",
        limitations:"Janela de passagem intermediária: 10 s. Histórico curto de main_frame só participa por ligação observada; navegação comum zera queries/comparações. POST, IDs transformados, CNAME, workers sem tabId e frames opacos não cobertos."}};
  };
})();
