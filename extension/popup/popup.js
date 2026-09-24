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
function render(data) {
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
