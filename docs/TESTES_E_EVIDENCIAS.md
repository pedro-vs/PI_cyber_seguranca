# Protocolo de testes e evidências

Resultados DDG e dos sites reais estão **pendentes**. Consultar a documentação online não executa os testes. Resultados reais desta etapa são somente os explicitamente registrados em `evidencias/local/`.

## Registrar para toda execução

ID, data/hora/fuso, commit, Firefox/OS, versão da extensão, URL inicial/final, proteção ETP, cookies/particionamento, perfil limpo ou reaproveitado, cache, consentimento, uBlock ativo/inativo e suas listas. Use o mesmo roteiro de navegação e janela de 30s. Depois de interações tardias, registre que o intervalo excedeu a janela inicial de correlação de cookies.

Não alterar a proteção habitual sem necessidade. Se uma hipótese exigir mudar ETP/cookies, use um perfil de laboratório separado, registre a mudança e repita somente aquele caso. A configuração do navegador é parte do experimento.

## Primeira coleta manual — agora

1. Rode `npm run fixture`.
2. No Firefox com a extensão carregada, abra `http://localhost:8787/` e aguarde PRONTO + 5s.
3. Abra o popup, clique Atualizar. Compare com a tabela do README.
4. Tire `etapa1-popup.png`, mantendo a URL da página visível.
5. Tire `etapa1-storage.png`, mostrando a seção HTML5. Se necessário use Abrir relatório.
6. Exporte `etapa1-relatorio.json` e registre Firefox/OS.
7. Envie esses arquivos para revisão. Um erro deve ser enviado literalmente, junto com o console de Inspecionar da extensão em `about:debugging`.

Esta etapa comprova a base, não DDG, Blacklight, uBlock ou desempenho em sites reais.

## Matriz DDG pronta para preencher

As URLs abaixo foram conferidas no índice oficial. Para cada página, transcreva o esperado/resultados exibidos **durante a execução**, incluindo subtestes. Não copiar como esperado um comportamento presumido pela extensão.

| ID / nível | Teste e URL | Esperado da própria página | Observado pelo plugin | Coincide? | Divergência e evidência | Print |
|---|---|---|---|---|---|---|
| DDG-01 / C | Tracker Reporting: https://privacy-test-pages.site/tracker-reporting/1major-via-script.html | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-02 / C | Storage Blocking: https://privacy-test-pages.site/privacy-protections/storage-blocking/ | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-03 / C-B | Canvas: https://privacy-test-pages.site/privacy-protections/fingerprinting/canvas.html | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-04 / B | Tracker Blocking: https://privacy-test-pages.site/privacy-protections/request-blocking/ | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-05 / B | Storage Partitioning: https://privacy-test-pages.site/privacy-protections/storage-partitioning/ | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-06 / B | Bounce Tracking: https://privacy-test-pages.site/privacy-protections/bounce-tracking/ | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-07 / B | Query Parameters: https://privacy-test-pages.site/privacy-protections/query-parameters/ | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |
| DDG-08 / A | JS leaks: https://privacy-test-pages.site/security/js-leaks.html | PENDENTE | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |

Duplicar a linha para cada subteste/configuração, mantendo um print do plugin por linha. Guardar também o resultado da própria página e o JSON. Nomear `DDG-01-config1-popup.png`, `DDG-01-config1-pagina.png`, `DDG-01-config1.json`.

### O que fazer em cada grupo, quando os detectores estiverem prontos

