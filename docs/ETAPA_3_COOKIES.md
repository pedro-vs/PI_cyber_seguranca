# Etapa 3 — atribuição de cookies e validação local

Validação inicial em 28/09/2026: alterações recuperadas dos patches da execução anterior com autorização do aluno. Naquela execução, `npm test`: **60 testes, 60 pass, 0 fail**, incluindo os 26 originais, 29 de cookies/background e 5 de regressão de storage; `npm run check`: **OK**. DDG: **NÃO EXECUTADO**.

Atualização 0.3.0: `npm test`: **80 testes, 80 passaram, 0 falharam**, preservando rede, storage, canvas e o controle de host posterior ao evento. O aluno informou aprovação manual de `/cookies/change` e da lógica principal de `/cookies/rejected`. A correção de `/cookies/third` foi verificada automaticamente em Firefox 156.0.1/macOS, em três repetições com perfil temporário: setup com inventário 2; terceiro com inventário 3, baseline 2, uma tentativa, um evento/gravação e uma identidade provável terceira/sessão. Em todas, o request do iframe começou 3 ms antes do evento; seu callback chegou 22/17/21 ms depois do evento, respectivamente. `host-request-replay` associou o evento real. Limpeza também exercitada após cookies de sessão, persistentes, paths distintos, raiz e terceiro particionado. A data `Expires` no passado evita as entradas expiradas que foram observadas com `Max-Age=0`. Integração reproduzível por `tests/firefox_cookie_diagnostics.py --scenario third --exercise-cleanup --firefox <binário> --geckodriver <binário>`; sem screenshots, sem alterar ETP/TCP e sem valores de cookies nos relatórios. Repetição manual de terceiro: **PENDENTE**.

## O que cada medida significa

| Conceito | Evidência e limite |
|---|---|
| A. Preexistente observado | Identidade observada antes do início da requisição principal, ainda conhecida no histórico. A lista é congelada para a navegação. Não é um inventário completo anterior ao carregamento. |
| B. Inventário atual | Resultado de `cookies.getAll` para os sites observados e store da aba, filtrado por contexto. Pode incluir paths não solicitados, cookies antigos e escritos depois dos 30 s. Não prova envio nem criação. |
| C. Tentativa Set-Cookie | Campo HTTP observado em uma resposta da aba, incluindo instruções de exclusão. Guarda só nome, URL reduzida, host, requestId e horário. Não se converte em sucesso e não é somado às gravações. |
| D. Criação inferida | Evento não removido `explicit`, sem identidade anterior nem remoção `overwrite` conhecida, com histórico não truncado. É inferência da sequência observada; não garante continuidade perfeita da API nem autoria da página. |
| E. Alteração | Mesma identidade já observada, ou sequência remoção `overwrite` + escrita em até 1 s. A remoção e a escrita são dois eventos brutos e uma gravação. Não comparamos valores. Uma substituição atrasada sem evidência suficiente fica indeterminada. |
| F. Evento na janela | Recebimento de `onChanged` entre o timestamp inicial e inicial + 30.000 ms, inclusive. É uma janela operacional fixa, não o intervalo até `load`. Atualizar só consulta; não reinicia a janela. |
| G. Atribuição à aba | Set-Cookie pertence a uma resposta observada naquela aba. `onChanged` não fornece tabId/requestId: o evento é correlacionado a todas as navegações observadas compatíveis, sem comprovar autoria. |

O painel mostra eventos brutos, gravações e identidades únicas provavelmente criadas/alteradas. Uma identidade criada e depois alterada conta duas gravações, mas uma identidade. Um preexistente pode também ser alterado. Essas medidas se sobrepõem: **não somar**.

Metadados e identidade incluem nome, domínio, path, cookie store, FPI e chave de partição. Classificação primeira/terceira parte usa a PSL existente; sessão/persistente usa a informação do cookie fornecida pelo Firefox. Nos eventos, a parte e top URL são as observadas naquele instante; no inventário, referem-se ao contexto atual. O indicador adicional `hasCrossSiteAncestor`, quando fornecido, é preservado na identidade; não inferimos a árvore completa de ancestrais dos frames.

## Histórico, privacidade e limitações

