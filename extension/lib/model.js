(() => {
  "use strict";
  const P = globalThis.PrivacyLens;
  P.cookieKey = c => JSON.stringify([c.storeId, c.domain, c.path, c.name,
    c.firstPartyDomain || "", c.partitionKey?.topLevelSite || "", c.partitionKey?.hasCrossSiteAncestor ?? null]);
  P.cookieMetadata = c => ({name: c.name, domain: c.domain, path: c.path,
    storeId: c.storeId, hostOnly: c.hostOnly, session: c.session,
    expirationDate: c.expirationDate ?? null, secure: c.secure, httpOnly: c.httpOnly,
    sameSite: c.sameSite, firstPartyDomain: c.firstPartyDomain || "",
    partitionKey: c.partitionKey || null});
  P.cookieMatches = (c, context, resolve) => {
    if (c.storeId !== context.storeId) return false;
    const topHost = P.host(context.topUrl), domain = P.normalizeHost(c.domain);
    if (c.firstPartyDomain && resolve(P.normalizeHost(c.firstPartyDomain)) !== resolve(topHost)) return false;
    if (c.partitionKey?.topLevelSite) {
      try {
        const partition = new URL(c.partitionKey.topLevelSite), top = new URL(context.topUrl);
        if (partition.protocol !== top.protocol || resolve(P.host(partition.href)) !== resolve(topHost)) return false;
      } catch { return false; }
    }
    return [...context.hosts].some(host => c.hostOnly ? host === domain : host === domain || host.endsWith(`.${domain}`));
  };
  P.newPage = (tabId, url, requestId, startedAt = Date.now()) => ({
    tabId, topUrl: url, navigationRequestId: requestId, startedAt,
    storeId: null, requests: [], latestRequest: new Map(), frames: new Map(),
    cookieWrites: new Map(), setCookies: [], droppedRequests: 0, droppedCookieHeaders: 0,
    cookieWriteEvents: 0, droppedCookieWrites: 0, partial: requestId === null
  });
  P.recordRequest = (state, d, limit = 4000) => {
    if (state.requests.length >= limit) { state.droppedRequests++; return; }
    const item = {id: d.requestId, at: d.timeStamp, ...P.safeUrl(d.url), host: P.host(d.url),
      type: d.type, method: d.method, frameId: d.frameId, parentFrameId: d.parentFrameId,
      documentUrl: P.safeUrl(d.documentUrl || d.originUrl || "").url, status: "observed"};
    state.requests.push(item); state.latestRequest.set(d.requestId, item);
  };
  P.summarizeNetwork = (state, resolve) => {
    const topHost = P.host(state.topUrl), domains = new Map();
    const totals = {total: state.requests.length, first: 0, third: 0, unknown: 0, failed: 0};
    for (const request of state.requests) {
      const party = P.party(request.host, topHost, resolve);
      totals[party]++;
      if (request.status === "error") totals.failed++;
      const group = domains.get(request.host) || {host: request.host, site: resolve(request.host), party,
        requests: 0, failed: 0, types: new Set()};
      group.requests++; group.types.add(request.type);
      if (request.status === "error") group.failed++;
      domains.set(request.host, group);
    }
    return {totals, domains: [...domains.values()].map(d => ({...d, types: [...d.types]}))
      .sort((a,b) => b.requests - a.requests || a.host.localeCompare(b.host))};
  };
})();
