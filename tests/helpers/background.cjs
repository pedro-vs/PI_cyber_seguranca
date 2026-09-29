"use strict";
const vm = require("node:vm"), fs = require("node:fs"), path = require("node:path");
const deferred = () => { let resolve; const promise = new Promise(r => {resolve=r;}); return {promise,resolve}; };
function harness({delayStore = false, delayPSL = false, failFrames = false, localStorage} = {}) {
  const extension = path.join(__dirname,"../../extension");
  const manifest = JSON.parse(fs.readFileSync(path.join(extension,"manifest.json"),"utf8"));
  let now = 1000, inventory = [], inventoryHook;
  const listeners = {}, frames = new Map(), store = deferred(), psl = deferred();
  const event = name => ({addListener(fn) {listeners[name]=fn;},hasListener(fn) {return listeners[name]===fn;}});
  const browser = {
    storage: localStorage ? {local:localStorage} : undefined,
    runtime: {getURL: p => `moz-extension://test/${p}`, id:"test", onMessage:event("message"),
      getManifest:()=>manifest, getBrowserInfo:async()=>({version:"mock"})},
    tabs: {get:async id => {if(delayStore) await store.promise; return {id,url:"https://example.com/",cookieStoreId:"default"};},
      onRemoved:event("removed"), sendMessage:async()=>{}},
    webNavigation:{onCommitted:event("committed"),getAllFrames:async()=>{if(failFrames) throw Error("unavailable");return [...frames.values()];},getFrame:async({frameId})=>frames.get(frameId) || null},
    cookies:{onChanged:event("cookie"),getAll:async()=>inventoryHook ? inventoryHook() : inventory},
    webRequest:Object.fromEntries(["onBeforeRequest","onHeadersReceived","onBeforeRedirect","onCompleted","onErrorOccurred"].map(n=>[n,event(n)]))
  };
  class Clock extends Date {static now() {return now;}}
  const ctx=vm.createContext({browser,URL,TextEncoder,crypto:require("node:crypto").webcrypto,Date:Clock,
    fetch:async()=>{if(delayPSL) await psl.promise; return {ok:true,text:async()=>"com\ntest"};}});
  for(const f of manifest.background.scripts)
    vm.runInContext(fs.readFileSync(path.join(extension,f),"utf8"),ctx,{filename:f});
  return {evaluate:source=>vm.runInContext(source,ctx),listeners,frames,store,psl,time:t=>{now=t;},inventory:items=>{inventory=items;},inventoryHook:fn=>{inventoryHook=fn;},
    navigate:(id="main",tabId=1,url="https://example.com/",timeStamp=now)=>listeners.onBeforeRequest({tabId,type:"main_frame",requestId:id,url,timeStamp,frameId:0}),
    cookie:(extra={},removed=false,cause="explicit")=>listeners.cookie({removed,cause,cookie:{name:"id",domain:"example.com",path:"/",hostOnly:true,storeId:"default",session:true,value:"DO_NOT_EXPORT",...extra}}),
    retainedState:()=>vm.runInContext("JSON.stringify([...pages.values()])",ctx),
    report:async(tabId=1)=>JSON.parse(JSON.stringify(await listeners.message({type:"report",tabId,refresh:true},{id:"test",url:"moz-extension://test/popup/popup.html"})))
  };
}
module.exports = {harness};
