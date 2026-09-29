<!-- COVER -->
# Privacy Lens

## Avaliação Intermediária de Cibersegurança

Insper

**Professor:** João Eduardo Luisi

**Aluno:** Pedro Henrique Vargas Sepulveda

**Data:** 29 de setembro de 2026

**Extensão:** versão 0.5.0 · Firefox

**Repositório:** https://github.com/pedro-vs/PI_cyber_seguranca

Relatório técnico de implementação, validação e reconciliação de evidências.

As lacunas documentais são declaradas. A conclusão deste documento não equivale à comprovação integral dos requisitos da avaliação.
<!-- ENDCOVER -->

<!-- PAGEBREAK -->

## Sumário

<!-- TOC -->

<!-- PAGEBREAK -->

## 1. Ambiente de teste

Todos os números apresentados neste relatório foram obtidos das evidências armazenadas no repositório, incluindo JSONs do Privacy Lens, arquivos HAR, capturas de tela, Blacklight, uBlock Origin e resultados das páginas de teste.

Este trabalho analisa conexões, armazenamento e indicadores de rastreamento no Firefox. O conjunto inclui coletas manuais em 28 e 29 de setembro de 2026 e controles locais automatizados anteriores, identificados separadamente. Nenhuma nova execução de site foi produzida para preencher resultados ausentes.

O inventário precedeu a movimentação dos arquivos. Foram classificados 62 arquivos fornecidos em dois lotes: 45 PNG, oito JSON do Privacy Lens, três resultados DDG, três HAR e três PDF. Destes, 59 evidências foram movidas para evidencias/; o enunciado foi copiado para docs/referencias/. Os dois outros PDF ficaram fora da entrega: uma referência exclusivamente visual e um trabalho de outro tema. SHA-256, tamanho, dimensões e origem estão no manifesto.

**Tabela 1 — Ambiente confirmado e variáveis não estabelecidas**

| Item | Evidência e escopo |
|---|---|
| Firefox | 156.0.1 nos JSON e HAR. O mínimo 128.0 do manifest é alvo de compatibilidade, não outra versão testada. |
| Privacy Lens | v0.4.0 nos cinco JSON DDG; v0.5.0 nos JSON UOL, G1 e Mercado Livre e no código final. |
| Plataforma / horário | Arquivos recebidos em ambiente macOS; versão do sistema de coleta não documentada. Horários locais deste relatório: UTC−3; JSON usa UTC. |
| uBlock | 1.75.0 visível no UOL; listas/filtros e estado durante toda a carga não documentados. |
| Perfil e proteções | ETP, limpeza, cache, consentimento e demais extensões não foram integralmente registrados. Não se presume perfil limpo. |
| Sites | UOL, G1 e Mercado Livre definidos pelo aluno. Matrícula e comprovação do sorteio oficial não fornecidas. |
| Versão do código | HEAD 51125a2; histórico anterior preservado. A finalização documental não altera detectores. |

Fonte: E42,E43,E44,E45,E46,E47,E51,E52,E53,E38,E57,E58.

O nome do aluno foi recuperado do próprio docs/RELATORIO_MODELO.md. Ausência de arquivo é tratada como “não estabelecido” (NE). Contadores de requests, hosts, sites registráveis, cookies, mecanismos DDG e trackers classificados não são intercambiáveis.

<!-- PAGEBREAK -->

## 2. Privacy Lens

### 2.1 Objetivo

A extensão apresenta observações por página e evidencia seus limites. Um domínio terceiro não é automaticamente um rastreador: classificação de contexto e atribuição de intenção são questões distintas. Indicadores de canvas, bounce, sincronização ou hook são heurísticos; não certificam comprometimento.

### 2.2 Instalação

1. Obter o repositório e abrir o Firefox.
2. Acessar about:debugging#/runtime/this-firefox, selecionar “Carregar extensão temporária” e escolher extension/manifest.json.
3. Abrir ou recarregar uma página HTTP(S) após carregar a extensão.
4. Abrir Privacy Lens e usar “Atualizar”, “Exportar JSON” ou “Abrir relatório”.

Não há build nem npm install para instalar a extensão. Node 20 ou posterior é usado pelos testes locais. A instalação temporária é removida ao encerrar o Firefox. Recarregar a extensão apaga o histórico em memória; por isso as evidências são exportadas antes de mudar o contexto.

### 2.3 Arquitetura

O background mantém estado por aba/navegação e recebe webRequest, webNavigation e cookies.onChanged. A biblioteca de domínio usa uma Public Suffix List local com seções ICANN e PRIVATE, exceções e curingas. O snapshot da lista é de 24/09/2026 e sua proveniência fica versionada.

Content scripts executados em document_start e all_frames coletam storage e instrumentam APIs selecionadas no contexto real da página. O bootstrap separa wrappers próprios de alterações posteriores. Bibliotecas de resumo produzem um único relatório para popup, aba de relatório e JSON, evitando métricas distintas entre interfaces.

**Tabela 2 — Componentes e fluxo de dados**

| Componente | Responsabilidade |
|---|---|
| background.js + lib/model.js | Eventos de navegação/rede, estado por aba, agregação e montagem do relatório. |
| lib/domain.js + vendor/ | PSL, primeira/terceira parte e remoção de valores de query/fragmentos. |
| lib/cookies.js + content/storage.js | Histórico/atribuição de cookies e snapshots HTML5 por frame. |
| lib/canvas.js + content/canvas.js | Sequência desenho/leitura, contadores, amostras e cobertura. |
| lib/advanced-tracking.js | Parâmetros, sequência bounce e comparação efêmera entre sites. |
| lib/security.js / score.js / blocklist.js | Descritores/canais, índice com cobertura e regras locais de cancelamento. |
| popup/ | Relatório por página, atualização, exportação e edição da lista. |

Fonte: extension/manifest.json; docs/ARQUITETURA.md.

<!-- PAGEBREAK -->

### 2.4 Detectores

A observação de rede conserva método, tipo, domínio, horário, status HTTP, conclusão/erro e redirecionamento quando disponíveis. Requisições repetidas são eventos separados; agrupamentos por host e eTLD+1 respondem a perguntas diferentes.

Cookies são apresentados em camadas: inventário atual; preexistência quando houve observação anterior; tentativas Set-Cookie; eventos reais de gravação/remoção correlacionados a uma janela fixa de 30 s; identidades deduplicadas. cookies.onChanged não identifica a aba autora. Mesmo uma criação inferida pela sequência explicit/overwrite continua sendo correlação temporal e de contexto.

HTML5 é um snapshot por frame: localStorage/sessionStorage contam chaves; IndexedDB conta bancos, não registros. A extensão distingue acesso observado, indisponível e sem suporte. Não soma frames da mesma origem como bancos independentes nem deduz particionamento de contagens.

Canvas usa a regra canvas-sequence-v1: desenho e leitura/exportação no mesmo canvas em até 5 s. getImageData, toDataURL e toBlob são observados, preservando chamadas/exceções; toBlob registra a solicitação, não o resultado do callback. Canvas 2D/HTML é o escopo; WebGL, OffscreenCanvas e workers ficam fora.

Bounce acompanha passagem entre sites e permanência no intermediário, com janela de 10 s e evidências de ligação entre navegações. Ligações de cliente inferidas permanecem de confiança baixa. Cookie sync observa propagação compatível de identificadores em parâmetros, usando HMAC efêmero por navegação; não compara valores de cookies. Nomes de campanha e parâmetros funcionais recebem tratamentos distintos. Valores curtos, POST, transformações de identificadores e CNAME limitam a análise.

### 2.5 Privacidade da própria extensão

O manifest solicita acesso HTTP(S), abas, navegação, cookies, storage e webRequestBlocking para as funcionalidades descritas. Não há telemetria ou lista remota carregada durante a navegação. A política connect-src 'self' restringe conexões próprias; a PSL está no pacote.

Valores de cookies, storage e query não são exportados pelo Privacy Lens; hashes e chaves efêmeras também não. Nomes, origens, caminhos e horários permanecem para auditoria e ainda podem revelar contexto. Somente a configuração da blocklist persiste em storage.local; observações ficam em memória. A instrumentação é observável pela página e não promete invisibilidade.

Os HAR e os resultados DDG são arquivos externos à política de sanitização da extensão. Foram preservados como fornecidos, sem copiar valores sensíveis para as tabelas analíticas. O HAR UOL está em gzip sem perdas, com hash do conteúdo descomprimido verificado contra o original.

Fonte: extension/manifest.json; extension/lib/ e extension/content/; docs/ARQUITETURA.md; docs/ETAPA_3_COOKIES.md; docs/ETAPA_4_TRACKING.md; evidencias/manifesto-recebidos.json.

<!-- PAGEBREAK -->

## 3. Entregável 2 — DuckDuckGo Privacy Test Pages

### 3.1 Tabela resumo

