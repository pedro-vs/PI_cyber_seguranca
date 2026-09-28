# Correção de entrega fora de ordem — /cookies/session

## Causa reproduzida

Na execução local em Firefox 156.0.1, `cookies.onChanged` disparou com `cause: explicit`, mas o callback chegou **antes de `webRequest.onBeforeRequest` da nova navegação**. O timestamp da requisição já era anterior ao evento. O código anterior avaliava apenas o estado disponível naquele instante, que ainda podia ser `/cookies/setup`; quando a nova navegação era criada, perdia a gravação.

Não foi necessário relaxar `cookieMatches`: nos casos reproduzidos, `storeId` era `firefox-default`, `firstPartyDomain` vazio, `partitionKey` nulo e o host `localhost`. A PSL estava pronta. No contexto recriado para session, o store foi aguardado e a navegação continuou sendo a mesma ao processar o evento.

O patch guarda até 2.000 eventos reais sanitizados, mantendo os horários originais. Quando o main_frame é observado, reavalia os eventos que cabem na janela original de 30 s contra o host da nova navegação, store e partição. Não usa `Set-Cookie` nem diferença entre inventário e baseline como prova. O buffer é podado por idade ao receber eventos; perdas por limite são informadas em `cookies.ingressDropped`. Desde 0.3.0, um callback tardio de subrecurso também permite reavaliar o evento real, exclusivamente quando o timestamp inicial da requisição desse host é anterior ou igual ao evento. Um host cuja requisição começou depois continua excluído. `hostEvidence` registra início da requisição e recebimento do callback; `host-request-replay` identifica a reavaliação, sem duplicar contagens.

O evento ainda é uma correlação, não prova de autoria. Uma associação ao estado anterior pode aparecer no diagnóstico histórico; `currentNavigation` identifica a decisão para a navegação atual. Não somar decisões históricas como cookies adicionais.

## Diagnóstico temporário

Popup/relatório: **Diagnóstico onChanged**. JSON: `cookies.diagnostics`.

- `listenerActive`: conferido com `hasListener`.
- `totalReceivedSinceRegistration`: entrada no listener antes dos filtros.
- `probes`: consulta diagnóstica por nome/domínio do inventário ou tentativa HTTP; não estabelece vínculo causal com o header.
- `status: not-received`: nenhuma entrada encontrada para esta navegação até a coleta, com cobertura disponível. Não significa que o Firefox jamais disparou o evento.
- `status: discarded`: evento recebido, com motivo em `events[].decisions[].reason`.
- `status: associated`: evento real associado. Continua sendo correlação.
- `pending` e `inconclusive`: distinguem processamento pendente e perda de cobertura de ausência comprovada.
- `priorReceipts`: registros entregues antes do callback da navegação atual. Podem incluir o mesmo evento de `events` quando houve reavaliação; não somar as listas.
- `at`, `startedAt`, `navigationObservedAt`, `deltaMs`: horário de recebimento do evento, início informado pela rede, recebimento do início e diferença evento−início.
- `contextSource: navigation-start-replay`: recuperação de evento recebido antes do início observado; `contextCapturedAt` registra quando o contexto foi construído.
- `storeIdAtReceipt`/`storeStatusAtReceipt`: contexto disponível no recebimento. Na recuperação, a navegação atual ainda não era observada; esse fato é explícito. `storeIdAtContextCapture` e `storeIdAfterWait` mostram a resolução posterior.
- `readyAtReceipt`, `readyAfterWait`, `sameNavigation`, `hosts`, FPI e partição documentam as outras etapas.

Motivos incluem `before-window`, `after-window`, `partial-navigation`, `navigation-replaced`, `store-unavailable`, `store-mismatch`, `first-party-domain-mismatch`, `partition-site-mismatch`, `partition-scheme-mismatch`, `invalid-partition`, `ancestor-mismatch`, `host-mismatch` e erros de processamento. Valores de cookies e cabeçalhos brutos não são registrados. Diagnóstico limitado a 256 eventos, 64 decisões por evento e 256 hosts por descrição; truncamentos ficam explícitos.