- O histórico em memória recebe metadados de eventos globais acessíveis à extensão e das consultas de inventário. Não consulta todos os cookies do perfil. Eventos globais podem vir de outras abas ou processos. O relatório filtra por domínios observados, store, FPI e top site da partição.
- `getAll` é assíncrono. Um snapshot concluído depois do início não vira prova de preexistência daquela navegação. Pode alimentar navegações futuras. Se houve evento durante a consulta, o snapshot não alimenta o histórico, e `inventoryChangedDuringQuery` avisa que a leitura não é atômica.
- Sem observação anterior, aparece **Preexistência indeterminada**, inclusive ao instalar/recarregar a extensão com cookies antigos. Isso não significa que sejam novos. Uma criação inferida pode coexistir com preexistência não estabelecida.
- Uma única navegação compatível não prova autoria: outra aba parada, worker ou processo pode escrever. `matchingObservedNavigations` é apenas a quantidade de navegações monitoradas compatíveis, não a quantidade de autores possíveis.
- A instalação/reinicialização perde o histórico. Uma página já aberta é parcial até navegar/recarregar. BFCache, SPA, mudanças do relógio e atrasos de entrega da API limitam a leitura temporal. Nenhum cronômetro novo nasce ao abrir o popup.
- Limites: 4.000 identidades no histórico, 4.000 marcadores de overwrite, 2.000 eventos detalhados por navegação, 2.000 tentativas HTTP, 4.000 requests e 256 sites consultados. Perdas são indicadas; detalhes truncados são um subconjunto. Após perda no histórico, ausência de identidade deixa de sustentar inferência de criação.
- Valores de cookies e cabeçalhos brutos são descartados na entrada. Popup, JSON e logs não recebem esses valores. Nomes, paths e domínios continuam visíveis e podem conter informação sensível.
- JSON passa a `schemaVersion: 3`; os campos anteriores de rede, storage, canvas e cookies são mantidos. Versão da extensão **0.3.0**, também no rodapé; o cabeçalho mostra **ETAPA 3 · COOKIES**.

Fontes primárias: [cookies.onChanged](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged), [cookies.getAll](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAll), [cookies.Cookie](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/Cookie), [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie). O método e os limites temporais acima são decisões deste projeto, não garantias de atribuição oferecidas pelas APIs.

## Preparação no Firefox

1. Na raiz do projeto, execute `npm run fixture` e mantenha o terminal aberto. Se um servidor antigo estiver ocupando a porta, encerre aquele processo e inicie o atualizado. Não é necessário `npm install`.
2. Use um perfil de laboratório limpo, janela normal, sem outros cookies de localhost/127.0.0.1. Isso evita apagar seus dados de navegação habituais. Se reutilizar um perfil com a fixture antiga, o inventário geral poderá incluir cookies `pl_*` além dos novos `pl3_*`.
3. Em `about:debugging#/runtime/this-firefox`, recarregue Privacy Lens, ou carregue `extension/manifest.json`. Confirme **ETAPA 3 · COOKIES**. Faça isso uma vez, antes do setup.
4. Mantenha o mesmo container e a mesma aba de teste. Feche outras abas de localhost/127.0.0.1. No perfil de laboratório, deixe somente Privacy Lens ativa; registre versão do Firefox, SO, ETP e políticas de cookies. Não reduza as proteções para obter um resultado.
5. Navegue pelos links ou digitando a URL, sem usar Voltar/Avançar. Não recarregue a extensão entre setup e cenário. Recarregar uma página que escreve pode trocar criação por alteração.
6. Em cada medição, aguarde **PRONTO + 2 segundos**, abra Privacy Lens e clique **Atualizar**. Use **Abrir relatório** se necessário. Exporte o JSON antes da próxima navegação.

**Ordem dos cenários:** setup → preexisting → session → persistent → third → change → rejected. Para obter os totais isolados abaixo, **repita setup entre os cenários medidos**, sempre esperando PRONTO + 2 s e Atualizar. Paths e late ficam para depois como controles adicionais.

## Roteiro por página

### 1. Preparação

