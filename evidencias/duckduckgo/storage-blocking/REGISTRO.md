# DDG — Storage Blocking

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

Após Store, Retrieve deve recuperar o valor gravado nos mecanismos disponíveis e acessíveis. O teste distingue o documento principal e os iframes; sucesso local não demonstra acesso sob outro top site.

## Resultado da página

Store informa 23 mecanismos, 1 falha no resumo; Retrieve informa 23, 2 falhas no resumo. O valor 855 é recuperado nas três APIs principais do top-level e dos iframes safe/tracking. No iframe ad, localStorage/sessionStorage recuperam 855, mas IndexedDB apresenta DB is not defined. WebSQL apresenta openDatabase is not defined. Há erros adicionais de CookieStore, service worker e requisição no detalhe; os resumos não são a soma simples de todos os erros aninhados.

## Resultado do Privacy Lens

No recorte E13, o top-level privacy-test-pages.site tem 0 chaves locais, 0 de sessão e 0 bancos, coletados às 23:47:09. broken.third-party.site tem 1/1/1 às 23:48:15 e está removido no refresh. good.third-party.site aparece, mas suas contagens ficaram fora do recorte. Não há JSON deste teste no lote.

## Concordância e divergência

Parcial. Há storage observado no frame broken, mas a imagem não permite confirmar todos os frames. O top-level diverge do Retrieve por representar um snapshot anterior à captura do Store, feita às 23:50:29.

O snapshot das 23:47:09 antecede as capturas do Store e do Retrieve; não comprova o estado às 23:52:47. O instante exato da ação Store não foi registrado, e a causa da defasagem/divergência não está estabelecida. DB is not defined identifica falha do helper da página, não demonstra indisponibilidade da API IndexedDB. Não se completaram as antigas alegações de 1/1/1 no safe ou 1/1/0 no ad: esses números não estão no recorte recebido. Cookies e valores do DDG não são lidos pelo inventário HTML5 do plugin.

## Evidências

- **E11** — [ddg-storage-blocking-store.png](ddg-storage-blocking-store.png)
- **E12** — [ddg-storage-blocking-retrieve.png](ddg-storage-blocking-retrieve.png)
- **E13** — [ddg-storage-blocking-plugin.png](ddg-storage-blocking-plugin.png)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
