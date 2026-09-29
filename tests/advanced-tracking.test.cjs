"use strict";
const {test}=require("node:test"), assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path");
globalThis.crypto ||= require("node:crypto").webcrypto;
require("../extension/lib/domain.js");require("../extension/lib/model.js");require("../extension/lib/advanced-tracking.js");
const P=globalThis.PrivacyLens, resolve=P.createDomainResolver(fs.readFileSync(path.join(__dirname,"../extension/vendor/public_suffix_list.dat"),"utf8"));
const ID="Pl4A92f7C6d13E80b5", OTHER="L9x43G2cF8s71H6bA0";
function page(url="https://origin.test/",at=1000,previous,tabId=1,cap={}) {
  const state=P.newPage(tabId,url,`nav-${at}`,at);state.tracking=P.newTrackingPage(state,previous,cap);
  request(state,url,at,"main_frame",state.navigationRequestId);return state;
}
function request(state,url,at,type="image",id=`r-${at}`) {
  P.observeTrackingRequest(state.tracking,{url,timeStamp:at,type,requestId:id,frameId:type==="main_frame"?0:1});
}
function redirect(state,from,to,at,id=state.navigationRequestId,type="main_frame") {
  P.observeTrackingRedirect(state.tracking,{url:from,redirectUrl:to,timeStamp:at,requestId:id,statusCode:302,type});
}
function hop(state,from,to,at) {redirect(state,from,to,at);request(state,to,at+1,"main_frame",state.navigationRequestId);}
const report=state=>P.summarizeTracking(state.tracking,resolve);
function commit(state,url,at,type="link",qualifiers=[]) {
  P.commitTrackingNavigation(state.tracking,{url,timeStamp:at,frameId:0,transitionType:type,transitionQualifiers:qualifiers});
}
test("advanced: redirect isolado não vira bounce nem tracking",async()=>{
  const s=page();hop(s,"https://origin.test/","https://destination.test/",1100);
  const r=await report(s);assert.equal(r.bounce.status,"insufficient-evidence");assert.equal(r.cookieSync.status,"not-observed");
});
test("advanced: A → intermediário curto → A com ID gera indicador defensável",async()=>{
  const s=page();hop(s,"https://origin.test/",`https://third.test/hop?uid=${ID}`,1100);
  hop(s,`https://third.test/hop?uid=${ID}`,`https://origin.test/end?uid=${ID}`,1200);
  const r=await report(s), b=r.bounce.sequences[0];
  assert.equal(r.bounce.status,"indicator");assert.deepEqual(b.domains,["origin.test","third.test","origin.test"]);
  assert.equal(b.dwellMs,100);assert.equal(b.redirectType,"http-redirect");assert.match(b.limitation,/SSO/);
});
test("advanced: sequência sem ID distingue bounce observado de tracking",async()=>{
  const s=page();hop(s,"https://origin.test/","https://third.test/hop",1100);hop(s,"https://third.test/hop","https://origin.test/end",1200);
  const r=await report(s);assert.equal(r.bounce.status,"sequence-observed");assert.equal(r.bounce.sequences[0].confidence,"low");
});
test("advanced: bounce JS entre documentos preserva origem e exige client_redirect",async()=>{
  const a=page();commit(a,a.topUrl,1010);
  const b=page("https://third.test/bounce",20000,a);commit(b,b.topUrl,20010);
  const c=page("https://origin.test/end?bounceUIDcookie=42",20100,b);
  assert.equal((await report(c)).bounce.status,"insufficient-evidence");
  commit(c,c.topUrl,20110,"link",["client_redirect"]);
  const r=await report(c);assert.equal(r.bounce.status,"indicator");assert.equal(r.bounce.sequences[0].redirectType,"client-redirect");
  assert.deepEqual(r.bounce.sequences[0].parameters,["bounceUIDcookie"]);
});
test("advanced: navegação digitada não une uma sequência anterior",async()=>{
  const a=page(),b=page("https://third.test/",1200,a);commit(b,b.topUrl,1210);
  const c=page(`https://origin.test/?uid=${ID}`,1300,b);commit(c,c.topUrl,1310,"typed");
  const r=await report(c);assert.equal(r.bounce.status,"insufficient-evidence");assert.equal(r.bounce.route.length,1);
});
test("advanced: passagem longa e intermediário da mesma organização não viram bounce",async()=>{
  for(const [middle,endAt] of [["https://third.test/",13000],["https://cdn.origin.test/",1300]]) {
    const s=page();hop(s,s.topUrl,middle,1100);hop(s,middle,`https://origin.test/end?uid=${ID}`,endAt);
    assert.equal((await report(s)).bounce.status,"insufficient-evidence");
  }
});
test("advanced: redirects em iframe não são bounce de main_frame",async()=>{
  const s=page();request(s,"https://third.test/",1100,"sub_frame","frame");
  redirect(s,"https://third.test/",`https://origin.test/end?uid=${ID}`,1150,"frame","sub_frame");
  request(s,`https://origin.test/end?uid=${ID}`,1200,"sub_frame","frame");
  assert.equal((await report(s)).bounce.status,"insufficient-evidence");
});
test("advanced: parâmetros funcionais e credenciais não geram falso positivo",async()=>{
  const s=page(`https://origin.test/?page=2&q=other&id=1234&state=${ID}&nonce=${ID}&token=${ID}`);
  request(s,`https://third.test/?page=2&q=other&id=1234&state=${ID}&nonce=${ID}&token=${ID}`,1100);
  const r=await report(s);assert.equal(r.queryParameters.findings.length,0);assert.equal(r.cookieSync.indicators.length,0);
});
test("advanced: campanha e ID de clique conhecidos são sinais potenciais, sem confirmação",async()=>{
  const s=page("https://origin.test/?utm_source=demo&fbclid=12345&q=other");
  const r=await report(s);assert.equal(r.queryParameters.status,"potential-tracking");
  assert.deepEqual(r.queryParameters.findings.map(f=>f.parameter),["utm_source","fbclid"]);
  assert.equal(r.cookieSync.indicators.length,0);
});
test("advanced: ID reaparecendo entre sites em terceiro gera comparação segura",async()=>{
  const s=page();request(s,`https://first.test/sync?uid=${ID}`,1100);request(s,`https://second.test/match?partner_id=${ID}`,1200);
  const r=await report(s), indicator=r.cookieSync.indicators[0];
  assert.equal(r.cookieSync.status,"indicator");assert.deepEqual(indicator.domains,["first.test","second.test"]);
  assert.equal(indicator.cookieValueCompared,false);assert.equal(indicator.occurrences[0].at,1100);
  assert.ok(r.queryParameters.findings.some(f=>f.reasons.includes("cross-site-reuse")));
});
test("advanced: nome de endpoint sync sozinho é insuficiente",async()=>{
  const s=page();request(s,"https://third.test/sync?page=2",1100);
  const r=await report(s);assert.equal(r.cookieSync.status,"not-observed");assert.equal(r.cookieSync.endpointHints.length,1);
});
test("advanced: mesmo nome com IDs diferentes e reutilização só no mesmo site não são sync",async()=>{
  for(const [second,value] of [["second.test",OTHER],["cdn.first.test",ID]]) {
    const s=page();request(s,`https://first.test/?uid=${ID}`,1100);request(s,`https://${second}/?uid=${value}`,1200);
    assert.equal((await report(s)).cookieSync.indicators.length,0);
  }
});
test("advanced: contexto do evento não usa host visto depois durante HMAC/PSL assíncrono",async()=>{
  const s=page();request(s,`https://third.test/pixel?uid=${ID}`,1100);
  hop(s,s.topUrl,"https://third.test/",1200);
  const r=await report(s), early=r.queryParameters.findings.find(f=>f.at===1100);
  assert.equal(early.party,"third");assert.equal(early.domain,"third.test");
});
test("advanced: valores sensíveis, credenciais, fragmentos, chave e hashes não saem no JSON",async()=>{
  const s=page(`https://user:SECRET_PASSWORD@origin.test/a?uid=${ID}&email=secret%40email.test&token=SECRET_TOKEN#SECRET_FRAGMENT`);
  request(s,`https://third.test/?uid=${ID}`,1100);
  const json=JSON.stringify(await report(s));
  for(const forbidden of [ID,"SECRET_PASSWORD","secret@email.test","SECRET_TOKEN","SECRET_FRAGMENT","fingerprint","CryptoKey"])
    assert.equal(json.includes(forbidden),false,forbidden);
  assert.equal(/[a-f0-9]{64}/.test(json),false);
});
test("advanced: nomes de parâmetros inseguros são omitidos",async()=>{
  const s=page(`https://origin.test/?secret%40email.test=${ID}`);
  const r=await report(s);assert.equal(r.queryParameters.findings[0].parameter,"[nome omitido]");
});
test("advanced: limites de observações, parâmetros, hashes, resultados e histórico são explícitos",async()=>{
  const s=page(`https://origin.test/?uid=${ID}&cid=${ID}&gid=${ID}`,1000,undefined,1,
    {observations:2,parameters:2,hashes:1,findings:1,previousHops:1});
  request(s,`https://third.test/?uid=${ID}`,1100);request(s,"https://late.test/",1200);
  const r=await report(s);assert.equal(r.coverage.partial,true);
  for(const key of ["observations","parameters","hashes","findings"]) assert.ok(r.coverage.dropped[key]>0,key);
  const t=page("https://next.test/",2000,s,1,{previousHops:0});
  assert.equal(t.tracking.previousRoute.length,0);
});
test("advanced: valores longos não são retidos nem comparados",async()=>{
  const s=page(`https://origin.test/?uid=${"SENSITIVE".repeat(100)}`);
  const r=await report(s);assert.equal(r.coverage.dropped.values,1);assert.equal(JSON.stringify(r).includes("SENSITIVE"),false);
});
test("advanced: múltiplas abas nunca misturam IDs ou sequências",async()=>{
  const a=page("https://origin.test/",1000,undefined,1),b=page("https://origin.test/",1000,undefined,2);
  request(a,`https://first.test/?uid=${ID}`,1100);request(b,`https://second.test/?uid=${ID}`,1100);
  assert.equal((await report(a)).cookieSync.indicators.length,0);assert.equal((await report(b)).cookieSync.indicators.length,0);
});
test("advanced: nova navegação zera queries e comparações, inclusive tarefas HMAC pendentes",async()=>{
  const a=page();request(a,`https://first.test/?uid=${ID}`,1100);
  const b=page("https://origin.test/next",1200,a);request(b,`https://second.test/?uid=${ID}`,1300);
  const r=await report(b);assert.equal(r.cookieSync.indicators.length,0);
  assert.equal(r.queryParameters.findings.some(f=>f.domain==="first.test"),false);
  const c=page("https://origin.test/clean",1400,b);assert.equal((await report(c)).queryParameters.findings.length,0);
});
test("advanced: destino declarado sem request observado não completa bounce",async()=>{
  const s=page();hop(s,s.topUrl,"https://third.test/",1100);
  redirect(s,"https://third.test/",`https://origin.test/end?uid=${ID}`,1200);
  assert.equal((await report(s)).bounce.status,"insufficient-evidence");
});
test("advanced: Firefox sem client_redirect exige iniciador intermediário, sinal adicional e confiança baixa",async()=>{
  for(const [initiator,query,expected] of [["third.test",`uid=${ID}`,"indicator"],["third.test","page=2","insufficient-evidence"],
    ["other.test",`uid=${ID}`,"insufficient-evidence"]]) {
    const a=page(),b=page("https://third.test/bounce",2000,a);commit(b,b.topUrl,2010);
    const c=P.newPage(1,`https://origin.test/end?${query}`,"client",2200);c.tracking=P.newTrackingPage(c,b);
    P.observeTrackingRequest(c.tracking,{url:c.topUrl,timeStamp:2200,requestId:"client",type:"main_frame",frameId:0,
      originUrl:`https://${initiator}/bounce`});
    commit(c,c.topUrl,2210,"link");
    const r=await report(c);assert.equal(r.bounce.status,expected);
    if(expected==="indicator") {assert.equal(r.bounce.sequences[0].confidence,"low");assert.equal(r.bounce.sequences[0].redirectType,"client-redirect-inferred");}
  }
});
test("advanced: sequência de outra aba não pode virar histórico anterior",async()=>{
  const a=page("https://first.test/",1000,undefined,1);
  const b=page("https://second.test/",1100,a,2);commit(b,b.topUrl,1110);
  assert.equal(b.tracking.previousRoute.length,0);
});
test("advanced: timestamps anteriores à navegação são ignorados e hops fora de ordem sinalizados",async()=>{
  const s=page();request(s,`https://old.test/?uid=${ID}`,900);
  request(s,"https://late.test/",1300,"main_frame",s.navigationRequestId);
  request(s,"https://out-of-order.test/",1200,"main_frame",s.navigationRequestId);
  const r=await report(s);assert.equal(r.queryParameters.findings.length,0);assert.equal(r.coverage.dropped.outOfOrder,1);
  assert.equal(r.bounce.route.some(h=>h.domain==="out-of-order.test"),false);
});
test("advanced: nome numérico ou email também é omitido no relatório de rede",()=>{
  const r=P.safeUrl("https://example.test/?0.123456789&private%40mail.test=x&page=2");
  assert.deepEqual(r.queryKeys,["[nome omitido]","page"]);
});
test("advanced: campanha reutilizada não é automaticamente ID individual/cookie sync",async()=>{
  const s=page(`https://origin.test/?utm_campaign=${ID}`);
  request(s,`https://third.test/?utm_campaign=${ID}`,1100);
  const r=await report(s);assert.equal(r.cookieSync.indicators.length,0);
  assert.ok(r.queryParameters.findings.every(f=>f.reasons.length===1 && f.reasons[0]==="campaign-parameter"));
});
