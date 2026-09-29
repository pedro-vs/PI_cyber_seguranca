/* Contrato compartilhado pelo background, popup e relatório em aba. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens = globalThis.PrivacyLens || {};
  const version = "advanced-tracking-v1";
  const errors = {
    "missing-section":"O background não retornou advancedTracking. Recarregue a extensão em about:debugging e depois a página de teste.",
    "invalid-section":"O background retornou tracking avançado em formato incompatível. Recarregue a extensão e repita a coleta.",
    "state-missing":"O estado de tracking desta navegação não foi inicializado. Recarregue a página de teste.",
    "collection-failed":"Falha ao produzir o relatório de tracking avançado. Atualize ou recarregue a página de teste.",
    "report-failed":"O background não forneceu um relatório válido. Consulte o erro de coleta e tente Atualizar."
  };
  P.unavailableTrackingReport = code => {
    if (!Object.hasOwn(errors, code)) code = "invalid-section";
    return {version, availability:"unavailable", error:{code, message:errors[code]},
      bounce:{status:"unavailable", sequences:[], route:[]},
      cookieSync:{status:"unavailable", indicators:[], endpointHints:[], limitation:errors[code]},
      queryParameters:{status:"unavailable", findings:[], limitation:errors[code]},
      coverage:{partial:true, dropped:{}, hashErrors:null, pendingComparisons:null, observedRequests:null,
        limits:null, comparison:null, limitations:"Coleta indisponível não equivale a ausência de sinais."}};
  };
  const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const count = v => Number.isInteger(v) && v >= 0;
  const strings = v => Array.isArray(v) && v.every(s => typeof s === "string");
  const items = (v, valid = () => true) => Array.isArray(v) && v.every(item => object(item) && valid(item));
  // Nunca converte seção ausente/inválida em uma medição de zero sinais.
  P.normalizeTrackingReport = data => {
    if (data == null) return P.unavailableTrackingReport("missing-section");
    if (data.availability === "unavailable") return P.unavailableTrackingReport(data.error?.code);
    const b = data.bounce, s = data.cookieSync, q = data.queryParameters, c = data.coverage;
    if (!object(data) || data.version !== version || data.error != null ||
      (data.availability !== undefined && data.availability !== "available") ||
      !object(b) || !["indicator","sequence-observed","insufficient-evidence"].includes(b.status) ||
      !items(b.sequences, item => strings(item.domains) && strings(item.parameters) && Array.isArray(item.cookieWrites)) || !items(b.route) ||
      !object(s) || !["indicator","not-observed"].includes(s.status) ||
      !items(s.indicators, item => strings(item.domains) && items(item.occurrences)) || !items(s.endpointHints) ||
      !object(q) || !["potential-tracking","not-observed"].includes(q.status) || !items(q.findings, item => strings(item.reasons)) ||
      !object(c) || typeof c.partial !== "boolean" || !object(c.dropped) || !Object.values(c.dropped).every(count) ||
      !count(c.hashErrors) || !count(c.pendingComparisons) || !count(c.observedRequests) || typeof c.limitations !== "string")
      return P.unavailableTrackingReport("invalid-section");
    return {...data, availability:"available"};
  };
})();
