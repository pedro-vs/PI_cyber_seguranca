(() => {
  "use strict";
  const P = globalThis.PrivacyLens;
  P.blockHost = (input, resolve) => {
    if (typeof input !== "string" || input.length > 253) throw Error("Informe apenas um hostname, sem URL, porta, caminho ou curinga.");
    const text = input.trim().toLowerCase().replace(/\.$/, "");
    if (!/^(?:\[[0-9a-f:.]+\]|[\p{L}\p{N}.-]+)$/u.test(text) || text.startsWith(".") || text.includes(".."))
      throw Error("Informe apenas um hostname, sem URL, porta, caminho ou curinga.");
    const host = P.normalizeHost(text);
    if (!host || (!host.startsWith("[") && host.split(".").some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)))) throw Error("Hostname inválido.");
    const local = host === "localhost" || host.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    if (!local && (resolve(host) === host && resolve(`privacy-lens-test.${host}`) !== host)) throw Error("Não é permitido bloquear um sufixo público inteiro.");
    return host;
  };
  P.createBlocklist = (storage, resolver) => {
    let settings = {enabled:true,rules:[]}, status = "loading", error = null, queue = Promise.resolve();
    const validate = async raw => {
      const resolve = await resolver;
      if (!resolve || !raw || typeof raw.enabled !== "boolean" || !Array.isArray(raw.rules) || raw.rules.length > 200) throw Error("invalid");
      const rules = raw.rules.map(r => {
        if (!r || typeof r.includeSubdomains !== "boolean") throw Error("invalid");
        return {host:P.blockHost(r.host,resolve),includeSubdomains:r.includeSubdomains};
      });
      return {enabled:raw.enabled,rules:[...new Map(rules.map(r => [r.host,r])).values()].sort((a,b) => a.host.localeCompare(b.host))};
    };
    const ready = (async () => {
      try {
        if (!storage) throw Error("storage-unavailable");
        const saved = await storage.get("customBlocklist");
        if (saved.customBlocklist !== undefined) settings = await validate(saved.customBlocklist);
        status = "ready";
      } catch {status = "unavailable";error = "Não foi possível carregar a lista local. Nenhum bloqueio aplicado.";}
    })();
    return {ready,
      snapshot: () => ({status,error,enabled:settings.enabled,rules:settings.rules.map(r => ({...r}))}),
      async decide(url) {
        await ready;
        if (status !== "ready" || !settings.enabled) return null;
        let parsed;try {parsed = new URL(url);} catch {return null;}
        if (!["http:","https:","ws:","wss:"].includes(parsed.protocol)) return null;
        const host = P.host(url);
        const rule = settings.rules.find(r => host === r.host || (r.includeSubdomains && host.endsWith(`.${r.host}`)));
        return rule ? {...rule} : null;
      },
      update(action) {
        const work = queue.then(async () => {
          await ready;
          if (status !== "ready") throw Error(error);
          const next = {enabled:settings.enabled,rules:settings.rules.map(r => ({...r}))};
          if (action?.operation === "enabled" && typeof action.enabled === "boolean") next.enabled = action.enabled;
          else if (["add","remove"].includes(action?.operation)) {
            const host = P.blockHost(action.host,await resolver);
            next.rules = next.rules.filter(r => r.host !== host);
            if (action.operation === "add") {
              if (typeof action.includeSubdomains !== "boolean") throw Error("Informe o escopo de subdomínios.");
              next.rules.push({host,includeSubdomains:action.includeSubdomains});
            }
          } else throw Error("Operação de lista inválida.");
          const checked = await validate(next);
          try {await storage.set({customBlocklist:checked});}
          catch {throw Error("Falha ao salvar a lista; a configuração anterior foi preservada.");}
          settings = checked;return this.snapshot();
        });
        queue = work.catch(() => {});return work;
      }
    };
  };
})();