Os oito testes abaixo são tratados conforme o que cada página efetivamente mede. “Parcial” indica limite de evidência ou escopo, não necessariamente falha funcional. As Figuras 1–13 documentam esses testes. Registros completos estão em evidencias/duckduckgo/.

**Tabela 3 — Resumo DDG e alcance da confirmação**

| Teste | Esperado / página | Privacy Lens / avaliação |
|---|---|---|
| Tracker Reporting | Observar inclusão de tracker.js. | 1 tentativa terceira; HTTP 404/erro. Detecção da tentativa confirmada. |
| Storage Blocking | Gravar/recuperar estado por API e contexto. | Snapshot top-level anterior ao Store; comparação temporal parcial. |
| Canvas | Resistência, correção e desempenho. | 7.039 desenhos; 125 leituras; 18 indícios; 85 amostras omitidas. Critério complementar. |
| Tracker Blocking | Bloqueio se houver regra para bad.third-party.site. | 31 requests; 1 erro WebSocket. DDG: 22 loaded / 1 failed; versão observacional. |
| Storage Partitioning | Contraste same-site/cross-site. | 1/1/1 na origem própria; não reproduz comparação entre abas. |
| Bounce | IDs transportados pelo intermediário. | Indicador baixo, 427 ms, 2 sinais. Igualdade dos IDs em duas passagens não comprovada. |
| Query Parameters | Remover campanha e preservar controle. | Caso 01: 1 sinal; observação sem remoção. Dois painéis ambíguos. |
| js-leaks | Comparar objetos com referência Firefox 92 e controle com/sem extensão. | 0 indicadores no print; comparação causal inconclusiva sem par concluído identificado. |

Fonte: E08,E10,E11,E12,E13,E14,E15,E17,E18,E19,E20,E21,E22,E23,E24,E25,E27,E29,E30,E32,E33,E34,E42,E43,E44,E45,E46,E48,E49,E50.

Os JSON DDG da extensão são v0.4.0 e não contêm a metodologia de score v1 ativa do bloco posterior. js-leaks e blocklist pertencem à etapa seguinte. Essa separação impede atribuir bloqueios da v0.5.0 a execuções antigas.

Todos os testes possuem alguma captura do Privacy Lens, porém alguns recortes não preservam URL/nomes ou o par exato do subcaso. Assim, a exigência de print associado a cada linha não está integralmente comprovada para os controles faltantes.

<!-- PAGEBREAK -->

### 3.2 Tracker Reporting

**Objetivo e esperado.** A página 1major-via-script inclui https://doubleclick.net/tracker.js como script. O objetivo observacional é identificar a tentativa e seu domínio; o título da página não certifica resposta HTTP bem-sucedida.

**Resultado observado.** A página anuncia um tracker via script. O detalhe do Privacy Lens registra request 2642, frame 0, tipo script, estado error, HTTP 404 e NS_ERROR_CORRUPTED_CONTENT. O documento principal 2641 retorna 200.

**Privacy Lens.** JSON v0.4.0: 3 requisições, 2 próprias e 1 terceira; 1 falha. doubleclick.net é terceiro pela PSL. Exportação em 28/09 às 23:13:13.416 (UTC−3).

**Concordância e divergência.** Concordância na observação da tentativa, domínio, tipo e falha; não é prova de tracker executado com sucesso.

Contar a tentativa é coerente com webRequest mesmo quando seu carregamento falha. HTTP 404 e o erro de conteúdo não identificam qual proteção atuou. A v0.4.0 não tinha a blocklist da v0.5.0. A captura posterior E10 ainda mostra o mesmo requestId 2642, permitindo ligar o detalhe visual ao JSON sem presumir uma nova execução.

Fontes: E08, E09, E10, E42; registro detalhado em evidencias/duckduckgo/tracker-reporting/REGISTRO.md.

