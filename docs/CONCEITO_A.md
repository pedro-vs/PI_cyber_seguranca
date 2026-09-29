# Conceito A — implementação v0.5.0

Plano apresentado antes da implementação: registrar o Teste 7; acrescentar indicadores de alterações de API/canais terceiros sem modificar os detectores B; preparar js-leaks com controle sem extensão; implementar score explicável e blocklist persistente; validar unidades, integração e Firefox local. Nenhum resultado DDG de Conceito A foi presumido.

O [Teste 7](../evidencias/duckduckgo/query-parameters/REGISTRO.md) foi registrado conforme o relato: 1 / 2 / 2 / 0 sinais. Nos três primeiros casos os parâmetros permaneceram; no controle não houve falso positivo. Os sete testes anteriores documentam a v0.4.0 e não foram reclassificados como testes da v0.5.0.

## Indicadores de hook/hijacking

`security-v1` observa descritores de 19 APIs selecionadas: fetch, WebSocket, XMLHttpRequest, eval, XHR open/send, Function.toString, Document.createElement e os 11 métodos canvas já instrumentados. Compara referências/flags sem executar getters nem exportar código, argumentos ou valores. Baseline no `document_start`, bootstrap canvas separado e amostragem a cada segundo até 30 s; Atualizar faz nova amostragem. As alterações entre o baseline e o fim do bootstrap nos métodos canvas são atribuídas à instrumentação própria nesse intervalo controlado. Substituições posteriores ficam separadas.

- WebSocket terceiro: tentativa de canal, confiança baixa. Não mede mensagens nem duração; um handshake com erro continua sendo tentativa, não canal persistente comprovado.
- Polling compatível: quatro respostas 2xx do mesmo endpoint sem query, método e frame em 5–30 s, com tempos crescentes. Pode agregar queries diferentes; não prova conteúdo, periodicidade exata ou intenção.
- Combinação: mudança de API e sequência de polling no mesmo frame, com a amostra da mudança entre 1 s antes da primeira requisição e 1 s depois da quarta. Confiança moderada na coexistência; não demonstra que o hook produziu o tráfego, autoria de script ou comprometimento. Também pode ocorrer em software legítimo.
- WebSocket isolado, polling isolado, hook isolado e bootstrap próprio não recebem desconto H. Nenhum processo/configuração do SO ou navegador é inspecionado.

Falhas de leitura, APIs ausentes, frames inacessíveis/removidos, snapshots sem atualização nos últimos 5 s, janela inicial incompleta e truncamentos implicam cobertura parcial. Mudanças anteriores ao baseline, transitórias entre amostras, workers, frames opacos e substituição com o mesmo descritor não são cobertas. Horário da mudança é o da primeira amostra que a encontrou. Canais/combinações exportados: até 128 de cada; APIs/alterações limitadas às 19 selecionadas.

## Score e blocklist

A [metodologia privacy-score-v1](SCORE_PROPOSTA.md) define pesos, deduplicação, evidências e intervalo de cobertura. O relatório mantém `schemaVersion: 3` com seções aditivas `security`, `score` e `blocklist`; `advancedTracking` preserva nome e contrato. Falha de cálculo retorna indisponível, nunca uma nota 100 artificial. Popup e relatório em aba compartilham a mesma renderização; falha de A não interrompe B.

A blocklist aceita hostnames exatos e opção de incluir subdomínios, com normalização IDN e fronteira de domínio. Rejeita URLs, portas, curingas e sufixos públicos inteiros (PSL, incluindo PRIVATE). IP/localhost são permitidos. A lista começa vazia, aplica-se a todas as abas e persiste em `browser.storage.local`; pode ser pausada, reativada e ter regras removidas. Máximo 200 regras. Não altera permissões/ETP do Firefox. Persistência depende da manutenção dos dados da extensão no perfil; desinstalação/limpeza pode apagá-los.

Com as permissões `storage` e `webRequestBlocking`, o listener MV2 retorna `cancel:true` para HTTP(S)/WS(S) compatível com a regra. Espera a carga da lista antes de decidir, sem atrasar o registro síncrono das evidências de rede/cookies. Registra até 500 decisões por navegação, URL sem query e regra responsável; excesso fica explícito. `cancel-requested` significa que o Privacy Lens solicitou cancelamento, sem excluir atuação simultânea de outras extensões. Requisições sem aba também recebem a regra, mas não são atribuídas a uma aba no relatório. Falha de leitura da lista fica explícita e não aplica bloqueios; erro de gravação preserva a configuração anterior. Não elimina recursos já carregados; repita a navegação para comparar. Cache, service workers e tráfego não exposto ao webRequest limitam a cobertura.

