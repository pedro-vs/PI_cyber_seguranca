"use strict";
const {test} = require("node:test"), assert = require("node:assert/strict"), vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
const deferred = () => { let resolve; const promise = new Promise(r => {resolve=r;}); return {promise,resolve}; };
function harness({delayStore = false, delayPSL = false} = {}) {
  let now = 1000, inventory = [], inventoryHook;
  const listeners = {}, frames = new Map(), store = deferred(), psl = deferred();
  const event = name => ({addListener(fn) {listeners[name]=fn;},hasListener(fn) {return listeners[name]===fn;}});
  const browser = {
    runtime: {getURL: p => `moz-extension://test/${p}`, id:"test", onMessage:event("message"),
      getManifest:()=>({version:"0.3.0"}), getBrowserInfo:async()=>({version:"mock"})},
    tabs: {get:async id => {if(delayStore) await store.promise; return {id,url:"https://example.com/",cookieStoreId:"default"};},
      onRemoved:event("removed"), sendMessage:async()=>{}},
    webNavigation:{onCommitted:event("committed"),getAllFrames:async()=>[...frames.values()],getFrame:async({frameId})=>frames.get(frameId) || null},
    cookies:{onChanged:event("cookie"),getAll:async()=>inventoryHook ? inventoryHook() : inventory},
    webRequest:Object.fromEntries(["onBeforeRequest","onHeadersReceived","onBeforeRedirect","onCompleted","onErrorOccurred"].map(n=>[n,event(n)]))
  };
  class Clock extends Date {static now() {return now;}}
  const ctx=vm.createContext({browser,URL,Date:Clock,fetch:async()=>{if(delayPSL) await psl.promise; return {ok:true,text:async()=>"com\ntest"};}});
  for(const f of ["lib/domain.js","lib/model.js","lib/cookies.js","lib/cookie-diagnostics.js","lib/canvas.js","background.js"])
    vm.runInContext(fs.readFileSync(path.join(__dirname,"../extension",f),"utf8"),ctx,{filename:f});
  return {listeners,frames,store,psl,time:t=>{now=t;},inventory:items=>{inventory=items;},inventoryHook:fn=>{inventoryHook=fn;},
    navigate:(id="main",tabId=1,url="https://example.com/",timeStamp=now)=>listeners.onBeforeRequest({tabId,type:"main_frame",requestId:id,url,timeStamp,frameId:0}),
    cookie:(extra={},removed=false,cause="explicit")=>listeners.cookie({removed,cause,cookie:{name:"id",domain:"example.com",path:"/",hostOnly:true,storeId:"default",session:true,value:"DO_NOT_EXPORT",...extra}}),
    report:async(tabId=1)=>JSON.parse(JSON.stringify(await listeners.message({type:"report",tabId,refresh:true},{id:"test",url:"moz-extension://test/popup/popup.html"})))
  };
}
test("background preserva eventos precoces enquanto PSL e cookieStoreId estão pendentes",async()=>{
  const h=harness({delayStore:true,delayPSL:true});h.navigate();h.time(1001);h.cookie();h.store.resolve();h.psl.resolve();
  const r=await h.report();assert.equal(r.cookies.eventTotals.created,1);assert.equal(r.schemaVersion,3);
  assert.equal(r.network.totals.first,1);assert.equal(r.canvas.classification,"unavailable");assert.deepEqual(r.storage,[]);
  assert.equal(r.score.value,null);assert.equal(JSON.stringify(r).includes("DO_NOT_EXPORT"),false);
});
test("background descarta candidato de navegação substituída antes de resolver store",async()=>{
  const h=harness({delayStore:true});h.navigate();h.time(1001);h.cookie();h.time(2000);h.navigate("next");h.store.resolve();
  const r=await h.report();assert.equal(r.cookies.eventTotals.writes,0);assert.equal(r.cookies.preexisting.totals.total,1);
});
test("host observado só depois do evento não participa retroativamente da correlação",async()=>{
  const h=harness({delayStore:true});h.navigate();h.time(1001);h.cookie({domain:"third.test"});
  h.listeners.onBeforeRequest({tabId:1,type:"image",requestId:"third",url:"https://third.test/pixel",timeStamp:1002});h.store.resolve();
  assert.equal((await h.report()).cookies.eventTotals.writes,0);
});
test("background correlaciona duas abas compatíveis e exclui store/partição errados",async()=>{
  const h=harness();h.navigate();h.navigate("second",2);h.time(1100);h.cookie();
  h.cookie({storeId:"container2"});h.cookie({partitionKey:{topLevelSite:"https://other.com"}});
  for(const tab of [1,2]) {const r=await h.report(tab);assert.equal(r.cookies.eventTotals.writes,1);assert.equal(r.cookies.events[0].matchingObservedNavigations,2);}
});
test("headers HTTP não criam cookies e não vazam seus valores no relatório",async()=>{
  const h=harness();h.navigate();h.listeners.onHeadersReceived({tabId:1,requestId:"main",timeStamp:1100,url:"https://example.com/",statusCode:200,
    responseHeaders:[{name:"Set-Cookie",value:"rejected=HEADER_SECRET; Domain=invalid.test\nsecond=OTHER_SECRET"}]});
  const r=await h.report();assert.equal(r.cookies.setCookieAttempts.length,2);assert.equal(r.cookies.eventTotals.writes,0);
  assert.equal(r.cookies.totals.total,0);assert.equal(/SECRET/.test(JSON.stringify(r)),false);
});
test("inventário adquirido depois do início só estabelece baseline para a próxima navegação",async()=>{
  const h=harness();h.navigate();h.time(1500);h.inventory([{name:"old",domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true,value:"SECRET"}]);
  const a=await h.report();assert.equal(a.cookies.preexisting.currentCount,0);
  h.time(2000);h.navigate("next");const b=await h.report();
  assert.equal(b.cookies.preexisting.currentCount,1);assert.equal(b.cookies.probable.totals.total,0);
});
test("mudança durante inventário sinaliza snapshot não atômico e não contamina baseline",async()=>{
  const h=harness();h.navigate();h.inventoryHook(()=>{h.time(1500);h.cookie({},true);return [{name:"id",domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true}];});
  const a=await h.report();assert.equal(a.cookies.inventoryChangedDuringQuery,true);
  h.inventoryHook(null);h.time(2000);h.navigate("next");assert.equal((await h.report()).cookies.preexisting.totals.total,0);
});
test("falha de inventário fica explícita sem expor erro bruto potencialmente sensível",async()=>{
  const h=harness();h.navigate();h.inventoryHook(()=>{throw Error("COOKIE_SECRET");});
  const r=await h.report();assert.equal(r.cookies.errors.length,1);assert.equal(JSON.stringify(r).includes("COOKIE_SECRET"),false);
});
test("redirect mantém hops e classifica evento pelo contexto no instante da ocorrência",async()=>{
  const h=harness();h.navigate();h.time(1100);h.cookie();
  h.listeners.onBeforeRedirect({tabId:1,requestId:"main",timeStamp:1101,redirectUrl:"https://other.com/",statusCode:302});
  h.time(1102);h.navigate("main",1,"https://other.com/");
  const r=await h.report();assert.equal(r.network.totals.total,2);assert.equal(r.network.requests[0].status,"redirect");
  assert.equal(r.cookies.events[0].party,"first");assert.equal(r.cookies.events[0].topUrlAtEvent,"https://example.com/");
});
const storageSnapshot = (timeOrigin=1000) => ({type:"storage-snapshot",timeOrigin,
  localStorage:{status:"observed",count:2,unit:"keys"},sessionStorage:{status:"observed",count:1,unit:"keys"},
  indexedDB:{status:"observed",count:1,unit:"databases"}});
