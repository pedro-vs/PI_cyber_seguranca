# Plano e checklist — fonte de verdade: PDF do enunciado

**Atualização 0.2.0:** Etapa 1 validada e commitada pelo aluno; canvas implementado neste bloco, com validação manual pendente. Consulte a checklist operacional e os prints obrigatórios em `ETAPA_2_CANVAS.md`. Os critérios gerais abaixo só serão encerrados com suas evidências completas.

PDF de 4 páginas lido integralmente. Referências: entregáveis na p. 2; conceitos e descontos na p. 3; entrega na p. 4. Prazo operacional usado: **29/09/2026**, informado pelo aluno; o PDF diz “1 semana a partir da divulgação”.

## Obrigatório para qualquer conceito

- [ ] Repositório Git acessível ao professor, com commits incrementais ao longo da semana.
- [ ] Extensão Firefox instalável (`manifest.json`) e instruções `about:debugging`.
- [ ] Relatório DDG: teste × resultado esperado informado pela página × plugin × explicação específica de cada divergência.
- [ ] Print do plugin na página em cada linha do relatório DDG.
- [ ] Três sites oficiais sorteados por matrícula, não escolhidos livremente.
- [ ] Um HAR do DevTools por site, no mínimo.
- [ ] Comparação de cada site com Blacklight e bloqueios do uBlock Origin.
- [ ] Score nos três sites, critérios/pesos/justificativa e comparação com Blacklight.
- [ ] Relatório PDF contendo principalmente entregáveis 2, 3 e 4.
- [ ] HARs e prints no repositório em `evidencias/`.

Estes itens não ficam dispensados ao visar C. “Implementado” e “evidenciado” são estados diferentes.

## Conceito C

- [ ] Instalação e funcionamento no Firefox sem erro.
- [ ] Detectar e exibir requisições a domínios de terceira parte.
- [ ] Contar cookies injetados no carregamento: distinguir estoque, tentativa e alterações observadas; explicar limites de atribuição.
- [ ] Detectar armazenamento HTML5 (localStorage, sessionStorage, IndexedDB).
- [ ] Relatório DDG cobrindo Tracker Reporting.
- [ ] Relatório DDG cobrindo Storage Blocking.
- [ ] Relatório DDG cobrindo Fingerprinting/Canvas, mesmo que a detecção avançada seja aprofundada em B.
- [ ] Entregar HAR dos três sites, além dos entregáveis gerais.

## Conceito B — tudo de C, mais

- [ ] Cookies primeira × terceira parte; sessão × persistentes.
- [ ] Indicadores de canvas fingerprint com evidência de chamadas relevantes e controles negativos.
- [ ] Bounce tracking / cookie sync; cobrir Bounce Tracking e Query Parameters do DDG.
- [ ] Relatório DDG incluindo Tracker Blocking.
- [ ] Relatório DDG incluindo Storage Partitioning.
- [ ] Explicar tecnicamente cada divergência DDG.
- [ ] Nos três sites, reconciliar cada rastreador encontrado somente pelo Blacklight, somente pelo uBlock ou somente pela extensão, usando evidência concreta.

## Conceito A — tudo de B, mais

- [ ] Indicadores de hijacking/hook: WebSocket terceiro ou polling persistente; alterações de globais e scripts relevantes, com confiança/limitações.
- [ ] Usar `security/js-leaks.html` como teste e avaliar as alterações causadas pela própria extensão.
- [ ] Score explícito, aplicado aos três sites e criticamente comparado ao Blacklight (concordâncias, divergências e causas).
- [ ] Interface por página exibindo rastreadores/terceiros, cookies, storage e score.
- [ ] Lista personalizada: adicionar, remover, listar, persistir e bloquear futuras requisições, com prova de funcionamento.

## Riscos e como reduzi-los

