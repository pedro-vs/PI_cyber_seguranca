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
  $("extension-version").textContent = `v${data.extensionVersion}`;
  $("site").textContent = data.page.site;
  $("url").textContent = data.page.url;
  $("third").textContent = data.network.totals.third;
  $("cookies").textContent = data.cookies.totals.total;
  $("frames").textContent = data.storage.length;
  $("network-count").textContent = `${data.network.totals.total} observadas · ${data.network.totals.failed} falhas`;
  for (const id of ["domains", "cookie-list", "cookie-events", "cookie-attempt-list", "cookie-diagnostic-list", "storage-list"]) $(id).replaceChildren();
  for (const d of data.network.domains) row("domains", d.host, [`${d.types.join(", ")} · ${d.failed} falhas`], d.party, d.requests);
  if (!data.network.domains.length) $("domains").append(node("p", "Sem requisições registradas. Recarregue a página.", "muted"));
  const c = data.cookies.totals;
  $("cookie-summary").textContent = `Inventário atual: ${c.total} · ${c.first} primeira parte · ${c.third} terceira parte · ${c.session} sessão · ${c.persistent} persistentes · ${c.partitioned} com chave de partição`;
  const b = data.cookies.preexisting, e = data.cookies.eventTotals, p = data.cookies.probable.totals;
  $("cookie-baseline").textContent = `Preexistentes observados: ${b.totals.total} (${b.currentCount} ainda no inventário). Preexistência não estabelecida: ${b.unknownCurrentCount} atuais. Baseline parcial.`;
  $("cookie-writes").textContent = `Eventos na janela: ${e.observed} · ${e.writes} gravações (${e.created} criações inferidas, ${e.changed} alterações, ${e.unknown} indeterminadas) · ${e.removed} remoções, incluindo overwrite.`;
  $("cookie-probable").textContent = `Provavelmente criados/alterados na navegação: ${p.total} identidades · ${p.first} primeira parte · ${p.third} terceira parte · ${p.session} sessão · ${p.persistent} persistentes. Correlação, não autoria comprovada.`;
  const attempts = data.cookies.setCookieAttempts;
  $("cookie-attempts").textContent = `Tentativas Set-Cookie: ${attempts.length} (${attempts.filter(a => a.inObservationWindow).length} na janela). Aceite indeterminado.`;
  $("cookie-window").textContent = `Janela fixa: 30 s desde o início da requisição principal; ${data.cookies.window.status === "open" ? "ainda aberta" : data.cookies.window.status === "closed" ? "encerrada" : "indisponível: recarregue a página"}. Atualizar não reinicia a janela. Histórico descartado: ${data.cookies.historyDropped}; erros de eventos: ${data.cookies.processingErrors}.${data.cookies.inventoryChangedDuringQuery ? " Houve mudança durante a consulta; inventário não atômico, atualize novamente." : ""}`;
  for (const cookie of data.cookies.items) {
    const expiry = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString("pt-BR") : "fim da sessão";
    row("cookie-list", cookie.name, [`${cookie.domain} · path ${cookie.path} · store ${cookie.storeId}`, `${cookie.session ? "Sessão" : "Persistente"} · expira: ${expiry}`,
      `${cookie.preexisting === "observed-before-navigation" ? "Observado antes da navegação" : "Preexistência indeterminada"} · ${cookie.hasCorrelatedWrite ? "com gravação correlacionada" : "sem gravação correlacionada"}`,
      `HttpOnly: ${cookie.httpOnly ? "sim" : "não"} · Secure: ${cookie.secure ? "sim" : "não"} · partição: ${cookie.partitionKey?.topLevelSite || "não informada"}`], cookie.party);
  }
  const kinds = {created: "Criação inferida", changed: "Alteração", removed: "Remoção", unknown: "Gravação indeterminada"};
  for (const event of data.cookies.events) row("cookie-events", `${kinds[event.kind]} · ${event.name}`, [
    `${event.domain} · path ${event.path} · ${event.session ? "Sessão" : "Persistente"} · store ${event.storeId}`,
    `${new Date(event.at).toLocaleTimeString("pt-BR")} · causa ${event.cause} · ${event.basis}`,
    `Partição: ${event.partitionKey?.topLevelSite || "não informada"} · ${event.matchingObservedNavigations} navegações observadas compatíveis; outras abas/processos também podem ser autores.`
  ], event.party);
  for (const attempt of attempts) row("cookie-attempt-list", attempt.name, [attempt.url,
    `${new Date(attempt.at).toLocaleTimeString("pt-BR")} · ${attempt.inObservationWindow ? "dentro" : "fora"} da janela · aceite indeterminado`
  ], attempt.party);
  const diagnostic = data.cookies.diagnostics;
  const diagnosticLabels = {associated:"Evento recebido e associado", discarded:"Evento recebido e descartado",
    "not-received":"Evento onChanged não recebido nesta navegação", pending:"Evento recebido; processamento pendente",
    inconclusive:"Diagnóstico inconclusivo: cobertura insuficiente"};
  $("cookie-diagnostic-status").textContent = `Listener ${diagnostic.listenerActive ? "ativo" : "inativo"} · ${diagnostic.totalReceivedSinceRegistration} entradas globais desde a recarga da extensão · PSL ${diagnostic.readyStatus} · store ${diagnostic.navigation.storeStatus}. Registros descartados do diagnóstico: ${diagnostic.dropped}; decisões omitidas: ${diagnostic.droppedDecisions}; eventos descartados por limite do buffer: ${data.cookies.ingressDropped}.`;
  for (const probe of diagnostic.probes) row("cookie-diagnostic-list", probe.name, [
    `${probe.domain} · ${diagnosticLabels[probe.status]}`,
    ...probe.events.flatMap(event => [
      `Recebido: ${event.at} · causa ${event.cause} · removido ${event.removed} · store ${event.cookie.storeId} · FPI ${event.cookie.firstPartyDomain || "vazio"} · partição ${JSON.stringify(event.cookie.partitionKey)}`,
      ...event.decisions.flatMap(d => [
        `${d.status}${d.reason ? `: ${d.reason}` : ""} · navegação ${d.currentNavigation ? "atual" : "anterior"} · ${d.contextSource === "navigation-start-replay" ? "evento real reavaliado ao receber início da navegação" : d.contextSource === "host-request-replay" ? "evento real reavaliado por requisição anterior do host" : "contexto no recebimento"} · Δ início ${d.deltaMs} ms · hosts ${d.hosts.join(", ")} · store no contexto ${d.storeIdAtContextCapture || "pendente"} → ${d.storeIdAfterWait || "não processado"} · mesma navegação no processamento ${d.sameNavigation ?? "não verificada"} · PSL no recebimento ${event.readyAtReceipt}`,
        ...(d.hostEvidence || []).map(h => `Host ${h.host}: requisição ${h.requestId} iniciada em ${h.at}, callback recebido em ${h.observedAt}; ${event.at - h.at} ms antes do evento.`)
      ])
    ]),
    `${probe.priorReceipts.length} registros anteriores desta identidade por nome/domínio disponíveis no JSON. Valores de cookies não coletados.`
  ]);
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
