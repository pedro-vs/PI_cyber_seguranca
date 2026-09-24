/* Public Suffix List: regras exatas, curingas, exceções e seção PRIVATE. */
(() => {
  "use strict";
  const P = globalThis.PrivacyLens ||= {};
  P.normalizeHost = value => {
    const text = String(value || "").replace(/^\./, "").replace(/\.$/, "").toLowerCase();
    try { return new URL(`http://${text}`).hostname.replace(/\.$/, ""); }
    catch { return ""; }
  };
  P.host = value => { try { return P.normalizeHost(new URL(value).hostname); } catch { return ""; } };
  P.isWeb = value => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
  P.createDomainResolver = text => {
    const exact = new Set(), wildcard = new Set(), exceptions = new Set();
    for (const line of text.split(/\r?\n/)) {
      const rule = line.trim();
      if (!rule || rule.startsWith("//")) continue;
      if (rule.startsWith("!")) exceptions.add(P.normalizeHost(rule.slice(1)));
      else if (rule.startsWith("*.")) wildcard.add(P.normalizeHost(rule.slice(2)));
      else exact.add(P.normalizeHost(rule));
    }
    return host => {
      host = P.normalizeHost(host);
      if (!host || host.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
      const labels = host.split(".");
      let suffixSize = 1;
      for (let i = 0; i < labels.length; i++) {
        const suffix = labels.slice(i).join(".");
        if (exceptions.has(suffix)) return labels.slice(-(labels.length - i)).join(".");
        if (exact.has(suffix)) suffixSize = Math.max(suffixSize, labels.length - i);
        if (i > 0 && wildcard.has(suffix)) suffixSize = Math.max(suffixSize, labels.length - i + 1);
      }
      return labels.slice(-Math.min(labels.length, suffixSize + 1)).join(".");
    };
  };
  P.party = (host, topHost, resolve) => !host || !topHost ? "unknown" :
    resolve(host) === resolve(topHost) ? "first" : "third";
  P.safeUrl = value => {
    try {
      const url = new URL(value);
      return {url: `${url.origin}${url.pathname}`, queryKeys: [...new Set(url.searchParams.keys())]};
    } catch { return {url: "", queryKeys: []}; }
  };
})();
