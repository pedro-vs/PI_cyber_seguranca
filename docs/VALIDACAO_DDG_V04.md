# Roteiro manual DDG — Privacy Lens 0.4.0

Preparação documental conferida em **28/09/2026**. PDF da avaliação relido: pp. 2–3 exigem comparação por teste, explicação concreta de divergências e print do plugin em execução na página; Tracker Reporting, Storage Blocking e Canvas integram C, e os outros quatro integram B. Esta execução prepara evidências; não implementa Conceito A nem conclui os demais entregáveis da avaliação.

**Nenhum teste oficial foi executado no Firefox pelo agente.** O usuário informou as execuções manuais dos Testes 1–7; os dados estão registrados, com conferência dos arquivos de evidência ainda pendente. No Teste 2, o snapshot principal permaneceu anterior à gravação, enquanto o DDG recuperou 855. No Teste 3, o indicador de Canvas e a falha de desempenho DDG têm concordância parcial/complementar; a cobertura foi parcial por 85 amostras fora do limite. No Teste 4, carregamentos HTTP 200 e o erro WebSocket têm concordância alta/total nos mecanismos observados, sem atribuição de bloqueio. No Teste 5, o plugin confirmou storage same-site 1/1/1, sem agregar a auxiliar cross-site: concordância parcial / cobertura limitada, sem demonstrar particionamento pelo plugin. No Teste 6, ambas as passagens recuperaram IDs 95 e mostraram indicador de bounce, Cookie sync 0 e 2 sinais de parâmetros, sem omissões/falhas/pendências em Tracking avançado relatadas. Nenhum código foi alterado. O Teste 7 foi concluído conforme relato: sinais 1/2/2/0, divergência de remoção nos casos 01–03 e controle sem falso positivo. Este roteiro preserva o protocolo da v0.4.0; Conceito A foi autorizado posteriormente, em [CONCEITO_A.md](CONCEITO_A.md).

## Verificação das sete URLs e variantes

