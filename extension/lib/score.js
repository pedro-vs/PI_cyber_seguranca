(() => {
  "use strict";
  const P = globalThis.PrivacyLens;
  P.privacyScore = (report, resolve, weightFactor = 1) => {
    const caps = {N:10,C:20,S:10,F:15,T:25,H:20}, categories = [];
    const network = report.network, cookies = report.cookies, storage = report.storage, advanced = report.advancedTracking, security = report.security;
    const fresh = (frame, at) => frame.activeAtRefresh === true && Number.isFinite(frame.at) && frame.at >= at-5000;
    const now = Date.parse(report.generatedAt);
    const add = (id, label, raw, covered, evidence) => categories.push({id,label,cap:caps[id],
      points:Math.min(caps[id],Math.max(0,Math.round(raw*weightFactor))),covered:!!covered,evidence});
    const third = new Map();
    for (const r of network?.requests || []) if (r.party === "third" && r.status === "completed" && r.statusCode>=200 && r.statusCode<400 && !r.blockedBy)
      third.set(resolve(r.host), r);
    add("N","Exposição a terceiros",third.size*2,network && !report.coverage?.partial && !report.coverage?.droppedRequests,
      [...third].map(([site,r]) => ({site,requestId:r.id,at:r.at})));
    const writes = new Map();
    for (const e of cookies?.events || []) if (!e.removed) writes.set(P.cookieKey(e),e);
    const cookieItems = [...writes.values()], thirdWrites = cookieItems.filter(c => c.party === "third"), persistent = cookieItems.filter(c => !c.session);
    add("C","Gravações de cookies correlacionadas",thirdWrites.length*3+Math.min(5,persistent.length),
      cookies && cookies.window?.status === "closed" && !cookies.errors?.length && !cookies.processingErrors &&
        !cookies.ingressDropped && !cookies.historyDropped && !cookies.inventoryChangedDuringQuery && !report.coverage?.partial && !report.coverage?.droppedCookieWrites,
      cookieItems.map(e => ({name:e.name,domain:e.domain,path:e.path,storeId:e.storeId,partitionKey:e.partitionKey,at:e.at,
        third:e.party === "third",persistent:!e.session,attribution:"correlated-not-exclusive"})));
    const origins = new Map();
    for (const frame of storage || []) if (frame.party === "third" && fresh(frame,now) &&
      [frame.localStorage,frame.indexedDB].some(s => s?.status === "observed" && s.count>0)) origins.set(frame.origin,frame);
    add("S","Persistência em storage terceiro",origins.size*2,report.coverage?.storageFramesComplete && storage?.length && storage.every(f => fresh(f,now) &&
      [f.localStorage,f.sessionStorage,f.indexedDB].every(s => s?.status === "observed")),
      [...origins.values()].map(f => ({origin:f.origin,frameId:f.frameId,at:f.at})));
    add("F","Sequência canvas",report.canvas?.classification === "indicator" ? 15 : 0,
      report.coverage?.canvasFramesComplete && report.canvas && report.canvas.classification !== "unavailable" && !report.canvas.partial,
      (report.canvas?.frames || []).filter(f => f.observation.indicatorCanvases>0).map(f => ({frameId:f.frameId,url:f.url,rule:"canvas-sequence-v1"})));
    // Uma dimensão por navegação: usa o maior sinal, sem somar sync e bounce do mesmo fluxo.
    const sync = advanced?.cookieSync?.indicators || [], bounce = (advanced?.bounce?.sequences || []).filter(b => b.status === "indicator" && b.confidence === "moderate");
    add("T","Ligação entre sites",sync.some(s => s.confidence === "moderate") ? 15 : bounce.length ? 10 : 0,
      advanced?.availability === "available" && !advanced.coverage.partial,
      [...sync.filter(s => s.confidence === "moderate").map(s => ({kind:"sync",domains:s.domains,id:s.id})),
        ...bounce.map(b => ({kind:"bounce",domains:b.domains,at:b.intermediateAt}))]);
    add("H","Alterações de API e canal persistente",security?.combinations?.length ? 20 : 0,
      security?.availability === "available" && !security.coverage.partial,
      (security?.combinations || []).map(c => ({frameId:c.channel.frameId,domain:c.channel.domain,
        requestIds:c.channel.requestIds,apis:c.changes.map(a => a.api),at:c.channel.at})));
    const penalty = categories.reduce((sum,c) => sum+c.points,0), missing = categories.filter(c => !c.covered);
    const upper = Math.max(0,100-penalty), lower = Math.max(0,upper-missing.reduce((sum,c) => sum+c.cap-c.points,0));
    return {version:"privacy-score-v1",status:missing.length ? "partial" : "observed",value:missing.length ? null : upper,
      observedValue:upper,range:{min:lower,max:upper},coveredCategories:6-missing.length,totalCategories:6,categories,
      interpretation:"Índice normativo de exposição observada, não probabilidade de ataque. Maior = menos penalizações observadas; lacunas não são zeros confirmados.",
      method:"100 − N − C − S − F − T − H; tetos 10/20/10/15/25/20. T usa o maior sinal moderado por navegação; T/H: sinais isolados de confiança baixa não pontuam. Bloqueios não ganham bônus."};
  };
})();