- URL: http://localhost:8787/cookies/setup
- Antes: servidor atualizado, extensão carregada e condições acima. No primeiro teste, perfil limpo.
- Espera: PRONTO + 2 s; Atualizar; conferir nomes antes de seguir.
- Privacy Lens: inventário **2**, ambos primeira parte/sessão: `pl3_existing` e `pl3_change`. A limpeza cobre os sete nomes definidos pela fixture nos paths `/`, `/cookies` e `/cookies/sub`, nas variantes sem/com `Partitioned`: **44 tentativas HTTP próprias** (42 exclusões + 2 definições) e **42 terceiras** no iframe sob o mesmo top site/container. Usa `Expires` no passado. Tentativa inclui exclusão de cookie inexistente. Eventos e preexistentes podem variar devido à limpeza; não usar setup como caso medido. Outros nomes, top sites e containers não são apagados.
- Erro: página não chega a PRONTO; nomes de preparação ausentes; script/iframe 404; erro no popup. Cookies extras `pl_*` indicam contaminação do perfil, não criação indevida pelo detector.

### 2. Preexistente

- URL: http://localhost:8787/cookies/preexisting
- Antes: setup concluído + Atualizar, mesma aba/container; nenhuma limpeza posterior.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **2**, preexistentes observados **2**, ambos sessão/primeira parte. **0 eventos, 0 gravações, 0 prováveis e 0 tentativas**. Cada nome deve indicar **Observado antes da navegação** e **sem gravação correlacionada**.
- Erro: algum desses cookies aparecer como criação desta navegação, ou preexistência indeterminada apesar da preparação e histórico preservado.

### 3. Primeira parte / sessão

- URL: http://localhost:8787/cookies/session
- Antes: repetir setup + Atualizar; abrir session uma única vez.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **3**, todos primeira parte/sessão; preexistentes **2**. `pl3_session`: **1 criação inferida, 1 gravação, 1 evento, 1 identidade provável e 1 tentativa Set-Cookie**. No inventário, sua preexistência não está estabelecida; isso é diferente de uma gravação de tipo indeterminado.
- Erro: cookie novo contado como preexistente ou alteração após setup; mais de uma identidade; sessão classificada persistente; tentativa sozinha promovida a sucesso.

### 4. Primeira parte / persistente

- URL: http://localhost:8787/cookies/persistent
- Antes: repetir setup + Atualizar; abrir persistent uma única vez.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **3**: **2 sessão + 1 persistente**, todos primeira parte; preexistentes **2**. `pl3_persistent`: **1 criação inferida, 1 gravação, 1 evento e 1 identidade provável**, expiração próxima de 24 horas. **0 tentativas Set-Cookie**, pois a escrita é JavaScript.
- Erro: persistente classificado sessão; tentativa HTTP atribuída a essa escrita; evento ausente com cookie efetivamente criado e sem perdas/erros de cobertura.

### 5. Terceira parte

- URL: http://localhost:8787/cookies/third
- Antes: repetir setup + Atualizar; manter ETP e políticas inalteradas. O setup tenta apagar `pl3_third` no mesmo contexto particionado; a ausência deve ser conferida se repetir o teste.
- Espera: PRONTO + 2 s, incluindo o iframe; Atualizar.
- Diagnóstico: `pl3_third` deve mostrar **Evento recebido e associado** quando aceito. A associação pode usar `host-request-replay`: o callback da requisição chegou tarde, mas seu `timeStamp` é anterior ou igual ao horário original do evento. `hostEvidence` documenta os dois horários; hosts com requisição posterior não autorizam reavaliação. A contagem é única por evento/navegação, sem comprovar autoria exclusiva da aba.
- Privacy Lens: rede deve mostrar `127.0.0.1` como **terceira parte**. **1 tentativa Set-Cookie** chamada `pl3_third`. Os próprios continuam **2 preexistentes**. Se recusado, inventário **2**, **0 gravações e 0 prováveis**. Se aceito pela política de HTTP local/cookies, inventário **3**, com `pl3_third` de **terceira parte/sessão**, e **1 gravação/1 identidade provável**; após limpeza efetiva, criação inferida. Confira a partição informada. A fixture usa SameSite=None; Secure em HTTP local, portanto não garante aceite.
- Erro: terceiro classificado primeira parte; sucesso alegado só pelo header; cookie de outro container/top site associado. Recusa por Firefox **não é erro do Privacy Lens**. Iframe não carregado impede avaliar o cenário; ausência de evento não identifica por si só qual proteção atuou.

### 6. Alteração

