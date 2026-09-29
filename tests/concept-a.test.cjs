"use strict";
const {test}=require("node:test"), assert=require("node:assert/strict"), fs=require("node:fs"), vm=require("node:vm");
const {harness}=require("./helpers/background.cjs"), {popup}=require("./helpers/popup.cjs");
function libs() {
  const ctx=vm.createContext({URL});
  for(const file of ["domain","model","cookies","security","score","blocklist"])
    vm.runInContext(fs.readFileSync(`extension/lib/${file}.js`,"utf8"),ctx);
  return ctx.PrivacyLens;
}
const plain=x=>JSON.parse(JSON.stringify(x));
const resolve=host=>host.endsWith(".co.uk") ? host.split(".").slice(-3).join(".") : host.split(".").slice(-2).join(".");
const observation=()=>({version:"integrity-v1",status:"observed",scans:31,ownInstrumentation:[],changes:[],failed:[],unsupported:[]});
const change=(api="Window.fetch",at=2000)=>({api,at,kind:"descriptor-changed",afterOwnInstrumentation:false});
const frame=(changes=[])=>({frameId:0,origin:"https://example.com",at:32000,activeAtRefresh:true,observation:{...observation(),changes}});
const request=(i,at=2000+i*2000)=>({id:String(i),host:"third.test",url:"https://third.test/poll",frameId:0,type:"xmlhttprequest",method:"GET",at,status:"completed",statusCode:200});
function state(changes=[],requests=[]) {return {topUrl:"https://example.com",startedAt:1000,partial:false,droppedRequests:0,
  activeFrameIds:new Set([0]),securityFrames:new Map([[0,frame(changes)]]),requests};}

test("hook: distingue bootstrap canvas próprio, alteração posterior e APIs que não alterou",()=>{
  const P=libs(), descriptors=new Map(P.securityTargets.map(n=>[n,{value:()=>1,writable:true,configurable:true}]));
  let now=1000;const tracker=P.createIntegrityObserver(n=>descriptors.get(n),()=>now);
  descriptors.set("HTMLCanvasElement.toDataURL",{value:()=>2});tracker.finishBootstrap();
  assert.deepEqual(plain(tracker.snapshot().ownInstrumentation),["HTMLCanvasElement.toDataURL"]);
  assert.equal(tracker.snapshot().changes.length,0);
  now=2000;descriptors.set("Window.fetch",{get:()=>{throw Error("must-not-run");}});
  descriptors.delete("Window.WebSocket");descriptors.set("HTMLCanvasElement.toDataURL",{value:()=>3});tracker.scan();tracker.scan();
  const observed=plain(tracker.snapshot());assert.equal(observed.changes.length,3);
  assert.equal(observed.changes.find(c=>c.api==="Window.WebSocket").kind,"removed");
  assert.equal(observed.changes.find(c=>c.api==="HTMLCanvasElement.toDataURL").afterOwnInstrumentation,true);
  assert.equal(observed.changes.find(c=>c.api==="Window.fetch").afterOwnInstrumentation,false);
  assert.equal(JSON.stringify(observed).includes("must-not-run"),false);
});
test("hook: sanitização limita APIs/amostras e não exporta código/valores extras",()=>{
  const P=libs(), raw={...observation(),changes:[{...change(),source:"SECRET",value:"SECRET"}],secret:"SECRET"};
  assert.equal(JSON.stringify(P.sanitizeIntegrity(raw)).includes("SECRET"),false);
  for(const patch of [{changes:[change("Window.unknown")]},{scans:-1},{changes:Array(30).fill(change())},{failed:["unknown"]}])
    assert.equal(P.sanitizeIntegrity({...raw,...patch}),null);
});
test("hook: erro de leitura e API ausente permanecem cobertura parcial",()=>{
  const P=libs(), tracker=P.createIntegrityObserver(n=>{if(n==="Window.fetch") throw Error("SECRET");},()=>1000);
  tracker.finishBootstrap();const s=state();s.securityFrames.get(0).observation=tracker.snapshot();
  const result=P.summarizeSecurity(s,resolve,32000);assert.equal(result.coverage.partial,true);
  assert.equal(result.status,"not-observed");assert.equal(JSON.stringify(result).includes("SECRET"),false);
});
test("hijacking: WebSocket isolado, polling legítimo e hook isolado não geram combinação",()=>{
  const P=libs();
  for(const s of [state([], [{...request(0),type:"websocket"}]),state([],Array.from({length:4},(_,i)=>request(i))),state([change()])]) {
    const result=P.summarizeSecurity(s,resolve,32000);assert.equal(result.status,"observations");assert.equal(result.combinations.length,0);
  }
});
test("hijacking: exige mesmo frame e intervalo; rajada, requests falhas e bloqueios não contam",()=>{
  const P=libs(), requests=Array.from({length:4},(_,i)=>request(i));
  assert.equal(P.summarizeSecurity(state([change()],requests),resolve,32000).combinations.length,1);
  for(const items of [requests.map(r=>({...r,frameId:1})),requests.map(r=>({...r,status:"error"})),
    requests.map(r=>({...r,blockedBy:"privacy-lens-custom-list"})),requests.map((r,i)=>({...r,at:2000+i*100})),
    requests.map((r,i)=>({...r,at:2000+i*31000}))])
    assert.equal(P.summarizeSecurity(state([change()],items),resolve,32000).combinations.length,0);
  assert.equal(P.summarizeSecurity(state([change("Window.fetch",16000)],requests),resolve,32000).combinations.length,0);
});
function scoreReport() {return {generatedAt:new Date(32000).toISOString(),coverage:{partial:false,storageFramesComplete:true,canvasFramesComplete:true},
  network:{requests:[]},cookies:{events:[],errors:[],window:{status:"closed"}},
  storage:[{origin:"https://example.com",frameId:0,party:"first",at:32000,activeAtRefresh:true,
    localStorage:{status:"observed",count:0},sessionStorage:{status:"observed",count:0},indexedDB:{status:"observed",count:0}}],
  canvas:{classification:"not-observed",partial:false,frames:[]},
  advancedTracking:{availability:"available",coverage:{partial:false},bounce:{sequences:[]},cookieSync:{indicators:[]}},
  security:{availability:"available",coverage:{partial:false},combinations:[]}};}
