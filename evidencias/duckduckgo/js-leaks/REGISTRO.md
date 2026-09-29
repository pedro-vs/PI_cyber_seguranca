# DDG — js-leaks / hook

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

A página compara propriedades globais contra o perfil Firefox 92. O controle relevante é executar Check com e sem a extensão, mantendo o restante do ambiente e comparando os mesmos nomes.

## Resultado da página

E33, com Privacy Lens, tem listas vazias e Download the results desabilitado: captura anterior ao Check. E34 tem propriedades adicionadas e o menu de extensões vazio. E49 exporta 849 adicionadas, 17 removidas e 4 alteradas, contra firefox_92, às 02:36:31. O arquivo não identifica a condição com/sem extensão.

## Resultado do Privacy Lens

Na captura E33, Privacy Lens mostra 100/100 e 6/6 categorias com cobertura prevista; 0 alterações, 0 canais e 0 combinações. A blocklist está ativa e vazia. Não há JSON Privacy Lens dessa página no lote.

## Concordância e divergência

Comparação causal inconclusiva. As duas execuções concluídas com/sem extensão não estão documentadas por dois resultados identificados.

O DDG compara uma referência estática antiga; o Privacy Lens compara descritores selecionados ao document_start do próprio documento. Nenhum dos dois zeros seria prova universal de ausência de hook. As quatro propriedades alteradas no JSON são languages.0/languages.1 de window.clientInformation e toString/valueOf de window.location. Sem par controlado não se pode atribuir mudanças ao plugin, afirmar que são comuns às duas execuções ou concluir transparência da instrumentação. O resultado 100/100 pertence somente à cobertura declarada pelo plugin naquele instante.

## Evidências

- **E33** — [ddg-js-leaks-com-plugin-antes-check.png](ddg-js-leaks-com-plugin-antes-check.png)
- **E34** — [ddg-js-leaks-sem-plugin-pagina.png](ddg-js-leaks-sem-plugin-pagina.png)
- **E49** — [ddg-js-leaks-results-configuracao-nao-estabelecida.json](ddg-js-leaks-results-configuracao-nao-estabelecida.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
