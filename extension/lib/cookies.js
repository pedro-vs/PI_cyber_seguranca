/* Metadados apenas. onChanged é global: nenhuma inferência abaixo prova autoria da aba. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens;
  P.COOKIE_WINDOW_MS = 30000;
  P.createCookieHistory = ({limit = 4000} = {}) => {
    const known = new Map(), overwrites = new Map();
    let revision = 0, dropped = 0;
    function put(map, key, item) {
      map.delete(key); map.set(key, item);
      if (map.size > limit) { map.delete(map.keys().next().value); dropped++; }
    }
    return {
      get revision() { return revision; },
      get dropped() { return dropped; },
      // Um snapshot posterior ao início nunca é promovido a baseline daquela navegação.
      before(at) {
        return new Map([...known].filter(([, c]) => c.observedAt < at &&
          (c.session || c.expirationDate === null || c.expirationDate * 1000 > at)));
      },
      inventory(items, at, requestedRevision) {
        // Se houve qualquer evento enquanto getAll aguardava, não reintroduzir estado obsoleto.
        if (revision !== requestedRevision) return;
        for (const cookie of items) put(known, P.cookieKey(cookie), {...P.cookieMetadata(cookie), observedAt: at});
      },
      change(change, at) {
        revision++;
        const cookie = P.cookieMetadata(change.cookie), key = P.cookieKey(cookie);
        const previous = known.get(key), overwriteAt = overwrites.get(key);
        let kind = "removed", basis = change.cause;
        if (change.removed) {
          known.delete(key); overwrites.delete(key);
          if (change.cause === "overwrite") put(overwrites, key, at);
        } else {
          const paired = overwriteAt !== undefined && at >= overwriteAt && at - overwriteAt <= 1000;
          if (paired || previous) {
            kind = "changed"; basis = paired ? "overwrite-explicit-sequence" : "previously-observed-identity";
          } else if (change.cause === "explicit" && overwriteAt === undefined && !dropped) {
            kind = "created"; basis = "explicit-without-observed-overwrite";
          } else { kind = "unknown"; basis = "insufficient-event-history"; }
          overwrites.delete(key);
          put(known, key, {...cookie, observedAt: at});
        }
        return {...cookie, at, removed: change.removed, cause: change.cause, kind, basis};
      }
    };
  };
  P.cookieWindowReason = (state, at) => state.partial ? "partial-navigation" : !Number.isFinite(state.startedAt) ? "invalid-navigation-time" : !Number.isFinite(at) ? "invalid-event-time" :
    at < state.startedAt ? "before-window" : at > state.startedAt + P.COOKIE_WINDOW_MS ? "after-window" : null;
  P.inCookieWindow = (state, at) => P.cookieWindowReason(state, at) === null;
  P.recordCookieEvent = (state, event, context, resolve, candidateCount = 1, limit = 2000) => {
    if (!P.inCookieWindow(state, event.at) || !P.cookieMatches(event, context, resolve)) return false;
    state.cookieChangeEvents++;
    if (!event.removed) state.cookieWriteEvents++;
    if (state.cookieEvents.length >= limit) { state.droppedCookieWrites++; return false; }
    const item = {...event, party: P.party(P.normalizeHost(event.domain), P.host(context.topUrl), resolve),
      topUrlAtEvent: P.safeUrl(context.topUrl).url, matchingObservedNavigations: candidateCount,
      attribution: "temporal-context-correlation"};
    state.cookieEvents.push(item);
    if (!event.removed) state.cookieWrites.set(P.cookieKey(item), item);
    return true;
  };
  P.cookieTotals = items => ({total: items.length, first: items.filter(c => c.party === "first").length,
    third: items.filter(c => c.party === "third").length, session: items.filter(c => c.session).length,
    persistent: items.filter(c => !c.session).length, partitioned: items.filter(c => c.partitionKey?.topLevelSite).length});
  P.summarizeCookies = (state, inventory, context, resolve, now = Date.now()) => {
    const classify = c => ({...c, party: P.party(P.normalizeHost(c.domain), P.host(context.topUrl), resolve)});
    const baseline = [...state.cookieBaseline.values()].filter(c => P.cookieMatches(c, context, resolve)).map(classify);
    const items = inventory.map(c => ({...classify(P.cookieMetadata(c)),
      preexisting: state.cookieBaseline.has(P.cookieKey(c)) ? "observed-before-navigation" : "not-established",
      hasCorrelatedWrite: state.cookieWrites.has(P.cookieKey(c))}));
    const writes = state.cookieEvents.filter(e => !e.removed);
    const probable = new Map();
    for (const e of writes.filter(e => e.kind === "created" || e.kind === "changed")) {
      const key = P.cookieKey(e), previous = probable.get(key);
      probable.set(key, {...e, createdObserved: e.kind === "created" || !!previous?.createdObserved,
        changedObserved: e.kind === "changed" || !!previous?.changedObserved});
    }
    const probableItems = [...probable.values()];
    return {items, totals: P.cookieTotals(items), preexisting: {items: baseline, totals: P.cookieTotals(baseline),
      currentCount: items.filter(c => c.preexisting === "observed-before-navigation").length,
      unknownCurrentCount: items.filter(c => c.preexisting === "not-established").length,
      completeness: "partial-prior-observations-only"},
      events: state.cookieEvents.slice(), eventTotals: {observed: state.cookieChangeEvents,
        writes: state.cookieWriteEvents, created: writes.filter(e => e.kind === "created").length,
        changed: writes.filter(e => e.kind === "changed").length, unknown: writes.filter(e => e.kind === "unknown").length,
        removed: state.cookieEvents.filter(e => e.removed).length},
      probable: {items: probableItems, totals: P.cookieTotals(probableItems)},
      correlatedWrites: [...state.cookieWrites.values()], correlatedWriteEvents: state.cookieWriteEvents,
      setCookieAttempts: state.setCookies.map(a => ({...a, party: P.party(a.host, P.host(context.topUrl), resolve),
        inObservationWindow: P.inCookieWindow(state, a.at), outcome: "not-established"})),
      observationWindowMs: P.COOKIE_WINDOW_MS,
      window: {startedAt: state.startedAt, endsAt: state.startedAt + P.COOKIE_WINDOW_MS,
        status: state.partial ? "unavailable" : now <= state.startedAt + P.COOKIE_WINDOW_MS ? "open" : "closed"},
      attribution: "Correlação temporal e de contexto; não comprova autoria da aba. Criação é inferida de explicit sem overwrite observado. Não somar estoque, tentativas e eventos."};
  };
  P.setCookieAttempt = (line, d) => {
    const equals = line.indexOf("=");
    if (equals < 1) return null;
    // Não reter cabeçalho, valor nem atributos arbitrários.
    return {at: d.timeStamp, requestId: d.requestId, host: P.host(d.url),
      url: P.safeUrl(d.url).url, name: line.slice(0, equals).trim()};
  };
})();