test("score: controle coberto 100; parcial/unavailable não inventa zero confirmado",()=>{
  const P=libs(), r=scoreReport();assert.equal(P.privacyScore(r,resolve).value,100);
  delete r.security;const s=P.privacyScore(r,resolve);assert.equal(s.value,null);assert.deepEqual(plain(s.range),{min:80,max:100});
  assert.equal(s.coveredCategories,5);
  r.storage[0].at=1000;r.coverage.canvasFramesComplete=false;
  assert.deepEqual(plain(P.privacyScore(r,resolve).range),{min:55,max:100});
});
test("score: deduplica sites/identidades/origens, ignora Set-Cookie e estoque, não soma bounce e sync",()=>{
  const P=libs(),r=scoreReport();r.network.requests=[{...request(1),party:"third"},{...request(2),party:"third"}];
  r.cookies.items=[{name:"stock",session:false}];r.cookies.setCookieAttempts=[{name:"attempt"}];
  assert.equal(P.privacyScore(r,resolve).categories.find(c=>c.id==="C").points,0);
  const c={name:"id",domain:"third.test",path:"/",storeId:"default",party:"third",session:false,removed:false};
  r.cookies.events=[c,{...c,at:2000},{...c,removed:true}];
  const f={...r.storage[0],party:"third",origin:"https://third.test",localStorage:{status:"observed",count:1}};
  r.storage.push(f,{...f,frameId:2});
  r.advancedTracking.bounce.sequences=[{status:"indicator",confidence:"moderate",domains:["a","b","a"]}];
  r.advancedTracking.cookieSync.indicators=[{id:"s1",confidence:"moderate",domains:["a","b"]}];
  const s=P.privacyScore(r,resolve);assert.deepEqual(plain(s.categories.map(c=>c.points)),[2,4,2,0,15,0]);assert.equal(s.value,77);
});
test("score: sem desconto de baixa confiança; tetos e sensibilidade ±20% permanecem válidos",()=>{
  const P=libs(),r=scoreReport();r.advancedTracking.cookieSync.indicators=[{confidence:"low"}];
  assert.equal(P.privacyScore(r,resolve).value,100);
  r.network.requests=Array.from({length:30},(_,i)=>({...request(i),host:`site${i}.test`,party:"third"}));
  r.canvas.classification="indicator";
  r.security.combinations=[{channel:{frameId:0,domain:"third.test",requestIds:["1"],at:1000},changes:[change()]}];
  for(const factor of [.8,1,1.2]) {const s=P.privacyScore(r,resolve,factor);assert.ok(s.value>=0 && s.value<=100);
    assert.ok(s.categories.every(c=>c.points<=c.cap && c.points>=0));}
  r.network.requests.forEach(r=>r.blockedBy="privacy-lens-custom-list");
  assert.equal(P.privacyScore(r,resolve).categories[0].points,0);
});
function storage(saved) {return {data:saved,get:async function(){return this.data||{};},set:async function(v){this.data=plain(v);}};}
test("blocklist: persiste regras; fronteira de hostname, IDN, portas, subdomínios, toggle e remoção",async()=>{
  const P=libs(),db=storage(),list=P.createBlocklist(db,Promise.resolve(resolve));await list.ready;
  assert.equal((await list.decide("https://example.com")),null);
  await list.update({operation:"add",host:"EXAMPLE.com.",includeSubdomains:true});
  for(const url of ["https://example.com", "https://a.example.com:8443/a?secret=1","wss://example.com/socket"])
    assert.equal((await list.decide(url)).host,"example.com");
  for(const url of ["https://badexample.com","https://example.com.evil.test","moz-extension://example.com/file"])
    assert.equal(await list.decide(url),null);
  const restarted=P.createBlocklist(db,Promise.resolve(resolve));await restarted.ready;
  assert.equal((await restarted.decide("https://example.com")).host,"example.com");
  await restarted.update({operation:"enabled",enabled:false});assert.equal(await restarted.decide("https://example.com"),null);
  await restarted.update({operation:"enabled",enabled:true});
  await restarted.update({operation:"add",host:"example.com",includeSubdomains:false});assert.equal(await restarted.decide("https://sub.example.com"),null);
  await restarted.update({operation:"remove",host:"example.com"});assert.equal(restarted.snapshot().rules.length,0);
  await restarted.update({operation:"add",host:"münich.com",includeSubdomains:false});assert.equal((await restarted.decide("https://xn--mnich-kva.com")).host,"xn--mnich-kva.com");
});
test("blocklist: rejeita URLs, sufixos públicos e entradas ambíguas; erro de escrita mantém configuração",async()=>{
  const P=libs(),db=storage(),list=P.createBlocklist(db,Promise.resolve(resolve));await list.ready;
  for(const host of ["com","co.uk","https://example.com","example.com/path","*.example.com","example.com:80","a..com","-bad.com"])
    await assert.rejects(list.update({operation:"add",host,includeSubdomains:true}));
  await list.update({operation:"add",host:"example.com",includeSubdomains:true});
  db.set=async()=>{throw Error("SECRET");};await assert.rejects(list.update({operation:"remove",host:"example.com"}),/anterior foi preservada/);
  assert.equal((await list.decide("https://example.com")).host,"example.com");
});
test("blocklist: espera carregamento; falhas são explícitas e não bloqueiam tudo",async()=>{
  const P=libs();let resume;const db={get:()=>new Promise(r=>resume=r)};
  const list=P.createBlocklist(db,Promise.resolve(resolve));let resolved=false;
  const decision=list.decide("https://example.com").then(d=>{resolved=true;return d;});await Promise.resolve();assert.equal(resolved,false);
  resume({customBlocklist:{enabled:true,rules:[{host:"example.com",includeSubdomains:true}]}});assert.equal((await decision).host,"example.com");
  for(const store of [undefined,{get:async()=>{throw Error("SECRET");}},storage({customBlocklist:{enabled:true,rules:[{}]}})]) {
    const broken=P.createBlocklist(store,Promise.resolve(resolve));await broken.ready;
    assert.equal(broken.snapshot().status,"unavailable");assert.equal(await broken.decide("https://example.com"),null);
    assert.equal(JSON.stringify(broken.snapshot()).includes("SECRET"),false);
  }
});
test("background: hooks associados ao frame/documento; navegação nova não herda sinais",async()=>{
  const h=harness();await h.navigate();h.frames.set(0,{frameId:0,url:"https://example.com/"});h.time(2000);
  const sender={id:"test",tab:{id:1},frameId:0,url:"https://example.com/"};
  const message={type:"security-snapshot",timeOrigin:1000,sequence:2,observation:{...observation(),changes:[change()]}};
  await h.listeners.message(message,sender);assert.equal((await h.report()).security.changes.length,1);
  await h.listeners.message({...message,sequence:1,observation:observation()},sender);assert.equal((await h.report()).security.changes.length,1);
  h.time(4000);await h.navigate("next");await h.listeners.message({...message,sequence:3},sender);
  const r=await h.report();assert.equal(r.security.changes.length,0);assert.equal(r.score.status,"partial");
});
test("background: blocklist cancela requisição, registra decisão própria sem query e isola acesso do content script",async()=>{
  const h=harness({localStorage:storage()}), sender={id:"test",url:"moz-extension://test/popup/popup.html"};
  const action={operation:"add",host:"third.test",includeSubdomains:true};
  assert.equal(await h.listeners.message({type:"blocklist-update",action},{id:"test",url:"https://example.com",tab:{id:1}}),undefined);
  const updated=await h.listeners.message({type:"blocklist-update",action},sender);assert.equal(updated.status,"ready");
  await h.navigate();
  const result=await h.listeners.onBeforeRequest({tabId:1,frameId:0,type:"script",url:"https://third.test/a?token=SECRET",timeStamp:1200,requestId:"third"});
  assert.equal(result.cancel,true);const r=await h.report();assert.equal(r.blocklist.decisions.length,1);
  assert.equal(r.network.requests.find(r=>r.id==="third").blockedBy,"privacy-lens-custom-list");
  assert.equal(JSON.stringify(r).includes("SECRET"),false);
  assert.equal((await h.listeners.onBeforeRequest({tabId:-1,frameId:0,type:"other",url:"https://third.test/a",requestId:"worker",timeStamp:1300})).cancel,true);
});
test("popup/relatório: A ausente ou malformado não quebra B; falha real nunca mostra score 100",async()=>{
  const h=harness();await h.navigate();const report=await h.report();
  for(const fullPage of [false,true]) {
    const ui=await popup(report,{fullPage});assert.equal(ui.elements.get("error").hidden,true);
    for(const malformed of [undefined,{}, {availability:"available",status:"observations"}]) {
      await ui.refresh({...report,security:malformed,score:malformed,blocklist:malformed});
      assert.equal(ui.elements.get("error").hidden,true);assert.equal(ui.elements.get("third").textContent,0);
      assert.match(ui.elements.get("score-value").textContent,/Indisponível/);
      assert.match(ui.elements.get("security-summary").textContent,/indisponíveis/);
    }
    await ui.refresh(null,true);assert.equal(ui.elements.get("error").hidden,false);
    assert.equal(ui.elements.get("score-value").textContent,"Indisponível");
  }
});

