"use strict";
const {test} = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const source = fs.readFileSync(path.join(__dirname,"../extension/content/storage.js"),"utf8");
async function collect(window) {
  let done;
  const sent = new Promise(resolve => {done=resolve;});
  const browser = {runtime:{onMessage:{addListener(){}},sendMessage:async message=>done(JSON.parse(JSON.stringify(message)))}};
  vm.runInNewContext(source,{window:{...window,addEventListener(){}},document:{addEventListener(){}},
    performance:{timeOrigin:1000},browser,setTimeout,clearTimeout});
  return sent;
}
test("storage real do content script conta chaves/bancos sem ler conteúdo",async()=>{
  const denied = () => {throw Error("Valores não podem ser lidos");};
  const message=await collect({localStorage:{length:2,getItem:denied},sessionStorage:{length:1,getItem:denied},
    indexedDB:{databases:async()=>[{name:"SECRET_DB",version:1}],open:denied}});
  assert.equal(message.localStorage.count,2);assert.equal(message.sessionStorage.count,1);
  assert.equal(message.indexedDB.count,1);assert.equal(message.indexedDB.unit,"databases");
  assert.equal(JSON.stringify(message).includes("SECRET_DB"),false);
});
test("storage indisponível ou sem API não é relatado como zero",async()=>{
  const blocked = {get length(){const error=Error("blocked");error.name="SecurityError";throw error;}};
  const message=await collect({localStorage:blocked,sessionStorage:blocked,indexedDB:{}});
  assert.equal(message.localStorage.status,"unavailable");assert.equal(message.localStorage.count,null);
  assert.equal(message.sessionStorage.status,"unavailable");assert.equal(message.indexedDB.status,"unsupported");
});
