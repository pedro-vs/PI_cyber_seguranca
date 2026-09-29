"use strict";
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");

// DOM mínimo para executar os scripts reais da página, inclusive refresh().
class Element {
  constructor() {this.children=[];this.textContent="";this.hidden=false;this.disabled=false;this.events={};this.classList={add(){}};}
  append(...children) {this.children.push(...children);}
  replaceChildren(...children) {this.children=children;}
  addEventListener(name, fn) {this.events[name]=fn;}
}
async function popup(report, {fullPage=false, failure=false}={}) {
  const folder=path.join(__dirname,"../../extension/popup"), html=fs.readFileSync(path.join(folder,"popup.html"),"utf8");
  const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  for(const id of ["third","cookies","frames"]) elements.get(id).textContent="—";
  const messages=[], opened=[];
  let response=report, reject=failure;
  const ctx=vm.createContext({URL,location:{href:`moz-extension://test/popup/popup.html${fullPage ? "?tabId=1" : ""}`},
    document:{body:new Element(),createElement:()=>new Element(),getElementById:id=>{
      if(!elements.has(id)) throw Error(`Elemento ausente: ${id}`);
      return elements.get(id);
    }},
    browser:{tabs:{query:async()=>[{id:1}],create:args=>opened.push(args)},runtime:{
      getURL:p=>`moz-extension://test/${p}`,sendMessage:async message=>{
        messages.push(message);if(reject) throw Error("BACKGROUND_FAILED");return response;
      }
    }}
  });
  for(const match of html.matchAll(/<script src="([^"]+)"/g))
    vm.runInContext(fs.readFileSync(path.join(folder,match[1]),"utf8"),ctx,{filename:match[1]});
  await new Promise(resolve=>setImmediate(resolve));
  return {elements,messages,opened,evaluate:source=>vm.runInContext(source,ctx),
    refresh:async(value,failed=false)=>{response=value;reject=failed;await elements.get("refresh").events.click();}};
}
module.exports={popup};
