# Privacy Lens — Insper

Extensão Firefox para a Avaliação Intermediária de Cibersegurança. **Versão 0.2.0 / Etapa 2A — Canvas**, em 24/09/2026. A Etapa 1 foi validada pelo aluno no macOS/Firefox 156.0.1. Canvas está implementado e testado automaticamente; a validação manual deste bloco e suas evidências ainda estão pendentes. Ainda não cumpre todos os requisitos de C, B ou A.

**Comece pelo roteiro atual: [Canvas, atualização e prints obrigatórios](docs/ETAPA_2_CANVAS.md).** Ele define exatamente como atualizar sem alterar o histórico Git e quais capturas/JSONs salvar. [Lista de arquivos alterados](docs/ARQUIVOS_ETAPA_2_CANVAS.md).

## Comece aqui

1. Extraia o ZIP e abra esta pasta no VS Code.
2. Use Firefox 128 ou posterior. A versão mínima é um alvo de compatibilidade; veja a versão efetivamente testada em `docs/VALIDACAO_ETAPA_1.md`.
3. No Firefox, abra `about:debugging#/runtime/this-firefox`.
4. Clique em **Carregar extensão temporária** e selecione `extension/manifest.json`.
5. Abra uma página HTTP(S) **depois** da instalação, ou recarregue uma página aberta.
6. No menu de extensões, abra **Privacy Lens — Insper**. Você pode fixá-la na barra.
7. Clique em **Atualizar** para coletar novamente o armazenamento e os cookies; **Exportar JSON** salva os dados; **Abrir relatório** abre a mesma interface em uma aba para inspeção/prints.

Não há build, `npm install`, backend de produção ou serviço externo. Node é necessário somente para testes locais. A instalação temporária é removida ao encerrar o Firefox. Depois de editar arquivos, use **Recarregar** em `about:debugging` e recarregue a página testada.

## Validar a primeira etapa

Na raiz do projeto, com Node 20+:

```bash
npm test
npm run check
npm run fixture
```

Deixe o terceiro comando rodando. Abra **http://localhost:8787/** no Firefox, aguarde **PRONTO**, espere 5 segundos e abra o popup. Clique em **Atualizar**. Use um perfil de teste limpo, sem uBlock nesta medição inicial. Não é necessário alterar a proteção do Firefox.

| Medida | Esperado na fixture em perfil limpo |
|---|---|
| Primeira parte | `localhost` |
| Terceira parte | `127.0.0.1`, pelo menos 3 requisições |
| Cookies atuais | 5 próprios: 3 de sessão, 2 persistentes, um HttpOnly |
| Set-Cookie | 3 tentativas, correspondentes às três linhas HTTP |
| Gravações correlacionadas | Até 5 cookies na primeira carga; correlação não prova autoria da aba |
| Frame principal: localStorage | 2 chaves |
| Frame principal: sessionStorage | 1 chave |
| Frame principal: IndexedDB | 1 banco; não é contagem de registros |
| Frame terceiro | 1 chave local e 1 de sessão, ou acesso indisponível conforme a proteção |
| Score | Em preparação, sem nota fictícia |

Abra `http://localhost:8787/empty`: as requisições anteriores e gravações correlacionadas devem zerar; os 5 cookies existentes continuam no inventário. Abra `http://localhost:8787/redirect`: os dois passos da navegação HTTP devem constar no JSON. `localhost` e `127.0.0.1` apontam para seu computador, mas são sites diferentes para a classificação. Pare o servidor com Ctrl+C.

**Evidência a registrar agora:** print do popup em `localhost:8787`, print da seção de storage, JSON exportado e versão do Firefox. Salve em `evidencias/local/` usando nomes próprios para não sobrescrever os testes entregues. Envie os dois prints e o JSON para revisão. Se não carregar, envie o texto exato do erro de `about:debugging` e a versão do Firefox.

## O que está implementado

