# Arquitetura e limites

## Decisão para Firefox

Manifest V2, background persistente via `background.scripts`, content scripts em `document_start`/`all_frames`, popup HTML/CSS/JS. Mozilla mantém MV2; MDN documenta que background service worker não é o modelo suportado no Firefox. MV3 com event page também é possível, mas acrescentaria persistência/reidratação do estado sem benefício necessário neste prazo. A decisão não decorre de falta de `webRequestBlocking` em MV3: o Firefox também o suporta.

Compatibilidade alvo Firefox 128+. PSL é embarcada, sem depender da API `publicSuffix`, mais recente. O snapshot de PSL usa a fonte oficial e evita consultas externas durante navegação. Não há dependências npm de produção. Índices JavaScript em memória usam Maps, Sets e objetos simples.

## Caminho dos dados

1. `webRequest.onBeforeRequest` inicia/atualiza uma navegação da aba e registra cada hop observável. Redirects com o mesmo requestId mantêm o contexto.
2. `onHeadersReceived`, `onBeforeRedirect`, `onCompleted`, `onErrorOccurred` complementam estado HTTP. Um erro não é atribuído automaticamente ao uBlock ou à ETP.
3. Cada content script conta localStorage/sessionStorage e enumera bancos IndexedDB por `databases()`. Não abre bancos nem lê registros, evitando criar dados ou travar transações do site.
4. Mensagens passam pela identidade interna da extensão; o background deriva origem/aba/frame do remetente e confere o frame atual. A página não recebe acesso direto a essas APIs.
5. O relatório consulta cookies dos sites observados no cookie store da aba e filtra domínio/hostOnly, primeira parte isolada e partição. Dedupe: store + domínio + caminho + nome + partição + FPI.
6. O popup pede relatório, renderiza com `textContent` (sem inserir HTML da página) e exporta JSON. Query values, fragments, valores de cookies/storage não são guardados no relatório; caminhos, nomes e domínios permanecem para investigação.

## Permissões atuais

| Permissão | Motivo |
|---|---|
| `<all_urls>` | Observar páginas HTTP(S) e recursos de qualquer site dos testes |
| `tabs` | URL da aba ativa, cookieStoreId e seleção do relatório |
| `webRequest` | Eventos de rede e cabeçalhos de resposta |
| `webNavigation` | Contexto e validação dos frames |
| `cookies` | Inventário incluindo HttpOnly e eventos de alteração |

Na Etapa 1 não há `webRequestBlocking` ou `storage`: só serão adicionadas quando houver blocklist. O futuro bloqueio deverá validar hostname, bloquear também subdomínios com fronteira correta, manter allow/remove, persistir em `browser.storage.local` e registrar a própria decisão. Sem backend e sem alterar homepage, proxy ou mecanismo de busca. Navegação privada foi desabilitada no manifest para manter o escopo claro.

## Primeira e terceira parte

Comparamos o domínio registrável do recurso com o da página principal final. Subdomínios de `exemplo.com.br` são mesma parte; tenants distintos em `github.io` são partes diferentes. IPs e hosts locais usam o próprio hostname. Esquema/porta não entram nesta classificação de propriedade; origem de storage inclui esquema e porta. FPI/partitionKey são comparados separadamente, incluindo esquema da partição.

CNAME cloaking não é resolvido. A classificação não identifica o controlador jurídico do domínio. O snapshot PSL pode envelhecer; sua versão e hash constam em `extension/vendor/PROVENIENCIA.md`.

## Cookies e limites de inferência

`getAll` pode incluir cookies preexistentes e cookies com caminho que não foi solicitado nesta visita. É um inventário de domínios observados, não prova de transmissão. `onChanged` não informa requestId/tabId: associamos eventos aos contextos compatíveis por 30s e contamos identidades únicas, sem alegar criação exclusiva. Quando várias abas do mesmo site estão abertas, a atribuição pode ser ambígua. O processamento aguarda a resolução do cookieStoreId e da PSL sem adiar o registro dos listeners de rede. A próxima etapa deve aprofundar a atribuição antes de fechar o critério de “injetados”.

Partições de outros top sites são excluídas; cookies não particionados permanecem possíveis candidatos do inventário, sem afirmar que teriam sido enviados em contexto terceiro. Possuir partitionKey é observação da API, não prova geral de funcionamento do storage partitioning.

## Storage

Medimos estado nos momentos `document_start`, DOMContentLoaded, pageshow, após 1s/5s, evento storage e pedido manual. A contagem pode perder escritas breves. Um armazenamento vazio não prova que não foi acessado. Frames repetidos podem compartilhar storage: não somamos contagens como se fossem bancos independentes. `IndexedDB.databases()` dá quantidade de bancos, não quantidade de object stores/registros. Workers não são instrumentados.

## Instrumentação incremental

- Canvas implementado na v0.2.0: wrappers Firefox com wrappedJSObject/exportFunction, desenho/leitura/indício separados, mesmos canvas/frame e intervalo de 5 s. Não altera score. Detalhes e limites em ETAPA_2_CANVAS.md; js-leaks ainda não executado.
- Cookie sync: observar fluxo de identificador entre domínios, com hash efêmero e evidência de origem/destino; remover valores brutos e não classificar `utm_source` como ID de usuário automaticamente.
- Bounce: histórico limitado entre navegações, redirects HTTP e client-side; considerar permanência e interação. Login legítimo é controle negativo.
- Hook: WebSocket/polling com janela temporal, domínio e contexto; comparar descritores de globais e mudanças não causadas pela própria extensão. Sinais não equivalem a exploração confirmada.
- Mensagens oriundas do contexto da página serão tratadas como observações não confiáveis: validação de esquema, limites e sem comandos privilegiados.

## Memória e reprodutibilidade

Novo carregamento cria estado; fechar aba o remove. O background mantém apenas a sessão ativa de cada aba. Limites são documentados no README. Exportar antes de navegar. O logger contém horários/requestId/tipos/status suficientes para cruzamento inicial com HAR, mas não substitui o HAR nem fornece pilha completa do initiator.
