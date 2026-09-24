/* global browser */
"use strict";
const $ = id => document.getElementById(id);
let reportData, targetTabId;
const requestedTab = new URL(location.href).searchParams.get("tabId");
if (requestedTab !== null && /^\d+$/.test(requestedTab)) {
  targetTabId = Number(requestedTab);
  document.body.classList.add("full-page");
  $("open").hidden = true;
}
const partyName = party => ({first: "1ª parte", third: "3ª parte", unknown: "indeterminado"}[party]);
function node(tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function row(target, title, lines, party, count) {
  const el = node("div", "", "row");
  if (count !== undefined) el.append(node("span", String(count), "count"));
  el.append(node("strong", title));
  if (party) el.append(node("span", partyName(party), `tag ${party}`));
  for (const line of lines) el.append(node("p", line, "muted"));
  $(target).append(el);
}
function storageText(value, unit) { return value?.status === "observed" ? `${value.count} ${unit}` : `não observável (${value?.reason || value?.status || "sem coleta"})`; }
function renderCanvas(canvas) {
  const labels = {indicator:"Indicador de canvas fingerprinting detectado", "draw-only":"Canvas utilizado · indicador não detectado",
    "readback-only":"Leitura/exportação observada · sem sequência compatível", "not-observed":"Nenhuma chamada canvas observada",
    unavailable:"Canvas não observável · recarregue a página"};
  $("canvas-result").textContent = labels[canvas.classification] || labels.unavailable;
  $("canvas-result").className = canvas.classification === "indicator" ? "indicator" : "";
  $("canvas-counts").textContent = `${canvas.drawingCalls} desenhos · ${canvas.readbackCalls} leituras/exportações (${canvas.failedReadbacks} com exceção) · ${canvas.indicatorCanvases} canvas com indício`;
  const methods = [...new Set(canvas.frames.flatMap(f => f.observation.canvases.flatMap(c => c.readMethods)))];
  $("canvas-methods").textContent = methods.length ? `APIs de leitura: ${methods.map(m => m.split(".").pop()).join(" · ")}` : "Nenhuma API de leitura/exportação observada.";
  $("canvas-explanation").textContent = "Regra: desenho + leitura/exportação no mesmo canvas em até 5 s. Indício de baixa especificidade: editores e capturas legítimas também fazem isso. Não comprova rastreamento. toBlob registra solicitação, não o resultado do callback.";
  $("canvas-coverage").textContent = `${canvas.frames.length} frames com instrumentação. ${canvas.partial ? "Cobertura parcial: confira os detalhes." : "Métodos previstos instalados nos frames coletados."} Canvas 2D/HTML; workers, OffscreenCanvas e WebGL não cobertos.`;
  $("canvas-list").replaceChildren();
  for (const frame of canvas.frames) {
    const o = frame.observation, i = frame.instrumentation;
    row("canvas-list", frame.url, [`Frame ${frame.frameId} · ${i.installed.length} métodos instalados · ${o.canvasCount} canvas observados`,
      `Falhas: ${i.failed.length} · ausentes: ${i.unsupported.length} · substituídos: ${i.replaced.length} · eventos fora do limite: ${o.droppedEvents} · amostras fora do limite: ${o.droppedSamples}`,
      ...i.failed.map(f => `${f.method}: ${f.error}`), ...i.replaced.map(m => `Instrumentação substituída: ${m}`)]);
    for (const sample of o.samples) row("canvas-list", `Canvas #${sample.canvasId} · ${sample.method.split(".").pop()}`, [
      `${sample.width} × ${sample.height} · ${sample.outcome === "threw" ? `exceção ${sample.errorName}` : sample.outcome === "requested" ? "exportação solicitada" : "retorno sem exceção"}`,
      sample.precedingDraw ? `Desenho anterior: ${sample.precedingDraw.split(".").pop()} · intervalo ${Math.round(sample.drawToReadMs)} ms` : "Sem desenho anterior observado neste canvas.",
      sample.correlated ? "Sequência compatível com a regra; intenção não determinada." : "Esta chamada não atende à regra de sequência."
    ]);
  }
}
function render(data) {
  renderCanvas(data.canvas);
  $("site").textContent = data.page.site;
  $("url").textContent = data.page.url;
  $("third").textContent = data.network.totals.third;
  $("cookies").textContent = data.cookies.totals.total;
  $("frames").textContent = data.storage.length;
  $("network-count").textContent = `${data.network.totals.total} observadas · ${data.network.totals.failed} falhas`;
  for (const id of ["domains", "cookie-list", "storage-list"]) $(id).replaceChildren();
  for (const d of data.network.domains) row("domains", d.host, [`${d.types.join(", ")} · ${d.failed} falhas`], d.party, d.requests);
  if (!data.network.domains.length) $("domains").append(node("p", "Sem requisições registradas. Recarregue a página.", "muted"));
  const c = data.cookies.totals;
  $("cookie-summary").textContent = `${c.first} primeira parte · ${c.third} terceira parte · ${c.session} sessão · ${c.persistent} persistentes · ${c.partitioned} com chave de partição`;
  $("cookie-writes").textContent = `${data.cookies.correlatedWrites.length} cookies com gravações correlacionadas (${data.cookies.correlatedWriteEvents} eventos); ${data.cookies.setCookieAttempts.length} tentativas Set-Cookie.`;
  for (const cookie of data.cookies.items) {
    const expiry = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString("pt-BR") : "fim da sessão";
    row("cookie-list", cookie.name, [cookie.domain, `${cookie.session ? "Sessão" : "Persistente"} · expira: ${expiry}`,
      `HttpOnly: ${cookie.httpOnly ? "sim" : "não"} · Secure: ${cookie.secure ? "sim" : "não"} · partição: ${cookie.partitionKey?.topLevelSite || "não informada"}`], cookie.party);
  }
  for (const frame of data.storage) row("storage-list", frame.origin, [`Frame ${frame.frameId} · coleta ${new Date(frame.at).toLocaleTimeString("pt-BR")}`,
    `localStorage: ${storageText(frame.localStorage, "chaves")}`, `sessionStorage: ${storageText(frame.sessionStorage, "chaves")}`,
    `IndexedDB: ${storageText(frame.indexedDB, "bancos")}`]);
  if (!data.storage.length) $("storage-list").append(node("p", "Sem coleta. Recarregue; páginas protegidas e frames opacos podem impedir o acesso.", "muted"));
  $("coverage").textContent = `${data.coverage.partial ? "Coleta parcial: recarregue a página. " : ""}Fora dos limites: ${data.coverage.droppedRequests} requisições, ${data.coverage.droppedCookieHeaders} campos Set-Cookie, ${data.coverage.droppedCookieWrites} gravações. ${data.cookies.errors.join("; ")}`;
  $("status").textContent = `Atualizado às ${new Date(data.generatedAt).toLocaleTimeString("pt-BR")} · Firefox ${data.browser.version}`;
}
async function refresh() {
  $("refresh").disabled = true; $("export").disabled = true; $("error").hidden = true;
  reportData = null;
  try {
    if (targetTabId === undefined) {
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      targetTabId = tabs[0]?.id;
    }
    const data = await browser.runtime.sendMessage({type: "report", tabId: targetTabId, refresh: true});
    if (!data || data.error) throw new Error(data?.error || "Sem resposta do background.");
    reportData = data; render(data); $("export").disabled = false;
  } catch (error) { $("error").textContent = error.message; $("error").hidden = false; $("status").textContent = "Coleta indisponível."; }
  finally { $("refresh").disabled = false; }
}
$("refresh").addEventListener("click", refresh);
$("open").addEventListener("click", () => {
  if (targetTabId !== undefined) browser.tabs.create({url: `${browser.runtime.getURL("popup/popup.html")}?tabId=${targetTabId}`});
});
$("export").addEventListener("click", () => {
  if (!reportData) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(reportData, null, 2)], {type: "application/json"}));
  const link = document.createElement("a"); link.href = url;
  link.download = `privacy-lens-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
});
refresh();
