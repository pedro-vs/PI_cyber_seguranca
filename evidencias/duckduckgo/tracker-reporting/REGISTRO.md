# DDG — Tracker Reporting

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

A página 1major-via-script inclui https://doubleclick.net/tracker.js como script. O objetivo observacional é identificar a tentativa e seu domínio; o título da página não certifica resposta HTTP bem-sucedida.

## Resultado da página

A página anuncia um tracker via script. O detalhe do Privacy Lens registra request 2642, frame 0, tipo script, estado error, HTTP 404 e NS_ERROR_CORRUPTED_CONTENT. O documento principal 2641 retorna 200.

## Resultado do Privacy Lens

JSON v0.4.0: 3 requisições, 2 próprias e 1 terceira; 1 falha. doubleclick.net é terceiro pela PSL. Exportação em 28/09 às 23:13:13.416 (UTC−3).

## Concordância e divergência

Concordância na observação da tentativa, domínio, tipo e falha; não é prova de tracker executado com sucesso.

Contar a tentativa é coerente com webRequest mesmo quando seu carregamento falha. HTTP 404 e o erro de conteúdo não identificam qual proteção atuou. A v0.4.0 não tinha a blocklist da v0.5.0. A captura posterior E10 ainda mostra o mesmo requestId 2642, permitindo ligar o detalhe visual ao JSON sem presumir uma nova execução.

## Evidências

- **E08** — [ddg-tracker-reporting-plugin.png](ddg-tracker-reporting-plugin.png)
- **E09** — [ddg-tracker-reporting-detalhes.png](ddg-tracker-reporting-detalhes.png)
- **E10** — [ddg-tracker-reporting-rede.png](ddg-tracker-reporting-rede.png)
- **E42** — [ddg-tracker-reporting-relatorio.json](ddg-tracker-reporting-relatorio.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
