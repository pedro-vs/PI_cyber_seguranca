# DDG — Query Parameters

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

A página de índice mostra quatro casos: remover utm_source preservando q; remover utm_source/utm_medium; remover fbclid/fb_source preservando u; preservar o controle q/id.

## Resultado da página

As páginas de destino mantêm os parâmetros de campanha: caso 01, utm_source=something&q=other; caso 02, utm_source=something&utm_medium=somethingelse; caso 03, fbclid=12345&fb_source=someting&u=14 (grafia do print). A página final do controle 04 não foi fornecida.

## Resultado do Privacy Lens

Caso 01: JSON E46 confirma um sinal utm_source, com q preservado, zero sync e bounce insuficiente. E29/E30 mostram dois sinais, mas não exibem nomes nem URL e não podem ser atribuídos individualmente a 02/03. E32 mostra zero sinais; sua associação ao controle 04 depende do contexto relatado.

## Concordância e divergência

Concordância na detecção comprovada do caso 01; divergência esperada quanto à remoção nos casos 01–03. Validação individual de 02/03 e da URL final 04 é parcial.

O Privacy Lens observa e classifica parâmetros, sem reescrever URLs. Por isso os parâmetros continuam nas páginas mesmo quando sinalizados. Não se alegou remoção bem-sucedida nem falso positivo ausente no controle sem sua URL. As capturas ambíguas foram guardadas em pendentes/, sem decisão arbitrária por proximidade de horário.

## Evidências

- **E25** — [ddg-query-parameters-esperados.png](ddg-query-parameters-esperados.png)
- **E26** — [ddg-query-parameters-01-pagina.png](ddg-query-parameters-01-pagina.png)
- **E27** — [ddg-query-parameters-01-plugin.png](ddg-query-parameters-01-plugin.png)
- **E28** — [ddg-query-parameters-02-pagina.png](ddg-query-parameters-02-pagina.png)
- **E29** — [query-dois-sinais-a.png](pendentes/query-dois-sinais-a.png)
- **E30** — [query-dois-sinais-b.png](pendentes/query-dois-sinais-b.png)
- **E31** — [ddg-query-parameters-03-pagina.png](ddg-query-parameters-03-pagina.png)
- **E32** — [ddg-query-parameters-controle-zero-plugin.png](ddg-query-parameters-controle-zero-plugin.png)
- **E46** — [ddg-query-parameters-01-relatorio.json](ddg-query-parameters-01-relatorio.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
