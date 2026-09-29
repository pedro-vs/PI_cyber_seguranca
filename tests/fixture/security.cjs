"use strict";
// Controles locais de Conceito A; não são resultados DDG.
module.exports = (req,res,url,port) => {
  const third=`http://127.0.0.1:${port}`;
  if(url.pathname === "/security/client.js") {
    res.setHeader("Content-Type","application/javascript");
    res.end(`setTimeout(async()=>{
      const mode=location.pathname.split('/').pop();
      if(mode==='hook') {const original=window.fetch;window.fetch=function(...args){return Reflect.apply(original,this,args);};}
      if(mode==='hook'||mode==='polling') {
        let successes=0;
        for(let i=0;i<4;i++) {try {const response=await fetch('${third}/api');if(response.ok) successes++;}catch {}
          if(i<3) await new Promise(r=>setTimeout(r,2000));}
        document.getElementById('status').textContent='PRONTO · '+successes+' respostas de 4';
      } else if(mode==='websocket') {
        const socket=new WebSocket('ws://127.0.0.1:${port}/security/socket');
        socket.onerror=()=>{document.getElementById('status').textContent='PRONTO · tentativa WebSocket com erro esperado';};
      } else document.getElementById('status').textContent='PRONTO';
    },500);`);return true;
  }
  if(!["/security/negative","/security/hook","/security/polling","/security/websocket","/security/blocklist"].includes(url.pathname)) return false;
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy",`default-src 'self'; script-src 'self'; connect-src 'self' ${third} ws://127.0.0.1:${port}; img-src 'self' ${third}`);
  res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Privacy Lens · Conceito A</title>
    <h1>${url.pathname}</h1><p>Fixture local. Não comprova ataque nem substitui DDG js-leaks.</p><p id="status">Aguardando…</p>
    ${url.pathname.endsWith('/blocklist')?`<p>Imagem terceira abaixo: deve carregar sem regra e falhar com regra 127.0.0.1 ativa.</p><img id="third-pixel" src="${third}/pixel" alt="Pixel terceiro de teste">`:''}
    <script src="/security/client.js"></script></html>`);return true;
};
