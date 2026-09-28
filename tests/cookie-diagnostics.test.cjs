"use strict";
const {test}=require("node:test"), assert=require("node:assert/strict");
require("../extension/lib/domain.js");require("../extension/lib/model.js");require("../extension/lib/cookie-diagnostics.js");
const P=globalThis.PrivacyLens;
test("histórico de diagnóstico truncado não afirma que evento nunca foi recebido",()=>{
  const d=P.createCookieDiagnostics({limit:1}), s=P.newPage(1,"https://example.com/","main",1000);
  d.registered(500);d.navigation(s,1000);
  for(const name of ["first","second"]) d.receive({cookie:{name,domain:"example.com",value:"SECRET"},removed:false,cause:"explicit"},1100,"ready");
  const r=d.report(s,{topUrl:s.topUrl,hosts:new Set(["example.com"])},{items:[],setCookieAttempts:[{name:"first",host:"example.com"}]},true,"ready");
  assert.equal(r.probes[0].status,"inconclusive");assert.equal(r.dropped,1);
  assert.equal(JSON.stringify(r).includes("SECRET"),false);
});
test("listener inativo e navegação parcial não afirmam ausência comprovada",()=>{
  for(const partial of [true,false]) {
    const d=P.createCookieDiagnostics(),s=P.newPage(1,"https://example.com/",partial?null:"main",1000);
    d.navigation(s,1000);
    const r=d.report(s,{topUrl:s.topUrl,hosts:new Set(["example.com"])},{items:[],setCookieAttempts:[{name:"id",host:"example.com"}]},partial,"ready");
    assert.equal(r.probes[0].status,"inconclusive");
  }
});