![Figura 1 — Tracker Reporting: recorte da rede e da tentativa doubleclick.net/tracker.js, request 2642. Fonte: E10.](../evidencias/duckduckgo/tracker-reporting/ddg-tracker-reporting-rede.png#crop=0.733,0.065,0.24,0.87&height=400&width=350)

<!-- PAGEBREAK -->

### 3.3 Storage Blocking

**Objetivo e esperado.** Após Store, Retrieve deve recuperar o valor gravado nos mecanismos disponíveis e acessíveis. O teste distingue o documento principal e os iframes; sucesso local não demonstra acesso sob outro top site.

**Resultado observado.** Store informa 23 mecanismos, 1 falha no resumo; Retrieve informa 23, 2 falhas no resumo. O valor 855 é recuperado nas três APIs principais do top-level e dos iframes safe/tracking. No iframe ad, localStorage/sessionStorage recuperam 855, mas IndexedDB apresenta DB is not defined. WebSQL apresenta openDatabase is not defined. Há erros adicionais de CookieStore, service worker e requisição no detalhe; os resumos não são a soma simples de todos os erros aninhados.

**Privacy Lens.** No recorte E13, o top-level privacy-test-pages.site tem 0 chaves locais, 0 de sessão e 0 bancos, coletados às 23:47:09. broken.third-party.site tem 1/1/1 às 23:48:15 e está removido no refresh. good.third-party.site aparece, mas suas contagens ficaram fora do recorte. Não há JSON deste teste no lote.

**Concordância e divergência.** Parcial. Há storage observado no frame broken, mas a imagem não permite confirmar todos os frames. O top-level diverge do Retrieve por representar um snapshot anterior à captura do Store, feita às 23:50:29.

O snapshot das 23:47:09 antecede as capturas do Store e do Retrieve; não comprova o estado às 23:52:47. O instante exato da ação Store não foi registrado, e a causa da defasagem/divergência não está estabelecida. DB is not defined identifica falha do helper da página, não demonstra indisponibilidade da API IndexedDB. Não se completaram as antigas alegações de 1/1/1 no safe ou 1/1/0 no ad: esses números não estão no recorte recebido. Cookies e valores do DDG não são lidos pelo inventário HTML5 do plugin.

Fontes: E11, E12, E13; registro detalhado em evidencias/duckduckgo/storage-blocking/REGISTRO.md.

<!-- PAGEBREAK -->

#### Evidências de armazenamento e defasagem temporal

As Figuras seguintes confrontam a leitura efetiva na página com o horário preservado pelo snapshot. A imagem do plugin mantém o contexto do frame removido; a condição de presença não deve ser apagada ao transcrever a contagem.

![Figura 2 — Storage Blocking: recorte do Retrieve no top-level, incluindo localStorage, sessionStorage e IndexedDB com 855. Fonte: E12.](../evidencias/duckduckgo/storage-blocking/ddg-storage-blocking-retrieve.png#crop=0,0,1,0.267&height=210)

![Figura 3 — Storage Blocking: recorte com top-level 0/0/0 antigo e frame broken 1/1/1 removido. Fonte: E13.](../evidencias/duckduckgo/storage-blocking/ddg-storage-blocking-plugin.png#crop=0,0.265,1,0.595&height=370&width=440)

<!-- PAGEBREAK -->

### 3.4 Fingerprinting / Canvas

**Objetivo e esperado.** O DDG testa resistência, desempenho e correção; o Privacy Lens observa desenho seguido de leitura/exportação no mesmo canvas em até 5 s.

**Página DDG.** E14 mostra falhas nos pixels de referência, no limiar de mudança de pixels elegíveis, na conversão de saída e na renderização de string. getImageData também falha no limite de 250 ms, com 277 ms. Há várias asserções aprovadas; não é apenas uma falha de desempenho.

**Privacy Lens.** E43 registra 7.039 desenhos, 125 leituras/exportações, zero exceções e 18 canvas com indício; APIs getImageData e toDataURL. Um frame instrumentado, cobertura parcial, 85 amostras omitidas e zero eventos omitidos. Exportação às 00:27:01.325. Canvas #13: 2000 × 200, fill seguido de getImageData em 277 ms (Figuras 4 e 5).

**Concordância e divergência.** O resultado é complementar: a sequência confirma o critério do plugin, mas não aprova resistência ou correção. Os 277 ms entre desenho e leitura não medem diretamente a duração da API comparada pelo DDG. Igualdade numérica não prova correspondência causal. Zero exceções não significa desempenho aprovado. Amostras omitidas limitam a revisão individual; não há controle pareado para atribuir falhas à instrumentação.

Fontes: E14, E15, E16 e E43; registro completo de fingerprinting-canvas.

![Figura 4 — Canvas: recorte do Privacy Lens com contadores, APIs e cobertura parcial. Fonte: E15.](../evidencias/duckduckgo/fingerprinting-canvas/ddg-fingerprinting-canvas-plugin.png#crop=0.738,0.414,0.23,0.474&height=220&width=370)

![Figura 5 — Canvas #13: leitura isolada e sequência fill → getImageData, com intervalo de 277 ms. Fonte: E16.](../evidencias/duckduckgo/fingerprinting-canvas/ddg-fingerprinting-canvas-detalhes.png#height=135&width=420)

<!-- PAGEBREAK -->

### 3.5 Tracker Blocking

**Objetivo e esperado.** A página Request Blocking pede adicionar bad.third-party.site à lista de uma solução de bloqueio. A legenda verde significa carregou; borda vermelha significa falhou, podendo ser bloqueio ou outra falha.

**Resultado observado.** O download E48 de 00:46:12 contém 23 mecanismos: 22 loaded e WebSocket failed. E17/E18 mostram essa distribuição. Não há evidência de regra ativa para o domínio nesta execução.

**Privacy Lens.** JSON v0.4.0 de 00:54:41.962: 31 requisições, 9 próprias, 22 terceiras, 1 falha. script.js, style.css, object.png, frame.html e cssImport.css completam HTTP 200 em E19. WebSocket registra HTTP 404, error e NS_ERROR_WEBSOCKET_CONNECTION_REFUSED.

**Concordância e divergência.** Concordância dos estados exemplificados; totais medem unidades diferentes. O download DDG é anterior ao JSON e não contém requestIds para provar um pareamento integral por tentativa.

Um mecanismo pode produzir mais de uma requisição, e recursos da página entram no total 31. A falha WebSocket não pode ser atribuída ao Privacy Lens: v0.4.0 somente observava. A blocklist personalizada foi implementada e validada depois na v0.5.0, em fixture local. O nome bad.third-party.site não é, por si, uma regra de bloqueio.

Fontes: E17, E18, E19, E44, E48; registro detalhado em evidencias/duckduckgo/tracker-blocking/REGISTRO.md.

![Figura 6 — Tracker Blocking: amostra de recursos terceiros concluídos com HTTP 200. Fonte: E19.](../evidencias/duckduckgo/tracker-blocking/ddg-tracker-blocking-detalhes.png#crop=0,0,1,0.55&height=285&width=390)

O resultado DDG completo está em E48; a legenda de E18 confirma que verde significa carregado. Não há relação um-para-um entre seus mecanismos e todas as requests do relatório.

<!-- PAGEBREAK -->

### 3.6 Storage Partitioning

**Objetivo e esperado.** O DDG compara o acesso ao mesmo estado em contextos same-site e cross-site. Espera acesso no primeiro e separação no segundo para os mecanismos particionados; ausência de suporte é reportada separadamente.

**Resultado observado.** E50 contém 21 mecanismos: 19 pass, WebSQL unsupported e Prefetch Cache error. document.cookie, HTTP Cookie, Cookie Store API, localStorage, sessionStorage e IndexedDB passam. E20 mostra o mesmo identificador em dois resultados same-site e null nos dois cross-site das três APIs HTML5.

**Privacy Lens.** E22 mostra www.first-party.site: frame 0 coletado às 01:13:20 com 1 chave local, 1 de sessão e 1 banco. Dois frames embedded anteriores, coletados às 01:08:09, também mostram 1/1/1 e estão removidos. O plugin declara particionamento HTML5 não estabelecido.

**Concordância e divergência.** Complementar, com cobertura parcial da comparação entre contextos. O DDG fornece o contraste controlado; o plugin confirma apenas a presença de storage na origem mostrada.

Contagens iguais não demonstram igualdade de valores. A extensão não agrega nem compara identificadores entre abas; seus snapshots não reproduzem a prova cross-site. Não se devem somar os três frames da mesma origem como três bancos distintos. O horário final confirmado é 01:13:20, substituindo 01:11:48 que constava no relato antigo sem captura correspondente.

Fontes: E20, E21, E22, E50; registro detalhado em evidencias/duckduckgo/storage-partitioning/REGISTRO.md.

![Figura 7 — Storage Partitioning: igualdade same-site e null cross-site para as três APIs HTML5. Fonte: E20.](../evidencias/duckduckgo/storage-partitioning/ddg-storage-partitioning-detalhes.png#height=150)

![Figura 8 — Storage Partitioning: recorte do frame principal com 1/1/1 às 01:13:20. Fonte: E22.](../evidencias/duckduckgo/storage-partitioning/ddg-storage-partitioning-plugin.png#crop=0,0,1,0.32&height=180&width=420)

<!-- PAGEBREAK -->

### 3.7 Bounce Tracking

**Objetivo e esperado.** O intermediário bad.third-party.site lê IDs locais e os transporta à página de destino nos parâmetros bounceUIDlocalStorage e bounceUIDcookie. Recuperação de ID existente não é geração inicial.

**Resultado observado.** E23 mostra os dois IDs como 95 e isNew vazio na página de retorno às 01:27:42. E24 mostra indicador compatível com bounce, zero sync e dois sinais de parâmetros.

**Privacy Lens.** JSON v0.4.0 exportado às 01:30:16.624: rota privacy-test-pages.site → bad.third-party.site → privacy-test-pages.site; permanência intermediária 427 ms; ligação client-redirect-inferred, confiança low. Dois nomes de UID com valor de comprimento 2; zero sync; sem omissões, falhas de hash ou comparações pendentes nesta seção.

**Concordância e divergência.** Concordância quanto ao transporte observado e ao indicador heurístico. Reuso do mesmo 95 em duas passagens não está integralmente demonstrado pelos arquivos recebidos.

O usuário relatou duas passagens. Há uma captura da página e uma sequência posterior no JSON; como os valores não são exportados pelo plugin, não é possível provar igualdade entre as duas leituras. Sync exige pelo menos 8 caracteres, enquanto o identificador fotografado tem 2. A inferência de redirecionamento cliente mantém confiança baixa e não gera o desconto T de bounce moderado. Não se promoveu o relato de repetição a evidência independente.

Fontes: E23, E24, E45; registro detalhado em evidencias/duckduckgo/bounce-tracking/REGISTRO.md.

![Figura 9 — Bounce: página de retorno com IDs 95; esta captura não demonstra duas recuperações distintas. Fonte: E23.](../evidencias/duckduckgo/bounce-tracking/ddg-bounce-tracking-pagina.png#height=150)

![Figura 10 — Bounce: indicador compatível, zero sync e dois sinais; recorte do resumo do plugin. Fonte: E24.](../evidencias/duckduckgo/bounce-tracking/ddg-bounce-tracking-plugin.png#crop=0,0,1,0.36&height=165&width=420)

<!-- PAGEBREAK -->

### 3.8 Query Parameters

**Objetivo e esperado.** A página lista remoção de parâmetros de campanha e preservação de parâmetros funcionais, nos quatro casos da Tabela 4.

**Resultado observado.** E26/E28/E31 preservam os parâmetros de campanha nas páginas de destino. No caso 03, o print escreve fb_source=someting; essa grafia foi mantida. Não foi fornecida a página final do controle 04.

**Privacy Lens.** O JSON E46 confirma um sinal utm_source no caso 01, com q preservado, zero sync e bounce insuficiente. E29/E30 mostram dois sinais sem nomes nem URL; a identificação individual de 02/03 permanece pendente. E32 mostra zero sinais, mas não comprova a URL do controle.

**Concordância e divergência.** Detectar não remove parâmetros: a extensão não reescreve URLs. Há detecção comprovada no caso 01 e divergência de remoção nos casos 01–03. Não se afirmou validação individual de 02/03 nem ausência de falso positivo no controle sem sua URL. As duas capturas ambíguas foram preservadas separadamente.

Fontes: E25–E32 e E46; registro completo de query-parameters.

**Tabela 4 — Casos de Query Parameters e lacunas de pareamento**

| Caso | Esperado DDG | Página / plugin comprovado |
|---|---|---|
| 01 | q=other | utm_source permanece; JSON confirma 1 sinal. |
| 02 | string vazia | utm_source e utm_medium permanecem; painel individual NE. |
| 03 | u=14 | fbclid e fb_source permanecem; painel individual NE. |
| 04 | q=something&id=1234 | Só esperado no índice e painel zero sem URL; resultado final NE. |

Fonte: E25,E26,E27,E28,E29,E30,E31,E32,E46.

![Figura 11 — Query Parameters 01: URL e resultado preservam utm_source junto de q. Fonte: E26.](../evidencias/duckduckgo/query-parameters/ddg-query-parameters-01-pagina.png#height=145)

![Figura 12 — Query Parameters: um sinal no recorte do plugin; identificação do caso corroborada pelo JSON E46. Fonte: E27.](../evidencias/duckduckgo/query-parameters/ddg-query-parameters-01-plugin.png#crop=0,0,1,0.24&height=70&width=420)

<!-- PAGEBREAK -->

### 3.9 js-leaks / hook

**Objetivo e esperado.** A página compara propriedades globais contra o perfil Firefox 92. O controle relevante é executar Check com e sem a extensão, mantendo o restante do ambiente e comparando os mesmos nomes.

**Resultado observado.** E33, com Privacy Lens, tem listas vazias e Download the results desabilitado: captura anterior ao Check. E34 tem propriedades adicionadas e o menu de extensões vazio. E49 exporta 849 adicionadas, 17 removidas e 4 alteradas, contra firefox_92, às 02:36:31. O arquivo não identifica a condição com/sem extensão.

**Privacy Lens.** Na captura E33, Privacy Lens mostra 100/100 e 6/6 categorias com cobertura prevista; 0 alterações, 0 canais e 0 combinações. A blocklist está ativa e vazia. Não há JSON Privacy Lens dessa página no lote.

**Concordância e divergência.** Comparação causal inconclusiva. As duas execuções concluídas com/sem extensão não estão documentadas por dois resultados identificados.

O DDG compara uma referência estática antiga; o Privacy Lens compara descritores selecionados ao document_start do próprio documento. Nenhum dos dois zeros seria prova universal de ausência de hook. As quatro propriedades alteradas no JSON são languages.0/languages.1 de window.clientInformation e toString/valueOf de window.location. Sem par controlado não se pode atribuir mudanças ao plugin, afirmar que são comuns às duas execuções ou concluir transparência da instrumentação. O resultado 100/100 pertence somente à cobertura declarada pelo plugin naquele instante.

Fontes: E33, E34, E49; registro detalhado em evidencias/duckduckgo/js-leaks/REGISTRO.md.

![Figura 13 — js-leaks: recorte do painel com 100/100 e zero indicadores. O original mostra o DDG antes do Check. Fonte: E33.](../evidencias/duckduckgo/js-leaks/ddg-js-leaks-com-plugin-antes-check.png#crop=0.743,0.055,0.232,0.674&height=285&width=350)

A captura E34 e o JSON E49 ficam disponíveis integralmente no anexo. A referência Firefox 92, sozinha, não permite separar alterações do navegador, configuração e instrumentação. Não foi afirmado que as diferenças são comuns a duas execuções.

<!-- PAGEBREAK -->

## 4. Conceito A

### 4.1 Indicadores de hook/hijacking

A implementação v0.5.0 observa 19 descritores selecionados, comparados ao início do próprio documento. As amostras são coletadas aproximadamente a cada segundo na janela inicial de 30 s e por atualização. Onze métodos da instrumentação canvas própria são separados do conjunto de alterações posteriores; getters da página não precisam ser executados para comparar os descritores.

WebSocket observado é um canal potencial de baixa confiança. O critério de polling exige quatro respostas 2xx do mesmo endpoint, método e frame, distribuídas em 5–30 s. H só desconta quando uma alteração de API coexiste no mesmo frame, de até 1 s antes da primeira até 1 s depois da quarta requisição. A coincidência eleva o sinal a moderado, sem identificar causa ou autor.

No UOL, Function.toString mudou antes de quatro POST para events.newsroom.bi/ingest.php, com intervalo de 15.737 ms. Essa telemetria pode coexistir com alterações legítimas; chamá-la de ataque seria extrapolação. A crítica ao desconto H consta na seção 6.

### 4.2 Blocklist personalizada

A lista inicia vazia, guarda regras de hostname localmente e permite incluir subdomínios, adicionar, remover, pausar e reativar. A persistência usa storage.local; não há importação de listas de terceiros. Alterações valem para as próximas requisições, em todas as abas. A interface associa cada decisão própria à regra e à request, usando a expressão “cancelamento solicitado”.

E35 mostra a regra 127.0.0.1 e a decisão sobre request 3240 em /tracking/pixel. A captura manual comprova essa decisão; as etapas de pausa e retorno são comprovadas por controles automatizados locais separados.

![Figura 14 — Blocklist: recorte da regra 127.0.0.1 e da decisão própria de cancelamento. Fonte: E35.](../evidencias/conceito-a/blocklist/blocklist-cancelamento-local.png#crop=0,0.58,1,0.4&height=235&width=420)

<!-- PAGEBREAK -->

### 4.3 Validações locais relevantes

O JSON já versionado de Conceito A foi produzido por Firefox 156.0.1 em perfil temporário, modo headless, com fixture local. Não é execução DDG nem substitui capturas manuais. Os nove cenários reais são apresentados abaixo.

**Tabela 5 — Controles locais do bloco A**

| Cenário | Observação | Interpretação |
|---|---|---|
| negative | 0 alterações / 0 canais / 0 combinações; H=0; após janela, score 100. | Controle negativo dentro da cobertura prevista. |
| polling | 1 canal, sem alteração nem combinação; H=0. | Canal isolado não prova hijacking. |
| hook | Window.fetch alterado + canal; 1 combinação; H=20. | Controle positivo de coocorrência. |
| websocket | Tentativa com erro; 0 combinações; H=0. | Erro não equivale a canal persistente. |
| blocklist-empty | Imagem terceira carrega; 0 decisões. | Lista vazia não cancela. |
| blocklist-add | Imagem não carrega; 1 decisão. | Regra aplicada pela UI. |
| blocklist-pause | Imagem carrega; 0 decisões. | Retorno após pausa. |
| blocklist-enable | Imagem não carrega; 1 decisão. | Retorno do cancelamento. |
| blocklist-remove | Imagem carrega; 0 decisões. | Remoção funcional. |

Fonte: evidencias/desenvolvimento/conceito-a/automatizado/conceito-a.json.

Os testes Node verificam regras, ordenação, deduplicação, classificação PSL, autorização de mensagens, persistência da lista, cobertura e limites. A validação local anterior também contém controles positivos, negativos, leitura isolada e exceção de canvas. As imagens históricas das fixtures de cookies foram conservadas em desenvolvimento/cookies/; um inventário com três cookies no setup não prova identidade ou autoria do cookie adicional.

A execução final de npm test resultou em 142 testes aprovados e zero falhas. npm run check verificou manifest, referências e sintaxe JavaScript; git diff --check terminou sem erros. O registro final dos comandos está em docs/VALIDACAO_FINAL.txt. Não houve alteração de detector para alterar resultados de sites.

Fonte: JSON de Conceito A; docs/VALIDACAO_CONCEITO_A.md; evidencias/desenvolvimento/etapa-2-canvas/; suíte tests/ e scripts/check.cjs.

<!-- PAGEBREAK -->

## 5. Entregável 3 — Sites reais

### 5.1 Metodologia da coleta

Foram analisadas as coletas fornecidas de UOL, G1 e Mercado Livre, sem executar novos testes. Privacy Lens representa a navegação da aba; HAR representa a janela exportada; Blacklight é outra visita; uBlock mostra contadores segundo seu estado e regras. As Figuras 15–24 documentam os recortes selecionados.

scripts/analyze-evidence.cjs usa a PSL do pacote para contar hosts, sites, partes, status, Set-Cookie, redirects e repetições de método+URL completa. Valores só são usados em memória para distinguir repetições, sem exportá-los nas análises.

Os tipos HAR são inferidos do MIME, porque o tipo webRequest não foi exportado. HTTP 304 não entra em redirects; status 0 não identifica bloqueador; data: não conta como terceiro. Set-Cookie conta linhas de resposta, não aceites. Janelas e configuração precisam acompanhar qualquer comparação.

### 5.2 Visão geral

**Tabela 6 — Cobertura documental por site**

| Site | Privacy Lens | HAR | Blacklight / uBlock |
|---|---|---|---|
| UOL | JSON + print; score parcial. | 671 entradas; inclui início; termina após o JSON. | Blacklight recebido; uBlock recebido, sem logger. |
| G1 | JSON + prints; score parcial. Nova visita. | 296 entradas; documento principal ausente. | Blacklight recebido; uBlock + atribuição no DevTools. |
| Mercado Livre | JSON + print; score parcial. Nova visita. | 24 entradas; janela posterior à carga inicial. | Blacklight recebido, query truncada; uBlock recebido. |

Fonte: E36–E41,E47,E51–E53,E57–E62.

**Tabela 7 — Agregados dos HAR, sem equiparar terceiros a trackers**

| Medida | UOL | G1 | Mercado Livre |
|---|---|---|---|
| Entradas | 671 | 296 | 24 |
| Próprias / terceiras / sem host | 125 / 541 / 5 | 5 / 290 / 1 | 0 / 24 / 0 |
| Hosts HTTP(S) | 71 | 111 | 3 |
| Sites PSL / terceiros | 38 / 37 | 68 / 67 | 3 / 3 |
| Linhas Set-Cookie / respostas | 230 / 106 | 265 / 126 | 9 / 9 |
| Redirects sem 304 | 10 | 73 | 0 |
| Status 0 | 7 | 15 | 0 |
| Grupos repetidos / extras | 49 / 261 | 24 / 68 | 3 / 15 |

Fonte: E51,E52,E53.

<!-- PAGEBREAK -->

### 5.3 UOL

O JSON E47 registra início às 03:06:02.499 e exportação às 03:08:07.376. O HAR E51 começa às 03:06:02.504 e termina às 03:09:36.867. A diferença inicial de 5 ms, a URL e uma única entrada do documento principal vinculam fortemente a mesma navegação. Não há evidência de reload no HAR; a configuração persist logs não foi registrada.

O print E36 é anterior: 450 requisições, 389 terceiras e 31 falhas. O JSON posterior contém 513, 436 e 35, respectivamente. Em ambos, 66 cookies e 11 frames. Esse crescimento temporal não foi tratado como erro do contador.

![Figura 15 — UOL: recorte do Privacy Lens com 450 requisições, 389 terceiras, 66 cookies e 11 frames; momento anterior ao JSON. Fonte: E36.](../evidencias/sites/uol/privacy-lens/uol-plugin.png#crop=0.733,0.115,0.239,0.493&height=360&width=400)

O HAR soma 671 entradas; 532 começam até a exportação e 139 depois. Entre as posteriores, 43 vêm de videohd6.mais.uol.com.br, 22 de pagead2.googlesyndication.com e 15 de events.newsroom.bi. A playlist /live/6146-2.m3u8 aparece em 49 GET no HAR inteiro, confirmando tráfego repetido de streaming.

O pareamento por método, URL sem query e horário ±50 ms encontra 374 correspondências. Com tolerância de 2 s, há candidatos para todas as 513 requests, com deltas de 0–1565 ms; 125 têm mais de um candidato. É um alinhamento aproximado, pois o JSON omite valores e não certifica identidade de queries. Não se alterou o detector para forçar igualdade.

<!-- PAGEBREAK -->

#### UOL: reconciliação por host e estado

**Tabela 8 — Exemplos concretos na navegação UOL**

| Host / grupo | HAR | PL JSON | Explicação |
|---|---|---|---|
| videohd6.mais.uol.com.br | 96 | 53 | 43 entradas posteriores ao JSON; streaming. |
| pagead2.googlesyndication.com | 71 | 49 | 22 entradas posteriores; chamadas repetidas de medição/publicidade. |
| events.newsroom.bi | 43 | 28 | 15 posteriores; ingest.php também participa do indicador H. |
| sb.scorecardresearch.com | 38 | 26 | 12 posteriores ao JSON; repetição preservada. |
| conteudo.imguol.com.br | 42 | 29 | 13 entradas extras na janela comum, sem transferência mensurada no HAR. |
| pubads.g.doubleclick.net | 36 | 36 | Totais coincidem; não implica todos os estados iguais. |
| www.google-analytics.com | 1 | 1 | Blacklight também sinaliza GA, sem listar URL no print. |
| facebook.com / facebook.net | 0 | 0 | Blacklight sinaliza Facebook em outra visita; causa da diferença não estabelecida. |

Fonte: E47,E51,E37.

Além dos 513 candidatos pareados, restam 19 itens HAR na janela comum: quatro data: e 15 HTTPS (13 em conteudo.imguol.com.br, um em me.jsuol.com, um em i.ytimg.com). Os 15 HTTPS têm bodySize=0 e timings vazio. Isso é compatível com entradas sem nova transferência mensurada; o campo cache vazio impede comprovar que todos vieram de cache. Os índices estão em har/resumo.json.

As falhas do plugin são 34 NS_ERROR_DOM_NETWORK_ERR e uma NS_BINDING_ABORTED. Seus candidatos no pareamento amplo possuem resposta HTTP 2xx/3xx no HAR, que também contém sete outras entradas com status 0. Resposta HTTP e resultado final da API não são o mesmo estado; o arquivo não identifica a proteção responsável. Nesta coleta, a blocklist própria estava pausada, sem regras e sem decisões.

O inventário de 66 cookies contém 39 próprios e 27 terceiros; três de sessão e 63 persistentes; 27 com chave de partição. Não há preexistência comprovada para os 66. As 115 gravações correlacionadas em 30 s incluem 20 eventos de criação inferida e 95 de alteração, acompanhados de 115 remoções. Após deduplicação, são 42 identidades gravadas: dez terceiras e 40 persistentes. Estoque, eventos, identidades e as 155 tentativas Set-Cookie do JSON são medidas distintas.

<!-- PAGEBREAK -->

#### UOL: Blacklight e uBlock

E37 mostra 48 ad trackers e 17 cookies terceiros, com Facebook e Google Analytics detectados. Evasion, session recording, captura de teclas, TikTok e X aparecem como não encontrados. A visita remota está rotulada “Sep. 29, 2026, 02:15 ET”; sua captura local tem horário 03:16:32. A lista dos 48 trackers não está expandida, portanto não há como reconciliar cada entidade individualmente.

![Figura 16 — UOL no Blacklight: recorte com 48 ad trackers e 17 cookies terceiros; não são contadores de requisições. Fonte: E37.](../evidencias/sites/uol/blacklight/uol-blacklight.png#crop=0,0.24,1,0.225&height=140)

Comparar os 17 cookies do Blacklight aos 27 terceiros do inventário local é mais coerente que comparar com 66, mas ainda não iguala momento, perfil, partição e visita. O HAR/JSON local não contém hosts facebook.com/facebook.net; a causa específica dessa ausência frente ao Blacklight não é demonstrada pelo material.

E38 mostra 22 bloqueios (11%) e 17 de 24 domínios conectados. Chartbeat, Cxense e DoubleClick têm linhas de bloqueio, enquanto a coleta local anterior observa esses hosts. O ícone de energia cinza e a ausência de logger impedem afirmar bloqueio ativo durante toda a navegação. A versão 1.75.0 está visível; nomes de listas e filtros não estão.

![Figura 17 — UOL no uBlock: painel posterior com 22 bloqueios; estado e janela não são os do JSON das 03:08. Fonte: E38.](../evidencias/sites/uol/ublock/uol-ublock.png#crop=0.625,0.081,0.354,0.62&height=255&width=440)

<!-- PAGEBREAK -->

### 5.4 G1

O painel E39, fotografado às 03:26:48, mostra 559 requisições, 516 terceiras, 20 falhas, 166 cookies e 36 frames. O HAR E52 cobre 03:25:50.898–03:26:18.134: 296 entradas, sem a request principal de g1.globo.com/. onContentLoad=-2215 ms e onLoad=-1 indicam cobertura incompleta do carregamento. O JSON complementar E57 é de outra navegação, às 04:47–04:48; seus totais não substituem os deste painel anterior.

O HAR contém 73 redirects (68 HTTP 302, três 303, dois 307), 15 status 0, um 404 e um 451. As 265 linhas Set-Cookie distribuem-se por 126 respostas; não comprovam 265 gravações aceitas. Uma entrada data: fica fora da classificação de terceiros. O painel posterior tem janela mais ampla; a diferença entre 559 e 296 não é contagem de bloqueios.

![Figura 18 — G1: recorte do Privacy Lens com 559 requisições, 516 terceiras e 166 cookies; não há score visível. Fonte: E39.](../evidencias/sites/g1/privacy-lens/g1-plugin.png#crop=0.709,0.161,0.244,0.448&height=350&width=400)

No painel, s3.glbimg.com tem 67 requests, sdk-metrics.g.globo 18, mab.g.globo 16 e simage2.pubmatic.com 14. A matriz em evidencias/sites/g1/reconciliacao.md inclui a união dos hosts do HAR e do JSON complementar, com as visitas identificadas. As contagens do painel E39 ficam separadas.

<!-- PAGEBREAK -->

#### G1: evidência de bloqueio e limites da comparação

E40, às 03:28:39, mostra 42 bloqueios (3%) e 145 de 145 domínios conectados. O DevTools identifica explicitamente “Bloqueado por uBlock Origin” em icu.newsroom.bi/ingest.php, horizon-track.globo.com/g1 e googleads.g.doubleclick.net/pagead/interaction. O HAR anterior tem uma, cinco e três entradas nesses hosts, respectivamente. Isso confirma que os domínios foram observados e que houve bloqueio atribuído ao uBlock na captura posterior; não prova o mesmo estado em ambas as execuções.

![Figura 19 — G1: recorte do DevTools que atribui as linhas de cancelamento ao uBlock Origin. Fonte: E40.](../evidencias/sites/g1/ublock/g1-ublock.png#crop=0,0.778,1,0.22&height=160)

**Tabela 9 — G1: endpoints do HAR e do controle uBlock**

| Host | HAR | Controle posterior |
|---|---|---|
| icu.newsroom.bi | 1 entrada | ingest.php: Bloqueado por uBlock Origin. |
| horizon-track.globo.com | 5 entradas | g1: Bloqueado por uBlock Origin; é próprio segundo PSL globo.com. |
| googleads.g.doubleclick.net | 3 entradas | pagead/interaction: Bloqueado por uBlock Origin. |

Fonte: E52,E40.

O endpoint horizon-track.globo.com é exemplo de recurso que pode ser bloqueado por uma lista mesmo classificado como primeira parte pela PSL. Isso não é contradição: uma dimensão descreve o contexto do domínio e a outra aplica filtros.

O complemento E57/E59/E61 fornece JSON, painel de score e Blacklight próprios do G1. As novas evidências preenchem essas ausências documentais e preservam a distinção entre visitas.

<!-- PAGEBREAK -->

#### G1: JSON complementar e score

E57 cobre 04:47:40.954–04:48:48.979: 1.066 requisições, 108 próprias, 958 terceiras e 31 falhas. Não há sobreposição com o HAR das 03:25–03:26. O script registra collectionRelation.overlaps=false e não tenta parear requisições. Há 172 hosts no JSON e 111 no HAR; a união contém 203: 31 só no HAR e 92 só no JSON.

O inventário de 232 cookies contém 41 próprios, 191 terceiros, três de sessão, 229 persistentes e 184 particionados. As 513 gravações correlacionadas (87 criações inferidas e 426 alterações) e 450 remoções produzem 153 identidades gravadas, 129 terceiras e 150 persistentes. Há 606 tentativas Set-Cookie. Esses totais não equivalem às 265 linhas do HAR anterior nem comprovam autoria exclusiva da aba.

![Figura 20 — G1: score parcial 0–64/100 e sinais isolados de hook; recorte da captura das 04:49:08. Fonte: E59.](../evidencias/sites/g1/privacy-lens/g1-score-plugin.png#crop=0.714,0.207,0.231,0.395&height=290&width=340)

O recálculo confirma N=10, C=20, S=6, F=0, T=0 e H=0, com N/C cobertos. S considera três origens recentes: eus.rubiconproject.com, apps.sascdn.com e www.google.com. Sete alterações e dois canais, sem combinação, não descontam H. Tracking omite 734 observações e 40 parâmetros; T=0 é observação parcial. A blocklist própria está desativada, sem regras ou decisões. Fonte: E57.

<!-- PAGEBREAK -->

#### G1: Blacklight complementar

E61 mostra 27 ad trackers e 14 cookies terceiros, com visita rotulada Sep. 28, 2026, 01:01 ET. É o dia anterior à coleta local. Publicidade cita DoubleVerify e Twitter, Inc. mais 17 empresas; cookies citam LiveIntent Inc. e Twitter, Inc. mais duas. Contagens de empresas, trackers e cookies não são intercambiáveis.

![Figura 21 — G1 no Blacklight: 27 ad trackers, 14 cookies terceiros e data da visita remota; nomes parcialmente expandidos. Fonte: E61.](../evidencias/sites/g1/blacklight/g1-blacklight.png#height=420)

Os hosts cdn, pub, tps e tpsc-ue1.doubleverify.com aparecem no HAR/JSON com 2/10, 2/4, 1/5 e 2/24 requests, respectivamente. static.ads-twitter.com aparece somente no JSON, com duas requests. Os nomes permitem comparação de destinos, mas a captura Blacklight não identifica cada URL/host dos 27 trackers. Os 191 cookies terceiros locais versus 14 remotos vêm de visitas distintas. Evasion está negativo no recorte; categorias inferiores não visíveis permanecem NE. Fontes: E52,E57,E61.

<!-- PAGEBREAK -->

### 5.5 Mercado Livre

O HAR E53 registra apenas 24 entradas entre 03:30:06.464 e 03:30:44.259, todas HTTP 200. O documento principal não está presente; onContentLoad=-5348 ms e onLoad=-3485 ms colocam o começo da janela depois dos eventos de carregamento. O arquivo não demonstra que a página inteira usou somente 24 recursos.

**Tabela 10 — Mercado Livre: totalidade dos hosts do HAR parcial**

| Host | Entradas | Interpretação |
|---|---|---|
| o11y-proxy-otel-frontend.meli.com | 9 | Site PSL meli.com; diferente do top site. |
| http2.mlstatic.com | 8 | Site PSL mlstatic.com; oito imagens pelo MIME. |
| api.mercadolibre.com | 7 | Site PSL mercadolibre.com; diferente de mercadolivre.com.br. |

Fonte: E53.

São 16 respostas de MIME JSON, oito imagens, nove linhas Set-Cookie em nove respostas e zero redirects. Há três grupos de URL completa repetida, com 15 ocorrências além da primeira. Os três domínios são terceiros pelo critério de site registrável, ainda que os nomes integrem um mesmo ecossistema comercial; isso não os torna automaticamente trackers.

E41, às 03:36:15, mostra 40 bloqueios (9%) e oito de dez domínios conectados. hotjar.com e mercadoclics.com têm linhas de bloqueio. Não aparecem no HAR parcial anterior. Essa ausência não comprova inexistência: a janela não cobre a carga inicial, e bloqueios precoces podem impedir chamadas descendentes. A cadeia específica não pode ser reconstruída sem logger ou HAR pareado.

![Figura 22 — Mercado Livre: recorte do uBlock com 40 bloqueios e oito de dez domínios conectados. Fonte: E41.](../evidencias/sites/mercadolivre/ublock/mercadolivre-ublock.png#crop=0.62,0.072,0.355,0.39&height=240&width=440)

O complemento E58/E60/E62 fornece Privacy Lens e Blacklight próprios do Mercado Livre. Os CNAMEs CloudFront visíveis no uBlock não podem ser equiparados automaticamente a hosts do HAR: a extensão não resolve aliases DNS.

<!-- PAGEBREAK -->

#### Mercado Livre: JSON complementar e score

E58 cobre 04:50:08.707–04:50:59.031: 148 requisições, quatro próprias, 144 terceiras, seis falhas e dez hosts. A janela não se sobrepõe ao HAR; sete hosts aparecem somente no JSON. script.hotjar.com e static.hotjar.com têm uma request cada, e print1.mercadoclics.com tem 13. São sites nas linhas de bloqueio do uBlock anterior, em outra execução; sua presença posterior não demonstra falha daquele controle.

O inventário contém 22 cookies: 14 próprios, oito terceiros, um de sessão, 21 persistentes e três particionados. Dez gravações (duas criações inferidas, oito alterações) e dez remoções produzem cinco identidades gravadas: nenhuma terceira e quatro persistentes. Portanto C=4, apesar dos oito cookies terceiros no inventário. As 22 tentativas Set-Cookie não são 22 gravações confirmadas.

![Figura 23 — Mercado Livre: score parcial 41–66/100 e uma combinação de alterações de APIs com canal repetido. Fonte: E60.](../evidencias/sites/mercadolivre/privacy-lens/mercadolivre-score-plugin.png#crop=0.715,0.327,0.234,0.559&height=290&width=340)

N=10, C=4, S=0, F=0, T=0, H=20; N/C/T cobertos. H combina cinco alterações de APIs com quatro respostas 2xx de api.mercadolibre.com/melidata/tracks/component_prints em 15.685 ms, frame 0, requests 9568/9569/9571/9588. A coocorrência também pode decorrer de instrumentação legítima; não comprova hijacking. Tracking não registra perdas; S/F/H continuam parciais. A blocklist está desativada e vazia. Fonte: E58.

<!-- PAGEBREAK -->

#### Mercado Livre: Blacklight complementar

E62 mostra 11 ad trackers e 16 cookies terceiros; visita Sep. 28, 2026, 18:33 ET. A URL contém query parcialmente visível (skipInApp=true&matt_ig…), enquanto E58 registra a homepage sem query. O trecho oculto não foi reconstruído.

![Figura 24 — Mercado Livre no Blacklight: 11 ad trackers e 16 cookies terceiros; URL e data diferem da coleta local. Fonte: E62.](../evidencias/sites/mercadolivre/blacklight/mercadolivre-blacklight.png#height=420)

Publicidade cita Twitter, Inc. e Facebook, Inc. mais três empresas; cookies citam RTB House S.A. e ByteDance Ltd. mais três. As categorias de pixels, evasion e demais resultados inferiores não estão no recorte: nomes nessas listas não bastam para afirmar pixels Facebook/TikTok/X. Oito cookies terceiros locais versus 16 remotos são inventários distintos, não gravações equivalentes para C. Não há lista completa de hosts remotos para reconciliar cada tracker. Fontes: E58,E62.

<!-- PAGEBREAK -->

### 5.6 Causas típicas das divergências

As explicações adotadas são vinculadas a evidências específicas, e as hipóteses restantes ficam separadas de causas demonstradas.

**Tabela 11 — Divergências e seu grau de sustentação**

| Diferença | Evidência concreta | Conclusão permitida |
|---|---|---|
| Volume UOL | HAR termina 89,491 s após a exportação; 139 entradas posteriores, 43 de vídeo. | Janela e continuidade do tráfego explicam parte quantificada do excesso. |
| 19 itens extras UOL na janela comum | Quatro data: e 15 HTTPS com bodySize=0/timings vazio. | Escopo/registro de recurso difere; cache é compatível, não comprovado. |
| Falhas UOL versus HTTP | 35 erros PL têm candidatos com 2xx/3xx; HAR registra sete status 0 adicionais. | Estados não equivalentes; sem atribuição ao bloqueador. |
| 559 painel G1 versus 296 HAR | Painel posterior; documento principal ausente; DOM com tempo negativo. | HAR não cobre todo o carregamento; não deduzir bloqueios por subtração. |
| Mercado Livre sem Hotjar no HAR | 24 entradas tardias, três hosts; Hotjar visível no uBlock posterior. | Ausência na janela não prova ausência do tracker na página inteira. |
| Cookies UOL 27 versus 17 | 27 terceiros no inventário local; 17 na visita Blacklight. | Comparar unidades próximas, sem afirmar perfis/estados equivalentes. |
| uBlock versus classificação PSL | horizon-track.globo.com é próprio e tem bloqueio explícito no controle G1. | Filtros podem bloquear primeira parte; “terceiro” não é rótulo de malícia. |
| Novos JSONs G1/ML versus HARs | Janelas sem sobreposição; G1 1.066 versus 296, ML 148 versus 24. | Visitas diferentes; sem pareamento nem contagem de omissões por subtração. |
| Blacklight complementar | Visitas de 28/09; ML com query truncada, E58 sem query. | Comparação crítica possível; causalidade das diferenças não estabelecida. |
| Bloqueio em cadeia | uBlock tem bloqueios, mas não foi fornecido logger de dependências. | Mecanismo plausível; não inventar qual script deixou de gerar cada chamada. |

Fonte: E36–E41,E47,E51–E53,E57–E62.

Geografia, consentimento, sorteio de anúncio, perfil e cache podem mudar resultados entre visitas, mas não foram usados como explicações comprovadas de uma discrepância específica. Sem configuração pareada, essas causas continuam hipóteses. As matrizes por host e os CSV preservam a possibilidade de revisão sem expor os valores dos identificadores no texto.

<!-- PAGEBREAK -->

## 6. Entregável 4 — Privacy Score

### 6.1 Metodologia

O método implementado é privacy-score-v1: score = max(0, 100 − N − C − S − F − T − H). É um índice normativo de exposição observada, não probabilidade de ataque. Os pesos foram escolhidos no projeto e não calibrados empiricamente contra um conjunto de sites; não existem faixas validadas de “seguro”.

**Tabela 12 — Critérios implementados, pesos e justificativas**

| Categoria | Regra / teto | Justificativa e cautela |
|---|---|---|
| N | 2 por site PSL terceiro com resposta completed 200–399; teto 10. | Exposição a destinos distintos; CDNs legítimas também contam. Decisões próprias de bloqueio excluídas. |
| C | 3 por identidade terceira gravada + 1 por persistente gravada (até 5 nesse termo); teto 20. | Persistência e identificação. Deduplicação por store/domínio/path/nome/partição; correlação não autoria. |
| S | 2 por origem terceira com localStorage ou IndexedDB >0 em snapshot ativo de até 5 s; teto 10. | Persistência adicional. Sessão e snapshots removidos/antigos não pontuam automaticamente. |
| F | 15 se há sequência canvas; teto 15. | Exposição por leitura após desenho. Heurística também ocorre em editores legítimos. |
| T | 15 com sync moderado; senão 10 com bounce moderado; teto reservado 25. | Ligação entre sites. Usa o maior sinal, sem somar fluxos não demonstrados independentes. |
| H | 20 com combinação alteração de API + polling terceiro no mesmo frame/intervalo; teto 20. | Coocorrência de dois sinais; ainda não é prova de hijacking. Canal/hook isolado não pontua. |

Fonte: extension/lib/score.js; docs/SCORE_PROPOSTA.md.

A soma dos tetos é 100, mas T atualmente desconta no máximo 15 dos 25 reservados. Os dez pontos restantes não são fabricados como observação. Esse desenho torna o limite inferior conservador quando T não tem cobertura; é uma limitação conhecida da metodologia.

N exige rede sem truncamento e navegação observada desde o início; C exige janela de 30 s fechada e ausência dos erros/perdas previstos. S exige snapshots recentes, ativos e com as APIs observadas. F exige cobertura de frames e instrumentação; T e H respeitam suas próprias lacunas. Ter um número observado numa categoria não basta para marcá-la coberta.

<!-- PAGEBREAK -->

### 6.2 Resultado dos três sites

Quando há categoria sem cobertura completa, o JSON mantém value=null. O limite superior é 100 menos os descontos observados; o inferior subtrai ainda a soma de teto menos desconto de cada categoria descoberta, truncado em zero. observedValue é apenas o limite superior, não uma nota final.

No UOL, os descontos somam 69. N e C estão cobertos; S, F, T e H não. O superior é 31; faltam até 6+15+10+0 pontos nessas quatro categorias, levando o inferior a zero. O intervalo 0–31 é preservado integralmente.

**Tabela 13 — Score disponível e comparação externa por site**

| Site | Score PL | Cobertura | Blacklight |
|---|---|---|---|
| UOL | 0–31/100, parcial | 2/6; N e C cobertos. | 48 ad trackers; 17 cookies terceiros; não há nota equivalente. |
| G1 | 0–64/100, parcial | 2/6; N e C cobertos. | 27 ad trackers; 14 cookies terceiros. |
| Mercado Livre | 41–66/100, parcial | 3/6; N, C e T cobertos. | 11 ad trackers; 16 cookies terceiros. |

Fonte: E47,E57,E58,E37,E61,E62.

**Tabela 14 — Descontos dos três JSONs, exportados e recalculados**

| Categoria / teto | UOL | G1 | Mercado Livre |
|---|---|---|---|
| N / 10 | 10; coberto | 10; coberto | 10; coberto |
| C / 20 | 20; coberto | 20; coberto | 4; coberto |
| S / 10 | 4; parcial | 6; parcial | 0; parcial |
| F / 15 | 0; parcial | 0; parcial | 0; parcial |
| T / 25 | 15; parcial | 0; parcial | 0; coberto |
| H / 20 | 20; parcial | 0; parcial | 20; parcial |
| Soma dos descontos | 69 | 36 | 34 |

Fonte: E47,E57,E58; score.categories. Parcial indica cobertura incompleta da categoria, inclusive quando seu desconto já atinge o teto.

N usa 37/55/6 sites elegíveis (UOL/G1/ML), todos acima da saturação. C deduplica 42/153/5 identidades gravadas: 10/129/0 terceiras e 40/150/4 persistentes. S considera duas/três/zero origens recentes elegíveis. T no UOL usa um sync moderado entre analytics.google.com e www.google.com.br; dois outros são baixos. F não observa sequências, com cobertura incompleta nos três sites.

No G1, superior 64 e incerteza residual 4+15+25+20=64 dão inferior 0. No Mercado Livre, superior 66 e incerteza 10+15+0=25 dão inferior 41. H permanece parcial mesmo no teto, sem desconto residual adicional. Os três JSONs mantêm value=null.

O script chama a função privacyScore implementada e verifica igualdade integral com cada score exportado. Somente E47/E57/E58 alimentam os recálculos; HARs, screenshots e Blacklight não preenchem campos ausentes.

<!-- PAGEBREAK -->

### 6.3 Comparação crítica com Blacklight

No UOL há convergência qualitativa na exposição a publicidade, analytics e cookies terceiros: Blacklight aponta 48 ad trackers/17 cookies, e o plugin registra destinos terceiros, gravações e propagação compatível com sync. A comparação não é uma equivalência entre 48 trackers e 37 sites elegíveis de N: o primeiro é uma classificação de serviços na visita remota, o segundo é deduplicação PSL de respostas na aba local.

A ausência de evasion/fingerprinting no resultado Blacklight não valida F=0 do Privacy Lens: o JSON tem cobertura canvas incompleta. Session recording, captura de teclas e pixels de plataformas são categorias externas sem detectores específicos equivalentes em todas as dimensões do score. A indicação de Facebook não é reproduzida pelos hosts do HAR local, e a causa permanece em aberto.

No G1, 27 ad trackers e 14 cookies terceiros no Blacklight convergem qualitativamente com a exposição local, mas não equivalem aos 55 sites elegíveis de N nem às 129 identidades terceiras gravadas. N/C saturam; o amplo intervalo 0–64 preserva lacunas de S/F/T/H. Sete alterações e dois canais sem combinação não justificam H=20.

No Mercado Livre, 11 ad trackers e 16 cookies remotos coexistem com score 41–66. C=4 usa gravações próprias persistentes, sem gravação terceira correlacionada, embora oito cookies terceiros estejam no inventário. H=20 decorre da combinação local, categoria sem contraparte direta no recorte remoto. Data, URL e janela diferem; isso limita a comparação numérica, sem atribuir a diferença a um bloqueador.

Os intervalos do G1 e Mercado Livre se sobrepõem; não autorizam ranking definitivo entre ambos. O UOL tem intervalo abaixo do Mercado Livre neste método, mas visitas não controladas e pesos normativos impedem generalizar como segurança intrínseca dos sites. Categorias Blacklight fora do recorte permanecem NE.

Não é tecnicamente válido aplicar toda a fórmula aos campos visíveis do Blacklight: faltam gravações correlacionadas, snapshots ativos, sequência canvas, confiança do sync, combinação de descritores e cobertura. Logo, não se criou “score Blacklight” 0–100.

### 6.4 Limitações do score

H desconta 20 pontos no UOL por alteração de Function.toString e telemetria repetida; no Mercado Livre, por cinco alterações e chamadas a api.mercadolibre.com. Sem causalidade ou autoria demonstradas, aplicações legítimas podem receber o mesmo desconto. Esse caso é evidência concreta de baixa especificidade potencial; não deve ser apresentado como confirmação de sequestro.

C, S e T podem representar dimensões do mesmo fluxo de identificação, sem independência causal. N satura rapidamente em cinco sites; C já atinge seu teto no UOL. T reserva dez pontos que a regra atual não usa como desconto observado. Essas escolhas são transparentes, porém exigiriam estudo maior para calibrar utilidade e validade.

Uma análise de sensibilidade, executada com o parâmetro weightFactor da função implementada, mantém as mesmas evidências e modifica somente pesos antes dos tetos. Com −20% / +20%, UOL fica em 0–39 / 0–27; G1 em 0–65 / 0–63; Mercado Livre em 42–71 / 40–65. São cenários analíticos, não novas notas exportadas nem resultados de outras visitas. Os intervalos originais permanecem 0–31, 0–64 e 41–66.

Fonte: E47,E57,E58; extension/lib/score.js; evidencias/sites/{uol,g1,mercadolivre}/har/resumo.json, privacyLens.scoreSensitivity.

<!-- PAGEBREAK -->

## 7. Limitações

A coleta é observacional e pequena. A configuração exata de perfil, ETP, cache, consentimento, extensões e listas não foi preservada para todas as visitas. Blacklight é outra execução; capturas de uBlock são posteriores aos HAR. Não há base para inferir causalidade de toda diferença entre ferramentas.

Nos testes DDG, storage top-level defasado impede afirmar estado atual vazio. Dois painéis Query Parameters não identificam o subcaso, o controle final não conserva a URL e as duas recuperações bounce não têm dois pares completos de evidência. Em js-leaks, o único JSON não informa a condição da extensão e a captura com plugin antecede o Check. A ausência de um controle concluído não pode ser disfarçada como aprovação.

Nos sites reais, os três JSONs e os três Blacklight estão presentes. Os novos JSONs G1/Mercado Livre não se sobrepõem aos HARs anteriores, que omitem o documento principal. Os Blacklight não expõem listas completas de hosts; G1/ML têm categorias inferiores recortadas e ML tem URL parcialmente oculta. O material permite comparação crítica e reconciliação de hosts observados, sem identificar cada tracker remoto.

A extensão observa frames HTTP(S) e APIs selecionadas. Frames opacos, workers, WebGL, OffscreenCanvas, alterações entre amostras, mudanças anteriores ao document_start e transformações de identificadores permanecem lacunas. cookies.onChanged não informa autoria da aba. Set-Cookie não prova aceitação; snapshot não prova criação. Classificação PSL não é atribuição empresarial.

O JSON UOL também registra limites concretos: cobertura de storage/canvas por frames incompleta; tracking com oito observações, 771 parâmetros, 16 valores e 121 findings omitidos. Não houve erro de hash ou comparação pendente nessa exportação. O G1 registra 734 observações e 40 parâmetros omitidos em tracking; Mercado Livre registra zero perdas nessa camada. Ambos têm storage/canvas incompletos e H parcial. Contadores omitidos são unidades diferentes e não devem ser somados como uma única quantidade de requisições perdidas.

A instrumentação pode afetar desempenho e é detectável pela página. Não houve controle pareado suficiente para atribuir as falhas de correção/performance do canvas à extensão. Indicadores de hook não investigam configurações do navegador, processos do sistema ou exploração de vulnerabilidades.

O histórico Git contém nove commits, distribuídos em 24, 28 e 29/09/2026, com etapas distintas. Isso comprova desenvolvimento incremental, sem reconstruir artificialmente atividade em cada dia da semana. A matrícula e o sorteio dos sites não foram comprovados. A auditoria separada registra os requisitos ainda parciais ou ausentes.

<!-- PAGEBREAK -->

## 8. Conclusão

O Privacy Lens v0.5.0 implementa relatório por página, exportação JSON, observação de rede/cookies/storage, indicadores de canvas/tracking/hook, score com cobertura e blocklist local editável. Os controles automatizados e as capturas manuais sustentam comportamentos concretos, incluindo detecção da tentativa doubleclick.net, sequência canvas, transporte de parâmetros e cancelamento solicitado por regra própria.

A reconciliação do UOL mostra por que janelas e unidades precisam acompanhar os totais. O HAR continua após o JSON, inclui recursos data: e mantém entradas sem transferência mensurada; seu conjunto não deve ser comparado ao contador da extensão por simples subtração. O score original é 0–31, parcial, e a coocorrência que gera H deve ser interpretada criticamente.

O complemento de G1 e Mercado Livre permite recalcular seus scores em 0–64 e 41–66 e comparar criticamente os resultados com 27/14 e 11/16 trackers/cookies no Blacklight. Permanecem os limites de cobertura, visitas distintas, listas externas incompletas e lacunas DDG. O documento não reivindica comprovação integral do Conceito A ou de todos os entregáveis obrigatórios.

A finalização preservou os detectores, os arquivos originais e o histórico Git. O relatório e as análises podem ser regenerados pelos scripts incluídos, sem edição manual posterior do PDF.

## 9. Uso de IA

Utilizei o ChatGPT como apoio ao planejamento, à revisão técnica, à interpretação dos resultados e à elaboração de prompts. Utilizei o Codex para implementação e edição no repositório, organização das evidências, análise dos arquivos e geração deste relatório.

Executei manualmente as funcionalidades no Firefox e coletei as capturas de tela, HAR, resultados DDG, Blacklight e uBlock utilizados na avaliação. Os testes automatizados locais são identificados como tais e não são apresentados como coletas manuais. As decisões finais e a validação do trabalho são de responsabilidade humana.

Na finalização, a IA conferiu os dados e apontou lacunas em vez de produzir capturas ou resultados substitutos. Um relatório externo foi consultado exclusivamente como referência visual de estrutura e densidade. Nenhum texto, número, método, conclusão, nome ou imagem daquele trabalho foi usado como resultado deste projeto.

<!-- PAGEBREAK -->

## Anexo — Evidências e reprodução

O catálogo evidencias/INDEX.md associa o nome bruto, a identificação visual, o destino e a confiança. evidencias/manifesto-recebidos.json conserva hashes antes/depois da movimentação, tamanho, metadados e integridade. docs/RELATORIO_FONTES.md liga tabelas, figuras e números às evidências e aos seletores relevantes.

**Tabela 15 — Localização dos conjuntos**

| Conjunto | Caminho e conteúdo |
|---|---|
| DDG | evidencias/duckduckgo/: oito REGISTRO.md, RESULTADOS.md, capturas e JSON recebidos. |
| Sites | evidencias/sites/{uol,g1,mercadolivre}/: originais, reconciliacao.md, har/resumo.json e dominios.csv. |
| Transcrições | evidencias/sites/transcricao-capturas.json: números visíveis em Privacy Lens, Blacklight e uBlock. |
| Conceito A | evidencias/conceito-a/: captura blocklist e referências aos controles locais, sem duplicar os originais. |
| Desenvolvimento | evidencias/desenvolvimento/: controles locais históricos e capturas cookies. |
| Ambiguidades | docs/AMBIGUIDADES_EVIDENCIAS.md; painéis sem identificação em query-parameters/pendentes/. |
| Enunciado | docs/referencias/enunciado-avaliacao.pdf; critérios usados na auditoria final. |
| Entrega | docs/relatorio-final.md e .pdf; docs/AUDITORIA_FINAL.md; docs/VALIDACAO_FINAL.txt. |

Fonte: evidencias/manifesto-recebidos.json.

**Reproduzir a análise**

Executar na raiz do repositório: node scripts/analyze-evidence.cjs. Os originais não são modificados. Para recuperar o HAR UOL, usar gzip -dc evidencias/sites/uol/har/uol.har.gz redirecionando para um arquivo fora do repositório; o manifesto contém o hash esperado do conteúdo.

**Reproduzir o PDF**

Criar um ambiente Python 3.9 ou posterior, instalar scripts/requirements-report.txt e executar scripts/build-report.py a partir desse ambiente. O script usa fontes empacotadas com ReportLab, páginas A4, sumário com páginas e links, rodapés e recortes de diagramação sobre as imagens originais. Não usa sites remotos nem editor manual. Metadados PDF são fixados para reprodução determinística.

**Verificação final**

Executar npm test, npm run check e git diff --check. A geração do PDF é separada do runtime da extensão e não adiciona dependências à instalação Firefox. O relatório foi inspecionado em PDF; as evidências originais continuam disponíveis em sua resolução integral.

**Fontes do método**

Enunciado oficial (E54); código extension/lib/ e extension/content/; documentação ARQUITETURA.md, SCORE_PROPOSTA.md e FONTES.md. Os esperados DDG estão preservados nas próprias páginas fotografadas e nos registros de validação. Resultados externos vêm exclusivamente das capturas e downloads fornecidos, não de uma nova visita às ferramentas.
