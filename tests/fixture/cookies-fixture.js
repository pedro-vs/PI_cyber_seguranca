"use strict";
(async () => {
  const scenario = location.pathname.split("/").pop();
  if (scenario === "persistent") document.cookie = "pl3_persistent=demo; Max-Age=86400; Path=/cookies; SameSite=Lax";
  if (scenario === "late") {
    document.getElementById("status").textContent = "AGUARDANDO 32 s · escrita fora da janela";
    await new Promise(resolve => setTimeout(resolve, 32000));
    document.cookie = "pl3_session=late; Path=/cookies; SameSite=Lax";
  }
  if (document.readyState !== "complete") await new Promise(resolve => window.addEventListener("load", resolve, {once: true}));
  const names = document.cookie.split(";").map(c => c.trim().split("=")[0]).filter(n => n.startsWith("pl3_"));
  document.getElementById("observed").textContent = `Nomes visíveis via document.cookie (não inclui HttpOnly nem outros paths): ${names.join(", ") || "nenhum"}\nValores não exibidos. Consulte inventário, eventos e tentativas no Privacy Lens.`;
  const remaining = scenario === "setup" ? names.filter(name => !["pl3_existing", "pl3_change"].includes(name)) : scenario === "third-reset" ? names : [];
  document.getElementById("status").textContent = remaining.length ? `LIMPEZA INCOMPLETA · nomes ainda visíveis: ${[...new Set(remaining)].join(", ")}` : "PRONTO";
})().catch(() => { document.getElementById("status").textContent = "FALHA DA FIXTURE · verifique as políticas de armazenamento"; });
