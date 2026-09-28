"use strict";
const {test} = require("node:test"), assert = require("node:assert/strict");
require("../extension/lib/domain.js"); require("../extension/lib/model.js"); require("../extension/lib/cookies.js");
const P = globalThis.PrivacyLens, resolve = P.createDomainResolver("com\ntest");
const cookie = (extra = {}) => ({name: "id", domain: "example.com", path: "/", storeId: "default",
  hostOnly: true, session: true, value: "COOKIE_SECRET", ...extra});
const context = (extra = {}) => ({storeId: "default", topUrl: "https://example.com/", hosts: new Set(["example.com", "third.test"]), ...extra});
const page = () => P.newPage(1, "https://example.com/", "main", 1000);
const change = (h, at, extra = {}, removed = false, cause = "explicit") => h.change({cookie: cookie(extra), removed, cause}, at);
const summary = (s, items = []) => P.summarizeCookies(s, items, context(), resolve, 32000);

test("cookie antigo observado antes permanece preexistente sem virar criação", () => {
  const h = P.createCookieHistory(); h.inventory([cookie()], 500, h.revision);
  const s = page(); s.cookieBaseline = h.before(1000);
  const r = summary(s, [cookie()]);
  assert.equal(r.preexisting.currentCount, 1); assert.equal(r.probable.totals.total, 0);
  assert.equal(r.eventTotals.writes, 0); assert.equal(r.items[0].preexisting, "observed-before-navigation");
});
test("snapshot tardio ou no mesmo milissegundo não prova preexistência nem criação", () => {
  const h = P.createCookieHistory(); h.inventory([cookie()], 1000, h.revision);
  const s = page(); s.cookieBaseline = h.before(1000);
  h.inventory([cookie()], 2000, h.revision);
  const r = summary(s, [cookie()]);
  assert.equal(r.preexisting.currentCount, 0); assert.equal(r.preexisting.unknownCurrentCount, 1);
  assert.equal(r.probable.totals.total, 0);
});
test("snapshot pendente não ressuscita cookie removido nem sobrescreve evento novo", () => {
  const h = P.createCookieHistory(), revision = h.revision;
  change(h, 1000, {}, true); h.inventory([cookie()], 1100, revision);
  assert.equal(h.before(1200).size, 0);
});
test("baseline congelado não é alterado pela gravação posterior", () => {
  const h = P.createCookieHistory(); change(h, 500);
  const s = page(); s.cookieBaseline = h.before(1000);
  change(h, 1100, {}, true); change(h, 1200, {name: "new"});
  assert.equal(s.cookieBaseline.size, 1); assert.equal([...s.cookieBaseline.values()][0].name, "id");
});
test("cookie persistente já expirado não entra em baseline", () => {
  const h = P.createCookieHistory(); h.inventory([cookie({session: false, expirationDate: 0.8})], 500, 0);
  assert.equal(h.before(1000).size, 0);
});
test("explicit sem overwrite é criação inferida; overwrite + explicit é uma alteração", () => {
  const h = P.createCookieHistory(), s = page();
  const created = change(h, 1100);
  P.recordCookieEvent(s, created, context(), resolve);
  P.recordCookieEvent(s, change(h, 1200, {}, true, "overwrite"), context(), resolve);
  const altered = change(h, 1201);
  P.recordCookieEvent(s, altered, context(), resolve);
  const r = summary(s, [cookie()]);
  assert.equal(created.kind, "created"); assert.equal(altered.kind, "changed");
  assert.equal(altered.basis, "overwrite-explicit-sequence");
  assert.deepEqual(r.eventTotals, {observed: 3, writes: 2, created: 1, changed: 1, unknown: 0, removed: 1});
  assert.equal(r.probable.totals.total, 1);
  assert.equal(r.probable.items[0].createdObserved, true); assert.equal(r.probable.items[0].changedObserved, true);
});
test("overwrite identifica alteração mesmo sem inventário prévio", () => {
  const h = P.createCookieHistory(); change(h, 1100, {}, true, "overwrite");
  assert.equal(change(h, 1101).kind, "changed");
});
test("overwrite antigo não transforma substituição atrasada em falsa criação", () => {
  const h = P.createCookieHistory(); change(h, 1100, {}, true, "overwrite");
  assert.equal(change(h, 2200).kind, "unknown");
});
test("identidade previamente observada impede classificar escrita como criação", () => {
  const h = P.createCookieHistory(); h.inventory([cookie()], 500, 0);
  const e = change(h, 1200); assert.equal(e.kind, "changed");
  assert.equal(e.basis, "previously-observed-identity");
});
test("remoção explícita ou expiração seguida de criação não é alteração", () => {
  for (const cause of ["explicit", "expired", "expired_overwrite", "evicted"]) {
    const h = P.createCookieHistory(); change(h, 500); change(h, 1100, {}, true, cause);
    assert.equal(change(h, 1200).kind, "created", cause);
  }
});
test("tentativa Set-Cookie rejeitada nunca é promovida a sucesso ou gravação", () => {
  const s = page(); s.setCookies.push(P.setCookieAttempt("id=SECRET; Domain=invalid.test", {url:s.topUrl, timeStamp:1100, requestId:"main"}));
  const r = summary(s);
  assert.equal(r.setCookieAttempts.length, 1); assert.equal(r.setCookieAttempts[0].outcome, "not-established");
  assert.equal(r.probable.totals.total, 0); assert.equal(r.eventTotals.observed, 0);
});
test("identidades e eventos preservam paths, containers, FPI e partições", () => {
  const h = P.createCookieHistory(), s = page();
  for (const path of ["/", "/sub"]) P.recordCookieEvent(s, change(h, 1100, {path}), context(), resolve);
  assert.equal(summary(s).probable.totals.total, 2);
  const variants = [{storeId:"container"}, {firstPartyDomain:"other.com"},
    {partitionKey:{topLevelSite:"https://other.com"}}, {partitionKey:{topLevelSite:"http://example.com"}}];
  for (const extra of variants) assert.equal(P.recordCookieEvent(s, change(h, 1100, extra), context(), resolve), false);
  assert.equal(summary(s).eventTotals.observed, 2);
});
test("bit de ancestralidade participa da identidade e, quando conhecido, do filtro", () => {
  const c = cookie({partitionKey:{topLevelSite:"https://example.com",hasCrossSiteAncestor:true}});
  assert.equal(P.cookieMatches(c, context({partitionKey:{hasCrossSiteAncestor:false}}), resolve), false);
  assert.notEqual(P.cookieKey(c), P.cookieKey({...c,partitionKey:{...c.partitionKey,hasCrossSiteAncestor:false}}));
});
test("janela tem limites inclusivos; evento tardio não aparece após Atualizar", () => {
  const s = page(), h = P.createCookieHistory();
  for (const at of [999, 1000, 31000, 31001]) P.recordCookieEvent(s, change(h, at, {name:String(at)}), context(), resolve);
  const r = summary(s, [cookie({name:"31001"})]);
  assert.deepEqual(r.events.map(e => e.at), [1000,31000]); assert.equal(r.window.status, "closed");
  assert.equal(r.items[0].hasCorrelatedWrite, false);
});
test("página parcial não ganha uma janela artificial de atribuição", () => {
  const s = P.newPage(1,"https://example.com",null,1000);
  assert.equal(P.recordCookieEvent(s, change(P.createCookieHistory(),1100), context(),resolve), false);
  assert.equal(summary(s).window.status,"unavailable");
});
test("primeira/terceira parte e sessão/persistente nas gravações", () => {
  const s = page(), h = P.createCookieHistory();
  P.recordCookieEvent(s, change(h,1100),context(),resolve);
  P.recordCookieEvent(s, change(h,1101,{domain:"third.test",session:false,expirationDate:100,
    partitionKey:{topLevelSite:"https://example.com"}}),context(),resolve);
  assert.deepEqual(summary(s).probable.totals, {total:2,first:1,third:1,session:1,persistent:1,partitioned:1});
});
test("duas navegações compatíveis preservam ambiguidade, não autoria exclusiva", () => {
  const a = page(), b = page(), e = change(P.createCookieHistory(),1100);
  for (const s of [a,b]) P.recordCookieEvent(s,e,context(),resolve,2);
  assert.equal(summary(a).events[0].matchingObservedNavigations,2);
  assert.equal(summary(b).events[0].attribution,"temporal-context-correlation");
});
test("limite de eventos é visível e não inventa identidades extras", () => {
  const s = page(), h = P.createCookieHistory();
  P.recordCookieEvent(s,change(h,1100),context(),resolve,1,1);
  P.recordCookieEvent(s,change(h,1200,{name:"second"}),context(),resolve,1,1);
  assert.equal(s.droppedCookieWrites,1); assert.equal(summary(s).eventTotals.observed,2);
  assert.equal(summary(s).probable.totals.total,1);
});
test("histórico truncado usa classificação indeterminada quando falta evidência", () => {
  const h = P.createCookieHistory({limit:1}); change(h,500); change(h,600,{name:"other"});
  assert.ok(h.dropped); assert.equal(change(h,1100).kind,"unknown");
});
test("nenhum valor de cookie/cabeçalho aparece no estado, resumo ou JSON", () => {
  const h = P.createCookieHistory(), s = page();
  const raw = cookie({partitionKey:{topLevelSite:"https://example.com",value:"PARTITION_SECRET"}});
  h.inventory([raw],500,0); s.cookieBaseline=h.before(1000);
  P.recordCookieEvent(s,h.change({cookie:raw,removed:false,cause:"explicit"},1100),context(),resolve);
  s.setCookies.push(P.setCookieAttempt("id=HEADER_SECRET; Unrecognized=ATTRIBUTE_SECRET",{url:"https://u:URL_SECRET@example.com/?x=QUERY_SECRET",timeStamp:1100}));
  const json=JSON.stringify({report:summary(s,[raw]),baseline:[...s.cookieBaseline],writes:[...s.cookieWrites]});
  assert.equal(/SECRET|"value"/.test(json),false);
});
