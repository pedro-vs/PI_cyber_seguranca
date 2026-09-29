# DDG — Fingerprinting / Canvas

Status: **EXECUTADO MANUALMENTE**, conforme relato do usuário. Concordância **parcial/complementar**. Evidências informadas; arquivos ainda não localizados no repositório, com conferência pendente. Nenhum teste no Firefox ou screenshot foi executado pelo agente.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-3) · [Tabela de resultados](../RESULTADOS.md)

Página oficial selecionada: https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html

## Contexto da execução

- Teste informado: TESTE 3 — Fingerprinting / Canvas.
- Ambiente de referência da sequência manual: Firefox 156.0.1 / Privacy Lens v0.4.0. Mudanças de configuração nesta execução não foram informadas.
- URL inicial/final efetivamente aberta, data/hora/fuso, duração e espera: PENDENTES.
- macOS, referência Git, perfil/container, dados prévios/limpeza e cache: PENDENTES.
- ETP, exceções, preferências de fingerprinting e outras extensões: PENDENTES.
- O esperado documental DDG consiste em asserções de resistência, desempenho e correção. O indicador do plugin consiste em sequências de desenho e leitura/exportação; não equivale a um pass/fail DDG.

## Resultado real informado

| Campo Privacy Lens | Resultado |
|---|---|
| Classificação | Indicador de canvas fingerprinting detectado |
| Desenhos | 7039 |
| Leituras/exportações | 125 |
| Exceções | 0 |
| Canvas com indício | 18 |
| APIs de leitura/exportação | `getImageData`, `toDataURL` |
| Frames instrumentados | 1 |
| Cobertura | Parcial: 85 amostras fora do limite |

Exemplo concreto informado:

| Campo da amostra | Resultado |
|---|---|
| Canvas | #13 |
| Leitura | `getImageData` |
| Dimensões | 2000 × 200 |
| Desenho anterior | `fill` |
| Intervalo entre desenho e leitura | 277 ms |
| Classificação da sequência | Compatível |

O DDG registrou **falha de performance de `getImageData` em 277 ms**, segundo o usuário. O nome exato do check, o texto integral de Notes, o limiar da asserção e os resultados dos demais checks não foram transcritos. Permanecem pendentes de conferência nos artefatos, assim como o estado global de conclusão do DDG; não são registrados como pass ou fail por suposição.

## Concordância e limites

**Parcial/complementar**, conforme avaliação do usuário. Há evidência concreta de leitura após desenho: Canvas #13, `fill` → `getImageData`, 2000 × 200, intervalo de 277 ms. Isso sustenta a classificação observacional do Privacy Lens. O resultado DDG informado aponta desempenho inadequado para uma asserção de `getImageData`; zero exceções no plugin não contradiz uma falha de desempenho.

Os números de 277 ms têm definições distintas: no plugin, `drawToReadMs` é a diferença entre os timestamps observados da leitura e do desenho anterior; no DDG, o valor foi relatado como duração no teste de desempenho. A igualdade numérica não comprova duração idêntica, correspondência exata entre amostra e check, nem causa da lentidão. Para essa associação, ainda faltam o check/Notes e os dados temporais da mesma execução. Não se atribui a falha ao Firefox, a uma proteção ou à instrumentação sem evidência adicional.

A cobertura parcial é explícita: 85 amostras ultrapassaram o limite de retenção. O limite padrão do coletor é 40 amostras por frame, compatível com 125 leituras e 85 amostras omitidas neste relato. Isso limita a inspeção individual das sequências; não autoriza afirmar cobertura integral nem 85 exceções. `droppedEvents`, frameId/URL, outcome específico da amostra e detalhes da instalação dos hooks não foram informados.

O indicador não prova identificação efetiva do usuário, transmissão de um fingerprint, randomização de pixels, proteção bem-sucedida ou bloqueio. Nenhuma heurística ou código foi alterado para obter concordância.

## Evidências informadas pelo usuário

Pasta de destino: `evidencias/duckduckgo/fingerprinting-canvas/`.

- `ddg-fingerprinting-canvas-plugin.png`
- `ddg-fingerprinting-canvas-detalhes.png`
- `ddg-fingerprinting-canvas-relatorio.json`

Os nomes foram informados como evidências da execução. Os arquivos não foram localizados no repositório nesta conferência; seu conteúdo e os metadados de execução ainda não foram inspecionados. Não se presume que uma captura mostre todos os campos exigidos. Não há botão de download DDG próprio nesta variante; nenhum resultado DDG foi simulado.

O print principal deve identificar a página DDG e o Privacy Lens para a mesma aba; o complementar deve preservar a sequência/cobertura e as notas de desempenho. Manter os originais e usar sufixos em novas execuções, sem sobrescrever.

Próxima execução preparada: somente [TESTE 4 — Tracker Blocking](../../../docs/VALIDACAO_DDG_V04.md#teste-4).
