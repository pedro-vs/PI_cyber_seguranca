# DDG — Storage Partitioning

Status: **EXECUTADO MANUALMENTE**, conforme relato do usuário. Concordância **parcial / cobertura limitada**. O Privacy Lens observou storage same-site; não demonstrou sozinho o particionamento cross-site. Evidências informadas, com arquivos ainda não localizados no repositório e conferência pendente.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-5) · [Tabela de resultados](../RESULTADOS.md)

Página oficial selecionada: https://www.first-party.site/privacy-protections/storage-partitioning/

## Contexto e esperado documental

- Teste informado: TESTE 5 — Storage Partitioning.
- Ambiente de referência da sequência: Firefox 156.0.1 / Privacy Lens v0.4.0. Mudanças de configuração nesta execução não foram informadas.
- Origem observada no plugin: `https://www.first-party.site`.
- URL inicial/final completa, data/fuso, início/fim, duração e horário das exportações: PENDENTES. O horário de coleta top-level informado foi **01:11:48**.
- macOS, referência Git, perfil/container, dados prévios/cache, ETP/escudo/exceções e outras proteções: PENDENTES.
- Página e scripts conferidos em 29/09/2026 no commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`.

O DDG compara leituras same-site e cross-site. Para as APIs de storage com validador comum, pass exige recuperar o identificador em same-site e resultados cross-site consistentes diferentes dele, com quantidades correspondentes. O mesmo identificador nos dois contextos produz fail. Cache e HSTS têm critérios próprios; error e unsupported não são pass. Contagens de chaves/bancos no plugin não reproduzem essa comparação de valores.

## Resultado DDG informado

O resumo informou recuperação de dados de **21 mecanismos**.

| API | Estado real informado | Same-site | Cross-site |
|---|---|---|---|
| document.cookie | pass | Detalhes não transcritos | Detalhes não transcritos |
| HTTP Cookie | pass | Detalhes não transcritos | Detalhes não transcritos |
| Cookie Store API | pass | Detalhes não transcritos | Detalhes não transcritos |
| localStorage | pass | Identificador da sessão recuperado | null |
| sessionStorage | pass | Identificador da sessão recuperado | null |
| IndexedDB | pass | Identificador da sessão recuperado | null |
| WebSQL | unsupported | Detalhes não transcritos | Detalhes não transcritos |
| Prefetch Cache | error | Detalhes não transcritos | Detalhes não transcritos |

O usuário também informou que os demais mecanismos principais ficaram pass. Sem a transcrição individual dos demais casos, não se presume uma contagem de 19 pass nem se completa a tabela das 21 APIs com resultados inventados. O motivo específico de Prefetch Cache error permanece pendente de conferência; não é atribuído a bloqueio ou ao Privacy Lens.

O download DDG contém estados por API. Os valores/erros detalhados same-site/cross-site devem ser conferidos nas capturas/transcrição, pois não fazem parte desse download.

## Privacy Lens após a execução

| Contexto informado | Origem / frame / horário | localStorage | sessionStorage | IndexedDB |
|---|---|---|---|---|
| Top-level | https://www.first-party.site · Frame 0 · coleta 01:11:48 | 1 chave | 1 chave | 1 banco |
| Snapshot embedded same-site anterior 1 | Origem completa, frameId e horário não transcritos | 1 chave | 1 chave | 1 banco |
| Snapshot embedded same-site anterior 2 | Origem completa, frameId e horário não transcritos | 1 chave | 1 chave | 1 banco |

Os dois registros embedded são snapshots anteriores, conforme o usuário. Não somar suas contagens às do top-level como se fossem três armazenamentos independentes nem presumir frameIds distintos. Baseline e evolução temporal desses snapshots não foram informados.

O relatório da principal **não agregou a aba auxiliar cross-site** utilizada pelo DDG. Snapshots desse contexto não estão disponíveis nessa comparação. Cookies/store/partitionKey observados pelo plugin e detalhes de coleta não foram transcritos; não se presume que reproduzam os três resultados DDG de cookies.

## Concordância e limitação concreta

**Parcial / cobertura limitada**, conforme avaliação do usuário:

- O Privacy Lens confirma presença observável de storage no contexto same-site: Frame 0, coleta 01:11:48, contagens 1/1/1, além dos dois snapshots embedded anteriores com 1/1/1.
- O DDG recuperou o identificador em same-site e null em cross-site para localStorage, sessionStorage e IndexedDB, classificando essas APIs como pass. O resultado sustenta o isolamento de acesso no cenário DDG; null sozinho não distingue todos os mecanismos de isolamento/bloqueio.
- O Privacy Lens não dispõe do snapshot da aba auxiliar cross-site no relatório principal, nem compara o identificador da sessão. **Particionamento HTML5 não estabelecido pelos snapshots do plugin.**

A diferença é de cobertura entre abas/contextos, não uma contradição entre as contagens same-site e o resultado cross-site. A origem e a hora do snapshot delimitam o que o plugin confirmou. Os resultados de cookies, WebSQL, Prefetch Cache e outras APIs não têm comparação independente estabelecida com o plugin neste relato.

Nenhum código ou heurística foi alterado para ampliar cobertura ou obter concordância.

## Evidências informadas pelo usuário

Pasta de destino: `evidencias/duckduckgo/storage-partitioning/`.

- `ddg-storage-partitioning-plugin.png`
- `ddg-storage-partitioning-detalhes.png`
- `ddg-storage-partitioning-relatorio.json`
- `storage-partitioning-results.json`

Os arquivos foram informados como evidências, mas não foram localizados no repositório nesta conferência. A inspeção dos originais, dos demais resultados por API e dos metadados permanece pendente. Nenhuma captura ou resultado foi gerado pelo agente.

Preservar o print conjunto da página DDG e do relatório vinculado à principal, os detalhes same-site/cross-site e a cobertura dos snapshots. Manter os originais e usar sufixos em novas rodadas, sem sobrescrever.

Próxima execução preparada: somente [TESTE 6 — Bounce Tracking](../../../docs/VALIDACAO_DDG_V04.md#teste-6).