- Tracker Reporting: abrir a URL, aguardar 30s, registrar o tracker anunciado, comparar domínio/tipo/estado no JSON e no DevTools. Se houver bloqueio antecipado, registrar a prova, não inventar requisição ausente.
- Storage Blocking: executar os controles que a página oferecer, registrar cada tipo/origem e estado. Comparar “bloqueado” da página com “indisponível”/estoque do plugin, sem confundir a tentativa com sucesso de escrita.
- Canvas: executar a ação da página, guardar o resultado e a sequência observada. Na Etapa 1 o detector ainda não existe: o resultado do plugin é “não implementado”.
- Tracker Blocking: primeiro medição observacional; depois repetir com domínio escolhido na blocklist, mantendo o resto. Provar bloqueio com evento e resultado da página.
- Storage Partitioning: seguir o fluxo entre top sites indicado pelo teste. Comparar a mesma origem terceira sob contextos distintos; um snapshot único não é suficiente.
- Bounce Tracking: seguir os links/redirects do próprio teste e manter o histórico entre documentos. Capturar URL/cadeia/tempo/identificador, incluindo controles de login legítimo.
- Query Parameters: usar links de teste e observar URLs antes/depois, preservar nomes e evidências pseudonimizadas dos valores relevantes. “utm” pode ser campanha, não identidade individual.
- JS leaks: exportar um perfil de um Firefox limpo da **mesma versão**, repetir com a extensão, clicar Check para a comparação compatível e exportar resultados. Se o seletor só oferecer versões antigas, isso é uma limitação a registrar. Verificar added/removed/changed e separar alterações causadas pela instrumentação; não alegar que o teste injeta BeEF.

Quando chegar cada bloco, revisar a página real e detalhar os botões e campos exibidos naquela execução. Não preencher antecipadamente os resultados.

## Três sites sorteados

Preencher URLs oficiais em `evidencias/sites-reais/site-N/README.md` assim que forem informadas. Não substituir por sites escolhidos por conveniência.

Para cada site:

1. Perfil de laboratório; fixar proteção/cache/consentimento e extensões. Abrir DevTools → Rede antes de navegar, habilitar persistência de logs se for preciso acompanhar redirects.
2. Rodada A: Privacy Lens observacional, blocklist vazia, uBlock desligado. Carregar URL exata, aguardar 30s, executar as interações definidas, atualizar relatório.
3. Rede → contexto da lista → **Salvar tudo como HAR** (o rótulo pode variar com o idioma). Salvar `evidencias/har/site-N-baseline.har`. Guardar print e JSON do plugin.
4. Rodada B: mesmo roteiro, com uBlock ligado e **logger aberto antes da navegação**. Registrar versão, listas, domínio, tipo, regra/filtro que bloqueou, exceções e redirects/surrogates. Salvar print do logger e HAR adicional se necessário.
5. Blacklight: informar URL, localização/dispositivo/cache; salvar relatório, data e link/print. A rodada remota pode divergir por geolocalização, consentimento e scripts condicionais; cada hipótese precisa de evidência concreta.
6. Score da nossa extensão: salvar versão da fórmula, descontos por categoria, confiança e cobertura. Comparar dimensões, não inventar uma nota equivalente para o Blacklight.

HARs podem conter cookies, tokens e dados pessoais. Antes de publicar, revisar e pseudonimizar esses campos, preservando nomes/domínios/estrutura e a consistência dos identificadores necessários à reconciliação. Usar navegação sem login ajuda a reduzir o problema. Documentar o que foi removido.

## Reconciliação: uma linha por caso

| Caso | Site / domínio / recurso | Plugin | Blacklight | uBlock + filtro | HAR (arquivo, entrada, horário, tipo, initiator disponível, redirects) | Hipótese e checagem | Conclusão |
|---|---|---|---|---|---|---|---|
| PENDENTE | PENDENTE | NÃO EXECUTADO | NÃO EXECUTADO | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE |

Exemplos de hipóteses a testar, não resultados: recurso bloqueado antes de observado; imagem versus script; surrogate do uBlock; domínio terceiro legítimo; CNAME não resolvido; cookie preexistente; ID particionado em outro top site; chamada condicionada ao consentimento. Só concluir quando houver evidência. Se o initiator não vier no HAR, guardar painel/stack correspondente ou declarar não disponível.

## Próximos commits reais

Depois de cada detector funcionando: COMMIT AGORA com mensagem específica. Depois de executar DDG: `test: record DuckDuckGo privacy evidence`. Depois de sites reais: `test: reconcile assigned sites with reference tools`. Não fabricar commits ou retroagir datas.