- Estado separado por aba e navegação, com preservação de hops HTTP de redirecionamento.
- Requisições por hostname, tipo, estado, status HTTP e contexto de documento quando disponível.
- Classificação primeira/terceira parte por eTLD+1 com PSL completa, incluindo PRIVATE, exceções e curingas.
- Inventário de cookies dos domínios observados: domínio, nome, sessão/persistente, expiração, HttpOnly, Secure, chave de partição. Filtragem pelo cookie store da aba e partição do site.
- Tentativas HTTP Set-Cookie separadas de cookies existentes e de gravações correlacionadas pela API de cookies.
- Snapshots localStorage/sessionStorage/IndexedDB por frame HTTP(S), com estados indisponível/sem suporte.
- Canvas: instrumentação Firefox no contexto real da página; distinção entre desenho, leitura e sequência compatível; evidência por API/frame.
- Popup, relatório em aba e exportação JSON. Dados transitórios ficam na memória da extensão.
- Testes de lógica e fixture local reproduzível.

## O que os números significam

**Terceiro não é sinônimo de rastreador.** O painel não transforma CDNs ou fontes externas em ataques. As quantidades são requisições observadas, não conexões TCP/TLS.

**Cookie existente não é cookie injetado nesta carga.** O inventário inclui preexistentes. `Set-Cookie` indica tentativa do servidor, inclusive se rejeitada pelo navegador. `cookies.onChanged` confirma alteração no armazenamento, mas não fornece tabId: a correlação limita-se aos domínios vistos, store, partição e primeiros 30 segundos. Outra aba do mesmo site pode participar da correlação. Ainda é necessário aprofundar atribuição de cookies na Etapa 2.

**Não observável não é zero.** Páginas internas, domínios protegidos pelo Firefox, frames opacos (`about:blank`, `srcdoc`, sandbox), workers e dados escritos/apagados entre snapshots têm lacunas. O inventário não diz quem originalmente gravou os dados. Scripts terceiros executados no documento principal escrevem no storage da origem desse documento.

**Limites:** 4.000 eventos de requisição, 2.000 tentativas Set-Cookie, 2.000 identidades de cookies correlacionadas e inventário dos primeiros 256 sites por navegação. Truncamentos de rede/headers/consulta são indicados. O relatório deve ser exportado antes de fechar a aba ou recarregar a extensão. SPA permanece na mesma navegação; histórico BFCache e cadeia de bounce entre documentos serão tratados na próxima etapa.

## Arquivos e plano

| Caminho | Responsabilidade |
|---|---|
| `extension/manifest.json` | Permissões, background, content script e popup |
| `extension/background.js` | Eventos do Firefox, estado, cookies e relatório |
| `extension/lib/domain.js` | PSL, classificação e redução de URLs |
| `extension/lib/model.js` | Metadados, filtros e agregação |
| `extension/content/storage.js` | Snapshots por frame |
| `extension/popup/` | HTML/CSS/JS da interface |
| `extension/vendor/` | PSL local e proveniência |
| `tests/` | Testes de lógica, teste Firefox opcional e fixture |
| `scripts/check.cjs` | Verificação de sintaxe e referências do manifest |
| `docs/PLANO_E_CHECKLIST.md` | C/B/A, riscos, cronograma e próximas etapas |
| `docs/ARQUITETURA.md` | Decisões técnicas e limites |
| `docs/SCORE_PROPOSTA.md` | Proposta preliminar de metodologia, sem resultados |
| `docs/TESTES_E_EVIDENCIAS.md` | Protocolo DDG, sites reais e reconciliação |
| `docs/RELATORIO_MODELO.md` | Esqueleto do futuro relatório PDF |
| `docs/VALIDACAO_ETAPA_1.md` | O que foi efetivamente validado nesta entrega |
| `docs/FONTES.md` | Documentação consultada |
| `evidencias/` | Resultados reais locais e espaços pendentes para DDG/sites |

## Git e próximo bloco

Seu histórico da Etapa 1 foi informado como validado e commitado. Esta entrega não inclui `.git` nem executa comandos no seu GitHub. Preserve os commits existentes e suas evidências. Não rode novamente git init e não substitua a pasta inteira do repositório.

Para este bloco, execute a validação de canvas descrita em `docs/ETAPA_2_CANVAS.md` e envie prints/JSONs. O próximo commit será indicado após essa validação. Cookies, DDG, score e outros recursos não foram misturados neste bloco.
