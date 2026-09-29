# DDG — Tracker Reporting

Status: **EXECUTADO E VALIDADO MANUALMENTE PELO USUÁRIO**, conforme relato nesta conversa. Os arquivos abaixo foram informados como capturados, mas ainda não foram localizados no repositório; inclusão e conferência dos artefatos permanecem pendentes. Nenhuma captura foi produzida pelo agente.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-1) · [Tabela de resultados](../RESULTADOS.md)

- Teste/subteste: 1 major tracker loaded via script.
- URL informada: https://privacy-test-pages.site/tracker-reporting/1major-via-script.html
- Data/hora/fuso, duração e URL final efetiva: PENDENTE de confirmação no artefato/relato.
- Ambiente informado para a rodada: Firefox 156.0.1 / Privacy Lens v0.4.0. Versão macOS e referência Git da execução: PENDENTES.
- Perfil/container, dados prévios/limpeza, cache, ETP, exceções e outras extensões: PENDENTES.
- Esperado documental: inclusão programada de `https://doubleclick.net/tracker.js` por script; não há garantia de sucesso HTTP nem placar automático.
- Texto DDG observado pelo usuário: “1 major tracker loaded via script src”.
- Privacy Lens informado: **3 requests totais**; domínio `doubleclick.net` classificado como terceira parte; URL `https://doubleclick.net/tracker.js`; tipo `script`; estado `error`; HTTP **404**; erro **NS_ERROR_CORRUPTED_CONTENT**.
- Concordância: **total quanto ao reporte da tentativa, domínio e tipo**, conforme validação manual informada. Não é uma confirmação de carregamento bem-sucedido.
- Divergência: nenhuma quanto à tentativa reportada. A falha HTTP/erro de conteúdo foi observada e preservada; a página não prometia HTTP 200.
- Explicação técnica: a requisição do recurso declarado pelo DDG foi observada como script terceiro e terminou com erro. HTTP 404 e NS_ERROR_CORRUPTED_CONTENT não identificam, isoladamente, ação do Firefox, de um bloqueador ou autoria do bloqueio. Não há evidência para essa atribuição.
- RequestId, timestamps, headers e demais detalhes: PENDENTES da conferência do JSON.
- Cookies/storage: não avaliados neste relato; não inferir resultados.

## Evidências informadas pelo usuário

Pasta prevista: `evidencias/duckduckgo/tracker-reporting/`.

- `ddg-tracker-reporting-plugin.png` — print principal informado como capturado; arquivo ainda não localizado no repositório.
- `ddg-tracker-reporting-detalhes.png` — print complementar informado como capturado; arquivo ainda não localizado no repositório.
- `ddg-tracker-reporting-relatorio.json` — exportação informada; arquivo ainda não localizado no repositório.

Não substituir esses arquivos por capturas artificiais. Conferência visual/JSON pendente; resultado textual registrado com origem explícita no relato do usuário. O detector não foi alterado por esse resultado.
