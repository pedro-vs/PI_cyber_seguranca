# Etapa 4 — indicadores avançados e preparação DDG

Versão 0.4.0. O aluno informou validação manual das etapas 1, 2 e 3 em macOS/Firefox 156.0.1, incluindo cookie terceiro e a correção de ordenação. Este bloco preserva essa implementação; adiciona observação de queries/navegações, contexto de storage e roteiro de evidências. Resultados oficiais DDG permanecem **NÃO EXECUTADOS**. A implementação não encerra todos os entregáveis do Conceito B do PDF: DDG manual, HAR/reconciliação de três sites e demais entregáveis obrigatórios dependem das próximas validações.

## Verificações executadas em 28/09/2026

- `npm test`: **107 testes, 107 passaram, 0 falharam, 0 ignorados**. Os 80 anteriores foram preservados; 25 testes do módulo avançado e 2 regressões de privacidade/contexto de storage foram acrescentados.
- `npm run check`: **OK**, manifest, referências e sintaxe JavaScript.
- `git diff --check`: **OK**; whitespace dos arquivos novos também conferido.
- Firefox **156.0.1/macOS**, perfil temporário, sem screenshots: controles de bounce HTTP negativo/positivo, query normal/controle final, query tracking, sync e bounce JS passaram. Duas rodadas completas, mais uma após reduzir a URL principal no estado, verificaram a interface/versão e a ausência do ID controlado no relatório. No caminho JS, observou-se `client-redirect-inferred` com confiança baixa.
- Regressão nativa `/cookies/setup → /cookies/third`: setup com inventário 2; terceiro com inventário 3, baseline 2, 1 evento/gravação, 1 criação inferida, 1 provável e 1 tentativa. Associação por `host-request-replay` preservada. Preferências lidas, sem alteração: cookieBehavior 5, reduceTimerPrecision true, resistFingerprinting false.
- Os **15 arquivos existentes** nas pastas `evidencias/screenshots/etapa_1/`, `etapa_2_canvas/` e `etapa_3_cookies/` mantiveram seus hashes SHA-256. Nenhuma evidência DDG foi gerada/preenchida. Sem commit, push ou rebase.

## Método implementado

`extension/lib/advanced-tracking.js` mantém um estado separado por aba/navegação. Registra metadados síncronos antes de esperar PSL/HMAC. A comparação recebe o timestamp e top host daquele evento, sem reclassificar eventos antigos pelo host final. Nova navegação zera comparações e queries; somente um histórico limitado de hops pode acompanhar uma ligação observada entre documentos.

**Bounce:** precisa de origem → intermediário → destino em main_frame, intermediário de site registrável diferente de origem e destino, e passagem de 0 a 10.000 ms. Redirect HTTP exige também a requisição observada ao destino; só um Location não completa a cadeia. Link de entrada é permitido. Redirect isolado, iframe, mesma organização ou passagem longa não bastam.

- `sequence-observed`: sequência observada com redirect HTTP/flag de cliente, sem sinal adicional suficiente de tracking.
- `indicator`: sequência com nome/forma de identificador ou gravação real de cookie já correlacionada e disponível no intermediário. Confiança moderada, sem rastreamento confirmado.
- `insufficient-evidence`: cobertura/sequência insuficiente para a regra; não significa ausência comprovada de tracking.

Firefox 156.0.1 não forneceu `client_redirect` no controle local de `location.href`. Há um caminho **explicitamente inferido**, de confiança baixa: navegação reportada como `link`, iniciador correspondente ao documento intermediário já ligado à origem, passagem ≤10 s e sinal adicional de identificador/gravação. Aparece como `client-redirect-inferred`; não comprova automatismo. Cliques rápidos, SSO e pagamentos podem produzir esse padrão. A regra não finge que a API forneceu a flag. Sem o sinal adicional, esse caminho é insuficiente.