## Validação local manual

Use perfil de teste, mantenha as proteções escolhidas e anote-as. Recarregue a extensão em `about:debugging#/runtime/this-firefox` apontando para `extension/manifest.json`; confirme v0.5.0. Execute `npm run fixture`. Antes de cada caso abaixo, deixe a lista vazia e navegue pelo endereço indicado. Não use apenas Atualizar para reiniciar a navegação.

| URL completa | Espera e ações | Resultado esperado | Erro |
|---|---|---|---|
| http://localhost:8787/security/negative | Aguarde PRONTO e 31 s desde a navegação; abra Privacy Lens → Atualizar. | 0 alterações externas, 0 canais, 0 combinações; 11 métodos canvas próprios separados. Em perfil limpo/cobertura completa, score 100; não significa site seguro. | Hook próprio pontuado, erro de UI, ausência de cobertura apresentada como zero confirmado. |
| http://localhost:8787/security/polling | Aguarde PRONTO · 4 respostas de 4, cerca de 7 s; Atualizar. Para fechar cobertura, repetir Atualizar aos 31 s. | 1 canal de requests repetidos, 0 alterações, 0 combinações, desconto H=0; N pode pontuar contato terceiro. | Polling sozinho classificado como combinação/hijacking ou penalizado em H. |
| http://localhost:8787/security/hook | Mesma espera do polling; Atualizar. | Alteração Window.fetch, 1 canal, 1 combinação, H=20. Retornos do fetch continuam corretos. Não prova ataque/autoria. | Canvas próprio contado como hook externo, fetch quebrado, combinação ausente com 4 respostas e amostragem disponível. |
| http://localhost:8787/security/websocket | Aguarde PRONTO com erro esperado, normalmente até 5 s; Atualizar. | Tentativa WebSocket terceiro com erro, 0 combinações, H=0; servidor da fixture não aceita upgrade. | Erro tratado como bloqueio do plugin ou persistência comprovada. |
| http://localhost:8787/security/blocklist | Aguarde PRONTO e 2 s. Primeiro sem regra, adicione `127.0.0.1` na UI e recarregue a página; repita pausando, reativando e removendo a regra. | Imagem carrega sem regra/pausada/removida; com regra ativa, request `/pixel` tem erro e decisão própria, regra `127.0.0.1`. Rede continua contando a tentativa. Recarregar a extensão mantém a regra enquanto seus dados persistirem. | Host sem fronteira bloqueado, pausa sem efeito, regra perdida na recarga, falha genérica atribuída ao plugin sem decisão própria. |

Se outra proteção impedir as respostas de polling, registre a limitação: não flexibilize o limiar para forçar resultado. Para não afetar comparações anteriores, remova as regras de teste ao terminar.

## Próximo teste manual: DDG js-leaks

Siga exclusivamente o [roteiro e registro de js-leaks](../evidencias/duckduckgo/js-leaks/REGISTRO.md), comparando o mesmo Firefox com e sem Privacy Lens e usando lista vazia. A coleta de três sites/HAR/Blacklight e os demais entregáveis acadêmicos continuam pendentes; existência de código não os substitui.

## Verificação automatizada reproduzível

```bash
npm test
npm run check
git diff --check
python3 tests/firefox_concept_a.py --firefox /caminho/firefox --geckodriver /caminho/geckodriver --out /tmp/privacy-lens-a
```

O teste Python abre perfil temporário e servidor em porta livre, testa a UI real de A e permite salvar JSON sanitizado. Não tira screenshots nem acessa o DDG. Os testes anteriores permanecem ativos. [Resultado desta implementação](VALIDACAO_CONCEITO_A.md).

Fontes primárias: [Firefox webRequest.onBeforeRequest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest), [storage.local](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local), [objetos entre contextos Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts), [página oficial DDG js-leaks](https://privacy-test-pages.site/security/js-leaks.html) e [implementação DDG](https://privacy-test-pages.site/security/leaks.js), consultadas em 29/09/2026.
