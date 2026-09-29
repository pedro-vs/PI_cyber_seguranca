# DDG — Tracker Blocking

Status: **EXECUTADO MANUALMENTE**, conforme relato do usuário. Concordância **alta/total para os mecanismos observados**. Evidências informadas; arquivos ainda não localizados no repositório, com conferência pendente. Nenhum teste no Firefox ou screenshot foi executado pelo agente.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-4) · [Tabela de resultados](../RESULTADOS.md)

Página oficial selecionada: https://privacy-test-pages.site/privacy-protections/request-blocking/

## Contexto e esperado documental

- Teste informado: TESTE 4 — Tracker Blocking.
- Ambiente de referência da sequência: Firefox 156.0.1 / Privacy Lens v0.4.0. Mudanças de configuração nesta execução não foram informadas.
- URL inicial/final efetivamente aberta, data/hora/fuso, espera e horários de captura/exportação: PENDENTES.
- macOS, referência Git, perfil/container, cache/dados prévios, ETP, escudo/exceção, outras proteções e eventual regra para o domínio: PENDENTES.
- Página e scripts conferidos em 29/09/2026 no commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`.

A página DDG pede `bad.third-party.site` na blocklist da solução avaliada. Com uma regra efetiva, os recursos abrangidos não devem carregar com sucesso. Sem essa pré-condição, não há expectativa universal de bloqueio. Privacy Lens v0.4.0 observa requisições e não fornece essa regra.

## Resultado real informado

**DDG:** praticamente todos os mecanismos ficaram `loaded`; o único `failed` visível foi WebSocket. O relato não fornece a contagem exata por estado nem a transcrição individual de todos os casos. Não se transforma “praticamente todos” em “22 loaded / 1 failed” sem conferir o download.

**Privacy Lens:**

| Campo | Resultado informado |
|---|---|
| Rede total | 31 requests · 1 falha |
| bad.third-party.site | 22 requests de terceira parte · 1 falha |

Correspondências exemplificadas pelo usuário:

| Caso DDG | Estado DDG informado | Recurso Privacy Lens | Tipo | Estado | HTTP / erro |
|---|---|---|---|---|---|
| html / script | loaded, conforme comparação relatada | script.js | script | completed | 200 |
| html / img | loaded, conforme comparação relatada | img.jpg | image | completed | 200 |
| html / iframe | loaded, conforme comparação relatada | frame.html | sub_frame | completed | 200 |
| css / import | loaded, conforme comparação relatada | cssImport.css | stylesheet | completed | 200 |
| js / fetch | loaded, conforme comparação relatada | fetch.json | xmlhttprequest | completed | 200 |
| js / websocket | failed | wss://bad.third-party.site/block-me/web-socket | websocket | error | 404 · NS_ERROR_WEBSOCKET_CONNECTION_REFUSED |

RequestIds, frameIds, timestamps, caminhos completos dos cinco recursos HTTP e eventual associação de `fetch.json` com outros helpers: PENDENTES de conferência no JSON. Não se força associação individual só pelo nome do recurso.

## Concordância e divergências

**Alta/total para os mecanismos observados**, conforme avaliação do usuário: os cinco exemplos de recursos carregados no DDG também aparecem concluídos com HTTP 200 no Privacy Lens. O caso WebSocket aparece como `failed` no DDG e como `error`, HTTP 404, `NS_ERROR_WEBSOCKET_CONNECTION_REFUSED` no plugin.

Não foi relatada divergência nesse recorte. Isso não é uma certificação de correspondência de todos os casos DDG: a transcrição completa e os artefatos ainda precisam ser conferidos. O código oficial define 23 mecanismos; os 31 requests totais e os 22 requests do domínio terceiro são contagens de rede, sem relação obrigatória de um para um com esses mecanismos.

O erro do WebSocket registra falha de conexão/carregamento nesse endpoint, sem estabelecer a causa ou sua autoria. **Não atribuir bloqueio ao Privacy Lens nem ao Firefox.** HTTP 404 e `NS_ERROR_WEBSOCKET_CONNECTION_REFUSED` isoladamente não identificam uma proteção; não se conclui que o domínio inteiro foi bloqueado, especialmente diante dos carregamentos HTTP 200 relatados.

## Evidências informadas pelo usuário

Pasta de destino: `evidencias/duckduckgo/tracker-blocking/`.

- `ddg-tracker-blocking-plugin.png`
- `ddg-tracker-blocking-detalhes.png`
- `ddg-tracker-blocking-relatorio.json`
- `request-blocking-results.json`

Os arquivos foram informados como evidências, mas não foram localizados no repositório nesta conferência. Conteúdo das capturas, resultados completos DDG e metadados de execução permanecem pendentes de inspeção. Nenhum arquivo de resultado foi simulado.

O print principal deve identificar a página DDG e o relatório da mesma aba. Preservar nos detalhes os recursos concluídos e o WebSocket com seu erro. Manter os originais; usar sufixos em novas rodadas, sem sobrescrever.

Nenhum código ou heurística foi alterado. Próxima execução preparada: somente [TESTE 5 — Storage Partitioning](../../../docs/VALIDACAO_DDG_V04.md#teste-5).
