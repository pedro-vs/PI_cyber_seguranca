# Auditoria final — Privacy Lens

Conferência em 29/09/2026 contra o [enunciado oficial](referencias/enunciado-avaliacao.pdf), lido integralmente (4 páginas). **O PDF final está produzido; o conjunto acadêmico permanece parcial.** Faltam evidências específicas, não preenchidas por estimativas ou resultados de outro trabalho.

OK = requisito comprovado no escopo indicado. PARCIAL = existe implementação/evidência, mas falta parte do requisito. AUSENTE = evidência necessária não recebida. A auditoria não atribui conceito/nota e não transforma implementação em cumprimento dos entregáveis dependentes.

## Requisitos oficiais

| Requisito / enunciado | Status | Evidência | Observação |
|---|---|---|---|
| Repositório Git com histórico incremental — p. 2 | OK | `git log`; histórico abaixo | Nove commits em 24, 28 e 29/09; não é commit único. Não se fabricou atividade nos demais dias. |
| Link público ou acesso ao professor — p. 4 | OK | [consulta pública](referencias/acesso-repositorio.json); https://github.com/pedro-vs/PI_cyber_seguranca | API sem autenticação retornou 200 e private=false. Não prova publicação dos novos arquivos locais. |
| Manifest e instruções de instalação Firefox — p. 2 | OK | `extension/manifest.json`, README | v0.5.0; instalação temporária via about:debugging. |
| Plugin instala e roda no Firefox — C, p. 3 | OK | `evidencias/desenvolvimento/conceito-a/automatizado/conceito-a.json`; capturas manuais | Firefox 156.0.1; não se alega validação de todas as versões. |
| Detectar/apresentar terceiros — p. 1/C | OK | `lib/domain.js`, `model.js`; E10/E42/E47 | PSL completa; contagem de requests não equivale a trackers confirmados. |
| Cookies injetados no carregamento — p. 1/C | PARCIAL | `lib/cookies.js`; E47; controles locais | Inventário, tentativas, eventos e identidades separados; `onChanged` não prova autoria exclusiva da aba. UOL: 42 identidades correlacionadas, não 66 criações confirmadas. |
| Primeira/terceira parte e sessão/persistentes — B | OK | E47 `cookies.totals`; testes cookies | 39/27 e 3/63 no inventário UOL. |
| HTML5 local/session/IndexedDB — p. 1/C | OK | E13/E22; `content/storage.js` | Contagens por frame, estados indisponíveis e snapshots antigos explicitados. |
| Canvas fingerprint — p. 1/B | OK | E15/E16/E43 e controles locais | Indicador de sequência, não certeza de rastreamento; cobertura DDG parcial com 85 amostras omitidas. |
| Bounce / cookie sync — p. 1/B | OK | E23/E24/E45; E47; controles locais | Indicadores e confiança expostos; repetição dos IDs entre duas passagens DDG não integralmente comprovada. |
| Indicadores de hijacking/hook — p. 1/A | OK | JSON local casos hook/polling/negative/websocket; E47 | Descritores e canais coexistentes; autoria/causalidade não afirmadas. |
| Tabela DDG esperado × plugin × divergência — p. 2 | OK | `evidencias/duckduckgo/RESULTADOS.md`; relatório seção 3 | Oito testes; resultados e lacunas específicos, sem relato antigo contrário às evidências. |
| Print do plugin em cada linha/subcaso DDG — p. 2 | PARCIAL | E08–E34; oito pastas DDG | Todos os testes têm algum print, mas 02/03 Query, controle final, duas passagens bounce e par js-leaks não têm associação integral. |
| Tracker Reporting — C | OK | E08–E10/E42; registro | Request 2642, script doubleclick.net, HTTP 404/erro; observação da tentativa comprovada. |
| Storage Blocking — C | PARCIAL | E11–E13; registro | Store/Retrieve e defasagem confirmados; não há JSON completo nem contagens visíveis de todos os frames. |
| Fingerprinting/Canvas — C/B | OK | E14–E16/E43; registro | Resistência/performance/correção DDG distinguidas da sequência do plugin. |
| Tracker Blocking — B | OK | E17–E19/E44/E48; registro | 22 loaded/1 failed versus 31 requests; v0.4 observacional, sem atribuição indevida de bloqueio. |
| Storage Partitioning — B | OK | E20–E22/E50; registro | DDG same-site/cross-site; extensão não afirma provar partição. Snapshot final 01:13:20. |
| Bounce Tracking DDG — B | PARCIAL | E23/E24/E45; registro | Indicador comprovado; igualdade dos IDs nas duas passagens não comprovada com dois pares completos. |
| Query Parameters DDG — B | PARCIAL | E25–E32/E46; registro | Caso 01 comprovado; capturas de dois sinais ambíguas; controle sem URL final. |
| js-leaks com análise da instrumentação — A | PARCIAL | E33/E34/E49; registro | Captura com plugin antes do Check; único JSON não identifica condição; causalidade inconclusiva. |
| Três sites sorteados por matrícula — p. 2 | AUSENTE | Sites informados: UOL, G1, Mercado Livre | Matrícula e documento de sorteio não recebidos. Não equivale a ausência das coletas. |
| HAR dos três sites — p. 2/C | OK | E51/E52/E53; hashes no manifesto | Três arquivos reais; UOL gzip sem perdas. |
| Cobertura de carga integral nos HAR | PARCIAL | `har/resumo.json` por site | G1/Mercado Livre sem documento principal e com pageTimings anteriores à janela. |
| Plugin em execução nos três sites — atenção p. 3 | OK | E36/E39/E47/E57/E58/E59/E60 | JSONs e painéis próprios dos três sites; G1/ML complementares em novas navegações. |
| Blacklight UOL — entregável 3 | OK | E37 | 48 trackers, 17 cookies, categorias transcritas; sem lista individual expandida. |
| Blacklight G1 — entregável 3 | OK | E61 | Resultado próprio recebido: 27 ad trackers/14 cookies; visita 28/09 01:01 ET. Escopo: campos visíveis; não é lista completa de hosts. |
| Blacklight Mercado Livre — entregável 3 | OK | E62 | Resultado próprio: 11 ad trackers/16 cookies; visita 28/09 18:33 ET. URL com query truncada; categorias inferiores NE. |
| uBlock nos três sites — entregável 3 | OK | E38/E40/E41 | Contadores 22/42/40; sem lista completa de filtros/logger. |
| Reconciliação de cada tracker divergente nos três sites — B | PARCIAL | `sites/*/reconciliacao.md`, `dominios.csv` | União HAR/PL em G1/ML: 203/10 hosts; falta lista externa completa e execução pareada. JSONs já recebidos. |
| Explicações específicas das divergências — atenção p. 3 | OK | Relatório seção 5.6 e reconciliações | Janelas, vídeo, data:, bodySize/timings, status, PSL e snapshots citados; causas restantes marcadas NE. |
| Metodologia explícita de score — p. 2/A | OK | `lib/score.js`; `docs/SCORE_PROPOSTA.md`; seção 6 | Pesos, tetos, deduplicação, cobertura, intervalo e sensibilidade, sem nota externa fabricada. |
| Score aplicado ao UOL | OK | E47 e recálculo `privacyScore` | Intervalo original **0–31/100**, 2/6; não convertido em 31 pontual. |
| Score aplicado ao G1 | OK | E57; painel E59; recálculo privacyScore | **0–64/100**, parcial, 2/6; N/C cobertos; descontos 10/20/6/0/0/0. |
| Score aplicado ao Mercado Livre | OK | E58; painel E60; recálculo privacyScore | **41–66/100**, parcial, 3/6; N/C/T cobertos; descontos 10/4/0/0/0/20. |
| Comparação crítica score × Blacklight nos três sites — A | OK | Seções 5 e 6; E37/E47/E57/E58/E61/E62 | Comparação dos campos recebidos, cobertura, unidades, tetos e visitas; não se fabrica nota Blacklight. Listas completas/categorias recortadas continuam NE. |
| Relatório por página na interface — A | OK | `extension/popup/`; E02/E10/E36/E39; testes locais | Rede, cookies, storage, score; relatório em aba e JSON. |
| Blocklist personalizada pela interface — A | OK | E35; JSON local blocklist-empty/add/pause/enable/remove; suíte Node | Regra, decisão própria, pausa/retorno e remoção; persistência no código e testes, não inferida da captura única. |
| PDF contendo entregáveis 2/3/4 — p. 4 | OK | `docs/relatorio-final.pdf` e `.md` | Documento final com resultados disponíveis e lacunas expressas; conteúdo acadêmico incompleto não disfarçado. |
| HAR/prints no repositório — p. 4 | OK | `evidencias/INDEX.md` e manifesto | Arquivos locais organizados e integridade conferida; publicação ainda não realizada. |
| Publicação destes novos artefatos | PARCIAL | `git status` final | Não commitados/push por instrução explícita do aluno. Link público anterior não contém automaticamente esta entrega. |
| Testes finais | OK | `docs/VALIDACAO_FINAL.txt` | npm test, npm run check, git diff --check; resultados registrados após execução. |
| Fontes e reprodução do PDF | OK | `RELATORIO_FONTES.md`, `scripts/build-report.py`, `requirements-report.txt` | Fontes empacotadas, A4, sumário/páginas, originais preservados; geração determinística verificada. |

