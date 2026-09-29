/* global browser, $, node, row, reportData */
"use strict";
let blocklistConfig = null, blocklistBusy = false;
function renderScore(score) {
  $("score-details").replaceChildren();
  $("score-value").textContent = "Indisponível";
  $("score-coverage").textContent = "Não foi possível calcular a pontuação; ausência de coleta não é zero.";
  if (!score || !["partial","observed"].includes(score.status) || !Array.isArray(score.categories) ||
      !Number.isFinite(score.range?.min) || !Number.isFinite(score.range?.max)) return;
  $("score-value").textContent = score.status === "partial" ? `${score.range.min}–${score.range.max} / 100 · parcial` : `${score.value} / 100`;
  $("score-coverage").textContent = `${score.coveredCategories}/${score.totalCategories} categorias com cobertura prevista. ${score.interpretation} ${score.version}.`;
  row("score-details", "Método", [score.method]);
  for (const category of score.categories) row("score-details", `${category.id} · ${category.label}`, [
    `Desconto observado: ${category.points}/${category.cap}. ${category.covered ? "Cobertura prevista disponível." : "Cobertura incompleta; o intervalo inclui a parcela não observada."}`,
    ...category.evidence.map(e => JSON.stringify(e))
  ]);
}
function renderSecurity(security) {
  $("security-list").replaceChildren();
  $("security-summary").textContent = "Indicadores de hook indisponíveis nesta coleta.";
  $("security-coverage").textContent = "Não é possível concluir ausência de alterações.";
  if (security?.availability !== "available") return;
  const labels = {"combined-indicator":"Alteração de API e canal repetido correlacionados", observations:"Observações isoladas · hijacking não comprovado",
    "not-observed":"Nenhum indicador nas APIs observadas"};
  $("security-summary").textContent = `${labels[security.status]} · ${security.changes.length} alterações · ${security.channels.length} canais · ${security.combinations.length} combinações.`;
  $("security-coverage").textContent = `${security.coverage.partial ? "Cobertura parcial. " : "Janela e APIs previstas observadas. "}${security.coverage.limitations}`;
  for (const change of security.changes) row("security-list", change.api, [
    `Frame ${change.frameId} · ${change.origin} · ${change.kind} · ${new Date(change.at).toLocaleTimeString("pt-BR")}`,
    change.afterOwnInstrumentation ? "Mudança posterior à instrumentação canvas própria." : "Diferença em relação ao descritor inicial; autoria e intenção desconhecidas."
  ]);
  for (const channel of security.channels) row("security-list", channel.domain, [channel.url,channel.reason,
    `Frame ${channel.frameId} · requests ${channel.requestIds.join(", ")} · confiança baixa${channel.error ? ` · erro ${channel.error}` : ""}`]);
  for (const combination of security.combinations) row("security-list", "Sinais combinados · confiança moderada", [combination.reason]);
  for (const frame of security.frames) row("security-list", `Frame ${frame.frameId} · ${frame.origin}`, [
    `${frame.observation.scans} amostragens · ${frame.observation.failed.length} APIs inacessíveis · ${frame.observation.unsupported.length} ausentes.`,
    `Instrumentação própria separada: ${frame.observation.ownInstrumentation.join(", ") || "nenhuma alteração registrada"}`
  ]);
}
function renderBlocklist(config) {
  $("blocklist-rules").replaceChildren();$("blocklist-decisions").replaceChildren();
  blocklistConfig = config?.status === "ready" && Array.isArray(config.rules) ? config : null;
  $("blocklist-status").textContent = blocklistConfig ?
    `${config.enabled ? "Ativa" : "Pausada"} · ${config.rules.length} regras locais. Alterações valem para as próximas requisições; recarregue a página para repetir o teste.` :
    (config?.error || "Lista indisponível; não foi possível verificar a configuração.");
  for (const id of ["blocklist-add","blocklist-toggle"]) $(id).disabled = !blocklistConfig || blocklistBusy;
  $("blocklist-toggle").textContent = config?.enabled ? "Pausar lista" : "Ativar lista";
  if (!blocklistConfig) return;
  for (const rule of config.rules) {
    const line = node("div","","row"), remove = node("button",`Remover ${rule.host}`,"secondary");
    remove.disabled = blocklistBusy;
    remove.addEventListener("click",() => changeBlocklist({operation:"remove",host:rule.host}));
    line.append(node("p",`${rule.host} · ${rule.includeSubdomains ? "inclui subdomínios" : "somente hostname exato"}`),remove);
    $("blocklist-rules").append(line);
  }
  if (!config.rules.length) row("blocklist-rules","Lista vazia",["Nenhum domínio bloqueado por esta lista."]);
  for (const decision of config.decisions || []) row("blocklist-decisions",decision.host,[decision.url,
    `Cancelamento solicitado pelo Privacy Lens · regra ${decision.rule.host} · request ${decision.requestId}. Outras proteções também podem atuar.`]);
  if (config.dropped) row("blocklist-decisions","Cobertura parcial",[`${config.dropped} decisões excederam o limite do relatório.`]);
}
function renderConceptA(data) {
  // Uma seção nova indisponível ou malformada não derruba as medições B.
  for (const [renderSection, section] of [[renderScore,data?.score],[renderSecurity,data?.security],[renderBlocklist,data?.blocklist]]) {
    try {renderSection(section);} catch {renderSection(null);}
  }
}
async function changeBlocklist(action) {
  if (blocklistBusy || !blocklistConfig) return;
  blocklistBusy = true;renderBlocklist(blocklistConfig);$("blocklist-error").textContent = "";
  try {
    const result = await browser.runtime.sendMessage({type:"blocklist-update",action});
    if (!result || result.error || result.status !== "ready") throw Error(result?.error || "Sem confirmação de gravação da lista.");
    blocklistConfig = {...result,decisions:blocklistConfig.decisions || [],dropped:blocklistConfig.dropped || 0};
    reportData = null;$("export").disabled = true;
    $("status").textContent = "Lista alterada. Clique em Atualizar antes de exportar o relatório.";
  } catch (error) {$("blocklist-error").textContent = error.message;}
  finally {blocklistBusy = false;renderBlocklist(blocklistConfig);}
}
async function loadBlocklist() {
  try {renderBlocklist(await browser.runtime.sendMessage({type:"blocklist-get"}));}
  catch {renderBlocklist(null);}
}
function setupConceptA() {
  $("blocklist-form").addEventListener("submit",event => {
    event.preventDefault();
    changeBlocklist({operation:"add",host:$("blocklist-host").value,includeSubdomains:$("blocklist-subdomains").checked});
  });
  $("blocklist-toggle").addEventListener("click",() => changeBlocklist({operation:"enabled",enabled:!blocklistConfig?.enabled}));
}
