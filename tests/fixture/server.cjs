"use strict";
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const port = Number(process.env.FIXTURE_PORT || 8787);
const top = `http://localhost:${port}`, third = `http://127.0.0.1:${port}`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, top);
  res.setHeader("Cache-Control", "no-store");
  if (["/canvas/negative","/canvas/positive","/canvas/read-only","/canvas/errors","/canvas/frame"].includes(url.pathname)) {
    res.setHeader("Content-Type","text/html; charset=utf-8");
    res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; frame-src http://127.0.0.1:*;");
    return res.end(fs.readFileSync(path.join(__dirname,"canvas.html")));
  }
  if (["/canvas.css","/canvas-fixture.js"].includes(url.pathname)) {
    res.setHeader("Content-Type",url.pathname.endsWith(".css")?"text/css":"application/javascript");
    return res.end(fs.readFileSync(path.join(__dirname,url.pathname.slice(1)),"utf8").replaceAll("__PORT__",String(port)));
  }
  if (url.pathname === "/redirect") { res.writeHead(302, {Location: "/"}); return res.end(); }
  if (url.pathname === "/empty") { res.setHeader("Content-Type", "text/html; charset=utf-8"); return res.end("<!doctype html><title>Página vazia</title><h1>Página sem recursos externos</h1>"); }
  if (url.pathname === "/pixel") {
    res.setHeader("Content-Type", "image/svg+xml");
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="teal"/></svg>');
  }
  if (url.pathname === "/api") { res.setHeader("Content-Type", "application/json"); res.setHeader("Access-Control-Allow-Origin", top); return res.end('{"ok":true}'); }
  if (url.pathname === "/favicon.ico") { res.writeHead(204); return res.end(); }
  if (["/fixture.js", "/frame.js"].includes(url.pathname)) {
    res.setHeader("Content-Type", "application/javascript");
    return res.end(fs.readFileSync(path.join(__dirname,url.pathname.slice(1)),"utf8").replaceAll("__PORT__",String(port)));
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (url.pathname === "/frame") return res.end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Frame terceiro</title><p id="status">Coletando…</p><script src="/frame.js"></script></html>');
  if (url.pathname !== "/") { res.writeHead(404); return res.end("Não encontrado"); }
  res.setHeader("Set-Cookie", ["pl_session_http=demo; Path=/; SameSite=Lax", "pl_persistent_http=demo; Max-Age=86400; Path=/; SameSite=Lax", "pl_httponly=demo; HttpOnly; Path=/; SameSite=Lax"]);
  res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Privacy Lens — teste controlado</title>
    <style>body{max-width:760px;margin:60px auto;padding:20px;font:16px/1.6 system-ui;color:#163240}h1{font-size:32px}pre{white-space:pre-wrap;background:#eef6f5;padding:20px;border-radius:12px}iframe{width:100%;border:1px solid #b9cece}</style>
    <h1>Privacy Lens · Etapa 1</h1><p>Fixture local. Não é evidência DuckDuckGo.</p><pre id="status">Preparando dados…</pre>
    <img src="${third}/pixel?demo_signal=fixture" alt="Recurso terceiro de teste"><iframe title="Origem terceira" src="${third}/frame"></iframe><script src="/fixture.js"></script></html>`);
});
server.listen(port,"127.0.0.1",() => console.log(`Fixture: ${top}\nTerceiro local: ${third}\nCtrl+C encerra.`));