test("content script real: não invoca getters nem adiciona globais à página; snapshots não vazam funções/valores",async()=>{
  let getterCalls=0, now=0, collect;const messages=[], page={};
  Object.defineProperty(page,"fetch",{get(){getterCalls++;throw Error("PRIVATE_GETTER");},configurable:true});
  const ctx=vm.createContext({performance:{timeOrigin:1000,now:()=>now},window:{wrappedJSObject:page,addEventListener(){}},
    document:{addEventListener(){}},setInterval:()=>1,clearInterval(){},
    browser:{runtime:{sendMessage:async m=>messages.push(plain(m)),onMessage:{addListener(fn){collect=fn;}}}}});
  for(const file of ["lib/security.js","content/security.js","content/security-ready.js"])
    vm.runInContext(fs.readFileSync(`extension/${file}`,"utf8"),ctx);
  assert.equal(getterCalls,0);assert.equal(Object.hasOwn(page,"PrivacyLens"),false);
  now=1200;Object.defineProperty(page,"fetch",{value:function PRIVATE_SOURCE(){},configurable:true});
  await collect({type:"collect-security"});assert.equal(getterCalls,0);
  assert.equal(messages.at(-1).observation.changes[0].api,"Window.fetch");
  assert.equal(JSON.stringify(messages).includes("PRIVATE_"),false);
});
test("blocklist: PSL real protege sufixos PRIVATE, curingas e aceita tenants/exceções/IPv6",()=>{
  const P=libs(), psl=P.createDomainResolver(fs.readFileSync("extension/vendor/public_suffix_list.dat","utf8"));
  for(const host of ["com","co.uk","com.br","github.io","blogspot.com","a.ck"])
    assert.throws(()=>P.blockHost(host,psl));
  for(const host of ["example.co.uk","tenant.github.io","www.ck","localhost","127.0.0.1","[::1]"])
    assert.equal(P.blockHost(host,psl),host);
});
test("blocklist: atualizações concorrentes não perdem regras; erro não trava a fila",async()=>{
  const P=libs(),db=storage(),list=P.createBlocklist(db,Promise.resolve(resolve));await list.ready;
  await Promise.all(["a.test","b.test"].map(host=>list.update({operation:"add",host,includeSubdomains:false})));
  await assert.rejects(list.update({operation:"add",host:"*.invalid.test",includeSubdomains:true}));
  await list.update({operation:"add",host:"c.test",includeSubdomains:false});
  assert.deepEqual(plain(list.snapshot().rules.map(r=>r.host)),["a.test","b.test","c.test"]);
});
test("background: falhas de segurança/score são explícitas e preservam tracking B",async()=>{
  const h=harness();await h.navigate();h.evaluate('P.summarizeSecurity=()=>{throw Error("PRIVATE");};P.privacyScore=()=>{throw Error("PRIVATE");}');
  const r=await h.report();assert.equal(r.security.availability,"unavailable");assert.equal(r.score.status,"unavailable");
  assert.equal(r.score.value,null);assert.equal(r.advancedTracking.availability,"available");assert.equal(JSON.stringify(r).includes("PRIVATE"),false);
  const ui=await popup(r);assert.equal(ui.elements.get("error").hidden,true);assert.equal(ui.elements.get("third").textContent,0);
});

