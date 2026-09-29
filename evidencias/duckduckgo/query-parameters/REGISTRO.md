# DDG — Query Parameters

Status: **EXECUTADO E CONCLUÍDO MANUALMENTE**, conforme relato do usuário, na sequência de validação da v0.4.0. Os quatro casos foram registrados. Evidências informadas; arquivos ainda não localizados no repositório, conferência pendente.

[Procedimento documental](../../../docs/VALIDACAO_DDG_V04.md#teste-7) · [Tabela consolidada](../RESULTADOS.md)

Página selecionada: https://privacy-test-pages.site/privacy-protections/query-parameters/

## Resultados reais informados

| Caso | Expected DDG | Results real DDG | Privacy Lens | Interpretação |
|---|---|---|---|---|
| 01 | q=other | utm_source=something&q=other | 1 sinal potencial | utm_source permaneceu; detecção correta conforme relato; divergência no critério de remoção |
| 02 | string vazia | utm_source=something&utm_medium=somethingelse | 2 sinais potenciais | dois parâmetros de campanha permaneceram; identificação correta conforme relato; divergência de remoção |
| 03 | u=14 | fbclid=12345&fb_source=someting&u=14 | 2 sinais potenciais | fbclid/fb_source permaneceram; identificação correta conforme relato; divergência de remoção |
| 04 — controle | q=something&id=1234 | q=something&id=1234 | 0 sinais potenciais | controle preservado, sem falso positivo observado |

Nos casos 01–03, os parâmetros de tracking não foram removidos na configuração atual do Firefox. O Privacy Lens identificou corretamente os parâmetros suspeitos presentes, segundo a validação informada. **Concordância observacional e divergência de remoção**: a v0.4.0 sinaliza parâmetros, não os remove. Não atribuir limpeza ou bloqueio ao plugin nem classificar a permanência dos parâmetros como falha do detector. A avaliação conjunta é parcial nesses três casos, por medir funções diferentes com resultados concretos acima.

No caso 04, concordância total no controle: Results coincide com Expected e não houve sinal potencial. Isso demonstra ausência de falso positivo nesse exemplo, sem generalizar para todas as URLs.

Os valores são os dados públicos do teste relatados pelo usuário; o JSON Privacy Lens não exporta valores de queries. RequestIds, horários, motivos individuais e cobertura por caso ainda precisam ser conferidos nos artefatos. Não se presume cobertura sem omissões a partir do Teste 6.

## Ambiente e evidências

Referência da sequência: Firefox 156.0.1 / Privacy Lens v0.4.0; mudanças não informadas. Data/hora/fuso, URLs finais completas, ETP/escudo, perfil/container, cache, outras proteções e duração: PENDENTES de transcrição/conferência. As strings de Results foram preservadas literalmente, incluindo `someting` no caso 03.

Pasta: `evidencias/duckduckgo/query-parameters/`.

- `ddg-query-parameters-01-plugin.png`
- `ddg-query-parameters-01-relatorio.json`
- `ddg-query-parameters-02-plugin.png`
- `ddg-query-parameters-02-relatorio.json`
- `ddg-query-parameters-03-plugin.png`
- `ddg-query-parameters-03-relatorio.json`
- `ddg-query-parameters-04-plugin.png`
- `ddg-query-parameters-04-relatorio.json`
- `ddg-query-parameters-esperados.png`

Os nove arquivos foram informados como evidências; não foram localizados no repositório nesta conferência. Não existe download DDG próprio nesta variante. Nenhuma captura foi feita pelo agente e nenhum resultado foi simulado. Preservar os originais por caso, sem sobrescrever.

Testes 1–7 relatados como executados. Conferência das evidências permanece pendente. Próximo bloco autorizado pelo usuário: Conceito A, com indicadores de hook/hijacking, validação js-leaks, score e blocklist; os detectores B devem ser preservados.