test("regressão storage: relatório mantém contagens e frames enquanto cookies mudam",async()=>{
  const h=harness();h.navigate();h.frames.set(0,{frameId:0,url:"https://example.com/"});
  await h.listeners.message(storageSnapshot(),{id:"test",tab:{id:1},frameId:0,url:"https://example.com/"});
  h.time(1100);h.cookie();const r=await h.report();
  assert.equal(r.cookies.eventTotals.writes,1);assert.equal(r.storage.length,1);
  assert.equal(r.storage[0].localStorage.count,2);assert.equal(r.storage[0].sessionStorage.count,1);
  assert.equal(r.storage[0].indexedDB.count,1);
});
test("regressão storage: ignora documento antigo e limpa snapshot na nova navegação",async()=>{
  const h=harness();h.navigate();h.frames.set(0,{frameId:0,url:"https://example.com/"});
  const sender={id:"test",tab:{id:1},frameId:0,url:"https://example.com/"};
  await h.listeners.message(storageSnapshot(),sender);assert.equal((await h.report()).storage.length,1);
  h.time(2000);h.navigate("next");await h.listeners.message(storageSnapshot(),sender);
  assert.equal((await h.report()).storage.length,0);
});
test("regressão storage: primeira/terceira origem e indisponibilidade permanecem separadas",async()=>{
  const h=harness();h.navigate();
  for(const [frameId,url] of [[0,"https://example.com/"],[1,"https://third.test/frame"]]) {
    h.frames.set(frameId,{frameId,url});
    const message=storageSnapshot();
    if(frameId===1) message.localStorage={status:"unavailable",count:null,reason:"SecurityError"};
    await h.listeners.message(message,{id:"test",tab:{id:1},frameId,url});
  }
  const r=await h.report();assert.equal(r.storage.length,2);
  assert.equal(r.storage[0].origin,"https://example.com");assert.equal(r.storage[0].localStorage.count,2);
  assert.equal(r.storage[1].origin,"https://third.test");assert.equal(r.storage[1].localStorage.count,null);
  assert.equal(r.storage[1].localStorage.status,"unavailable");
});
test("diagnóstico diferencia header sem entrada real no listener",async()=>{
  const h=harness();h.navigate();
  h.listeners.onHeadersReceived({tabId:1,requestId:"main",timeStamp:1100,url:"https://example.com/",statusCode:200,
    responseHeaders:[{name:"Set-Cookie",value:"id=SECRET"}]});
  const r=await h.report(), d=r.cookies.diagnostics;
  assert.equal(d.listenerActive,true);assert.equal(d.probes[0].status,"not-received");
  assert.equal(d.totalReceivedSinceRegistration,0);assert.equal(r.cookies.eventTotals.writes,0);
});
test("diagnóstico registra explicit associado sem valores",async()=>{
  const h=harness();h.navigate();h.time(1100);h.cookie();
  h.inventory([{name:"id",domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true,value:"SECRET"}]);
  const r=await h.report(), d=r.cookies.diagnostics;
  assert.equal(d.probes[0].status,"associated");assert.equal(d.probes[0].events[0].cause,"explicit");
  assert.equal(d.counts.associated,1);assert.equal(/SECRET|DO_NOT_EXPORT|"value"/.test(JSON.stringify(d)),false);
});
test("diagnóstico informa cada motivo de filtro com os campos recebidos",async()=>{
  for(const [extra,reason] of [
    [{storeId:"container2"},"store-mismatch"],
    [{firstPartyDomain:"other.com"},"first-party-domain-mismatch"],
    [{partitionKey:{topLevelSite:"https://other.com",hasCrossSiteAncestor:true}},"partition-site-mismatch"],
    [{partitionKey:{topLevelSite:"http://example.com"}},"partition-scheme-mismatch"],
    [{partitionKey:{topLevelSite:"invalid"}},"invalid-partition"],
    [{domain:"third.test"},"host-mismatch"]
  ]) {
    const h=harness();h.navigate();h.time(1100);h.cookie(extra);
    const r=await h.report(), d=r.cookies.diagnostics;
    assert.equal(d.totalReceivedSinceRegistration,1);assert.equal(d.decisions[0].decisions[0].reason,reason);
    assert.equal(d.decisions[0].decisions[0].status,"discarded");
    assert.equal(r.cookies.eventTotals.writes,0);
  }
});
test("diagnóstico registra relógio anterior e evento tardio sem ampliar janela",async()=>{
  for(const [at,reason] of [[1000,"before-window"],[32000,"after-window"]]) {
    const h=harness();h.time(1000.5);h.navigate();h.time(at);h.cookie();
    const r=await h.report(), decision=r.cookies.diagnostics.decisions[0].decisions[0];
    assert.equal(decision.reason,reason);assert.equal(decision.deltaMs,at-1000.5);
    assert.equal(r.cookies.eventTotals.writes,0);
  }
});
test("diagnóstico mostra ready/store pendentes no recebimento e prontos após espera",async()=>{
  const h=harness({delayStore:true,delayPSL:true});h.navigate();h.time(1100);h.cookie();
  h.store.resolve();h.psl.resolve();const r=await h.report();
  const e=r.cookies.diagnostics.decisions[0], d=e.decisions[0];
  assert.equal(e.readyAtReceipt,"pending");assert.equal(d.storeIdAtReceipt,null);
  assert.equal(d.storeStatusAtReceipt,"pending");assert.equal(d.storeIdAfterWait,"default");
  assert.equal(d.sameNavigation,true);assert.equal(d.readyAfterWait,"ready");assert.equal(d.status,"associated");
  assert.deepEqual(d.hosts,["example.com"]);
});
test("diagnóstico preserva descarte de navegação substituída em priorReceipts",async()=>{
  const h=harness({delayStore:true});h.navigate();h.time(1100);h.cookie();h.time(1200);h.navigate("next");
  h.store.resolve();h.inventory([{name:"id",domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true}]);
  const r=await h.report(), p=r.cookies.diagnostics.probes[0];
  assert.equal(p.priorReceipts[0].decisions[0].reason,"navigation-replaced");
  assert.equal(p.priorReceipts[0].decisions[0].currentNavigation,false);assert.equal(r.cookies.eventTotals.writes,0);
});
test("Firefox: onChanged entregue antes de onBeforeRequest é reavaliado com horário original",async()=>{
  const h=harness();h.time(500);h.navigate("setup");
  h.time(600);h.cookie({name:"old1"});h.cookie({name:"old2"});
  h.time(1100);h.cookie({name:"pl3_session"});
  // A requisição começou em 1000, mas seu callback só foi entregue em 1200.
  h.time(1200);h.navigate("session",1,"https://example.com/",1000);
  h.inventory(["old1","old2","pl3_session"].map(name=>({name,domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true})));
  const r=await h.report(), c=r.cookies, p=c.diagnostics.probes.find(p=>p.name==="pl3_session");
  assert.equal(c.preexisting.currentCount,2);assert.equal(c.eventTotals.writes,1);assert.equal(c.eventTotals.created,1);
  assert.equal(c.events[0].at,1100);assert.equal(p.status,"associated");
  const d=p.events[0].decisions.find(d=>d.currentNavigation);
  assert.equal(d.contextSource,"navigation-start-replay");assert.equal(d.deltaMs,100);
  assert.equal(d.navigationObservedAt,1200);assert.equal(d.status,"associated");
  h.navigate("session",1,"https://example.com/",1000);
  assert.equal((await h.report()).cookies.eventTotals.writes,1);
});
test("buffer não reatribui eventos anteriores à janela nem aceita container/partição incorretos",async()=>{
  const h=harness();h.time(900);h.cookie({name:"old"});
  h.time(1100);h.cookie({storeId:"wrong"});h.cookie({partitionKey:{topLevelSite:"https://other.com"}});
  h.time(1200);h.navigate("main",1,"https://example.com/",1000);
  const r=await h.report();assert.equal(r.cookies.eventTotals.writes,0);
  const ds=r.cookies.diagnostics.decisions.flatMap(e=>e.decisions);
  assert.deepEqual(ds.map(d=>d.reason),["store-mismatch","partition-site-mismatch"]);
});
test("buffer sem nenhum onChanged não inventa escrita a partir de inventário novo",async()=>{
  const h=harness();h.time(1200);h.navigate("main",1,"https://example.com/",1000);
  h.inventory([{name:"id",domain:"example.com",path:"/",storeId:"default",hostOnly:true,session:true}]);
  const r=await h.report();assert.equal(r.cookies.totals.total,1);assert.equal(r.cookies.probable.totals.total,0);
  assert.equal(r.cookies.diagnostics.probes[0].status,"not-received");
});
const thirdCookie = {name:"pl3_third",domain:"127.0.0.1",path:"/cookies",
  partitionKey:{topLevelSite:"http://localhost",hasCrossSiteAncestor:true}};
