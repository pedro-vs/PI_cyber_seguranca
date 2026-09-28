/* Diagnóstico temporário, em memória, sem valores. Não participa da inferência de criação. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens;
  P.createCookieDiagnostics = ({limit = 256, decisionLimit = 64} = {}) => {
    const entries = [];
    let sequence = 0, received = 0, dropped = 0, droppedDecisions = 0;
    let registeredAt = null;
    return {
      registered(at) { registeredAt = at; },
      navigation(state, at) {
        state.cookieDiagnosticSequence = ++sequence;
        state.cookieNavigationObservedAt = at;
      },
      receive(change, at, readyStatus) {
        received++;
        const entry = {sequence: ++sequence, at, cookie: P.cookieMetadata(change.cookie),
          removed: change.removed, cause: change.cause, readyAtReceipt: readyStatus, decisions: []};
        entries.push(entry);
        if (entries.length > limit) { entries.shift(); dropped++; }
        return entry;
      },
      decision(entry, state, context, source = "listener-receipt", capturedAt = entry.at) {
        const decision = {tabId: state.tabId, navigationSequence: state.cookieDiagnosticSequence,
          navigationRequestId: state.navigationRequestId, startedAt: state.startedAt,
          navigationObservedAt: state.cookieNavigationObservedAt, deltaMs: entry.at - state.startedAt,
          topUrl: P.safeUrl(context.topUrl).url, hosts: [...context.hosts].slice(0, 256),
          hostEvidence: (context.hostEvidence || []).slice(0, 256).map(h => ({...h})),
          hostsTruncated: context.hosts.size > 256,
          contextSource:source, contextCapturedAt:capturedAt,
          storeIdAtContextCapture:context.storeId, storeStatusAtContextCapture:state.storeStatus,
          storeIdAtReceipt:source === "listener-receipt" ? context.storeId : null,
          storeStatusAtReceipt:source === "listener-receipt" ? state.storeStatus : "see-original-receipt",
          expectedHasCrossSiteAncestor: context.partitionKey?.hasCrossSiteAncestor ?? null,
          status: "pending", reason: null};
        if (entry.decisions.length < decisionLimit) entry.decisions.push(decision);
        else droppedDecisions++;
        return decision;
      },
      report(state, context, cookies, listenerActive, readyStatus) {
        const current = entries.filter(e => e.sequence > state.cookieDiagnosticSequence ||
          e.decisions.some(d => d.navigationSequence === state.cookieDiagnosticSequence));
        const probes = new Map();
        for (const c of cookies.items) probes.set(JSON.stringify([c.name, P.normalizeHost(c.domain)]), {name:c.name,domain:P.normalizeHost(c.domain)});
        for (const a of cookies.setCookieAttempts) {
          const key = JSON.stringify([a.name,a.host]);
          if (!probes.has(key)) probes.set(key,{name:a.name,domain:a.host});
        }
        const relevant = (entry, probe) => entry.cookie.name === probe.name &&
          (P.normalizeHost(entry.cookie.domain) === probe.domain ||
            (!entry.cookie.hostOnly && probe.domain.endsWith(`.${P.normalizeHost(entry.cookie.domain)}`)));
        const describe = entry => ({...entry, decisions: entry.decisions.filter(d => d.tabId === state.tabId).map(d => ({...d,
          currentNavigation: d.navigationSequence === state.cookieDiagnosticSequence}))});
        // Probes só localizam diagnósticos por nome/domínio; nunca atribuem sucesso ao header.
        const results = [...probes.values()].map(probe => {
          const matches = current.filter(e => relevant(e,probe));
          const decisions = matches.flatMap(e => e.decisions.filter(d => d.navigationSequence === state.cookieDiagnosticSequence));
          const prior = entries.filter(e => e.sequence < state.cookieDiagnosticSequence && relevant(e,probe)).slice(-2);
          const status = decisions.some(d => d.status === "associated") ? "associated" :
            decisions.some(d => d.status === "pending") ? "pending" :
            decisions.some(d => d.status === "discarded") ? "discarded" :
            dropped || droppedDecisions || !listenerActive || state.partial ? "inconclusive" : "not-received";
          return {...probe, status, received: matches.length, events: matches.map(describe), priorReceipts: prior.map(describe)};
        });
        const decisions = current.flatMap(e => e.decisions.filter(d => d.navigationSequence === state.cookieDiagnosticSequence));
        return {version:"cookie-ingress-v1", listenerActive, registeredAt, readyStatus,
          totalReceivedSinceRegistration: received, dropped, droppedDecisions,
          navigation: {sequence:state.cookieDiagnosticSequence, requestId:state.navigationRequestId,
            startedAt:state.startedAt, observedAt:state.cookieNavigationObservedAt, storeId:state.storeId,
            storeStatus:state.storeStatus, topUrl:P.safeUrl(context.topUrl).url, hosts:[...context.hosts].slice(0,256)},
          counts: {received:decisions.length, associated:decisions.filter(d => d.status === "associated").length,
            discarded:decisions.filter(d => d.status === "discarded").length, pending:decisions.filter(d => d.status === "pending").length},
          probes:results,
          decisions:current.filter(e => e.decisions.some(d => d.tabId === state.tabId &&
            d.navigationSequence === state.cookieDiagnosticSequence)).map(describe),
          meaning:"Não recebido significa nenhuma entrada encontrada no listener para esta navegação até esta coleta, incluindo reavaliações de eventos anteriores à entrega de onBeforeRequest, com cobertura disponível. Não prova que o Firefox nunca disparou o evento. Probes por nome/domínio não provam autoria nem aceite de Set-Cookie. Consulte priorReceipts para a ordem de entrega."};
      }
    };
  };
})();