- URL: http://localhost:8787/cookies/change
- Antes: repetir setup + Atualizar; confirmar `pl3_change` presente antes de abrir change.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **2**, preexistentes **2**, primeira parte/sessão. `pl3_change`: **1 alteração, 0 criações, 1 gravação, 1 identidade provável e 1 tentativa HTTP**. Normalmente **2 eventos brutos**: remoção `overwrite` e escrita `explicit`. Não são dois cookies criados.
- Erro: classificar como criação ou aumentar inventário para 3; tratar overwrite como uma segunda gravação; expor o valor alterado.

### 7. Tentativa recusada

- URL: http://localhost:8787/cookies/rejected
- Antes: repetir setup + Atualizar.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **2**, preexistentes **2**; **1 tentativa Set-Cookie** `pl3_rejected`, com **aceite indeterminado**. **0 eventos, 0 gravações e 0 prováveis**; `pl3_rejected` ausente do inventário. O domínio inválido do header é a condição controlada de recusa; a extensão não anuncia diagnóstico de bloqueio.
- Erro: tentativa incrementar criação/gravação; nome aparecer como cookie efetivamente presente; UI anunciar aceite confirmado.

### Controles adicionais

**Paths — http://localhost:8787/cookies/paths**

- Antes: repetir setup + Atualizar.
- Espera: PRONTO + 2 s; Atualizar.
- Privacy Lens: inventário **4**, preexistentes **2**; **2 tentativas, 2 criações inferidas, 2 gravações/eventos e 2 identidades prováveis**, primeira parte/sessão. `pl3_path` deve ter duas entradas distintas: `/cookies` e `/cookies/sub`. A segunda pode não aparecer em `document.cookie` desta página, mas consta do inventário de domínio.
- Erro: colapsar as duas entradas porque têm o mesmo nome ou ocultar o path na comparação.

**Fora da janela — http://localhost:8787/cookies/late**

- Antes: repetir setup + Atualizar; manter a aba ativa e não recarregar durante a espera.
- Espera: aguardar o texto de espera mudar para **PRONTO**, depois mais 2 s: aproximadamente **34 segundos** desde a abertura.
- Privacy Lens: inventário **3**, preexistentes **2**, todos primeira parte/sessão; `pl3_session` presente, **sem gravação correlacionada**. **0 eventos na janela, 0 gravações, 0 prováveis e 0 tentativas HTTP**. Texto **janela encerrada**. O inventário atual pode conter escrita tardia sem associá-la à janela inicial.
- Erro: escrita tardia contada dentro dos 30 s, ou Atualizar reabrir a janela.

## Evidências locais e preservação

O aluno deve capturar página/URL e seção Cookies da extensão, com contagens e detalhes relevantes legíveis. Para alteração, abrir eventos; para paths, abrir inventário com os dois paths; para rejeição, mostrar tentativa e ausência no inventário. Pode usar duas capturas por caso se necessário, mais JSON exportado.

Salvar em `evidencias/screenshots/etapa_3_cookies/`, com bases `cookies-setup`, `cookies-preexisting`, `cookies-session`, `cookies-persistent`, `cookies-third`, `cookies-change`, `cookies-rejected`, e, opcionalmente, `cookies-paths`/`cookies-late`: sufixos `-pagina.png`, `-plugin.png` e `-relatorio.json`. Prints são de desenvolvimento; nenhum destes é evidência DDG. Nenhuma captura foi gerada pelo agente.

Preservar integralmente `evidencias/screenshots/etapa_1/`, `evidencias/screenshots/etapa_2_canvas/`, demais evidências históricas, testes originais e `.git`. Não sobrescrever arquivos de execuções anteriores; usar sufixo de data/repetição.

Depois dos cookies, como conferência manual de regressão, usar a fixture anterior `http://localhost:8787/` e controles canvas já validados. Os cookies pl3_* permanecem no inventário desse domínio; comparar os 5 cookies pl_* da fixture antiga por nome, ou usar outro perfil limpo. Storage principal continua 2 chaves localStorage, 1 sessionStorage e 1 banco IndexedDB. Os roteiros anteriores permanecem preservados.

**Próximo passo:** receber a validação manual e os JSONs/capturas do aluno. DDG Tracker Reporting, Storage Blocking e Canvas permanecem pendentes, sem resultados esperados ou observados preenchidos neste bloco. Nenhum commit foi executado.