## Repetição manual solicitada

1. Mantenha `npm run fixture` rodando. Use a mesma configuração limpa que mostrou baseline correto; não altere ETP/cookies para esse teste. Feche outras abas de localhost/127.0.0.1 e mantenha o mesmo container.
2. Recarregue Privacy Lens uma vez em `about:debugging#/runtime/this-firefox` para carregar o patch. Depois não recarregue a extensão entre setup e session.
3. Abra **http://localhost:8787/cookies/setup**. Espere **PRONTO + 2 s**, abra Privacy Lens e clique **Atualizar**. Confirme `pl3_existing` e `pl3_change` presentes, inventário 2 no perfil limpo.
4. Na mesma aba, abra **http://localhost:8787/cookies/session** uma única vez, pelo link ou URL. Não use Voltar nem recarregue a página.
5. Espere **PRONTO + 2 s**; abra Privacy Lens e clique **Atualizar**.
6. Esperado: inventário **3**, preexistentes **2**, preexistência não estabelecida **1**, eventos **1**, gravações **1**, criações inferidas **1**, alterações **0**, identidades prováveis **1**, tentativas HTTP **1**. O novo cookie é primeira parte/sessão.
7. Em **Diagnóstico onChanged**, procure `pl3_session`: deve mostrar **Evento recebido e associado**. Pode indicar **evento real reavaliado ao receber início da navegação**, ou associação direta se o Firefox entregar em outra ordem. Ambos são válidos.
8. Exporte o JSON como `cookies-session-diagnostico-relatorio.json` em `evidencias/screenshots/etapa_3_cookies/`, usando sufixo se já existir. Se permanecer zero, envie esse JSON: `status`, motivos e `priorReceipts` agora distinguem ausência de recebimento, filtros e ordem de entrega. Não copiar o objeto bruto de cookies do console.

É erro permanecer sem associação apesar de um evento `explicit` com contexto compatível e horário dentro da janela; o diagnóstico deve apontar o caminho. Set-Cookie sozinho continua insuficiente, mesmo com inventário 3.

## Integração reproduzível, sem screenshots

Verificações executadas em 28/09/2026: `npm test` **71/71, 0 falhas**; `npm run check` **OK**. No teste final em Firefox 156.0.1/macOS, três repetições produziram inventário 3, baseline 2, 1 criação inferida, 1 gravação e 1 tentativa HTTP. O evento chegou 8/4/4 ms depois do timestamp inicial da requisição e 28/14/21 ms antes de seu callback, respectivamente. As três associações usaram `navigation-start-replay`. Preferências observadas no perfil temporário: cookieBehavior 5, reduceTimerPrecision true, resistFingerprinting false. A configuração e o resultado do perfil manual ainda devem ser conferidos pelo aluno.

`tests/firefox_cookie_diagnostics.py` cria perfil e portas temporários, instala a extensão e repete setup/session três vezes. Não altera o perfil habitual nem configura ETP/cookieBehavior. Requer Firefox, geckodriver, Node e Python stdlib; não instala dependências no projeto.

```bash
python3 tests/firefox_cookie_diagnostics.py \
  --firefox /caminho/para/firefox \
  --geckodriver /caminho/para/geckodriver \
  --out /caminho/temporario/cookies-diagnostico.json
```

Sem `--out`, os relatórios ficam apenas em memória e o script imprime o diagnóstico sanitizado. Falha nas asserções se perder o evento. Esse teste automatizado não é evidência manual nem DDG.

Referências de API: [Mozilla cookies.onChanged](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged). A documentação descreve a notificação de alteração; a ordem entre callbacks de APIs diferentes acima foi observada na execução local, não presumida como garantia de ordenação da API.