Referências: [repositório oficial](https://github.com/duckduckgo/privacy-test-pages), [índice publicado](https://privacy-test-pages.site/) e [índice no commit consultado](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/index.html). HEAD oficial consultado: `e45b65aa6185710a1a1c7d6ee930856e051e8139` (04/09/2026). Os HTMLs selecionados responderam HTTP 200 e coincidem com essa revisão; a URL final de Storage Partitioning também respondeu 200. A disponibilidade dos recursos terceiros e os resultados no navegador continuam pendentes.

| Requisito do PDF | Página oficial selecionada | Variante e critério de escolha |
|---|---|---|
| Tracker Reporting | [1 major tracker via script](https://privacy-test-pages.site/tracker-reporting/1major-via-script.html) | Um script/um domínio; variantes img, fetch, fragmento e surrogate são adicionais. |
| Storage Blocking | [Storage blocking](https://privacy-test-pages.site/privacy-protections/storage-blocking/) | Gravação/recuperação por mecanismo; distinto de particionamento. |
| Fingerprinting / Canvas | [Canvas verification](https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html) | Exercita APIs de canvas; a página geral de fingerprinting tem escopo mais amplo. |
| Tracker Blocking | [Request blocking](https://privacy-test-pages.site/privacy-protections/request-blocking/) | É a entrada chamada Tracker Blocking no índice; request-blocklist e tracker-site-blocking são outros cenários. |
| Storage Partitioning | [Origem correta](https://www.first-party.site/privacy-protections/storage-partitioning/) | O link do índice em privacy-test-pages.site redireciona por JS a www.first-party.site. |
| Bounce Tracking | [Bounce tracking](https://privacy-test-pages.site/privacy-protections/bounce-tracking/) | Retorno a privacy-test-pages.site, primeira passagem e repetição separadas. |
| Query Parameters | [Query parameters](https://privacy-test-pages.site/privacy-protections/query-parameters/) | Quatro links, com Expected próprio; quarto link é controle. |

Fontes de implementação conferidas: [script de Tracker Reporting](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/tracker-reporting/1major-via-script.html), [Storage Blocking](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/main.js), [Canvas](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/fingerprinting/canvas.js), [Tracker Blocking](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/request-blocking/main.js), [origens](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/helpers/common.js) e [validação de particionamento](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/helpers/tests.js), [bounce](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/bounce-tracking/bounce.html), [Expected de queries](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/query-parameters/index.html) e [Results de queries](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/query-parameters/main.js).

## Preparação e registro comuns

- Janela normal, perfil/container identificados; somente Privacy Lens ativa na rodada inicial. Manter e registrar ETP, exceções e preferências alteradas de cookies/fingerprinting. Não alterar proteções para produzir concordância. Rodadas com configurações diferentes exigem registros e arquivos diferentes.
- Confirmar Privacy Lens v0.4.0 antes da navegação; recarregar a extensão somente se necessário e antes de começar. Não recarregar entre hops ou fases de um teste. A janela de eventos de cookies é de 30 s desde a navegação e não reinicia ao clicar Atualizar.
- Os tempos abaixo são limites operacionais do roteiro, não garantias nem resultados do DDG. Operação incompleta permanece inconclusiva; timeout não demonstra bloqueio.
- Cada linha/subteste executado precisa de captura manual com a página DDG e o Privacy Lens identificáveis. Usar Abrir relatório vinculado à aba original, movê-lo para outra janela e capturar ambas lado a lado. Imagem só da página DDG, relatório sem contexto e print de fixture não atendem a esse registro. Detalhes podem precisar de capturas complementares.
- Salvar JSON do plugin e download DDG quando disponível. Os caminhos são planejados; não representam arquivos existentes. Usar sufixos `-r1`, `-r2` se já houver arquivos; não sobrescrever uma execução.
- [RESULTADOS.md](../evidencias/duckduckgo/RESULTADOS.md) separa esperados documentais, relatos manuais dos Testes 1–7 e resultados registrados dos quatro casos do Teste 7. O `REGISTRO.md` em cada pasta recebe os resultados reais durante a execução. Registrar tanto o esperado quanto o texto/estado efetivamente exibido pelo DDG.

<a id="teste-1"></a>
## TESTE 1 — Tracker Reporting

**URL oficial:**

https://privacy-test-pages.site/tracker-reporting/1major-via-script.html

Variante escolhida: **1 major tracker loaded via script**. O PDF exige a categoria Tracker Reporting, sem impor todas as variantes. Esta isola um domínio e um tipo de recurso; imagem, fetch, fragmento e surrogate são controles adicionais e precisam de linhas/prints próprios se executados.

**Objetivo do DDG:**

Exercitar o relatório de um rastreador conhecido incluído por script de terceira parte.

**Resultado esperado segundo o DDG:**

A página anuncia a inclusão de um rastreador por script. O [HTML oficial](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/tracker-reporting/1major-via-script.html) contém `//doubleclick.net/tracker.js`, resolvido para `https://doubleclick.net/tracker.js` ao abrir por HTTPS. É uma tentativa programada, sem garantia de carregamento/HTTP 200. Não existe placar automático. Um eventual status de erro deve ser registrado, sem atribuir automaticamente sua causa ao Firefox.

**Preparação:**

- Nova aba normal no Firefox 156.0.1; feche duplicatas deste teste. Não é necessário limpar cookies/storage.
- Privacy Lens v0.4.0 carregada antes da navegação. Se já estiver carregada nesta versão, não recarregue; se precisar, faça isso antes de abrir o teste, nunca durante a coleta.
- Perfil de teste com somente Privacy Lens ativa. Mantenha a proteção atual do Firefox; registre ETP Padrão/Estrito/Personalizado, escudo/exceção do site e qualquer proteção externa. Não desative proteções para obter o resultado desejado.
- Registre data/hora/fuso, versões, perfil/container e condição do cache. Use carregamento normal; ainda não execute os outros testes.

**Passos:**

1. Abra a URL oficial acima na nova aba. Aguarde conforme o campo Esperar.
2. Abra Privacy Lens → Atualizar → Rede → Requisições, redirects e erros observados. Procure `doubleclick.net` e `https://doubleclick.net/tracker.js`; registre também se não aparecerem.
3. Clique Abrir relatório. Mova apenas essa aba de relatório para outra janela do Firefox; deixe a página DDG aberta e coloque as duas janelas lado a lado. O relatório deve continuar vinculado à aba DDG original.
4. Atualize o relatório e deixe visíveis o domínio analisado e os dados da request. Capture manualmente o print especificado abaixo. Se precisar de mais espaço, guarde também um print complementar dos detalhes.
5. Use Exportar JSON e salve como `ddg-tracker-reporting-relatorio.json` na mesma pasta. Preencha apenas o Teste 1; envie o print, o JSON e a configuração observada antes de continuarmos.


**Esperar:**

Término do carregamento + **5 s**. Se a request continuar sem conclusão observada, esperar até **30 s desde a navegação**, atualizar e registrar esse estado.

**Na página DDG:**

- No texto central da página, a mensagem **1 major tracker loaded via script src**. Não há botão Start nem placar pass/fail; o recurso incluído está no HTML oficial.

**No Privacy Lens:**

- Rede, domínio terceiro, requestId, tipo `script`, estado, status HTTP/erro; JSON `network.requests`. O plugin não possui catálogo para afirmar que todo terceiro é rastreador.
- A observação real fica **PENDENTE** até a execução. Não substituir seção indisponível por zero nem exigir totais absolutos sem conferir as requests/frames efetivamente presentes.

**Registrar:**

- Resultado esperado documental e texto/estado real DDG; resultado Privacy Lens; concordância **total/parcial/não**; divergência concreta e explicação apoiada nos dados. Se os dados não permitirem avaliar concordância, registrar **não avaliável** e a lacuna, sem converter isso em sucesso.
- Anúncio da página; presença/ausência da tentativa no plugin; estado concreto da request; concordância sobre domínio/tipo. Uma tentativa registrada com erro pode concordar com a inclusão programada do script: o DDG não promete carregamento bem-sucedido. Se houver divergência, conferir DevTools → Rede e registrar recurso/erro, sem atribuir ausência automaticamente a bloqueio. Se precisar recarregar para obter dados de rede, salvar primeiro a evidência atual e registrar a recarga como nova execução.
- Data/hora/fuso, configuração, URL inicial/final, tempo de espera e nomes do print/JSON; usar o [registro deste teste](../evidencias/duckduckgo/tracker-reporting/REGISTRO.md).

**PRINT OBRIGATÓRIO PARA ENTREGA:**

- endereço e anúncio DDG + Privacy Lens mostrando domínio e request relevante, incluindo erro/status se houver. Usar **Abrir relatório** ao lado da página DDG original, em uma captura manual com contexto. Se os detalhes não couberem, acrescentar captura complementar sem substituir a principal.

**Nome:**

`ddg-tracker-reporting-plugin.png`

**Pasta:**

`evidencias/duckduckgo/tracker-reporting/`

JSON de apoio: `ddg-tracker-reporting-relatorio.json`.

<a id="teste-2"></a>
## TESTE 2 — Storage Blocking

**URL oficial:**

https://privacy-test-pages.site/privacy-protections/storage-blocking/

Reconferida no índice e código oficiais em 28/09/2026; HTTP 200, HTML publicado igual ao commit `e45b65aa6185710a1a1c7d6ee930856e051e8139`. Não usar a página de Storage Partitioning para esta execução.

**Objetivo do DDG:**

Tentar gravar e recuperar um número controlado por vários mecanismos, na página principal e em iframes terceiros, permitindo observar quais operações funcionam ou falham na configuração testada.

**Resultado esperado segundo o DDG:**

Onde gravação e acesso funcionarem, Retrieve data deve recuperar o número usado por Store data. O código usa a chave `data` em localStorage/sessionStorage e um banco IndexedDB chamado `data`. A página apresenta valores/erros por mecanismo e origem; não determina que tudo deve ser bloqueado. Um OK na fase Store não substitui a verificação de leitura, especialmente nos cookies, cuja escrita pode ser ignorada sem exceção.

Origem desse esperado:

- [Texto da página](https://privacy-test-pages.site/privacy-protections/storage-blocking/): explica a tentativa de gravar e recuperar um número pelos mecanismos do navegador.
- [Código dos mecanismos](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/helpers/commonTests.js): operações de escrita/leitura de cookies, localStorage, sessionStorage e IndexedDB. [Código dos iframes](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/iframe.js): retorna resultado ou erro de cada operação.
- [Controlador da página](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/main.js): fases Store/Retrieve, detalhes, download e remoção dos iframes após resposta. O download pode ficar habilitado antes de terminarem as promessas; esperar as linhas estabilizarem.
- [README oficial](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/README.md): identifica o site publicado e o uso das instruções/botões/resultados. Não estabelece uma aprovação universal para Firefox ou Privacy Lens.

Distinções para interpretar a medição:

| Observação | Conclusão permitida |
|---|---|
| Store seguido de Retrieve devolvendo o número do teste | Gravação recuperável naquele mecanismo/contexto; para dizer criado agora, conferir também o estado anterior. |
| Privacy Lens mostra `observed` e contagem positiva | Há chaves/bancos visíveis ao coletor naquele frame; não prova quando foram criados nem qual valor contêm. |
| Privacy Lens mostra `observed` e zero | Consulta respondeu com zero itens visíveis naquele contexto/instante; não comprova bloqueio nem ausência em outras partições. |
| `unavailable`, `unsupported` ou sem snapshot/frame | Acesso/coleta/API indisponível; não significa storage inexistente. Registrar motivo e cobertura. |
| Erro ou timeout no DDG | A operação não foi confirmada; preservar o erro específico. Só atribuir bloqueio/autor quando houver evidência da operação/política, não pelo zero do plugin. |

**Preparação:**

- Nova aba em janela normal do Firefox 156.0.1; manter a mesma aba e container entre Store e Retrieve. Fechar duplicatas deste teste.
- Nesta rodada, **não limpar cookies/storage**: registrar o baseline antes de Store. Dados prévios não impedem observar a nova escrita/leitura, mas impedem presumir criação inédita apenas por contagem. Nunca limpar entre as fases.
- Privacy Lens v0.4.0 já carregada antes da navegação; não recarregar a extensão nem a página durante o fluxo. Somente Privacy Lens ativa no perfil de teste.
- Manter a configuração do Teste 1. Registrar o modo ETP real — Padrão/Estrito/Personalizado —, escudo/exceções, preferências alteradas e outras proteções. Não assumir o modo que foi usado nem desligar proteções para buscar concordância.
- Manter cache normal. Não usar parâmetros `store`, `retrive` ou `timeout` na URL, nem executar funções pelo Console nesta primeira rodada.

**Passos manuais:**

1. Abra a URL. Antes de Store, abra Privacy Lens → Atualizar → Armazenamento HTML5 e anote o baseline por origem/frame, status e contagens. Não execute Retrieve antes de Store: a rotina de IndexedDB pode abrir/criar o banco durante a própria leitura.
2. Feche o popup ou volte à aba DDG original. Clique Store data uma vez. Aguarde, clique no resumo para expandir os detalhes e anote o número controlado e os resultados/erros por mecanismo, inclusive nos grupos de iframe.
3. Antes de Retrieve, atualize o Privacy Lens e anote os snapshots após Store. Preserve o texto/erros da fase de gravação, pois Retrieve substitui a lista. Se houver falha relevante, fotografe manualmente essa fase em captura adicional identificada e/ou exporte `ddg-storage-blocking-store-relatorio.json`.
4. Na mesma aba DDG, clique Retrieve data uma vez. Aguarde estabilizar, abra os detalhes e compare localStorage/sessionStorage/IndexedDB com o número anotado. Registre erros literalmente, sem transformá-los em bloqueio confirmado.
5. Clique Download the result somente após estabilização; salve `storage-blocking-results.json`. O botão habilitado sozinho não significa que todas as operações terminaram. O arquivo exporta resultados de recuperação; preserve também as mensagens visíveis, pois nem todo erro aninhado fica completo no download.
6. Abra Privacy Lens → Atualizar → Abrir relatório. Mova apenas o relatório para outra janela e posicione-o ao lado da DDG original. Atualize o relatório, abra Armazenamento HTML5 e capture o print principal/complementar definidos abaixo.
7. Exporte `ddg-storage-blocking-relatorio.json`. Preencha o registro por mecanismo/origem e envie print(s), JSON do plugin, download DDG e configuração. Pare no Teste 2.

**Esperar:**

Depois de Store e depois de Retrieve: aguarde as linhas estabilizarem e mais **2 s**; use **até 30 s por fase** como limite operacional. O próprio DDG usa um timeout padrão de **1 s após load do iframe**: se ele mostrar timeout, anote-o, sem mudar esse parâmetro. Algumas linhas podem manter reticências com valor vazio; anote o texto e o JSON em vez de presumir atividade ou sucesso. Se o fluxo não concluir, registre tempo/etapa e resultado inconclusivo. [Controlador oficial](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/main.js).

A janela de 30 s do Privacy Lens aplica-se a eventos de cookies desde o main_frame; não é limite do teste de storage. Se Store acontecer depois dela, ausência de evento de cookie é uma limitação temporal, não bloqueio.

**Na página DDG:**

- Identificação Storage Blocking Test Page, botões Store data / Retrieve data e resumos de gravação/recuperação. Clicar no resumo abre os detalhes.
- Linhas localStorage, sessionStorage e IndexedDB no documento principal e dentro de `safe third party iframe`, `tracking third party iframe` e `ad third party iframe`. Registrar valor/erro por linha, não apenas o total do resumo.
- APIs não suportadas, erros de cookies, cache, service workers ou WebSQL não devem ser automaticamente atribuídos a bloqueio de localStorage/IndexedDB. Esses mecanismos têm coberturas diferentes no plugin.

**No Privacy Lens:**

Abrir **Armazenamento HTML5** e comparar os contextos definidos nas [origens oficiais](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/helpers/globals.js):

| Contexto a procurar | Origem |
|---|---|
| Documento principal, `top-level`, primeira parte | `https://privacy-test-pages.site` |
| Iframe safe, `embedded`, terceira parte | `https://good.third-party.site` |
| Iframe tracking, `embedded`, terceira parte | `https://broken.third-party.site` |
| Iframe ad, `embedded`, terceira parte | `https://convert.ad-company.site` |

- Anotar frameId, origem, top site, horário da coleta e se o frame está presente, removido (snapshot anterior) ou não verificado. Store e Retrieve criam frames diferentes; não presumir frameId fixo nem somar snapshots da mesma origem como dados distintos.
- localStorage/sessionStorage: **número de chaves** e status/motivo. IndexedDB: **número de bancos**, não registros nem o número aleatório do DDG. Comparar baseline, após Store e após Retrieve; não definir contagens fixas antecipadamente.
- O [controlador DDG](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/main.js) remove iframes ao receber a resposta; a coleta de um terceiro pode faltar ou ser anterior à escrita. Não abrir a origem terceira diretamente para substituir esse contexto, pois muda o top site.
- **Rede:** procurar requests `sub_frame` para `/privacy-protections/storage-blocking/iframe.html`, frameId/requestId, estado, HTTP, erro e horários. Falha ou cancelamento não identifica automaticamente a proteção responsável.
- **Cookies:** quando a divergência envolver cookies, registrar nome, domínio/path, sessão/persistente, store, eventos e partitionKey quando informada. Set-Cookie não comprova aceite; partitionKey não comprova particionamento HTML5.
- Scripts externos executados no documento principal podem gravar cookies desse documento: a origem do arquivo JS não os transforma automaticamente em cookies do domínio terceiro. O [script DDG](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-blocking/3rdparty.js) usa document.cookie no contexto em que executa.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

Usar **Abrir relatório** em outra janela, lado a lado com a aba DDG original. Fazer uma única captura manual das duas janelas, sem montagem. Deixar visíveis:

- Barra de endereço DDG e identificação Storage Blocking Test Page.
- Resumo/detalhes após Retrieve data, especialmente as linhas HTML5 comparadas.
- Privacy Lens identificado para a página DDG, seção Armazenamento HTML5, origem/frame relevante, contexto top-level/embedded e primeira/terceira parte, localStorage/sessionStorage/IndexedDB e condição do snapshot.

Priorizar o documento principal no print principal e os grupos terceiros no complementar. Se um frame não tiver sido coletado, documentar essa ausência; não produzir artificialmente a linha. Não substituir a captura com contexto por uma imagem só do JSON ou só do DDG.

**Nome principal:**

`ddg-storage-blocking-plugin.png`

**PRINT COMPLEMENTAR:**

`ddg-storage-blocking-detalhes.png` — outros frames, erros ou linhas DDG que não couberam. Se forem necessárias mais imagens, acrescentar sufixos sem sobrescrever. Uma captura adicional da fase Store deve ter nome próprio, por exemplo `ddg-storage-blocking-store.png`.

**Pasta:**

`evidencias/duckduckgo/storage-blocking/`

**Exportar:**

Sim: `ddg-storage-blocking-relatorio.json` pelo Privacy Lens e `storage-blocking-results.json` pela página DDG, ambos na pasta acima. São documentos diferentes. O JSON do plugin não inclui valores armazenados; anotar o número controlado e os resultados reais na página DDG.

**Registro em RESULTADOS.md:**

- Esperado documental: gravação seguida de recuperação do número quando mecanismo/acesso funcionarem; observar valores/erros por origem, sem bloqueio universal presumido.
- Resultado Privacy Lens: **PENDENTE**, preencher após execução por frame/API com status e contagens.
- Concordância total/parcial/não: **PENDENTE**; se faltarem dados, não avaliável com lacuna concreta.
- Divergência: **PENDENTE**; comparar a mesma API/origem/fase, incluindo horário do snapshot.
- Explicação técnica: **PENDENTE**; referenciar snapshot/request/cookie ou indicar que precisamos de mais dados.
- Evidência: nomes planejados dos dois prints, JSON do plugin e download DDG; só declarar capturado após a captura real.

Usar o [REGISTRO.md do teste](../evidencias/duckduckgo/storage-blocking/REGISTRO.md) para baseline, Store, Retrieve e contexto. DDG com erro + Privacy Lens com zero não confirma bloqueio: pode haver contexto vazio, acesso negado, frame removido, estado particionado ou coleta parcial. Contagens, isoladamente, não distinguem essas causas.

<a id="teste-3"></a>
## TESTE 3 — Fingerprinting / Canvas

**URL oficial:**

https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html

Página e JavaScript reconferidos em 28/09/2026: HTTP 200 e conteúdo igual à revisão oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`. Esta é a variante **Fingerprinting canvas verification** do índice DDG; a página geral de fingerprinting e Canvas draw são controles distintos, não executados nesta rodada.

**Objetivo do DDG:**

Verificar comportamento das operações canvas por asserções de resistência, desempenho e correção. Comparar depois as APIs exercitadas com o indicador observacional do Privacy Lens.

**Resultado esperado segundo o DDG:**

A tabela Status / Notes mostra pass/fail por asserção, agrupada por check. O código inclui resistência a comparações entre canvases, limites de duração e conversões/renderizações esperadas; não é um placar “tracker presente/ausente”. Por exemplo, layering comparison exige alterações em mais de 20% dos pixels elegíveis, além de verificações de consistência. Cada falha deve ser interpretada pela nota específica, sem pressupor que Firefox 156.0.1 aprovará todas as asserções. Não alterar proteções para buscar aprovação.

Fontes: [texto da página](https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html), [código dos checks](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/fingerprinting/canvas.js) e [rotina de desenho](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/fingerprinting/helpers/canvas.js). O [README](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/README.md) identifica o site publicado; nesta variante o código inicia automaticamente, sem botão Start. A página contém tabela e menu para outros hosts, sem botão próprio de download de resultados.

**Preparação:**

- Nova aba em janela normal do Firefox 156.0.1, mesmo perfil/container da rodada. Não é necessário limpar cookies/storage.
- Privacy Lens v0.4.0 carregada **antes** de abrir a URL. Não recarregar a extensão durante o teste; não tentar um baseline na própria página antes de as chamadas começarem, pois o teste é automático.
- Somente Privacy Lens ativa. Manter e registrar ETP Padrão/Estrito/Personalizado, exceções e preferências de fingerprinting alteradas; não alterar resistFingerprinting, randomização ou proteções para fazer os checks passarem.
- Fechar outras execuções pesadas da fixture/teste. Não mudar de host pelo menu, não clicar Canvas drawing e não abrir outra variante nesta rodada.

**Passos manuais:**

1. Abra a URL oficial na nova aba. Os checks começam automaticamente cerca de 1 s após DOMContentLoaded. Mantenha essa aba em primeiro plano até estabilizar a tabela; não recarregue durante a execução.
2. Aguarde conforme Esperar. Registre categorias/checks, Status e Notes, especialmente cada fail; preserve números de tempo e mensagens. Categoria não é uma asserção: não contar os títulos como pass/fail.
3. Abra Privacy Lens → Atualizar → **Canvas → Ver sequência e APIs observadas**. Anote classificação, contagens, APIs, frame, exceções e cobertura. Não preencha resultado esperado do plugin como resultado observado.
4. Use **Abrir relatório**, mova apenas o relatório para outra janela e posicione-o ao lado da página DDG original. Atualize e capture print principal/complementar conforme abaixo.
5. Exporte `ddg-fingerprinting-canvas-relatorio.json`. Anote os resultados DDG no registro e envie print(s), JSON, configuração e eventual falha/inconclusão. Pare neste teste, sem modificar o detector.

**Esperar:**

Aguardar a tabela completar e ficar estável por **5 s**, reservando até **60 s**. Estabilidade visual sozinha não comprova conclusão: uma operação assíncrona pode ter parado. Se necessário, consultar no Console **da aba DDG** a expressão somente de leitura `({complete: results.complete, didFail: results.didFail, failures: results.fails.length})`. Não chamar init(), não reiniciar os testes nem modificar flags. Se complete não for true, houver erro ou a página não responder em 60 s, registrar execução inconclusiva/tempo e preservar a evidência.

O código tem oito checks, cada um podendo produzir várias linhas de asserção. Não confundir número de checks com número de passes/falhas. O limite de 60 s é operacional do roteiro, não critério oficial de aprovação.

**Na página DDG:**

- URL `/fingerprinting/canvas.html`, identificação Fingerprinting Test Page, texto sobre canvas e tabela Status / Notes.
- Categorias resistance/performance/correctness e seus checks. Registrar pass/fail e nota literal; não inferir bloqueio, ausência de chamadas ou aprovação do Privacy Lens a partir da cor DDG.
- Nas falhas, distinguir nota de resistência a pixels, tempo acima do limite, conversão inesperada e exceção/recurso ausente. Dependências como seedrandom e scripts da página podem falhar; nesses casos guardar Rede/Console concretos antes de atribuir causa.

**No Privacy Lens:**

- Classificação exibida em Canvas: indicador, somente uso/leitura, nenhuma chamada observada ou indisponível; registrar o texto efetivo.
- Desenhos, leituras/exportações, exceções, canvas com indício e APIs observadas. O código DDG exercita getImageData/toDataURL e operações como putImageData/fillRect/fillText; não exigir que todas as APIs instrumentadas apareçam ou que toBlob tenha contagem positiva.
- Nos detalhes: frameId/URL, canvasId, dimensões, método de desenho precedente, método de leitura, intervalo drawToReadMs, correlated e outcome/exceção. O critério atual é desenho seguido de leitura/exportação no mesmo canvas em até **5 s**, respeitando tamanho e resultado da chamada.
- Cobertura: métodos instalados/falhos/ausentes/substituídos e eventos/amostras omitidos. Existem limites de **100 canvases, 20.000 eventos e 40 amostras por frame**. Uma amostra ausente após truncamento não significa que a API nunca foi chamada; os limites podem afetar completude das contagens.
- O detector não lê pixels nem confirma randomização, unicidade de fingerprint, desempenho DDG, intenção de rastrear ou proteção do Firefox. Instrumentação pode acrescentar custo às chamadas; uma falha de desempenho, isoladamente, não identifica a causa. toBlob registra solicitação, não o sucesso do callback. Workers/OffscreenCanvas/WebGL não são cobertos.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

Fazer captura manual das duas janelas lado a lado, sem montagem, mostrando:

- Página DDG original, barra de endereço, identificação e tabela Status / Notes com ao menos os checks comparados.
- Privacy Lens identificado para a mesma URL, seção Canvas, classificação, contagens e APIs.
- Sempre que couber, uma sequência no mesmo canvas com desenho precedente, leitura e intervalo; usar o complementar para isso se necessário.

**Nome principal:**

`ddg-fingerprinting-canvas-plugin.png`

**PRINT COMPLEMENTAR:**

`ddg-fingerprinting-canvas-detalhes.png` — detalhes da sequência/frame/cobertura ou notas de falha DDG que não couberem. Para comparar mais linhas, acrescentar capturas com sufixos e manter referência a elas no registro; não reutilizar um print que não mostre o check discutido.

**Pasta:**

`evidencias/duckduckgo/fingerprinting-canvas/`

**Exportar:**

Sim: `ddg-fingerprinting-canvas-relatorio.json` pelo Privacy Lens. A variante canvas.html não oferece botão Download próprio; não inventar uma exportação DDG. Preservar Status / Notes pelos prints e registro. A consulta opcional de complete/didFail/failures apenas auxilia o registro e não substitui a captura obrigatória.

**Registrar:**

No [REGISTRO.md deste teste](../evidencias/duckduckgo/fingerprinting-canvas/REGISTRO.md) e em RESULTADOS.md: esperado documental por check; status/nota real DDG; resultado Privacy Lens; concordância total/parcial/não (ou não avaliável, explicando cobertura); divergência concreta; explicação por API/frame/intervalo/exceção/limite; evidência correspondente. **Tudo observado permanece PENDENTE até a execução.**

Pass DDG e indicador do plugin podem coexistir: um avalia asserções do teste, outro uma sequência de chamadas. Fail DDG e indicador também podem coexistir. Explicar com a operação, nota e sequência concretas; a frase genérica “metodologias diferentes” não substitui os dados.

<a id="teste-4"></a>
## TESTE 4 — Tracker Blocking

**URL oficial:**

https://privacy-test-pages.site/privacy-protections/request-blocking/

O índice chama esta URL de **Tracker Blocking**. `/privacy-protections/request-blocklist/` testa regras da configuração DDG; `/tracker-site-blocking/` é outro cenário por site. Usar a URL acima, sem `?run`, para iniciar manualmente.

**Verificação documental:**

Página, `main.js`, CSS e helpers de frames/workers reconferidos em **29/09/2026**: HTTP 200 e conteúdo igual ao commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`. Isso confirma o procedimento publicado, não execução no Firefox nem disponibilidade dos recursos de terceiros. Fontes: [página oficial](https://privacy-test-pages.site/privacy-protections/request-blocking/), [HTML](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/request-blocking/index.html) e [código do teste](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/request-blocking/main.js).

**Objetivo do DDG:**

Exercitar diferentes mecanismos de requisição contra um domínio configurado como bloqueável para avaliar uma solução de bloqueio.

**Resultado esperado segundo o DDG:**

A página pede que `bad.third-party.site` esteja na blocklist da solução avaliada. Com uma regra efetiva, os recursos abrangidos não devem ser carregados com sucesso. A legenda separa carregamento, ausência de carregamento e falha; o bloqueio é apenas uma causa possível de falha.

O código define 23 casos em HTML/CSS/JS/Other. Cada caso começa em `not loaded` e pode mudar para `loaded` ou `failed` conforme seu critério; alguns verificam callback/conteúdo/dimensões, outros dependem de mensagens ou Resource Timing. O download é habilitado no início e não comprova conclusão. Um `not loaded` persistente não demonstra bloqueio.

Nesta rodada, **Privacy Lens v0.4.0 apenas observa**: não fornece a regra solicitada pelo DDG. Manter as proteções existentes e registrar o resultado real; não esperar bloqueio universal nem avaliar o plugin como se fosse um bloqueador.

**Preparação:**

- Firefox 156.0.1, janela normal e nova aba; fechar duplicatas do Teste 4. Confirmar Privacy Lens v0.4.0 antes de abrir a URL. Se já carregada, não recarregar a extensão.
- Não é necessária limpeza de cookies/storage. Registrar perfil/container, cache/dados prévios, data/hora/fuso e eventual execução anterior desta página com service worker. Não limpar dados, trocar proteções ou recarregar no meio da rodada.
- Somente Privacy Lens ativa na configuração combinada. Manter e anotar ETP Padrão/Estrito/Personalizado e exceção/escudo do site. Se houver outra proteção, registrar nome/regra real; não acrescentar um bloqueador para forçar o esperado.
- As capturas e exportações desta rodada devem se referir à mesma aba DDG. Deixar a página aberta até salvar tudo.

**Passos manuais:**

1. Abra a URL acima na nova aba. Confira o título Request Blocking Test Page e o botão Start the test. Aguarde 5 s para o carregamento inicial; registre a configuração.
2. Clique **Start the test uma vez** e anote o horário. Acompanhe as quatro categorias e siga o tempo de espera abaixo, sem recarregar a página.
3. Registre o estado literal por mecanismo. Posicione o mouse no indicador para ler o tooltip, se necessário. Use **Download the results** para guardar `request-blocking-results.json` após a espera; não trate o botão habilitado como sinal de conclusão.
4. Na aba DDG original, abra **Privacy Lens → Atualizar → Rede → Requisições, redirects e erros observados**. Procure `bad.third-party.site`; registre classificação de terceira parte, totais observados e os detalhes das requests correspondentes.
5. Compare pelo menos `html/script`, `html/img`, `html/iframe`, `css/import` e `js/fetch`, além de todos os mecanismos com divergência ou sem cobertura. As referências abaixo ajudam a localizar cada recurso. O JSON DDG deve preservar todos os casos efetivamente iniciados.
6. Clique **Abrir relatório** a partir da aba DDG. Mova apenas a aba do relatório para outra janela do Firefox. Deixe a página original e o relatório lado a lado; confira que a URL analisada ainda é a desta execução e atualize o relatório.
7. Faça manualmente as capturas indicadas abaixo. Exporte o JSON do Privacy Lens e salve os arquivos na pasta do Teste 4. Registre horário de cada coleta e eventual mudança de estado entre print e exportação.
8. Preencha somente o Teste 4 com estados reais, correspondências e limitações. Pare após entregar as evidências desta rodada.

**Esperar:**

Após clicar Start, aguardar estados sem mudança por **5 s**, com limite operacional de **30 s após o clique**. Se houver `not loaded` ou request ainda `observed` no limite, guardar esse estado e o tempo decorrido. Não existe sinal global de conclusão neste runner; tempo esgotado não é pass, fail de proteção ou prova de bloqueio. Não aplicar a janela de cookies como critério do teste de rede.

**Na página DDG:**

- Categorias **HTML, CSS, JS, Other**, com os nomes dos mecanismos e a legenda.
- Estados literais `loaded`, `not loaded`, `failed`, acessíveis no tooltip e no download.
- No JSON: `page: request-blocking`, `date` e `results[]` com `category`, `id`, `status`. A revisão consultada define 23 casos; quantidade menor merece registro de execução incompleta/erro, sem inventar resultados faltantes.
- O DDG avalia um critério próprio por mecanismo: por exemplo, script depende de callback e fetch depende do conteúdo JSON. Sucesso de transporte no plugin não garante que esse critério tenha sido satisfeito.

**No Privacy Lens:**

Examinar domínio, URL reduzida/path, tipo, requestId, frameId, estado, HTTP, erro e redirects em Rede e em `network.requests` no JSON. O host alvo deve ser classificado como terceira parte quando observado sob `privacy-test-pages.site`.

| Caso DDG | Recurso a procurar no host bad.third-party.site | Tipo de referência |
|---|---|---|
| html / script | `/privacy-protections/request-blocking/block-me/script.js` | script |
| html / img | `/privacy-protections/request-blocking/block-me/img.jpg` | image |
| html / iframe | `/privacy-protections/request-blocking/block-me/frame.html` | sub_frame |
| css / import | `/privacy-protections/request-blocking/block-me/cssImport.css` | stylesheet |
| js / fetch | `/privacy-protections/request-blocking/block-me/fetch.json` | geralmente xmlhttprequest; registrar o tipo real |

Os tipos são referências de localização, não observações desta execução. O mesmo `fetch.json` é usado por helpers de iframe/worker e pelo caso com redirect: path sozinho não identifica qual caso gerou uma request. Usar frame, horário, cadeia e dados disponíveis; se a associação não for inequívoca, registrá-la como não estabelecida.

Não impor um total de 23 requests ao plugin: recursos da página, helpers, redirects e tentativas são registros de rede diferentes dos 23 casos DDG. A interface lista até 200 requests; conferir JSON e cobertura antes de declarar ausência. Requisições sem associação a uma aba, possíveis em workers, podem ficar fora da coleta desta aba; isso não autoriza presumir bloqueio.

Estado `error`, cancelamento, HTTP 404 ou ausência de request não identifica automaticamente uma proteção. `observed` significa sem conclusão observada. Uma seção indisponível deve ser registrada como tal, nunca como zero ou sucesso.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

Captura manual com **URL/título DDG, categoria, mecanismo e resultado visíveis**, ao lado do Privacy Lens mostrando **URL analisada, domínio terceiro e request correspondente com tipo/estado/HTTP/erro**. Usar Abrir relatório em outra janela, preservando a aba DDG original. Não entregar somente o DDG ou somente o plugin.

**Nome principal:**

`ddg-tracker-blocking-plugin.png`

**Pasta:**

`evidencias/duckduckgo/tracker-blocking/`

**PRINT COMPLEMENTAR:**

`ddg-tracker-blocking-detalhes.png` — linhas DDG e requests que não couberem na principal, especialmente divergências, redirects e cobertura. Se necessário, usar sufixos adicionais por categoria/mecanismo para que cada comparação registrada tenha evidência legível; preservar o contexto da mesma página.

**Exportar:**

- Privacy Lens: `ddg-tracker-blocking-relatorio.json`.
- Download the results do DDG: `request-blocking-results.json`.
- Salvar ambos na pasta acima, sem editar os resultados. Usar sufixos em novas rodadas para não sobrescrever.

**Registro:**

No [REGISTRO.md deste teste](../evidencias/duckduckgo/tracker-blocking/REGISTRO.md), anotar por mecanismo: esperado condicionado à regra/configuração, estado real DDG, request correspondente ou ausência, estado/HTTP/erro/frame, concordância total/parcial/não ou não avaliável, divergência e explicação concreta. Preservar também o caso `not loaded` no limite de espera. Registrar data/hora/fuso, versões, ETP/escudo, outras proteções, URL inicial/final, tempo de espera, totais e arquivos.

Se o DDG e o plugin parecerem divergir, conferir se comparam o mesmo recurso e a mesma fase. Uma request `completed` com HTTP 404 pode coexistir com `not loaded`; isso não equivale a bloqueio. Se faltarem dados, indicar quais, sem atribuir causa. Uma nova rodada com DevTools deve preservar primeiro os arquivos atuais e ser identificada separadamente.

<a id="teste-5"></a>
## TESTE 5 — Storage Partitioning

**URL oficial:**

https://www.first-party.site/privacy-protections/storage-partitioning/

A entrada do índice em `https://privacy-test-pages.site/privacy-protections/storage-partitioning/` redireciona por JavaScript, após cerca de 2 s, para a origem acima. Abrir diretamente a URL selecionada, sem `?run`; usar o host esperado pelo teste.

**Verificação documental:**

Em **29/09/2026**, a URL selecionada respondeu HTTP 200; seu HTML, `main.js`, `helpers/common.js`, `helpers/tests.js`, `testPage.js`, `testWindow.html` e helpers de iframe coincidiram com o commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`. Não há README específico nesta pasta. Fontes: [página oficial](https://privacy-test-pages.site/privacy-protections/storage-partitioning/), [fluxo principal](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/main.js), [aba auxiliar](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/testPage.js), [origens](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/helpers/common.js) e [validadores por API](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/storage-partitioning/helpers/tests.js). Esta é verificação documental; nenhum teste foi executado no Firefox pelo agente.

**Objetivo do DDG:**

Comparar armazenamento e outros mecanismos de estado em contextos same-site e cross-site para avaliar isolamento/bloqueio versus compartilhamento, por API.

**Resultado esperado segundo o DDG:**

Registrar o estado literal por API: `pass`, `fail`, `error` ou `unsupported`.

- Para as APIs que usam `validateStorageAPI`, o critério de pass exige recuperar o identificador da execução em same-site e um resultado cross-site consistente diferente dele, com quantidades correspondentes. Recuperar o mesmo identificador nos dois contextos produz fail. Resultados fora dos critérios previstos podem produzir error.
- APIs de cache têm validadores próprios; vários comparam contagens de acesso no servidor. CSS cache e HSTS também têm critérios específicos. Não aplicar a regra de localStorage indiscriminadamente a todas as linhas.
- `unsupported` não significa isolamento demonstrado. A interface usa o mesmo ícone verde para pass e unsupported: sempre preservar o texto.
- Um pass DDG pode corresponder a isolamento ou bloqueio conforme o mecanismo; não prova ação do Privacy Lens nem distingue todas as causas. A rodada registra resultados reais, sem presumir que o Firefox deva apresentar pass em todas as APIs.

**Preparação:**

- Firefox 156.0.1, Privacy Lens v0.4.0 já carregada, janela normal e nova aba. Fechar outras cópias de Storage Partitioning e auxiliares de rodadas anteriores; haverá uma principal e a auxiliar aberta pelo próprio teste.
- Somente Privacy Lens ativa na configuração combinada. Manter e registrar ETP, escudo/exceções, preferências de cookies, HTTPS-Only e outras proteções existentes.
- Não é necessária limpeza prévia neste roteiro. Registrar perfil/container, cache e dados anteriores. **Não usar recarga forçada**, porque ela pode desviar dos Service Workers; não limpar dados nem mudar configurações no meio da rodada.
- Abrir a URL normalmente. Não recarregar a extensão durante a coleta.
- A aba auxiliar precisa abrir pelo clique em Run Tests. Se o Firefox impedir a abertura, registrar o aviso e tratar a rodada como incompleta; preservar o registro antes de permitir a abertura solicitada e repetir em uma rodada separada. Não clicar Run Tests repetidamente na mesma execução.

**Passos manuais:**

1. Abra a URL selecionada em uma nova aba e aguarde 5 s. Confira `www.first-party.site`, o título Storage Partitioning Test Page e Run Tests. Anote data/hora/fuso e configuração.
2. Antes de iniciar, abra Privacy Lens → Atualizar → Armazenamento HTML5. Anote origens/frames, contagens ou indisponibilidade e horário de coleta como baseline. Feche o popup e mantenha a mesma aba DDG.
3. Clique **Run Tests uma vez** e anote o horário. Deixe a aba auxiliar navegar e executar os casos, sem fechá-la, recarregá-la ou interrompê-la para capturas.
4. Aguarde o fluxo indicado abaixo. A auxiliar deve tentar fechar ao terminar; se ela informar conclusão e não fechar, pode fechá-la para voltar à principal. Não fechar enquanto indicar execução/espera.
5. Na principal, espere o resumo, clique **Show Detailed Results** e registre os estados de todas as APIs exibidas. Para as comparações, preserve os detalhes `same-site` e `cross-site`, incluindo `value`/`error`, principalmente de localStorage, sessionStorage, IndexedDB e cookies.
6. Clique **Download the result** e salve `storage-partitioning-results.json`. O arquivo guarda os estados por API; os valores/erros detalhados precisam ser preservados nas capturas ou transcritos no registro.
7. Volte à aba DDG principal, abra **Privacy Lens → Atualizar → Armazenamento HTML5**. Registre os snapshots e horários; consulte Cookies para store/partitionKey quando disponíveis. Confira também limitações de cobertura.
8. Clique **Abrir relatório** a partir dessa aba. Mova somente o relatório para outra janela, confirme a URL analisada e coloque as duas janelas lado a lado. Atualize e faça manualmente as capturas descritas abaixo. Exporte o JSON do plugin.
9. Preencha somente o Teste 5. Guarde os artefatos da mesma rodada e pare após entregar seu resultado.

**Esperar:**

Reservar **até 120 s após Run Tests** para o fluxo normal. O sinal útil de conclusão na principal é o resumo com os resultados e o download habilitado; pode levar mais de 30 s. O limite de 120 s é operacional, não uma garantia do DDG.

Se não concluir, registrar tempo decorrido, URL/etapa da auxiliar, avisos e disponibilidade de resumo/download. Preservar a evidência da rodada incompleta, sem convertê-la em pass/fail de proteção. Aviso de navegação HTTP/HTTPS também deve ser registrado; não mudar preferências durante a rodada. A janela de 30 s dos eventos de cookies não é timeout do DDG.

**Na página DDG:**

- Resumo da quantidade de mecanismos recuperados e estado literal por API.
- **Show Detailed Results**: listas `same-site`/`cross-site`, com valores ou erros, preservando distinção entre null, vazio e erro.
- No download: `page: storage-partitioning`, `date` e `results[]` com `id` e `value` (estado). Não há esses detalhes de recuperação no JSON exportado.
- Não confundir `Cache API` com os casos de cache HTTP, nem interpretar `unsupported` como pass só pelo ícone.

**No Privacy Lens:**

A principal em `www.first-party.site` grava por um iframe da mesma origem. A auxiliar faz as leituras: nos casos de storage/cache/comunicação, o iframe de `www.first-party.site` é observado sob top-level `www.first-party.site` em same-site e sob `good.third-party.site` em cross-site. HSTS tem fases HTTP próprias. As abas têm contextos distintos.

O relatório vinculado à principal **não reúne automaticamente os snapshots da auxiliar**. Não exigir que `good.third-party.site` apareça como iframe terceiro na principal. O iframe de gravação é removido ao finalizar, portanto seu snapshot pode aparecer como anterior/frame ausente. Não interromper o teste para tentar capturar a auxiliar antes do fechamento.

| Seção | Registrar | Limite da comparação |
|---|---|---|
| Armazenamento HTML5 | Origem, frameId, top site na coleta, top-level/embedded, horário, frame presente/ausente, localStorage/sessionStorage em chaves e IndexedDB em bancos; ou status/erro de coleta | Contagem não revela o identificador DDG nem comprova compartilhamento/isolamento |
| Cookies | Domínio, store e partitionKey, quando observados; inventário e cobertura temporal | Chave de partição de cookie não comprova particionamento HTML5 nem todas as asserções DDG |
| Rede/cobertura | Contextos efetivamente coletados e lacunas, quando úteis para explicar o fluxo | Observar requests não mede isolamento de caches, comunicação ou HSTS |

Não há contagens fixas esperadas no Privacy Lens. Se o horário do snapshot não avançar depois de Run Tests, registrar defasagem/cobertura temporal, como no Teste 2, sem concluir bloqueio ou estado atual vazio. Se a seção estiver indisponível, preservar esse estado; não substituí-lo por zero.

A interface pode informar **particionamento HTML5 não estabelecido**: esse é o limite metodológico do snapshot. Uma API DDG sem medição equivalente no plugin deve ficar como **não avaliável pelo Privacy Lens**, com a lacuna concreta, mesmo quando o DDG produziu pass/fail.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

Captura manual com **URL/título DDG, resultado e detalhes de uma API comparada**, ao lado do Privacy Lens identificado para a mesma aba, mostrando **origem/frame/top site, contagens ou indisponibilidade e horário do snapshot**. Usar Abrir relatório em outra janela, mantendo a principal aberta. Print apenas do DDG ou do plugin não substitui a captura conjunta.

**Nome principal:**

`ddg-storage-partitioning-plugin.png`

**Pasta:**

`evidencias/duckduckgo/storage-partitioning/`

**PRINT COMPLEMENTAR:**

`ddg-storage-partitioning-detalhes.png` — detalhes same-site/cross-site, erros/unsupported e cobertura/snapshots anteriores; incluir cookies/partitionKey se comparados. Se não couberem as APIs registradas, usar complementos com sufixo por API, preservando contexto. O download DDG não substitui as capturas desses detalhes.

**Exportar:**

- Privacy Lens da principal: `ddg-storage-partitioning-relatorio.json`.
- Download DDG: `storage-partitioning-results.json`.
- Guardar ambos na pasta acima, sem editar os resultados. Usar sufixos em novas execuções, sem sobrescrever.

**Registro:**

No [REGISTRO.md deste teste](../evidencias/duckduckgo/storage-partitioning/REGISTRO.md), registrar por API: esperado documental, estado DDG, detalhes same-site/cross-site, snapshot/contexto que o plugin realmente observou, concordância total/parcial/não ou não avaliável, divergência e explicação concreta. Guardar versões, configuração, URL inicial/final, duração, horários de coleta, conclusão ou etapa incompleta e arquivos.

Exemplos de limites que exigem registro: DDG mostra isolamento, mas plugin dispõe apenas de contagens na principal; snapshot anterior à execução; API de comunicação/cache/HSTS sem medição equivalente; erro DDG cujo motivo não foi coletado pelo plugin. Não transformar essas lacunas em concordância total ou falha do particionamento. Preservar os resultados antes de qualquer investigação posterior.

<a id="teste-6"></a>
## TESTE 6 — Bounce Tracking

**URL oficial:**

https://privacy-test-pages.site/privacy-protections/bounce-tracking/

Usar o link **Go to privacy-test-pages.site**, cujo destino inicial é:

`https://bad.third-party.site/privacy-protections/bounce-tracking/bounce.html?destination=privacy-test-pages.site`

O retorno esperado usa a mesma página inicial, com parâmetros de resultado. Esse caminho permite comparar **privacy-test-pages.site → bad.third-party.site → privacy-test-pages.site** na mesma aba. Os outros links são variantes; não executá-los nesta rodada. `good.third-party.site` e `bad.third-party.site` pertencem ao mesmo site registrável, portanto essa alternativa não representa três sites distintos.

**Verificação documental:**

Em **29/09/2026**, índice e intermediário selecionados responderam HTTP 200 e coincidiram com o commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`. A pasta contém `index.html` e `bounce.html`, sem README próprio. Fontes: [página oficial](https://privacy-test-pages.site/privacy-protections/bounce-tracking/), [intermediário](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/bounce-tracking/bounce.html) e [destino/resultados](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/bounce-tracking/index.html). A consulta foi documental, sem executar o teste em navegador.

**Objetivo do DDG:**

Exercitar uma passagem por site intermediário que lê/tenta gravar um identificador em localStorage/cookie e o transporta na URL de retorno. Comparar a primeira passagem da rodada com uma repetição sem limpeza.

**Resultado esperado segundo o DDG:**

O intermediário lê `bounceUID` de localStorage e cookie antes de qualquer geração. Se ambos estiverem ausentes, gera um número de 1 a 101 e tenta gravá-lo nos dois mecanismos. Depois navega por JavaScript para o destino, sem atraso adicional no link selecionado.

| Condição | Mensagem e parâmetros documentais esperados |
|---|---|
| Nenhum ID prévio e execução sem erro que interrompa o fluxo | Mensagem de ID recém-gerado; `isNew` preenchido e `bounceUIDlocalStorage`/`bounceUIDcookie` vazios |
| Pelo menos um ID já disponível | Mensagens com os IDs lidos em cada mecanismo; `isNew` vazio; um campo pode estar vazio se só o outro mecanismo tiver ID |
| Repetição sem limpar, com persistência | IDs anteriores reaparecem nos mecanismos que conservaram os dados |
| Dados não persistiram ou houve erro | Pode haver nova geração ou interrupção; registrar mensagem/Log/URL real, sem presumir a causa |

Na primeira geração, os campos de UID ficam vazios porque foram lidos **antes** da gravação e não são relidos para construir a URL. A mensagem de geração não comprova por si só que o cookie foi aceito ou persistiu. A repetição serve para verificar o que o DDG consegue recuperar.

A página não oferece placar universal pass/fail nem botão de download de resultados. Seu resultado demonstra o fluxo controlado da página, sem atribuir automaticamente bloqueio ou remoção a uma proteção.

**Preparação:**

- Firefox 156.0.1, Privacy Lens v0.4.0 previamente carregada, janela normal e nova aba. Fechar duplicatas deste teste; usar a mesma aba nas duas passagens.
- Manter somente Privacy Lens ativa na configuração combinada e registrar ETP, escudo/exceções, políticas de cookies, perfil/container, data/hora/fuso e versões.
- Registrar a condição dos dados anteriores de `bad.third-party.site`: ausentes, existentes ou desconhecidos. Não é necessária limpeza nesta rodada; **primeira passagem da rodada não significa necessariamente primeira geração de ID**.
- Se uma limpeza já foi feita antes da rodada, registrar seu escopo; não presumir que ela ocorreu. Não limpar cookies/storage entre as duas passagens.
- Não recarregar a extensão, usar Voltar, digitar o endereço do intermediário ou abrir o link em outra aba durante o fluxo. Clicar no link da própria página para preservar a ligação observada entre documentos.
- Não acrescentar `delay` à URL nem pausar o intermediário. Guardar todos os arquivos da primeira passagem antes de iniciar a segunda.

**Passos manuais — primeira passagem:**

1. Abra a URL oficial do índice e aguarde 5 s. Confira domínio, título e link Go to privacy-test-pages.site.
2. Clique **Go to privacy-test-pages.site** com clique normal na mesma aba e anote o horário. Deixe o navegador passar pelo intermediário e retornar automaticamente.
3. Após o retorno e a espera abaixo, registre a mensagem DDG e a URL final: presença/vazio de `isNew`, `bounceUIDlocalStorage` e `bounceUIDcookie`. Se já houver IDs, anote que a rodada começou com dados existentes.
4. Abra **Privacy Lens → Atualizar → Tracking avançado → Bounce tracking**. Registre classificação, cadeia, duração, tipo de redirect, confiança, motivos e cobertura.
5. Clique **Abrir relatório** a partir da aba DDG, mova somente o relatório para outra janela e confira sua URL analisada. Capture manualmente DDG e relatório lado a lado; exporte o JSON com o prefixo `primeira`.

**Passos manuais — repetição:**

6. Depois de salvar a primeira passagem, volte à **aba DDG original**, que permaneceu aberta. Clique novamente **Go to privacy-test-pages.site**, sem limpar dados, recarregar ou usar Voltar.
7. Aguarde o retorno. Registre se cada ID foi recuperado, ficou vazio ou se houve nova geração; compare com a primeira passagem sem presumir persistência dos dois mecanismos.
8. Atualize o relatório vinculado à aba original e confira a cadeia/horários desta passagem. Salve outro print e JSON com o prefixo `repeticao`. O relatório é atualizado; não reutilizar a captura anterior como evidência da segunda passagem.
9. Preencha as duas linhas do Teste 6 e pare após entregar seus resultados.

**Esperar:**

Em cada passagem, aguardar o retorno e a mensagem DDG, depois **2 s** antes de atualizar o plugin. Se não retornar em **30 s após o clique**, registrar URL atual, Log/aviso/erro e tempo decorrido como execução incompleta; não completar mentalmente a cadeia.

O limite de 30 s é operacional. A heurística do plugin considera a permanência no intermediário de até **10 s**; isso não é um prazo para salvar prints nem exige executar a segunda passagem em 10 s. O relatório pode ser salvo com calma após o retorno, preservando a aba.

**Na página DDG:**

- Mensagem abaixo dos links: ID recém-gerado ou IDs provenientes de localStorage/cookie.
- URL final e campos preenchidos/vazios; distinguir primeira geração de recuperação.
- Se parar no intermediário, preservar o Log e a URL. Não inventar a mensagem final.
- Não há download DDG próprio; a transcrição e as capturas preservam o resultado.

**No Privacy Lens:**

A seção relevante é **Tracking avançado → Bounce tracking**; no JSON, `advancedTracking.bounce` e `advancedTracking.coverage`.

| Evidência realmente disponível | Comportamento esperado da regra atual |
|---|---|
| Cadeia ligada entre os três documentos, passagem intermediária ≤10 s, redirect reconhecido e sinal adicional de identificador/gravação correlacionada | Indicador compatível com bounce tracking |
| Redirect explicitamente reconhecido e cadeia elegível, mas sem sinal adicional | Sequência de bounce observada |
| Flag JS ausente, mas iniciador corresponde ao intermediário ligado à origem, passagem curta e sinal adicional | Pode aparecer `client-redirect-inferred`, confiança baixa; não comprova automatismo |
| Ligação não observada, passagem longa ou dados insuficientes | Bounce: evidência insuficiente, com rota/cobertura a registrar |

Procurar o trecho **privacy-test-pages.site → bad.third-party.site → privacy-test-pages.site**, requestIds/timestamps, tempo de passagem, tipo de redirect e motivo. Não exigir total fixo de sequências; o histórico curto pode conter outros trechos, que precisam ser separados por horários.

Na geração inicial, `bounceUIDlocalStorage` e `bounceUIDcookie` vazios não geram sinal de identificador; `isNew` numérico também não é um nome de identificador reconhecido pela regra atual. A classificação pode depender de uma gravação real de cookie capturada/correlacionada e da ligação entre documentos; não exigir indicador em toda primeira passagem.

Na repetição, se os campos de UID retornarem preenchidos e forem observados, seus nomes devem aparecer como sinais potenciais de identificador. O indicador de bounce ainda depende da cadeia/tempo/redirect. IDs numéricos curtos deste teste podem gerar sinal pelo nome sem gerar Cookie sync: a comparação de identificadores exige pelo menos 8 caracteres. Não inventar igualdade com valores de cookies, que o detector não lê/compara.

Registrar `sequence-observed`, `insufficient-evidence`, confiança baixa ou seção indisponível literalmente. Set-Cookie sozinho não prova gravação. Navegação curta/correlação também não estabelece autoria exclusiva ou intenção; fluxos legítimos podem produzir sinais semelhantes.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

Uma captura manual **por passagem**, com URL/título/mensagem DDG ao lado do relatório da mesma aba mostrando classificação, rota disponível, motivo e confiança. Se não houver indicador, capturar a ausência e os detalhes disponíveis. Usar Abrir relatório em outra janela, mantendo a aba original aberta.

**Nomes principais:**

- `ddg-bounce-tracking-primeira-plugin.png`
- `ddg-bounce-tracking-repeticao-plugin.png`

**Pasta:**

`evidencias/duckduckgo/bounce-tracking/`

**PRINT COMPLEMENTAR:**

Se os detalhes não couberem, usar `ddg-bounce-tracking-primeira-detalhes.png` e `ddg-bounce-tracking-repeticao-detalhes.png`, com rota/requestIds/timestamps, parâmetros, motivos e cobertura da respectiva passagem.

**Exportar:**

- `ddg-bounce-tracking-primeira-relatorio.json`
- `ddg-bounce-tracking-repeticao-relatorio.json`
- Não há download DDG nesta variante. Salvar a mensagem nas capturas/transcrição, sem criar resultado simulado. Preservar originais e usar sufixos em novas rodadas.

**Registro:**

No [REGISTRO.md deste teste](../evidencias/duckduckgo/bounce-tracking/REGISTRO.md), separar primeira passagem e repetição: condição inicial dos dados, URL inicial/final, mensagem DDG real, campos preenchidos/vazios, cadeia/timestamps, duração, redirect, classificação/confiança/motivo e cobertura. Anotar concordância total/parcial/não ou não avaliável com explicação concreta e nomes dos arquivos.

Se o DDG recuperar IDs e o plugin não mostrar indicador, registrar os fatos antes de propor correção. Conferir se faltou a origem, o intermediário ou o retorno na rota, se houve passagem >10 s, ausência da flag/iniciador, parâmetros não observados ou outra limitação. Não ajustar heurísticas nem converter uma lacuna em sucesso.

<a id="teste-7"></a>
## TESTE 7 — Query Parameters

**URL oficial:**

https://privacy-test-pages.site/privacy-protections/query-parameters/

Executar os **quatro links do índice, nesta ordem**, com clique normal na própria página. O quarto é o controle que não deve ser reescrito. Não abrir diretamente os destinos para substituir o clique.

**Verificação documental:**

Em **29/09/2026**, `index.html`, `query.html` e `main.js` publicados responderam HTTP 200 e coincidiram com o commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`. A pasta não contém README próprio. Fontes: [índice oficial](https://privacy-test-pages.site/privacy-protections/query-parameters/), [links e Expected](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/query-parameters/index.html), [página de destino](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/query-parameters/query.html) e [renderização de Results](https://github.com/duckduckgo/privacy-test-pages/blob/e45b65aa6185710a1a1c7d6ee930856e051e8139/privacy-protections/query-parameters/main.js). Nenhum teste foi executado no Firefox pelo agente.

**Objetivo do DDG:**

Avaliar remoção seletiva de parâmetros de tracking em links, preservando os parâmetros funcionais e o controle.

**Resultado esperado segundo o DDG:**

Comparar manualmente **Expected**, mostrado no índice, com **Results**, mostrado no destino. O script do destino exibe os parâmetros da URL recebida usando URLSearchParams; não remove parâmetros nem produz placar automático de pass/fail.

Os exemplos abaixo são os links e esperados documentais, não resultados desta rodada:

| Caso e link no índice | URL original completa do link | Expected DDG |
|---|---|---|
| 01 — utm_source + parâmetro padrão | `https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?utm_source=something&q=other` | `q=other` |
| 02 — utm_source + utm_medium | `https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?utm_source=something&utm_medium=somethingelse` | string vazia: `""` |
| 03 — fbclid + fb_source + parâmetro padrão | `https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?fbclid=12345&fb_source=someting&u=14` | `u=14` |
| 04 — link que não deve ser reescrito | `https://privacy-test-pages.site/privacy-protections/query-parameters/query.html?q=something&id=1234` | `q=something&id=1234` |

Preservar a grafia `fb_source=someting` do link oficial. No caso 02, string vazia não significa que o texto literal “vazia” deva aparecer: o destino mostra aspas sem parâmetros entre elas.

**Privacy Lens v0.4.0 observa e não remove parâmetros.** Se nenhuma outra proteção reescrever o link/URL, Results conservará a query original. Nos casos 01–03 isso diverge do Expected de remoção, mesmo que o plugin identifique corretamente os parâmetros presentes. Registrar os dois critérios separadamente; não alterar a configuração para forçar o Expected.

**Preparação:**

- Firefox 156.0.1, Privacy Lens v0.4.0 previamente carregada, janela normal e **nova aba para o Teste 7**. Manter essa aba nos quatro casos, separada da execução anterior de Bounce.
- Não é necessária limpeza de cookies/storage. Registrar perfil/container, dados prévios/cache, data/hora/fuso, ETP/escudo/exceções e eventual proteção de limpeza de URLs.
- Somente Privacy Lens ativa na configuração combinada. Não instalar/ativar outra proteção nem mudar preferências durante a rodada.
- Não recarregar a extensão entre índice e destino. Não usar “copiar link limpo” ou editar parâmetros.
- Salvar o print/JSON de cada caso antes de retornar ao índice; o relatório acompanha a navegação atual da aba, não é um arquivo imutável das anteriores.

**Passos manuais:**

1. Abra a URL do índice na nova aba e aguarde 5 s. Confira os quatro links e seus Expected. Faça manualmente a captura complementar do índice indicada abaixo.
2. Clique normalmente no **primeiro link**, na mesma aba. Não cole a URL de destino na barra.
3. Aguarde o carregamento/Results + 2 s. Anote a URL final completa e o texto literal de Results; compare com o Expected do caso 01.
4. Abra **Privacy Lens → Atualizar → Tracking avançado → Parâmetros potencialmente relacionados a tracking**. Registre nomes, motivos, requestId/contexto, quantidade real de sinais e cobertura.
5. Clique **Abrir relatório** a partir da aba DDG e mova somente o relatório para outra janela. Confira a URL analisada e capture manualmente Results/URL ao lado da seção de parâmetros. Exporte o JSON com o prefixo `01`.
6. Depois de salvar, selecione a aba DDG original e **digite a URL do índice** para iniciar o próximo caso, sem Voltar/Avançar. Aguarde o índice, clique o segundo link e repita coleta/captura/exportação com prefixo `02`.
7. Faça o mesmo para o terceiro e quarto links, usando `03` e `04`. Em cada destino, atualize o relatório vinculado à mesma aba e confira URL/horário antes de salvar.
8. Preencha os quatro registros e pare após entregar o Teste 7. Não iniciar outra avaliação nesta rodada.

**Esperar:**

Abertura inicial do índice: **5 s**. Cada destino: carregamento e Results renderizado + **2 s** antes de atualizar o plugin.

Se a página/script não carregar ou o estado permanecer incerto, registrar após **até 30 s desde o clique** o URL/erro e a cobertura; não substituir falha de renderização por query vazia. Esses tempos são operacionais, não resultados do DDG.

**Na página DDG:**

- Expected vem do índice; Results e URL final vêm do destino de cada clique.
- No caso 02, conferir URL final junto de Results: o HTML começa com um campo vazio antes do script. Results vazio com query ainda presente na URL pode ser falha de renderização, não prova de remoção.
- Registrar o que foi removido, preservado ou modificado, inclusive parâmetros funcionais. Resultado diferente do Expected não identifica automaticamente qual componente causou a diferença.
- Não há botão de download DDG nesta variante. Preservar Expected/Results nas capturas/transcrição.

**No Privacy Lens:**

| Caso | Sinais esperados **se os parâmetros chegarem à request observada** | Controle que não deve gerar sinal nesse exemplo |
|---|---|---|
| 01 | `utm_source`: campanha | `q=other` |
| 02 | `utm_source` e `utm_medium`: campanha | nenhum parâmetro funcional neste link |
| 03 | `fbclid`: identificador de clique; `fb_source`: campanha | `u=14` |
| 04 | Nenhum sinal potencial pelos parâmetros desse link | `q=something` e `id=1234` |

No caso 04, esperar **Nenhum sinal potencial observado** quando a coleta estiver disponível e não houver outros sinais na navegação. Se o controle gerar sinal, preservar parâmetro/motivo/request correspondente antes de avaliar possível falso positivo.

Para a request principal original, sem reescrita, os nomes relevantes são respectivamente **1 / 2 / 2 / 0**. Não converter isso em total obrigatório do relatório: requests adicionais/redirects ou parâmetros removidos antes da observação podem alterar a contagem. Conferir os registros concretos.

No JSON, consultar `advancedTracking.queryParameters.findings` e `advancedTracking.coverage`; relacionar com `network.requests` quando necessário. O plugin exporta nomes/motivos/metadados, não valores das queries. Os valores públicos deste roteiro vêm dos links DDG; não exigir que apareçam no JSON Privacy Lens.

Se os parâmetros forem removidos antes de webRequest, sua ausência no plugin não prova falha do detector. Se houver observação anterior à remoção, um sinal pode coexistir com Results já limpo: conferir requestId, horário, redirect e URL final. Distinguir ausência de sinal, seção indisponível e omissões de coleta.

Esses cliques simples no mesmo site não exigem indicador de Bounce ou Cookie sync. Não reutilizar os dois sinais de Bounce do Teste 6 como resultado de Query Parameters; cada caso precisa dos seus dados.

**PRINT OBRIGATÓRIO PARA ENTREGA:**

**Uma captura manual por caso**, mostrando URL final e Results DDG ao lado do Privacy Lens identificado para a mesma aba, com nomes/motivos dos parâmetros ou ausência de sinal e cobertura. Usar Abrir relatório em outra janela. No controle, preservar a ausência de sinais; em erro/indisponibilidade, capturar esse estado.

**Nomes principais:**

- `ddg-query-parameters-01-plugin.png`
- `ddg-query-parameters-02-plugin.png`
- `ddg-query-parameters-03-plugin.png`
- `ddg-query-parameters-04-plugin.png`

**Pasta:**

`evidencias/duckduckgo/query-parameters/`

**PRINT COMPLEMENTAR:**

- `ddg-query-parameters-esperados.png` — índice com URL, quatro links e Expected legíveis; se precisar dividir, usar sufixos.
- Se necessário, `ddg-query-parameters-01-detalhes.png` até `ddg-query-parameters-04-detalhes.png`, para requestIds/motivos/redirects/cobertura que não couberem na principal. O print do índice não substitui os quatro prints conjuntos.

**Exportar:**

`ddg-query-parameters-01-relatorio.json`, `ddg-query-parameters-02-relatorio.json`, `ddg-query-parameters-03-relatorio.json` e `ddg-query-parameters-04-relatorio.json`.

Não há download DDG próprio. Preservar originais e usar sufixos em novas rodadas, sem sobrescrever.

**Registro:**

No [REGISTRO.md deste teste](../evidencias/duckduckgo/query-parameters/REGISTRO.md), separar os quatro casos: URL original do link, Expected, Results real, URL final, nomes/motivos/requestIds observados, contagem e cobertura, concordância total/parcial/não ou não avaliável, divergência e explicação concreta.

Comparar explicitamente **remoção DDG** e **observação Privacy Lens**. Exemplo condicional: se Results conservar `utm_source` e o plugin o sinalizar como campanha, registrar a divergência de remoção e a identificação correta do parâmetro; não chamar isso de remoção pelo plugin nem de falha do detector. Se o Expected for atendido por outra proteção, não atribuir a ação ao Privacy Lens.

Registrar data/hora/fuso, versões/configuração, espera e arquivos por caso. Preservar qualquer divergência antes de investigar ou propor alteração. Este é o último teste do bloco, mas o resultado manual e a conferência das evidências ainda precisam ser recebidos antes de concluir a avaliação.

## Tratamento das divergências após cada execução

Não modificar heurísticas antes dos testes para buscar concordância. Primeiro preservar o resultado e o print/JSON. Explicações devem apontar requestId, domínio, URL reduzida, tipo, estado/erro HTTP, redirect/timestamp, cookie/path/store/partitionKey, frame/origem/top site, snapshot ou parâmetro concreto. “Metodologias diferentes” não é explicação suficiente. Se faltarem dados, registrar que precisamos inspecionar mais informações, por exemplo DevTools → Rede e o JSON da mesma execução.

Privacy Lens v0.4.0 observa e não bloqueia. Uma request observada não significa que terminou; erro/falha/cancelamento não identifica automaticamente qual proteção atuou. Um snapshot sem storage não comprova particionamento; partitionKey de cookie não demonstra isolamento de localStorage/IndexedDB. Os valores de storage não são lidos pelo plugin e abas auxiliares fechadas não podem ser reconstruídas.

Condução histórica: testes 1–7 executados manualmente conforme relatos, com evidências ainda pendentes de conferência. Prosseguir no bloco Conceito A autorizado, mantendo estes resultados e protocolos da v0.4.0.
