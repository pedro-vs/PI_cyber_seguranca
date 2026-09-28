"use strict";
const {randomUUID} = require("node:crypto");
const names = ["pl3_existing", "pl3_change", "pl3_session", "pl3_persistent", "pl3_rejected", "pl3_path", "pl3_third"];
// Paths usados pelos cenários e a variante raiz de execuções anteriores.
// A resposta é emitida na própria origem/contexto que deve ser limpo.
// Expiração inequivocamente passada: Max-Age=0 deixou entradas com expiração
// igual ao instante da resposta visíveis em getAll no Firefox 156.0.1.
const resetHeaders = thirdContext => names.flatMap(name => ["/", "/cookies", "/cookies/sub"].flatMap(cookiePath => [
  `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${cookiePath}; ${thirdContext ? "SameSite=None; Secure" : "SameSite=Lax"}`,
  `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${cookiePath}; SameSite=None; Secure; Partitioned`
]));
module.exports = function cookiesFixture(req, res, url, port) {
  if (!url.pathname.startsWith("/cookies/")) return false;
  const scenario = url.pathname.slice("/cookies/".length);
  const descriptions = {
    setup: ["Preparação", "Limpa os 7 nomes pl3_* definidos pela fixture nos paths /, /cookies e /cookies/sub, incluindo tentativas para cookies explicitamente particionados. O iframe repete a limpeza em 127.0.0.1 sob este top site. Depois devem restar somente pl3_existing e pl3_change no inventário limpo. Confira no Privacy Lens antes de seguir; outros containers/partições não são apagados."],
    preexisting: ["Caso 1 · Preexistente", "Após preparação + Atualizar: 2 cookies preexistentes, 0 gravações, 0 tentativas Set-Cookie, 0 provavelmente criados/alterados. Não há escrita nesta página."],
    session: ["Caso 2 · Primeira parte / sessão", "Após preparação: pl3_session criado por cabeçalho; 1 tentativa Set-Cookie, 1 criação inferida, 1 identidade correlacionada de primeira parte/sessão. Inventário: 3 (os 2 preexistentes + este)."],
    persistent: ["Caso 3 · Primeira parte / persistente", "Após preparação: pl3_persistent criado por document.cookie, Max-Age=86400; 0 tentativas HTTP, 1 criação inferida, 1 identidade correlacionada de primeira parte/persistente. Inventário: 3."],
    third: ["Caso 4 · Terceira parte", "O iframe 127.0.0.1 tenta Set-Cookie pl3_third com SameSite=None; Secure. Esperado: 1 tentativa terceira se o iframe carregar. Aceite depende de HTTP local, ETP/TCP e políticas de cookies: se aceito, gravação terceira; se recusado, nenhuma gravação correspondente. Não presumir sucesso nem diagnosticar bloqueador apenas pelo zero."],
    change: ["Caso 5 · Alteração", "Após preparação: pl3_change recebe outro valor pelo cabeçalho. 1 tentativa, 1 gravação de alteração, 0 criações, 1 identidade correlacionada. Normalmente 2 eventos brutos: remoção overwrite + escrita explicit. Inventário permanece 2; ambos preexistentes."],
    rejected: ["Caso 6 · Domínio inválido", "O servidor localhost envia pl3_rejected com Domain=example.invalid, que não corresponde ao emissor. Esperado: 1 tentativa Set-Cookie, nenhum cookie pl3_rejected no inventário, 0 gravações/criações correspondentes. Inventário permanece 2. A extensão mostra aceite indeterminado; a rejeição é a condição controlada desta fixture."],
    paths: ["Controle adicional · Paths diferentes", "Após preparação: 2 cabeçalhos criam pl3_path, um em /cookies e outro em /cookies/sub. Esperado: 2 identidades, 2 criações, 2 tentativas; inventário 4. O inventário inclui caminhos não enviados nesta URL."],
    late: ["Controle adicional · Fora da janela", "Após preparação: document.cookie grava pl3_session aos 32 segundos. Depois de PRONTO + Atualizar: inventário 3, 0 eventos na janela inicial de 30 s, 0 tentativas HTTP e 0 identidades correlacionadas."],
    "third-frame": ["Iframe terceiro", "Tentativa HTTP de cookie terceiro. A leitura abaixo só indica se o nome está visível neste documento; não atribui autoria nem diagnostica ETP."],
    "third-reset": ["Preparação do iframe", "Limpeza dos nomes da fixture nos mesmos paths, origem 127.0.0.1 e partição deste top site. Se o navegador recusar cookies neste contexto, a preparação também pode ser recusada. Cookies de outros top sites/containers não são apagados."]
  };
  if (!descriptions[scenario]) { res.writeHead(404); res.end("Cenário inexistente"); return true; }
  const headers = [];
  if (scenario === "setup") {
    headers.push(...resetHeaders(false),
      "pl3_existing=seed; Path=/cookies; SameSite=Lax", "pl3_change=before; Path=/cookies; SameSite=Lax");
  }
  if (scenario === "session") headers.push("pl3_session=demo; Path=/cookies; SameSite=Lax");
  if (scenario === "change") headers.push(`pl3_change=${randomUUID()}; Path=/cookies; SameSite=Lax`);
  if (scenario === "rejected") headers.push("pl3_rejected=demo; Domain=example.invalid; Path=/cookies; SameSite=Lax");
  if (scenario === "paths") headers.push("pl3_path=a; Path=/cookies; SameSite=Lax", "pl3_path=b; Path=/cookies/sub; SameSite=Lax");
  if (scenario === "third-frame") headers.push("pl3_third=demo; Path=/cookies; SameSite=None; Secure");
  if (scenario === "third-reset") headers.push(...resetHeaders(true));
  if (headers.length) res.setHeader("Set-Cookie", headers);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; frame-src http://127.0.0.1:*;");
  const [title, expected] = descriptions[scenario];
  res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="/canvas.css">
    <main><p class="eyebrow">PRIVACY LENS · COOKIES · DESENVOLVIMENTO LOCAL</p><h1>${title}</h1>
    <p id="expected">${expected}</p><p id="status" role="status">EXECUTANDO…</p><pre id="observed"></pre>
    ${scenario === "third" || scenario === "setup" ? `<iframe title="Cookies terceiros" src="http://127.0.0.1:${port}/cookies/${scenario === "third" ? "third-frame" : "third-reset"}"></iframe>` : ""}
    <p>Condição para os totais: preparação imediatamente antes de cada caso, mesmo container, sem outras abas localhost/127.0.0.1 escrevendo. Os números referem-se aos cookies pl3_*; dados de fixtures anteriores podem aumentar o inventário geral.</p>
    <p>Não recarregue a extensão entre preparação e caso: isso apaga o histórico em memória. Navegue pelos links na mesma aba; não use Voltar (BFCache). Espere PRONTO + 2 s e clique Atualizar no Privacy Lens.</p>
    <p>Limitações: snapshot não prova criação; onChanged não informa aba; janela fixa de 30 s. Proteções do Firefox podem impedir escrita. Esta página não altera configurações do navegador nem chama a extensão.</p>
    <nav>${["setup", "preexisting", "session", "persistent", "third", "change", "rejected", "paths", "late"].map(s => `<a href="/cookies/${s}">${s}</a>`).join(" ")}</nav>
    <p>Prints locais não substituem evidências DDG. Nenhum resultado da avaliação é preenchido aqui.</p></main><script src="/cookies-fixture.js"></script></html>`);
  return true;
};