Eventos de cookies são consultados apenas se já associados pela metodologia existente. Snapshots do intermediário, quando disponíveis, são contexto: não provam escrita nem identidade. Não se usa Set-Cookie nem delta de inventário como sucesso. Não se altera a janela de 30 s de cookies. IDs DDG curtos e declarados em nomes `bounceUIDcookie`/`bounceUIDlocalStorage` podem ser sinais de bounce; a igualdade entre valores curtos não é comparada.

**Cookie sync:** igualdade de identificadores em requisições da mesma navegação para sites registráveis diferentes, com contexto terceiro ou cadeia HTTP. HMAC-SHA-256 com chave aleatória não exportável, diferente por navegação/aba; valores são codificados transitoriamente para HMAC e não integram o estado/relatório. Nem chave nem hashes são exportados. O JSON usa rótulos locais `comparison-N`, domínios, parâmetros, horários e requestIds. Não há comparação com valores de cookies. A conclusão é propagação compatível com sync, não origem comprovada em cookie. Endpoint chamado sync sem propagação é apenas pista insuficiente. Hash de recurso reutilizado também pode coincidir: confiança baixa se não houver nome de ID/endpoint, moderada se houver.

**Query parameters:** nomes de campanha (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `fb_source`), IDs de clique (`fbclid`, `gclid`, `dclid`, `msclkid`, `twclid`, `ttclid`, `yclid`), nomes de ID, forma de alta entropia e reutilização entre sites. Campanha não vira ID individual automaticamente. O filtro de forma exige 16–256 caracteres alfanuméricos/`_-`, letras e números, ao menos 8 caracteres distintos e entropia de Shannon ≥3,3 bits/caractere. É uma aproximação, não medição de unicidade. A comparação exige ≥8 caracteres. `page=2`, `q`, `id=1234`, paginação, idioma, cache busters comuns e credenciais/controles de autenticação como state/code/nonce/token ficam fora da comparação. Nomes fora do formato alfanumérico simples de até 64 caracteres são omitidos também na lista de queryKeys da rede. Valores, fragmentos e credenciais de URL não são exportados; paths e nomes legíveis ainda podem ser sensíveis.

## Relatório e limites

- `schemaVersion: 3` permanece compatível; campo adicional `advancedTracking.version: advanced-tracking-v1`. `extensionVersion` vem do manifest (0.4.0), como o rodapé.
- Bounce: rota, tipo de ligação, iniciador quando disponível, timestamps, motivo, confiança e ressalvas. Cookie sync: domínios e ocorrências pseudonimizadas. Query: motivo e contexto por parâmetro.
- Rede oferece detalhes expansíveis com requestId, tipo, estado, erro, HTTP e redirect. Falha/cancelamento/ausência não identificam a proteção responsável; esta versão não bloqueia nem limpa URLs.
- Storage acrescenta origem principal na coleta, parte/contexto e presença do frame no último refresh. Um frame removido pode ter somente snapshot anterior. Não compara valores entre top sites/abas; não conclui particionamento HTML5 pela contagem ou pela chave de cookie. Frames transitórios, aba auxiliar fechada, APIs de cache, service workers e frames opacos têm cobertura limitada.
- Limites adicionais por navegação: 512 observações (requests + destinos de redirects), 24 parâmetros/URL, 256 caracteres por valor comparado, URL de até 16.384 caracteres para análise, 4.096 HMACs, 32 hops atuais, 8 hops anteriores e 128 resultados por lista. Perdas, hashes indisponíveis/pendentes e timestamps fora de ordem sinalizam cobertura parcial. Atualizar novamente após estabilizar as requests.
- Novas abas não herdam cadeias/IDs; fechar aba e recarregar extensão descartam o estado. BFCache, navegações não observadas, POST, identificadores transformados, CNAME e workers sem tabId continuam limitados. Um cookie pode ter sido escrito antes da instrumentação; isso não sustenta criação retroativa.
- Sem novos hooks de navegador, score, lista de bloqueio ou permissões. Instrumentação canvas e inferência de cookies preservadas.

