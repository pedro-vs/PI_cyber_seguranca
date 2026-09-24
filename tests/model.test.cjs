"use strict";
const {test} = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
require("../extension/lib/domain.js"); require("../extension/lib/model.js");
const P = globalThis.PrivacyLens;
const resolve = P.createDomainResolver(fs.readFileSync(path.join(__dirname, "../extension/vendor/public_suffix_list.dat"), "utf8"));
test("PSL classifica com.br e co.uk sem unir organizações distintas", () => {
  assert.equal(resolve("cdn.exemplo.com.br"), "exemplo.com.br");
  assert.equal(resolve("shop.example.co.uk"), "example.co.uk");
  assert.equal(P.party("cdn.exemplo.com.br", "www.exemplo.com.br", resolve), "first");
  assert.equal(P.party("outro.com.br", "exemplo.com.br", resolve), "third");
});
test("PSL PRIVATE mantém tenants github.io separados", () => {
  assert.equal(resolve("img.alice.github.io"), "alice.github.io");
  assert.equal(P.party("alice.github.io", "bob.github.io", resolve), "third");
});
test("PSL cobre wildcard e exceções", () => {
  assert.equal(resolve("a.b.ck"), "a.b.ck");
  assert.equal(resolve("a.www.ck"), "www.ck");
  assert.equal(resolve("a.city.kawasaki.jp"), "city.kawasaki.jp");
});
test("normaliza IDN, ponto final, IP, IPv6 e localhost", () => {
  assert.equal(resolve("WWW.Exemplo.COM.BR."), "exemplo.com.br");
  assert.equal(P.normalizeHost("bücher.de"), "xn--bcher-kva.de");
  assert.equal(resolve("127.0.0.1"), "127.0.0.1");
  assert.equal(resolve("[::1]"), "[::1]");
  assert.equal(resolve("localhost"), "localhost");
  assert.equal(P.party("", "example.com", resolve), "unknown");
});
test("cookies: domínio exige fronteira e respeita hostOnly", () => {
  const c = {storeId: "default", domain: ".example.com", hostOnly: false};
  const context = {storeId: "default", topUrl: "https://example.com/", hosts: new Set(["sub.example.com"])};
  assert.equal(P.cookieMatches(c, context, resolve), true);
  assert.equal(P.cookieMatches({...c, hostOnly: true}, context, resolve), false);
  assert.equal(P.cookieMatches(c, {...context, hosts: new Set(["evil-example.com"])}, resolve), false);
});
test("cookies: não mistura containers, FPI e partições de outros top sites", () => {
  const c = {storeId: "default", domain: "tracker.test", hostOnly: true};
  const context = {storeId: "default", topUrl: "https://example.com/", hosts: new Set(["tracker.test"])};
  assert.equal(P.cookieMatches({...c, storeId: "container2"}, context, resolve), false);
  assert.equal(P.cookieMatches({...c, firstPartyDomain: "other.com"}, context, resolve), false);
  assert.equal(P.cookieMatches({...c, partitionKey: {topLevelSite: "https://other.com"}}, context, resolve), false);
  assert.equal(P.cookieMatches({...c, partitionKey: {topLevelSite: "http://example.com"}}, context, resolve), false);
  assert.equal(P.cookieMatches({...c, partitionKey: {topLevelSite: "https://example.com"}}, context, resolve), true);
});
test("cookies de mesmo nome em caminhos ou partições distintas não colapsam", () => {
  const a = {name:"id", domain:"example.com", path:"/", storeId:"default"};
  assert.notEqual(P.cookieKey(a), P.cookieKey({...a, path:"/sub"}));
  assert.notEqual(P.cookieKey(a), P.cookieKey({...a, partitionKey:{topLevelSite:"https://example.com"}}));
  assert.notEqual(P.cookieKey({...a, partitionKey:{hasCrossSiteAncestor:false}}), P.cookieKey({...a, partitionKey:{hasCrossSiteAncestor:true}}));
});
test("metadados de cookies e URL não incluem valores ou credenciais", () => {
  assert.equal("value" in P.cookieMetadata({name:"id", value:"SECRET"}), false);
  assert.deepEqual(P.safeUrl("https://alice:secret@example.com/a?token=SECRET&x=2#password"), {url:"https://example.com/a",queryKeys:["token","x"]});
});
test("rede mantém tentativas, erros e hops sem confundir com TCP", () => {
  const s = P.newPage(1, "https://example.com", "main", 1000);
  P.recordRequest(s, {requestId:"main",url:"https://example.com",type:"main_frame",timeStamp:1000});
  P.recordRequest(s, {requestId:"a",url:"https://tracker.test/a",type:"image",timeStamp:1001});
  s.latestRequest.get("a").status = "redirect";
  P.recordRequest(s, {requestId:"a",url:"https://tracker.test/b",type:"image",timeStamp:1002});
  s.latestRequest.get("a").status = "error";
  const summary=P.summarizeNetwork(s,resolve);
  assert.deepEqual(summary.totals,{total:3,first:1,third:2,unknown:0,failed:1});
});
test("limita volume e informa truncamento", () => {
  const s=P.newPage(1,"https://example.com","main");
  P.recordRequest(s,{requestId:"a",url:"https://example.com/a"},1);
  P.recordRequest(s,{requestId:"b",url:"https://example.com/b"},1);
  assert.equal(s.requests.length,1); assert.equal(s.droppedRequests,1);
});
test("nova navegação tem estado independente", () => {
  const a=P.newPage(1,"https://example.com","a"), b=P.newPage(1,"https://other.com","b");
  a.frames.set(0,{origin:"https://example.com"}); a.cookieWrites.set("id",{});
  assert.equal(b.frames.size,0); assert.equal(b.cookieWrites.size,0);
});
