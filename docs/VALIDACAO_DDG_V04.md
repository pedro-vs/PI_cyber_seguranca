# Roteiro manual DDG — Privacy Lens 0.4.0

Preparado pela leitura do PDF da avaliação (4 páginas) e das páginas/código oficiais em 28/09/2026. **Nenhum teste DDG foi executado pelo agente; nenhum resultado observado foi preenchido; nenhuma screenshot foi gerada.** Os resultados locais não substituem estas evidências. Esta etapa não entrega score, hook/hijacking, blocklist nem a reconciliação dos três sites reais; não equivale à conclusão integral do Conceito B.

## Preparação comum às sete medições

1. Carregue/recarregue `extension/manifest.json` uma vez em `about:debugging#/runtime/this-firefox`. Confirme **v0.4.0 / ETAPA 4 · INDICADORES**. Não recarregue a extensão no meio de um fluxo: perde-se o histórico.
2. Use um perfil de laboratório, janela normal, mesmo container durante cada teste. Registre data/fuso, macOS, versão exata do Firefox, versão do plugin, ETP (Padrão/Estrito/Personalizado), exceções, preferências de cookies e fingerprinting alteradas, cache e outras extensões. Primeira rodada: somente Privacy Lens ativa. Não altere proteções para forçar aprovação. Uma rodada adicional com outra proteção exige registro e nomes de arquivos diferentes.
3. Nova aba para cada teste, exceto as continuações explicitadas abaixo. Feche cópias anteriores da mesma página. Não faça limpeza global do navegador. Em perfil novo não é necessária limpeza prévia; se repetir, registre se os dados foram mantidos e siga as instruções específicas.
4. Faça as interações iniciais assim que a página carregar. A janela de eventos de cookies continua fixa em 30 s desde o main_frame; abrir/atualizar o painel não a reinicia. Uma interação posterior pode aparecer no inventário e ficar fora dos eventos, corretamente.
5. Ao concluir cada caso, abra Privacy Lens → **Atualizar** → **Exportar JSON**, antes de navegar. Salve também os resultados DDG quando houver botão de download. Não preencha manualmente um sucesso que a página não informou.
6. Cada linha/subteste/configuração na tabela precisa de print do plugin naquela página. Mantenha visíveis a barra de endereço, o título/resultado DDG e a seção relevante do Privacy Lens. Se o popup não couber, use **Abrir relatório** e mova essa aba para outra janela; posicione página DDG e relatório lado a lado. O relatório deve mostrar o mesmo domínio/URL reduzida, versão e horário. Uma captura complementar de detalhes é permitida; não substitui a captura com contexto.
7. Use sufixos `-r1`, `-r2` etc. quando o nome já existir. Não sobrescreva evidências. Em `evidencias/duckduckgo/RESULTADOS.md`, duplique linhas para os subtestes; resultados, concordância e divergências continuam pendentes até a execução.

## 1 — Tracker Reporting

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 1 — Conceito C

**Nome:** Tracker Reporting

**URL exata:** https://privacy-test-pages.site/tracker-reporting/1major-via-script.html

**Preparação:** nova aba, somente Privacy Lens; sem necessidade de limpar cookies/storage. Extensão carregada antes de abrir; não recarregar durante a medição. Registrar ETP e eventuais outras proteções conforme preparação comum.

**Ação:** abrir a URL, deixar carregar, abrir Privacy Lens, Atualizar. Expandir **Rede → Requisições, redirects e erros observados**; localizar `doubleclick.net` e o recurso `/tracker.js`. Exportar JSON.

**Esperar:** término do carregamento + **5 s**. Se a request continuar sem conclusão observada, esperar até **30 s desde a navegação**, atualizar e registrar esse estado.