## Validação local curta

Reinicie `npm run fixture` para carregar as rotas novas. Recarregue a extensão **uma vez antes dos casos**, confirme 0.4.0. Mesma aba/container, janela normal, outras abas localhost/127 fechadas. Não precisa apagar cookies/storage para estes controles; eles não escrevem cookies nem storage. Digite a URL de cada caso independente na barra, evitando Voltar/Avançar. Espere página final carregada + **2 s**, Atualizar, expandir Tracking avançado, exportar JSON antes de ir ao próximo caso.

| Caso / URL completa | Ação e resultado esperado |
|---|---|
| http://localhost:8787/tracking/bounce-negative | Redirect próprio único; Bounce: evidência insuficiente, 0 sinais query, 0 sync. |
| http://localhost:8787/tracking/bounce-positive | Seguir redirects automaticamente. Rota localhost → 127.0.0.1 → localhost, 1 sequência com indicador de bounce; UID propagado também pode gerar 1 indicador de sync, evidência distinta da classificação de bounce. |
| http://localhost:8787/tracking/query-normal?page=2 | 0 sinais query, 0 sync, sem bounce. |
| http://localhost:8787/tracking/query-tracking?utm_source=privacy-lens&uid=Pl4A92f7C6d13E80b5 | Campanha/UID são sinais potenciais; mesmo ID em recurso terceiro gera 1 indicador de propagação. `Pl4A92f7C6d13E80b5` é público da fixture, mas não pode aparecer no JSON. |
| http://localhost:8787/tracking/cookie-sync | Request a 127.0.0.1 com redirect para localhost: 1 comparação/indicador de sync, sem bounce de main_frame. Não lê nem comprova origem em cookie. |
| http://localhost:8787/tracking/start-client | Clicar **Iniciar**; aguardar destino. Rota de três domínios/hosts localhost → 127.0.0.1 → localhost, indicador com `client-redirect` ou `client-redirect-inferred` explicitamente limitado. |
| http://localhost:8787/tracking/query-normal?page=2 | Repetir ao final: 0 sinais/0 sync, sem herdar a sequência anterior. |

É erro: negativo/funcional gerar indicador; eventos misturarem abas; URL/query/cookie value vazar no JSON; sync afirmar leitura de cookie; bounce inferido aparecer como flag confirmada; ou versão divergente entre rodapé/manifest/JSON. Falha de recurso, cobertura truncada ou HMAC pendente deve ser registrada como limitação, sem falsificar resultado.

O teste opcional `python3 tests/firefox_cookie_diagnostics.py --scenario tracking --repeats 2 --firefox <binário> --geckodriver <binário> --out <arquivo-temporário.json>` usa Firefox headless em perfil temporário, somente fixtures locais, sem screenshots e sem mudar ETP/TCP. O arquivo é diagnóstico automatizado local, nunca evidência DDG/manual.

## Evidências oficiais

Seguir [o roteiro completo dos sete testes](VALIDACAO_DDG_V04.md), com formato de print obrigatório, URL, preparação, ação, espera, esperado documental e destino de cada arquivo. Preencher [a tabela manual](../evidencias/duckduckgo/RESULTADOS.md) somente depois de executar. Pastas/screenshots anteriores permanecem preservadas. Não foi feito commit/push/rebase.

## Fontes e decisões

PDF fornecido: `/Users/robertosepulvedajr/Downloads/Avaliacao_Intermediaria_Ciberseguranca.pdf`. Define entregáveis C/B e evidências obrigatórias; instruções de prazo/histórico nele não autorizam commits nesta tarefa.

[webRequest.onBeforeRedirect](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRedirect), [webNavigation.onCommitted](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCommitted), [Web Crypto HMAC/sign](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign) e [código DDG](https://github.com/duckduckgo/privacy-test-pages) consultados para APIs e procedimentos. Limiares, filtros de parâmetros, confiança e exigências de sequência são decisões heurísticas deste projeto, não garantias da API.
