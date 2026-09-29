# DDG — Tracker Blocking

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

A página Request Blocking pede adicionar bad.third-party.site à lista de uma solução de bloqueio. A legenda verde significa carregou; borda vermelha significa falhou, podendo ser bloqueio ou outra falha.

## Resultado da página

O download E48 de 00:46:12 contém 23 mecanismos: 22 loaded e WebSocket failed. E17/E18 mostram essa distribuição. Não há evidência de regra ativa para o domínio nesta execução.

## Resultado do Privacy Lens

JSON v0.4.0 de 00:54:41.962: 31 requisições, 9 próprias, 22 terceiras, 1 falha. script.js, style.css, object.png, frame.html e cssImport.css completam HTTP 200 em E19. WebSocket registra HTTP 404, error e NS_ERROR_WEBSOCKET_CONNECTION_REFUSED.

## Concordância e divergência

Concordância dos estados exemplificados; totais medem unidades diferentes. O download DDG é anterior ao JSON e não contém requestIds para provar um pareamento integral por tentativa.

Um mecanismo pode produzir mais de uma requisição, e recursos da página entram no total 31. A falha WebSocket não pode ser atribuída ao Privacy Lens: v0.4.0 somente observava. A blocklist personalizada foi implementada e validada depois na v0.5.0, em fixture local. O nome bad.third-party.site não é, por si, uma regra de bloqueio.

## Evidências

- **E17** — [ddg-tracker-blocking-primeira-pagina.png](ddg-tracker-blocking-primeira-pagina.png)
- **E18** — [ddg-tracker-blocking-pagina.png](ddg-tracker-blocking-pagina.png)
- **E19** — [ddg-tracker-blocking-detalhes.png](ddg-tracker-blocking-detalhes.png)
- **E44** — [ddg-tracker-blocking-relatorio.json](ddg-tracker-blocking-relatorio.json)
- **E48** — [request-blocking-results.json](request-blocking-results.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
