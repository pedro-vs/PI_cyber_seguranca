"use strict";
// Identificador público e controlado da fixture; nunca usar dados reais aqui.
const id = "Pl4A92f7C6d13E80b5";
module.exports = function trackingFixture(req, res, url, port) {
  if (!url.pathname.startsWith("/tracking/")) return false;
  const top = `http://localhost:${port}`, third = `http://127.0.0.1:${port}`;
  const redirect = to => { res.writeHead(302, {Location:to}); res.end(); return true; };
  if (url.pathname === "/tracking/bounce-negative") return redirect(`${top}/tracking/destination`);
  if (url.pathname === "/tracking/bounce-positive") return redirect(`${third}/tracking/intermediate?uid=${id}`);
  if (url.pathname === "/tracking/intermediate") return redirect(`${top}/tracking/destination?uid=${id}`);
  if (url.pathname === "/tracking/sync-start") return redirect(`${top}/tracking/sync-finish?partner_id=${id}`);
  if (["/tracking/sync-finish","/tracking/pixel"].includes(url.pathname)) {
    res.setHeader("Content-Type","image/svg+xml");
    res.end('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="teal"/></svg>');
    return true;
  }
  if (url.pathname === "/tracking/client.js") {
    res.setHeader("Content-Type","application/javascript");
    res.end(`setTimeout(() => { location.href = ${JSON.stringify(`${top}/tracking/destination?uid=${id}`)}; }, 250);`);
    return true;
  }
  const pages = {
    "/tracking/destination": ["Destino", "Se veio do bounce positivo: sequência localhost → 127.0.0.1 → localhost, passagem curta e indicador. Se veio do negativo: evidência insuficiente. Consulte a rota, não apenas esta URL.", ""],
    "/tracking/query-normal": ["Query funcional", "page=2 não deve gerar sinal de tracking nem cookie sync.", ""],
    "/tracking/query-tracking": ["Query e identificador reutilizado", "Parâmetro de campanha/UID na URL principal e UID reutilizado em request terceiro: sinais potenciais, sem confirmação de tracking.", `<img alt="Recurso terceiro controlado" src="${third}/tracking/pixel?partner_id=${id}">`],
    "/tracking/cookie-sync": ["Cookie sync simulado", "O mesmo identificador controlado passa por dois sites via request/redirect. Esperado: 1 indicador de propagação compatível com sync. Não se lê nem se comprova origem em cookie.", `<img alt="Sync controlado" src="${third}/tracking/sync-start?uid=${id}">`],
    "/tracking/start-client": ["Bounce por JavaScript", "Clique em Iniciar. A origem localhost, o intermediário 127.0.0.1 e o destino localhost devem formar uma sequência com client-redirect.", `<a id="start" href="${third}/tracking/client-hop?uid=${id}">Iniciar</a>`],
    "/tracking/client-hop": ["Intermediário JS", "Redirecionamento em 250 ms; controle do fluxo usado pelo DDG, sem executar DDG.", '<script src="/tracking/client.js"></script>']
  };
  const page = pages[url.pathname];
  if (!page) { res.writeHead(404); res.end("Cenário inexistente"); return true; }
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' http://127.0.0.1:* http://localhost:*;");
  res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>${page[0]} · Privacy Lens</title><link rel="stylesheet" href="/canvas.css"><main>
    <p>PRIVACY LENS · FIXTURE LOCAL · NÃO É EVIDÊNCIA DDG</p><h1>${page[0]}</h1><p>${page[1]}</p>${page[2]}
    <p id="status">Aguarde o carregamento completo + 2 s e clique Atualizar no Privacy Lens.</p>
    <p>Valores desta fixture são públicos/controlados; o relatório deve omiti-los. Use a barra de endereço para cada caso independente, sem Voltar/Avançar. Não recarregue a extensão durante uma sequência.</p>
    <nav><a href="/tracking/bounce-negative">Bounce negativo</a> · <a href="/tracking/bounce-positive">Bounce positivo HTTP</a> · <a href="/tracking/start-client">Bounce JS</a> · <a href="/tracking/query-normal?page=2">Query normal</a> · <a href="/tracking/query-tracking?utm_source=privacy-lens&uid=${id}">Query tracking</a> · <a href="/tracking/cookie-sync">Cookie sync</a></nav></main></html>`);
  return true;
};