const thirdRequest = (h, timeStamp=1005, requestId="third") => h.listeners.onBeforeRequest({tabId:1,type:"sub_frame",
  requestId,url:"http://127.0.0.1/cookies/third-frame",timeStamp,frameId:1,parentFrameId:0});
test("terceiro: request subframe anterior seguido de onChanged associa com PSL/store pendentes",async()=>{
  const h=harness({delayStore:true,delayPSL:true});h.navigate("main",1,"http://localhost/cookies/third");
  h.time(1005);thirdRequest(h);h.time(1010);h.cookie(thirdCookie);h.store.resolve();h.psl.resolve();
  const c=(await h.report()).cookies;
  assert.equal(c.eventTotals.writes,1);assert.equal(c.eventTotals.created,1);
  assert.equal(c.probable.totals.third,1);assert.equal(c.probable.totals.session,1);
  assert.equal(c.events[0].partitionKey.hasCrossSiteAncestor,true);
});
test("terceiro: callback de request atrasado recupera host-mismatch com timestamp anterior",async()=>{
  const h=harness();h.navigate("main",1,"http://localhost/cookies/third");h.time(1010);h.cookie(thirdCookie);
  let c=(await h.report()).cookies;
  assert.equal(c.eventTotals.writes,0);assert.equal(c.diagnostics.decisions[0].decisions[0].reason,"host-mismatch");
  h.time(1020);thirdRequest(h,1005);
  c=(await h.report()).cookies;
  assert.equal(c.eventTotals.observed,1);assert.equal(c.eventTotals.writes,1);assert.equal(c.probable.totals.third,1);
  const decision=c.diagnostics.decisions[0].decisions.find(d=>d.contextSource==="host-request-replay");
  assert.equal(decision.status,"associated");assert.deepEqual(decision.hosts,["localhost","127.0.0.1"]);
  const evidence=decision.hostEvidence.find(e=>e.host==="127.0.0.1");
  assert.equal(evidence.at,1005);assert.equal(evidence.observedAt,1020);assert.equal(c.events[0].at,1010);
});
test("terceiro: callback atrasado durante espera assíncrona aceita limite temporal igual",async()=>{
  const h=harness({delayStore:true,delayPSL:true});h.navigate("main",1,"http://localhost/cookies/third");
  h.time(1010);h.cookie(thirdCookie);h.time(1020);thirdRequest(h,1010);h.store.resolve();h.psl.resolve();
  const c=(await h.report()).cookies;assert.equal(c.eventTotals.writes,1);assert.equal(c.events[0].at,1010);
  assert.equal(c.diagnostics.decisions[0].decisions.find(d=>d.contextSource==="host-request-replay").status,"associated");
});
test("terceiro: timestamp de request posterior é rejeitado mesmo com callback já entregue",async()=>{
  const h=harness();h.navigate("main",1,"http://localhost/cookies/third");
  h.time(1008);thirdRequest(h,1011);h.time(1010);h.cookie(thirdCookie);
  const c=(await h.report()).cookies;assert.equal(c.eventTotals.writes,0);
  assert.equal(c.diagnostics.decisions[0].decisions[0].reason,"host-mismatch");
});
test("terceiro: reavaliação não duplica evento enquanto outra decisão aguarda PSL",async()=>{
  const h=harness({delayPSL:true});h.navigate("main",1,"http://localhost/cookies/third");
  h.time(1005);thirdRequest(h,1005);h.time(1010);h.cookie(thirdCookie);
  h.time(1020);thirdRequest(h,1002,"earlier");h.psl.resolve();
  let c=(await h.report()).cookies;assert.equal(c.eventTotals.writes,1);assert.equal(c.eventTotals.observed,1);
  h.time(1030);thirdRequest(h,1001,"earliest");c=(await h.report()).cookies;
  assert.equal(c.eventTotals.writes,1);assert.equal(c.probable.totals.total,1);
});
test("terceiro: reavaliação preserva isolamento de store, FPI e partição",async()=>{
  for(const extra of [{storeId:"other"},{firstPartyDomain:"other.test"},{partitionKey:{topLevelSite:"http://other.test",hasCrossSiteAncestor:true}}]) {
    const h=harness();h.navigate("main",1,"http://localhost/cookies/third");h.time(1010);h.cookie({...thirdCookie,...extra});
    h.time(1020);thirdRequest(h,1005);
    const c=(await h.report()).cookies;assert.equal(c.eventTotals.writes,0);assert.equal(c.probable.totals.total,0);
  }
});
