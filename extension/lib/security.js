/* Indicadores observacionais; não identificam malware nem autoria de alterações. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens = globalThis.PrivacyLens || {};
  const canvas = ["fillRect", "strokeRect", "fillText", "strokeText", "drawImage", "putImageData", "fill", "stroke", "getImageData"];
  P.securityTargets = ["Window.fetch", "Window.WebSocket", "Window.XMLHttpRequest", "Window.eval",
    "XMLHttpRequest.open", "XMLHttpRequest.send", "Function.toString", "Document.createElement",
    ...canvas.map(m => `CanvasRenderingContext2D.${m}`), "HTMLCanvasElement.toDataURL", "HTMLCanvasElement.toBlob"];
  const ownTarget = name => name.startsWith("CanvasRenderingContext2D.") || name.startsWith("HTMLCanvasElement.");
  const same = (a, b) => !a || !b ? a === b : ["value", "get", "set", "writable", "enumerable", "configurable"].every(k => a[k] === b[k]);
  P.createIntegrityObserver = (read, now) => {
    const baseline = new Map(), own = new Set(), failed = new Set(), changes = new Map();
    let started = false, scans = 0;
    const get = name => {try {return read(name);} catch {failed.add(name);return undefined;}};
    for (const name of P.securityTargets) baseline.set(name, get(name));
    const scan = () => {
      if (!started) return;
      scans++;
      for (const name of P.securityTargets) {
        const current = get(name), original = baseline.get(name);
        if (!failed.has(name) && !same(original, current) && !changes.has(name)) changes.set(name, {api:name, at:now(),
          kind:!original ? "added" : !current ? "removed" : "descriptor-changed", afterOwnInstrumentation:own.has(name)});
      }
    };
    return {
      finishBootstrap() {
        if (started) return;
        for (const name of P.securityTargets.filter(ownTarget)) {
          const current = get(name);
          if (!same(baseline.get(name), current)) {own.add(name);baseline.set(name, current);}
        }
        started = true;scan();
      }, scan,
      snapshot: () => ({version:"integrity-v1", status:started ? "observed" : "unavailable", scans,
        ownInstrumentation:[...own], changes:[...changes.values()], failed:[...failed],
        unsupported:P.securityTargets.filter(n => !baseline.get(n))})
    };
  };
  P.sanitizeIntegrity = raw => {
    const allowed = new Set(P.securityTargets), names = list => Array.isArray(list) && list.length <= allowed.size && list.every(n => allowed.has(n));
    if (!raw || raw.version !== "integrity-v1" || !["observed","unavailable"].includes(raw.status) ||
      !Number.isInteger(raw.scans) || raw.scans < 0 || !names(raw.ownInstrumentation) || !names(raw.failed) || !names(raw.unsupported) ||
      !Array.isArray(raw.changes) || raw.changes.length > allowed.size || raw.changes.some(c => !c || !allowed.has(c.api) ||
        !Number.isFinite(c.at) || !["added","removed","descriptor-changed"].includes(c.kind) || typeof c.afterOwnInstrumentation !== "boolean")) return null;
    return {version:raw.version, status:raw.status, scans:raw.scans,
      ownInstrumentation:[...new Set(raw.ownInstrumentation)], failed:[...new Set(raw.failed)], unsupported:[...new Set(raw.unsupported)],
      changes:raw.changes.map(c => ({api:c.api, at:c.at, kind:c.kind, afterOwnInstrumentation:c.afterOwnInstrumentation}))};
  };
  P.summarizeSecurity = (state, resolve, now = Date.now()) => {
    const frames = [...state.securityFrames.values()], channels = [], groups = new Map();
    for (const r of state.requests) {
      if (r.blockedBy || P.party(r.host, P.host(state.topUrl), resolve) !== "third") continue;
      if (r.type === "websocket") channels.push({kind:"websocket-attempt", domain:r.host, url:r.url, frameId:r.frameId,
        at:r.at, requestIds:[r.id], status:r.status, statusCode:r.statusCode ?? null, error:r.error || null,
        confidence:"low", persistent:false, reason:"A API de rede não demonstra duração nem conteúdo do canal WebSocket."});
      if (r.type !== "xmlhttprequest" || r.status !== "completed" || !(r.statusCode >= 200 && r.statusCode < 300)) continue;
      const key = `${r.frameId}|${r.method}|${r.url}`;
      const items = groups.get(key) || [];items.push(r);groups.set(key, items);
    }
    for (const items of groups.values()) {
      items.sort((a,b) => a.at-b.at);
      // Uma janela contígua de 30 s evita unir requisições espaçadas ao longo da visita.
      for (let end=3; end<items.length; end++) {
        const sample = items.slice(end-3,end+1), span = sample[3].at-sample[0].at;
        if (span < 5000 || span > 30000 || sample.some((r,i) => i && r.at <= sample[i-1].at)) continue;
        const r = sample[0];channels.push({kind:"repeated-third-party-requests",domain:r.host,url:r.url,frameId:r.frameId,
          at:r.at,lastAt:sample[3].at,requestIds:sample.map(x => x.id),count:4,spanMs:span,persistent:true,confidence:"low",
          reason:"4 respostas 2xx do mesmo endpoint/frame em 5–30 s; compatível com polling, também comum em aplicações legítimas."});break;
      }
    }
    const changes = frames.flatMap(f => f.observation.changes.map(c => ({...c, frameId:f.frameId, origin:f.origin})));
    const combinations = [];
    for (const channel of channels.filter(c => c.persistent)) {
      const related = changes.filter(c => c.frameId === channel.frameId && c.at >= channel.at-1000 && c.at <= channel.lastAt+1000);
      if (related.length) combinations.push({channel, changes:related, confidence:"moderate",
        reason:"Alteração de API e requisições repetidas coexistem no mesmo frame/intervalo; causalidade e autoria não estabelecidas."});
    }
    const active = state.activeFrameIds;
    const partial = state.partial || state.droppedRequests > 0 || !frames.length || !active ||
      [...active].some(id => !state.securityFrames.has(id)) || frames.some(f => f.observation.status !== "observed" ||
        f.observation.failed.length || f.observation.unsupported.length || !f.observation.scans ||
        !Number.isFinite(f.at) || now-f.at > 5000 || f.activeAtRefresh === false) || now-state.startedAt < 30000;
    return {version:"security-v1", availability:"available", status:combinations.length ? "combined-indicator" :
      changes.length || channels.length ? "observations" : "not-observed", channels:channels.slice(0,128),
      changes, combinations:combinations.slice(0,128), frames,
      coverage:{partial:partial || channels.length>128 || combinations.length>128, elapsedMs:Math.max(0,now-state.startedAt),
        dropped:Math.max(0,channels.length-128)+Math.max(0,combinations.length-128),
        limitations:"APIs selecionadas comparadas ao document_start; mudanças anteriores, entre amostras, workers e configurações do navegador não são verificadas. Não prova hijacking. Instrumentação canvas própria é separada."}};
  };
})();