**Resultado esperado segundo a própria página DDG:** a página anuncia um tracker incluído por script; o HTML solicita `https://doubleclick.net/tracker.js`. Não oferece um placar automático de aprovação. Isso descreve a tentativa programada, sem garantir sucesso HTTP. [Página oficial](https://privacy-test-pages.site/tracker-reporting/1major-via-script.html).

**Privacy Lens:** Rede, domínio terceiro, requestId, tipo `script`, estado, status HTTP/erro; JSON `network.requests`. O plugin não possui catálogo para afirmar que todo terceiro é rastreador.

**O que registrar:** anúncio da página; presença/ausência da tentativa no plugin; estado concreto da request; concordância sobre domínio/tipo. Se houver divergência, conferir DevTools → Rede e registrar recurso/erro, sem atribuir ausência automaticamente a bloqueio.

**PRINT:** endereço e anúncio DDG + Privacy Lens mostrando domínio e request relevante, incluindo erro/status se houver.

**Nome do arquivo:** `ddg-tracker-reporting-plugin.png`

**Pasta:** `evidencias/duckduckgo/tracker-reporting/`

**JSON:** `ddg-tracker-reporting-relatorio.json`.

## 2 — Storage Blocking

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 2 — Conceito C

**Nome:** Storage Blocking

**URL exata:** https://privacy-test-pages.site/privacy-protections/storage-blocking/

**Preparação:** nova aba; perfil de laboratório sem dados anteriores deste teste, ou limpar apenas os sites usados (`privacy-test-pages.site`, `good.third-party.site`, `broken.third-party.site`, `convert.ad-company.site`) antes de abrir. Não limpar entre gravar e recuperar. Mesma aba/container, ETP inalterado, somente Privacy Lens; não recarregar a extensão.

**Ação:** clicar **Store data**; abrir os detalhes do resultado; quando as operações estabilizarem, clicar **Retrieve data**. Abrir todos os detalhes dos tipos avaliados. Usar **Download the result**. Atualizar Privacy Lens e exportar JSON.

**Esperar:** operações sem reticências pendentes, depois **2 s** em cada fase. Se uma operação não terminar em **30 s**, registrar timeout/inconclusão e o tempo; não converter em bloqueio confirmado.

**Resultado esperado segundo a própria página DDG:** escreve um número de teste e tenta recuperá-lo por diferentes mecanismos. Os detalhes mostram resultado/erro por mecanismo, inclusive frames terceiros. A página não estabelece que todos deveriam falhar em qualquer configuração. Compare gravação/recuperação nas linhas efetivamente apresentadas, sem confundir contagem de chaves com o número armazenado. [Página oficial](https://privacy-test-pages.site/privacy-protections/storage-blocking/).

**Privacy Lens:** **Armazenamento HTML5** (origem, frame, top site, contexto, localStorage/sessionStorage/IndexedDB, disponibilidade) e **Cookies** (inventário, eventos e partições). Frames removidos podem ter só snapshot anterior ou nenhuma coleta: a página cria e remove iframes rapidamente. Cache, memória, history, window.name e service workers da página não são integralmente medidos pelo plugin.

**O que registrar:** linha DDG por mecanismo/origem; snapshot correspondente ou cobertura ausente; concordância/divergência. Exemplos de evidência concreta: frame removido antes da coleta; `SecurityError`; cookie ausente/presente em uma partição; request do iframe com erro. Contagem zero não demonstra bloqueio.

**PRINT:** URL/título, detalhes DDG de localStorage/sessionStorage/IndexedDB ou cookies + seção equivalente do plugin com origem/frame. Faça capturas complementares se necessário para cobrir as linhas registradas.

**Nome do arquivo:** `ddg-storage-blocking-plugin.png`

**Pasta:** `evidencias/duckduckgo/storage-blocking/`

**JSON:** `ddg-storage-blocking-relatorio.json`; preservar separadamente o download DDG.

## 3 — Fingerprinting / Canvas

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 3 — Conceitos C/B

**Nome:** Fingerprinting / Canvas

**URL exata:** https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html

**Preparação:** nova aba; não precisa limpar cookies/storage. Extensão já carregada; registrar ETP e qualquer preferência de resistência a fingerprinting, sem alterá-la nesta rodada. Somente Privacy Lens. Não usar o menu para trocar de host no primeiro caso.

**Ação:** abrir a página; os testes iniciam automaticamente. Acompanhar a tabela de status/notas. Depois abrir Privacy Lens, Atualizar, expandir **Canvas → Ver sequência e APIs observadas**, exportar JSON.

**Esperar:** tabela terminar de crescer e ficar estável por **5 s**; reservar até **60 s**. Se não concluir, registrar essa limitação. Opcionalmente confirmar `results.complete` no Console da própria página, sem modificar o teste.

**Resultado esperado segundo a própria página DDG:** os checks verificam correção e desempenho de renderização/leitura. A tabela marca cada asserção com pass/fail e notas. Um pass não significa ausência de fingerprinting, e um indicador do plugin não implica falha DDG. [Página oficial](https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html).

**Privacy Lens:** classificação Canvas, desenhos, leituras, APIs e pares no mesmo canvas em até 5 s, frame, exceções e perdas por limite. A página pode ter leituras legítimas e volume superior às amostras retidas; isso deve constar da explicação.

**O que registrar:** status/notas DDG de cada linha escolhida; sequência/API observada ou não pelo plugin; explicar diferenças com API, frame, exceção ou limite concreto. O detector não testa se os pixels foram randomizados nem reproduz os limites de desempenho DDG.

**PRINT:** URL/título, tabela DDG com status/notas e seção Canvas do plugin; detalhe complementar com sequência/API quando houver indicador.

**Nome do arquivo:** `ddg-fingerprinting-canvas-plugin.png`

**Pasta:** `evidencias/duckduckgo/fingerprinting-canvas/`

**JSON:** `ddg-fingerprinting-canvas-relatorio.json`.

## 4 — Tracker Blocking

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 4 — Conceito B

**Nome:** Tracker Blocking

**URL exata:** https://privacy-test-pages.site/privacy-protections/request-blocking/

**Preparação:** nova aba; não precisa limpar storage. Somente Privacy Lens, ETP registrado e inalterado; extensão carregada antes da página. Esta é uma rodada observacional: Privacy Lens 0.4.0 não oferece blocklist nem efetua bloqueio. Não adicionar uma regra fictícia ao plugin.

**Ação:** clicar **Start the test** uma vez. Examinar categorias HTML/CSS/JS/Other e a legenda. Usar **Download the results**. Atualizar Privacy Lens; expandir detalhes de Rede, localizar `bad.third-party.site`, exportar JSON.

**Esperar:** estados estabilizados por **5 s**, até **30 s após clicar**. Linhas sem conclusão devem ser registradas como tal.

**Resultado esperado segundo a própria página DDG:** testa vários mecanismos contra `bad.third-party.site`; para avaliar um bloqueador, pede que esse domínio esteja na lista de bloqueio. A legenda distingue recurso carregado, não carregado e falha (bloqueio é uma causa possível). Sem essa regra, não presumir que todas as linhas deveriam mostrar bloqueio. [Página oficial](https://privacy-test-pages.site/privacy-protections/request-blocking/).

**Privacy Lens:** Rede → domínio, tipo, requestId, estado, código HTTP, erro e redirect. `error` ou `observed` não são “bloqueado pelo Privacy Lens”. Nem toda falha DDG equivale a uma falha no transporte: o teste pode depender de callbacks, dimensões ou conteúdo.

**O que registrar:** resultado DDG por mecanismo, request correspondente e comparação. Ex.: linha script não carregada versus request `completed`/HTTP 404; linha iframe falhou e request mostra erro específico; request ausente com cobertura parcial. Se quiser uma rodada posterior com outro bloqueador, registrar extensão, regra real e configuração em linhas/arquivos separados; não atribuir sua ação ao Privacy Lens.

**PRINT:** URL/título, categoria/legenda e linha DDG comparada + detalhes da request no plugin.

**Nome do arquivo:** `ddg-tracker-blocking-plugin.png`

**Pasta:** `evidencias/duckduckgo/tracker-blocking/`

**JSON:** `ddg-tracker-blocking-relatorio.json`, junto ao download DDG.

## 5 — Storage Partitioning

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 5 — Conceito B

**Nome:** Storage Partitioning

**URL exata de execução:** https://www.first-party.site/privacy-protections/storage-partitioning/

**Entrada pelo índice DDG:** https://privacy-test-pages.site/privacy-protections/storage-partitioning/ — seu código redireciona à URL acima após cerca de 2 s.

**Preparação:** somente uma cópia da página principal; nova aba em perfil de laboratório. Não fazer recarga forçada (Shift-reload) nem manter outra execução aberta. Se repetindo, fechar a aba auxiliar anterior e usar navegação normal. Não limpar durante o fluxo. Mesma configuração de ETP/cookies, somente Privacy Lens; permitir a aba auxiliar iniciada pelo clique, se o navegador a bloquear, e registrar isso. Não recarregar a extensão.

**Ação:** na origem correta, clicar **Run Tests**. Deixar a aba auxiliar navegar e concluir; não fechar nem interferir nela. Voltar à aba original quando os resultados aparecerem. Clicar **Show Detailed Results** e **Download the result**. Atualizar/exportar Privacy Lens na aba original.

**Esperar:** resumo e download DDG disponíveis; os passos podem levar mais de 30 s. Reservar **até 120 s**; se não concluir, registrar aviso/etapa/tempo, não um pass. Não aplicar a janela de 30 s de cookies como timeout do teste DDG.

**Resultado esperado segundo a própria página DDG:** compara mecanismos em contextos same-site/cross-site e os classifica por API em pass/fail/error/unsupported. A página alerta que cópias simultâneas e recarga forçada invalidam o procedimento. Registre unsupported literalmente, mesmo se tiver ícone verde. [Página oficial](https://privacy-test-pages.site/privacy-protections/storage-partitioning/); [origens definidas pelo código](https://privacy-test-pages.site/privacy-protections/storage-partitioning/helpers/common.js).

**Privacy Lens:** Armazenamento HTML5 → origem, frame, top site na coleta, contexto, snapshot atual/anterior; Cookies → partição/store. A chave de cookie não demonstra particionamento de localStorage ou IndexedDB. Duas contagens iguais também não demonstram compartilhamento. O plugin não compara valores de storage nem mistura abas; dados de uma aba auxiliar já fechada não são recuperáveis. O relatório original pode observar somente parte do fluxo DDG.

**O que registrar:** status e detalhes same-site/cross-site da página; origens/frames efetivamente observados; o que não foi coletado. Uma conclusão sobre particionamento vem do teste controlado DDG, não do simples inventário do plugin. Se conseguir exportar a auxiliar antes de ela fechar sem interromper o teste, identificá-la em arquivo separado; não exigir essa coleta para fabricar cobertura.

**PRINT:** URL real em `www.first-party.site`, resumo/detalhes de uma API DDG + storage/origem/frame do Privacy Lens; detalhe complementar de partitionKey quando pertinente.

**Nome do arquivo:** `ddg-storage-partitioning-plugin.png`

**Pasta:** `evidencias/duckduckgo/storage-partitioning/`

**JSON:** `ddg-storage-partitioning-relatorio.json`, junto ao download DDG.

## 6 — Bounce Tracking

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 6 — Conceito B

**Nome:** Bounce Tracking

**URL exata inicial:** https://privacy-test-pages.site/privacy-protections/bounce-tracking/

**Link escolhido na página:** https://bad.third-party.site/privacy-protections/bounce-tracking/bounce.html?destination=privacy-test-pages.site

**Preparação:** nova aba; manter a mesma aba em todos os passos. Para distinguir geração/reutilização, usar perfil de laboratório sem dados prévios de `bad.third-party.site` ou registrar que já havia dados. Não limpar cookies/storage nem recarregar a extensão entre as duas passagens. Somente Privacy Lens; políticas atuais preservadas.

**Ação:** clicar **Go to privacy-test-pages.site** no índice do teste. Aguardar o retorno. Atualizar/exportar/capturar primeira passagem. Sem limpar dados, clicar novamente nesse link e guardar uma segunda medição. Preferir esse destino inicial: `bad.third-party.site` e `good.third-party.site` são hosts distintos da mesma organização pela PSL; o controle de retorno ao índice evita confundir hostname com site registrável.

**Esperar:** retorno ao destino, mensagem DDG aparecer + **2 s**. Se o intermediário parar ou a navegação falhar, registrar URL/erro e não completar mentalmente a cadeia.

**Resultado esperado segundo a própria página DDG:** o intermediário tenta passar seus IDs ao destino pela URL. O destino informa geração de ID quando ainda não existia ou mostra IDs recuperados de cookie/localStorage. A primeira geração pode retornar campos de UID vazios; a segunda passagem exercita reutilização se o navegador conservou os dados. Não há um placar universal de bloqueio. [Página oficial](https://privacy-test-pages.site/privacy-protections/bounce-tracking/); [código do intermediário](https://privacy-test-pages.site/privacy-protections/bounce-tracking/bounce.html).

**Privacy Lens:** **Tracking avançado → Bounce tracking**, rota `privacy-test-pages.site → bad.third-party.site → privacy-test-pages.site`, timestamps, passagem ≤10 s, parâmetros e classificação. Quando Firefox omitir a flag de redirect JS, pode mostrar `client-redirect-inferred`, confiança baixa: iniciador do documento + passagem curta + identificador, sem comprovar automatismo. A primeira passagem sem ID/evidência adicional pode ser insuficiente; não inventar cookie bem-sucedido. IDs numéricos curtos DDG podem sustentar sinal pelo nome sem produzir igualdade HMAC/cookie sync (mínimo 8 caracteres).

**O que registrar:** mensagem DDG por passagem; cadeia e classificação do plugin; requests/domínios/parâmetros e motivos. Login/pagamento/cliques rápidos são alternativas legítimas. `Set-Cookie` não é prova de gravação, e o detector não compara o valor do cookie ao valor da URL. A privacidade da navegação pode causar nova geração a cada passagem: registrar o que ocorreu.

**PRINT:** URL/título/mensagem do destino DDG + sequência de três domínios, classificação e motivo no plugin. O relatório identifica também as URLs intermediárias reduzidas.

**Nomes dos arquivos:** `ddg-bounce-tracking-primeira-plugin.png` e `ddg-bounce-tracking-repeticao-plugin.png`

**Pasta:** `evidencias/duckduckgo/bounce-tracking/`

**JSONs:** mesmos prefixos, terminando em `-relatorio.json`.

## 7 — Query Parameters

==================================================
PRINT OBRIGATÓRIO PARA ENTREGA
==================================================

**Teste:** 7 — Conceito B

**Nome:** Query Parameters

**URL exata inicial:** https://privacy-test-pages.site/privacy-protections/query-parameters/

**Preparação:** nova aba; não precisa limpar storage. Somente Privacy Lens, ETP e regras de limpeza de URLs registradas e inalteradas. Não recarregar a extensão entre índice e destino. Fazer um caso por vez, na mesma aba; retornar ao índice digitando sua URL, sem BFCache/Voltar.

**Ação:** clicar cada um dos quatro links do índice, na ordem. No destino, registrar **Results**, Atualizar Privacy Lens, abrir **Tracking avançado → Parâmetros**, exportar/capturar antes de retornar ao índice. Não colar direto a URL de destino para substituir o clique: a página testa o fluxo de links.

| Caso | URL original do link | Expected listado no índice |
|---|---|---|
| 1 | https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?utm_source=something&q=other | `q=other` |
| 2 | https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?utm_source=something&utm_medium=somethingelse | string vazia |
| 3 | https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?fbclid=12345&fb_source=someting&u=14 | `u=14` |
| 4 — controle | https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?q=something&id=1234 | `q=something&id=1234` |

**Esperar:** Results renderizado + **2 s** em cada destino.

**Resultado esperado segundo a própria página DDG:** Results deve coincidir com Expected de cada link, avaliando remoção seletiva. Os valores da tabela são os exemplos públicos da página, não resultados obtidos nesta execução. [Página oficial](https://privacy-test-pages.site/privacy-protections/query-parameters/).

**Privacy Lens:** sinais potenciais de campanha/clique (`utm_source`, `utm_medium`, `fbclid`, `fb_source`) quando efetivamente chegaram na request. Controle `q`/`id=1234` não deve gerar sinal. O plugin não remove parâmetros. Se outra proteção os remover antes de webRequest, sua ausência é compatível com visibilidade parcial; conferir a URL final e Results. Os IDs curtos do teste não exigem nem comprovam cookie sync.

**O que registrar:** Expected original, Results atual, parâmetros observados e motivo no plugin por caso. Divergência de remoção pode ser documentada concretamente: Results ainda contém `utm_source`, requestId correspondente contém esse nome, Privacy Lens apenas o sinalizou. Nunca preencher “bloqueado/removido pelo Privacy Lens”.

**PRINT:** URL final + Results e seção de parâmetros do plugin; captura complementar do índice com o Expected usado.

**Nomes dos arquivos:** `ddg-query-parameters-01-plugin.png`, `ddg-query-parameters-02-plugin.png`, `ddg-query-parameters-03-plugin.png`, `ddg-query-parameters-04-plugin.png`

**Pasta:** `evidencias/duckduckgo/query-parameters/`

**JSONs:** mesmos prefixos, terminando em `-relatorio.json`.

## Preenchimento e divergências

Usar [RESULTADOS.md](../evidencias/duckduckgo/RESULTADOS.md), uma linha por caso/API/configuração documentada. Toda divergência deve citar uma observação verificável: requestId + URL reduzida + tipo/erro; redirect com timestamps; cookie com domínio/path/store/partitionKey; snapshot com origem/frame/top site; parâmetro e motivo; ou a lacuna concreta de cobertura. A frase “metodologias diferentes”, sozinha, não explica o resultado.

Fontes consultadas somente para preparar o procedimento: [índice oficial](https://privacy-test-pages.site/), [repositório DDG](https://github.com/duckduckgo/privacy-test-pages), páginas e scripts vinculados acima. Reconfirmar botões/mensagens durante a execução se o site mudar. O PDF exige prints do plugin e resultados reportados pelas próprias páginas; a leitura do código não substitui essa execução.
