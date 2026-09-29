"use strict";
const {test}=require("node:test"), assert=require("node:assert/strict");
const {harness}=require("./helpers/background.cjs"), {popup}=require("./helpers/popup.cjs");

test("popup: advancedTracking ausente não acessa bounce de undefined nem impede métricas",async()=>{
  const h=harness();h.navigate();const report=await h.report();delete report.advancedTracking;
  for(const fullPage of [false,true]) {
    const ui=await popup(report,{fullPage});
    assert.equal(ui.elements.get("error").hidden,true,ui.elements.get("error").textContent);
    assert.match(ui.elements.get("advanced-summary").textContent,/indisponível/);
    assert.equal(ui.elements.get("third").textContent,0);
    assert.equal(ui.elements.get("export").disabled,false);
    assert.equal(ui.evaluate("reportData.advancedTracking.error.code"),"missing-section");
    assert.equal(ui.evaluate("reportData.advancedTracking.coverage.observedRequests"),null);
    assert.doesNotThrow(()=>ui.evaluate("renderAdvanced(undefined)"));
  }
});

const top="http://localhost:8787", third="http://127.0.0.1:8787", ID="Pl4A92f7C6d13E80b5";
function request(h,url,at,type="main_frame",requestId="main") {
  h.time(at);h.listeners.onBeforeRequest({tabId:1,frameId:type==="main_frame"?0:1,url,timeStamp:at,type,requestId});
}
function redirect(h,url,to,at,type="main_frame",requestId="main") {
  h.time(at);h.listeners.onBeforeRedirect({tabId:1,frameId:type==="main_frame"?0:1,
    url,redirectUrl:to,timeStamp:at,type,requestId,statusCode:302});
  request(h,to,at+1,type,requestId);
}
function scenario(name) {
  const h=harness();
  const start=`${top}/tracking/${name}${name==="query-tracking" ? `?utm_source=privacy-lens&uid=${ID}` : ""}`;
  request(h,start,1000);
  if(name==="bounce-negative") redirect(h,start,`${top}/tracking/destination`,1100);
  if(name==="bounce-positive") {
    const intermediate=`${third}/tracking/intermediate?uid=${ID}`;
    redirect(h,start,intermediate,1100);redirect(h,intermediate,`${top}/tracking/destination?uid=${ID}`,1200);
  }
  if(name==="query-tracking") request(h,`${third}/tracking/pixel?partner_id=${ID}`,1100,"image","pixel");
  if(name==="cookie-sync") {
    const first=`${third}/tracking/sync-start?uid=${ID}`;
    request(h,first,1100,"image","pixel");redirect(h,first,`${top}/tracking/sync-finish?partner_id=${ID}`,1200,"image","pixel");
  }
  return h;
}
async function assertViews(report,{bounce="insufficient-evidence",sync=0,queries=0}={}) {
  const a=report.advancedTracking;
  assert.equal(a.availability,"available");assert.equal(a.bounce.status,bounce);
  assert.equal(a.cookieSync.indicators.length,sync);assert.equal(a.queryParameters.findings.length,queries);
  assert.equal(JSON.stringify(report).includes(ID),false);
  let summary;
  for(const fullPage of [false,true]) {
    const ui=await popup(report,{fullPage}), elements=ui.elements;
    assert.equal(elements.get("error").hidden,true,elements.get("error").textContent);
    assert.equal(elements.get("export").disabled,false);
    assert.equal(elements.get("third").textContent,report.network.totals.third);
    assert.equal(elements.get("cookies").textContent,report.cookies.totals.total);
    assert.equal(elements.get("frames").textContent,report.storage.length);
    const text=elements.get("advanced-summary").textContent;
    assert.match(text,new RegExp(`Cookie sync: ${sync} indicadores · Parâmetros: ${queries} sinais`));
    if(summary) assert.equal(text,summary);summary=text;
    assert.deepEqual(JSON.parse(JSON.stringify(ui.messages)),[{type:"report",tabId:1,refresh:true}]);
    assert.deepEqual(JSON.parse(ui.evaluate("JSON.stringify(reportData.advancedTracking)")),a);
    if(!fullPage) {
      elements.get("open").events.click();
      assert.equal(ui.opened[0].url,"moz-extension://test/popup/popup.html?tabId=1");
    } else assert.equal(elements.get("open").hidden,true);
  }
}
test("relatório sem sinais avançados tem estrutura vazia e renderiza nas duas interfaces",async()=>{
  const r=await scenario("query-normal").report();await assertViews(r);
  assert.deepEqual(r.advancedTracking.bounce.sequences,[]);
  assert.deepEqual(r.advancedTracking.cookieSync.indicators,[]);
  assert.deepEqual(r.advancedTracking.queryParameters.findings,[]);
  assert.equal(r.advancedTracking.coverage.hashErrors,0);
});
test("relatório parcial sem onBeforeRequest inicializa tracking e informa cobertura parcial",async()=>{
  const r=await harness().report();await assertViews(r);
  assert.equal(r.coverage.partial,true);assert.equal(r.advancedTracking.coverage.partial,true);
  assert.deepEqual(r.advancedTracking.bounce.route,[]);assert.equal(r.advancedTracking.coverage.observedRequests,0);
});
for(const [name,expected] of [
  ["bounce-negative",{}],["bounce-positive",{bounce:"indicator",sync:1,queries:6}],
  ["query-tracking",{sync:1,queries:5}],["cookie-sync",{sync:1,queries:5}]
]) test(`background → popup/relatório: ${name}`,async()=>{
  const r=await scenario(name).report();await assertViews(r,expected);
  if(name==="bounce-positive") assert.deepEqual(r.advancedTracking.bounce.sequences[0].domains,["localhost","127.0.0.1","localhost"]);
});
test("navegação após redirect inicializa novo tracking e não reutiliza sinais anteriores",async()=>{
  const h=scenario("bounce-positive");await assertViews(await h.report(),{bounce:"indicator",sync:1,queries:6});
  request(h,`${top}/tracking/query-normal?page=2`,2000,"main_frame","next");
  h.listeners.committed({tabId:1,frameId:0,url:`${top}/tracking/query-normal?page=2`,timeStamp:2010,transitionType:"typed",transitionQualifiers:[]});
  const r=await h.report();await assertViews(r);assert.equal(r.advancedTracking.bounce.route.length,1);
  assert.equal(r.advancedTracking.coverage.observedRequests,1);
});
for(const [code,injection] of [
  ["state-missing","delete pages.get(1).tracking"],
  ["collection-failed","P.summarizeTracking = async () => {throw Error('PRIVATE_COOKIE_VALUE');}"],
  ["missing-section","P.summarizeTracking = async () => undefined"],
  ["invalid-section","P.summarizeTracking = async () => ({bounce:{}})"]
]) test(`falha real de tracking permanece explícita no relatório e na UI: ${code}`,async()=>{
  const h=scenario("query-normal");h.evaluate(injection);const r=await h.report();
  const a=r.advancedTracking;assert.equal(a.availability,"unavailable");assert.equal(a.error.code,code);
  assert.equal(a.bounce.status,"unavailable");assert.equal(a.cookieSync.status,"unavailable");
  assert.equal(a.coverage.observedRequests,null);assert.equal(a.coverage.hashErrors,null);
  assert.deepEqual(a.bounce.sequences,[]);assert.deepEqual(a.cookieSync.indicators,[]);assert.deepEqual(a.queryParameters.findings,[]);
  assert.equal(JSON.stringify(r).includes("PRIVATE_COOKIE_VALUE"),false);
  const ui=await popup(r);
  assert.match(ui.elements.get("advanced-summary").textContent,new RegExp(code));
  assert.doesNotMatch(ui.elements.get("advanced-summary").textContent,/0 indicadores|0 sinais/);
  assert.equal(ui.elements.get("error").hidden,true);assert.equal(ui.elements.get("third").textContent,0);
  assert.equal(ui.evaluate("reportData.advancedTracking.error.code"),code);
});
test("seção malformada, inclusive arrays internos, não interrompe renderização nem mantém indicadores antigos",async()=>{
  const valid=await scenario("bounce-positive").report(), ui=await popup(valid);
  for(const data of [null,{}, {bounce:undefined}, {...valid.advancedTracking,bounce:{status:"indicator",sequences:[{}],route:[]}},
    {...valid.advancedTracking,cookieSync:{status:"indicator",indicators:[{}],endpointHints:[]}},
    {...valid.advancedTracking,queryParameters:{status:"potential-tracking",findings:[{}]}},
    {...valid.advancedTracking,coverage:undefined}]) {
    await ui.refresh({...valid,advancedTracking:data});
    assert.equal(ui.elements.get("error").hidden,true);
    assert.match(ui.elements.get("advanced-summary").textContent,/indisponível/);
    assert.equal(ui.elements.get("bounce-route").children.length,0);
    assert.equal(ui.elements.get("third").textContent,valid.network.totals.third);
  }
  await ui.refresh(valid);assert.match(ui.elements.get("advanced-summary").textContent,/Indicador compatível com bounce/);
});
test("background sem resposta, com erro ou rejeição não vira relatório com zeros",async()=>{
  const r=await scenario("bounce-positive").report(), ui=await popup(r);
  for(const [response,failure] of [[undefined,false],[{error:"Falha na PSL"},false],[null,true]]) {
    await ui.refresh(response,failure);
    assert.equal(ui.elements.get("error").hidden,false);assert.equal(ui.elements.get("export").disabled,true);
    assert.equal(ui.elements.get("status").textContent,"Coleta indisponível.");
    assert.match(ui.elements.get("advanced-summary").textContent,/indisponível \(report-failed\)/);
    assert.equal(ui.elements.get("third").textContent,"—");assert.equal(ui.evaluate("reportData"),null);
  }
});
