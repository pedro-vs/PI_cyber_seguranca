# Arquivos da finalização

Snapshot de `git status --short --untracked-files=all`, sem commit/staging/push. As fontes brutas movidas estavam fora do repositório, portanto aparecem como arquivos novos, não renames Git. Os 15 arquivos removidos eram README de modelos vazios site-1/site-2/site-3, substituídos pelo índice e pelas pastas com nomes reais.

Resumo: 19 modificados, 15 removidos, 89 novos. Detectores e testes: nenhuma alteração.

Complemento G1/Mercado Livre: E57–E62 incorporados com hashes; três avisos AUSENTE.md substituídos pelas evidências reais. Reconciliações, scores, relatório, auditoria e PDF atualizados.

## Status completo

```text
 M README.md
 M docs/CONCEITO_A.md
 M docs/PLANO_E_CHECKLIST.md
 M docs/RELATORIO_MODELO.md
 M docs/SCORE_PROPOSTA.md
 M docs/TESTES_E_EVIDENCIAS.md
 M docs/VALIDACAO_CONCEITO_A.md
 M docs/VALIDACAO_DDG_V04.md
 M evidencias/duckduckgo/README.md
 M evidencias/duckduckgo/RESULTADOS.md
 M evidencias/duckduckgo/bounce-tracking/REGISTRO.md
 M evidencias/duckduckgo/fingerprinting-canvas/REGISTRO.md
 M evidencias/duckduckgo/js-leaks/REGISTRO.md
 M evidencias/duckduckgo/query-parameters/REGISTRO.md
 M evidencias/duckduckgo/storage-blocking/REGISTRO.md
 M evidencias/duckduckgo/storage-partitioning/REGISTRO.md
 M evidencias/duckduckgo/tracker-blocking/REGISTRO.md
 M evidencias/duckduckgo/tracker-reporting/REGISTRO.md
 M evidencias/har/README.md
 D evidencias/sites-reais/site-1/README.md
 D evidencias/sites-reais/site-1/blacklight/README.md
 D evidencias/sites-reais/site-1/har/README.md
 D evidencias/sites-reais/site-1/screenshots/README.md
 D evidencias/sites-reais/site-1/ublock/README.md
 D evidencias/sites-reais/site-2/README.md
 D evidencias/sites-reais/site-2/blacklight/README.md
 D evidencias/sites-reais/site-2/har/README.md
 D evidencias/sites-reais/site-2/screenshots/README.md
 D evidencias/sites-reais/site-2/ublock/README.md
 D evidencias/sites-reais/site-3/README.md
 D evidencias/sites-reais/site-3/blacklight/README.md
 D evidencias/sites-reais/site-3/har/README.md
 D evidencias/sites-reais/site-3/screenshots/README.md
 D evidencias/sites-reais/site-3/ublock/README.md
?? docs/AMBIGUIDADES_EVIDENCIAS.md
?? docs/ARQUIVOS_FINAIS.md
?? docs/AUDITORIA_FINAL.md
?? docs/RELATORIO_FONTES.md
?? docs/VALIDACAO_FINAL.txt
?? docs/VERIFICACAO_PDF.json
?? docs/referencias/acesso-repositorio.json
?? docs/referencias/enunciado-avaliacao.pdf
?? docs/relatorio-final.md
?? docs/relatorio-final.pdf
?? evidencias/INDEX.md
?? evidencias/conceito-a/blocklist/REGISTRO.md
?? evidencias/conceito-a/blocklist/blocklist-cancelamento-local.png
?? evidencias/conceito-a/hook/README.md
?? evidencias/desenvolvimento/cookies/change-relatorio.png
?? evidencias/desenvolvimento/cookies/session-pagina-plugin.png
?? evidencias/desenvolvimento/cookies/session-relatorio.png
?? evidencias/desenvolvimento/cookies/setup-inventario-tres.png
?? evidencias/desenvolvimento/cookies/third-inventario-quatro.png
?? evidencias/desenvolvimento/cookies/third-inventario-tres.png
?? evidencias/desenvolvimento/cookies/third-pagina-primeira.png
?? evidencias/duckduckgo/bounce-tracking/ddg-bounce-tracking-pagina.png
?? evidencias/duckduckgo/bounce-tracking/ddg-bounce-tracking-plugin.png
?? evidencias/duckduckgo/bounce-tracking/ddg-bounce-tracking-relatorio.json
?? evidencias/duckduckgo/fingerprinting-canvas/ddg-canvas-resultados.png
?? evidencias/duckduckgo/fingerprinting-canvas/ddg-fingerprinting-canvas-detalhes.png
?? evidencias/duckduckgo/fingerprinting-canvas/ddg-fingerprinting-canvas-plugin.png
?? evidencias/duckduckgo/fingerprinting-canvas/ddg-fingerprinting-canvas-relatorio.json
?? evidencias/duckduckgo/js-leaks/ddg-js-leaks-com-plugin-antes-check.png
?? evidencias/duckduckgo/js-leaks/ddg-js-leaks-results-configuracao-nao-estabelecida.json
?? evidencias/duckduckgo/js-leaks/ddg-js-leaks-sem-plugin-pagina.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-01-pagina.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-01-plugin.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-01-relatorio.json
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-02-pagina.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-03-pagina.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-controle-zero-plugin.png
?? evidencias/duckduckgo/query-parameters/ddg-query-parameters-esperados.png
?? evidencias/duckduckgo/query-parameters/pendentes/query-dois-sinais-a.png
?? evidencias/duckduckgo/query-parameters/pendentes/query-dois-sinais-b.png
?? evidencias/duckduckgo/storage-blocking/ddg-storage-blocking-plugin.png
?? evidencias/duckduckgo/storage-blocking/ddg-storage-blocking-retrieve.png
?? evidencias/duckduckgo/storage-blocking/ddg-storage-blocking-store.png
?? evidencias/duckduckgo/storage-partitioning/ddg-storage-partitioning-detalhes.png
?? evidencias/duckduckgo/storage-partitioning/ddg-storage-partitioning-pagina.png
?? evidencias/duckduckgo/storage-partitioning/ddg-storage-partitioning-plugin.png
?? evidencias/duckduckgo/storage-partitioning/storage-partitioning-results.json
?? evidencias/duckduckgo/tracker-blocking/ddg-tracker-blocking-detalhes.png
?? evidencias/duckduckgo/tracker-blocking/ddg-tracker-blocking-pagina.png
?? evidencias/duckduckgo/tracker-blocking/ddg-tracker-blocking-primeira-pagina.png
?? evidencias/duckduckgo/tracker-blocking/ddg-tracker-blocking-relatorio.json
?? evidencias/duckduckgo/tracker-blocking/request-blocking-results.json
?? evidencias/duckduckgo/tracker-reporting/ddg-tracker-reporting-detalhes.png
?? evidencias/duckduckgo/tracker-reporting/ddg-tracker-reporting-plugin.png
?? evidencias/duckduckgo/tracker-reporting/ddg-tracker-reporting-rede.png
?? evidencias/duckduckgo/tracker-reporting/ddg-tracker-reporting-relatorio.json
?? evidencias/manifesto-recebidos.json
?? evidencias/sites-reais/README.md
?? evidencias/sites/README.md
?? evidencias/sites/analise.json
?? evidencias/sites/g1/blacklight/g1-blacklight.png
?? evidencias/sites/g1/har/dominios.csv
?? evidencias/sites/g1/har/g1.har
?? evidencias/sites/g1/har/resumo.json
?? evidencias/sites/g1/privacy-lens/g1-plugin.png
?? evidencias/sites/g1/privacy-lens/g1-relatorio.json
?? evidencias/sites/g1/privacy-lens/g1-score-plugin.png
?? evidencias/sites/g1/reconciliacao.md
?? evidencias/sites/g1/ublock/g1-ublock.png
?? evidencias/sites/mercadolivre/blacklight/mercadolivre-blacklight.png
?? evidencias/sites/mercadolivre/har/dominios.csv
?? evidencias/sites/mercadolivre/har/mercadolivre.har
?? evidencias/sites/mercadolivre/har/resumo.json
?? evidencias/sites/mercadolivre/privacy-lens/mercadolivre-relatorio.json
?? evidencias/sites/mercadolivre/privacy-lens/mercadolivre-score-plugin.png
?? evidencias/sites/mercadolivre/reconciliacao.md
?? evidencias/sites/mercadolivre/ublock/mercadolivre-ublock.png
?? evidencias/sites/transcricao-capturas.json
?? evidencias/sites/uol/blacklight/uol-blacklight.png
?? evidencias/sites/uol/har/dominios.csv
?? evidencias/sites/uol/har/resumo.json
?? evidencias/sites/uol/har/uol.har.gz
?? evidencias/sites/uol/privacy-lens/uol-plugin.png
?? evidencias/sites/uol/privacy-lens/uol-relatorio.json
?? evidencias/sites/uol/reconciliacao.md
?? evidencias/sites/uol/ublock/uol-ublock.png
?? scripts/analyze-evidence.cjs
?? scripts/build-report.py
?? scripts/requirements-report.txt
```

## Commits sugeridos — não executados

1. `docs: organize collected evidence and reconcile DDG and real sites` — inventário, originais, análises, registros e documentação atualizada.
2. `docs: add final report PDF, source map and requirements audit` — relatório/fonte, construtor reproduzível, auditoria e validações finais.

O relatório e as evidências ainda não foram publicados no remoto. Revisar os arquivos antes dos commits manuais.