test("popup: edição persiste antes de confirmar e invalida exportação antiga; falha mantém regra",async()=>{
  const db=storage(),h=harness({localStorage:db});await h.navigate();const r=await h.report();
  const sender={id:"test",url:"moz-extension://test/popup/popup.html"};
  const ui=await popup(r,{messageHandler:m=>h.listeners.message(m,sender)});
  await ui.evaluate('changeBlocklist({operation:"add",host:"third.test",includeSubdomains:true})');
  assert.equal(db.data.customBlocklist.rules[0].host,"third.test");
  assert.equal(ui.elements.get("export").disabled,true);assert.equal(ui.evaluate("reportData"),null);
  assert.equal(ui.evaluate("blocklistConfig.rules[0].host"),"third.test");
  db.set=async()=>{throw Error("disk-full");};
  await ui.evaluate('changeBlocklist({operation:"remove",host:"third.test"})');
  assert.match(ui.elements.get("blocklist-error").textContent,/anterior foi preservada/);
  assert.equal(ui.evaluate("blocklistConfig.rules[0].host"),"third.test");
  assert.equal(ui.elements.get("blocklist-add").disabled,false);
});
test("popup: lista continua removível quando relatório da página falha",async()=>{
  const config={status:"ready",enabled:true,rules:[{host:"example.com",includeSubdomains:true}]};
  const ui=await popup({error:"Abra uma página HTTP ou HTTPS"},{messageHandler:async()=>config});
  assert.equal(ui.elements.get("error").hidden,false);assert.equal(ui.elements.get("blocklist-add").disabled,false);
  assert.equal(ui.evaluate("blocklistConfig.rules[0].host"),"example.com");assert.equal(ui.elements.get("export").disabled,true);
});

test("hook: snapshot antigo ou frame sem coleta mantém cobertura parcial mesmo após 30 s",()=>{
  const P=libs(),s=state();assert.equal(P.summarizeSecurity(s,resolve,32000).coverage.partial,false);
  s.securityFrames.get(0).at=1000;assert.equal(P.summarizeSecurity(s,resolve,32000).coverage.partial,true);
  s.securityFrames.get(0).at=32000;s.activeFrameIds.add(1);assert.equal(P.summarizeSecurity(s,resolve,32000).coverage.partial,true);
});