| Risco | Por que é difícil | Decisão verificável |
|---|---|---|
| Cookies “injetados” | `getAll` mostra estoque; `onChanged` não contém aba; Set-Cookie pode ser rejeitado | Três métricas distintas; perfil limpo; janela documentada; confrontar headers e armazenamento |
| ETP/TCP e uBlock | Podem bloquear o evento antes de a extensão observá-lo | Registrar versões/proteções; execuções separadas; consultar HAR e logger; não presumir que zero é ausência |
| eTLD+1 | Últimos dois rótulos falham em com.br e hospedagens compartilhadas | PSL completa e testada; snapshot versionado |
| Canvas e hooks | Content script tem contexto isolado; instrumentação muda a página | Próximo bloco: instrumentação inicial específica de Firefox, identificação de autoalterações, controles de canvas legítimo e validação js-leaks |
| Cookie sync | Parâmetro parecido com ID não prova sincronismo | Correlacionar cadeia, valor pseudonimizado e cookie/origem; baixa confiança se faltarem elos |
| Bounce | Redirect também serve login e pagamento; estado por página é insuficiente | Histórico curto por aba entre documentos, tempo/interação/identificadores; explicar indícios, sem rótulo definitivo |
| Storage partitioning | Snapshot isolado não compara a mesma origem sob dois top sites | Protocolo A→T/B→T no DDG, chaves de partição de cookies; inferência de storage só com execução cruzada |
| Hook/hijacking | WebSocket/polling legítimos são comuns; privilégio limitado | Exigir contexto e combinações de sinais; não alegar acesso a ataques no sistema operacional |
| Comparação externa | Localização, consentimento, cache, proteção e horário mudam o tráfego | Congelar condições, registrar URLs/filtros/requests, repetir apenas para hipótese concreta |
| Prazo | Evidências e reconciliação exigem tempo humano | Coleta desde o dia 24; reservar o dia 29 para redação/revisão |

## Cronograma 24–29/09

| Data | Bloco | Critério de saída / evidência | Commit sugerido após validação |
|---|---|---|---|
| 24/09 | Etapa 1: manifest, rede, cookies, storage, popup, fixture, testes e documentação | Instalar no seu Firefox; JSON e prints locais; criar repositório | `feat: add initial Firefox network cookies and storage report` |
| 25/09 | Canvas, atribuição de cookies, controles positivos/negativos e DDG mínimo de C | Prints de Tracker Reporting/Storage Blocking/Canvas; registrar divergências | `feat: detect canvas readback and document DDG baseline` |
| 26/09 | Query params, redirects entre documentos, bounce/cookie sync, partições, score | Evidências das cadeias; DDG correspondente; fórmula congelada e teste de sensibilidade | `feat: add tracking correlations and privacy scoring` |
| 27/09 | Hook/hijacking, blocklist persistente, DDG restante | Bloquear/desbloquear domínio real da fixture; js-leaks com/sem extensão; todas as linhas DDG documentadas | `feat: add security indicators and custom domain blocking` |
| 28/09 | Três sites oficiais, HAR, Blacklight, uBlock e reconciliação | Três conjuntos de evidências e tabela por domínio/request; score aplicado | `test: compare assigned sites with HAR Blacklight and uBlock` |
| 29/09 | Corrigir problemas críticos, relatório PDF, revisar acesso/entrega | PDF conferido, prints/HAR presentes, README reproduzível, link ao professor | `docs: finalize evidence reconciliation and report` |

Se C atrasar, proteger primeiro seus testes e entregáveis gerais. Não declarar A apenas porque existem botões de recursos avançados.

## Estrutura planejada

Arquivos atuais estão descritos no README. Próximos módulos entrarão em `extension/detectors/` (canvas, tracking, security), `extension/lib/score.js` e `extension/lib/blocklist.js`. Não há código fictício nesses caminhos nesta entrega.

Estrutura de evidências já preparada: `evidencias/local/`, `evidencias/duckduckgo/`, `evidencias/sites-reais/site-1/`, `site-2/`, `site-3/`, `evidencias/har/`, `evidencias/screenshots/`.

## Escopo exato da Etapa 1

Entregar uma base observacional instalável, testável e compreensível, com rede/cookies/storage e interface; comprovar os cálculos de classificação; fornecer fixture e instruções. Na Etapa 1, score, fingerprinting, bloqueio e reconhecimento de hook não recebiam resultados simulados. A v0.2.0 acrescenta somente canvas, descrito no roteiro atual. A validação manual da Etapa 1 foi informada como concluída. A próxima validação é a de canvas v0.2.0, antes de cookies/DDG.
