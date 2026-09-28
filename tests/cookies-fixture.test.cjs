"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fixture=require("./fixture/cookies.cjs");
function response(scenario) {
  const headers=new Map();let body="";
  fixture({}, {setHeader:(key,value)=>headers.set(key,value),end:value=>{body=value;},writeHead(){}},
    new URL(`http://localhost:8787/cookies/${scenario}`),8787);
  return {headers:headers.get("Set-Cookie") || [],body};
}
const meta = header => ({name:header.slice(0,header.indexOf("=")),path:/; Path=([^;]+)/.exec(header)?.[1],
  removed:header.includes("Expires=Thu, 01 Jan 1970 00:00:00 GMT"),partitioned:header.includes("; Partitioned")});
test("setup remove identidades e paths emitidos pelos cenários e só recria os dois seeds",()=>{
  const reset=response("setup").headers.map(meta);
  for(const scenario of ["session","change","paths","rejected"]) {
    for(const cookie of response(scenario).headers.map(meta))
      assert.ok(reset.some(r=>r.removed && r.name===cookie.name && r.path===cookie.path),scenario);
  }
  for(const name of ["pl3_persistent","pl3_session","pl3_third"])
    for(const path of ["/","/cookies","/cookies/sub"])
      for(const partitioned of [true,false])
        assert.ok(reset.some(r=>r.removed && r.name===name && r.path===path && r.partitioned===partitioned));
  assert.deepEqual(reset.filter(r=>!r.removed).map(r=>r.name),["pl3_existing","pl3_change"]);
});
test("limpeza terceira ocorre no iframe da mesma origem, paths e top site",()=>{
  assert.ok(response("setup").body.includes('http://127.0.0.1:8787/cookies/third-reset'));
  const reset=response("third-reset").headers;
  for(const cookie of response("third-frame").headers.map(meta)) {
    assert.ok(reset.some(h=>{const r=meta(h);return r.name===cookie.name && r.path===cookie.path && r.removed &&
      h.includes("SameSite=None") && h.includes("Secure");}));
  }
  assert.ok(reset.every(h=>meta(h).removed));
});
test("setup não tenta apagar cookies fora dos sete nomes da fixture",()=>{
  const allowed=new Set(["pl3_existing","pl3_change","pl3_session","pl3_persistent","pl3_rejected","pl3_path","pl3_third"]);
  for(const scenario of ["setup","third-reset"]) for(const header of response(scenario).headers)
    assert.ok(allowed.has(meta(header).name));
});