## Histórico Git preservado

| Commit | Data local | Etapa |
|---|---|---|
| 28239d4 | 24/09 15:28 | Inicial |
| 8bf945c | 24/09 15:46 | Extensão inicial |
| 3ff278c | 24/09 15:49 | Fixture e testes |
| 1d70cd0 | 24/09 15:50 | Documentação/validação inicial |
| f8e08bd | 24/09 16:23 | Capturas da etapa 1 |
| 5c6d419 | 24/09 17:03 | Canvas e validação Firefox |
| 84a15f8 | 28/09 18:13 | Atribuição de cookies |
| 61046e0 | 28/09 22:25 | Tracking avançado / DDG |
| 51125a2 | 29/09 02:50 | Hooks, score e blocklist |

Não houve commit, alteração de datas, rebase, push ou modificação dos detectores nesta finalização. Os nomes genéricos site-1/site-2/site-3 eram modelos vazios; foram substituídos por `evidencias/sites/` e um índice de redirecionamento, sem descartar evidência real.

## Faltas que impedem comprovação integral

1. Listas completas de hosts/trackers Blacklight e logger/configurações uBlock; capturas G1/ML não mostram todas as categorias. JSONs G1/ML complementares não têm janela comum com os HARs.
2. Par js-leaks concluído, identificado com/sem extensão; identificação individual de dois painéis Query, página do controle e segundo par bounce.
3. Matrícula/sorteio e publicação dos novos artefatos após revisão humana.

O complemento **E57–E62** resolveu as ausências de JSON/score G1, JSON/painel/score Mercado Livre e Blacklight próprio dos dois sites. Recálculo e comparação crítica agora existem para os três; cobertura parcial dos detectores permanece explícita.

A finalização não requisita novas medições nem altera critérios para melhorar números. Capturas ausentes não foram substituídas por saídas simuladas. O relatório do outro aluno e o PDF de outro trabalho não integram fontes de resultados.

## Verificação dos artefatos finais

PDF A4 com 35 páginas, 24 figuras e 15 tabelas; sumário com 37 entradas navegáveis. A inspeção visual e a igualdade de SHA-256 entre duas gerações consecutivas estão registradas em [VERIFICACAO_PDF.json](VERIFICACAO_PDF.json). Os 60 destinos do manifesto foram conferidos, incluindo o hash do HAR UOL descomprimido. Links locais sem destino ausente; detectores e testes preservados.

A lista completa de arquivos adicionados/modificados e dos modelos vazios removidos está em [ARQUIVOS_FINAIS.md](ARQUIVOS_FINAIS.md), junto do status Git e sugestões de commits que não foram executados.
