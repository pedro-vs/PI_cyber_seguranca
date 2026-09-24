# Validação efetivamente executada — 24/09/2026

## Resultado

Etapa 1 executada em **Firefox 156.0.1**, Linux, modo headless, geckodriver 0.37.1, perfil temporário e fixture local. Instalação temporária via WebDriver aceita pelo Firefox. O fluxo manual `about:debugging` no computador do aluno continua a ser conferido.

11 testes de lógica passaram em Node 24.19.0; a verificação de manifest, referências e sintaxe JavaScript passou. O script `tests/firefox_smoke.py` executou testes de integração com APIs reais do Firefox e asserções, não mocks.

| Verificação real | Resultado observado |
|---|---|
| Instalação temporária | `privacy-lens@projeto.insper` carregada |
| Rede da fixture | 7 requisições: 3 próprias e 4 terceiras, 0 falhas nesta execução |
| Domínios | `localhost` própria; `127.0.0.1` terceira |
| Cookies atuais | 5 próprios, 3 de sessão e 2 persistentes; um HttpOnly |
| Tentativas Set-Cookie | 3 |
| Cookies com alterações correlacionadas | 2; não usar essa métrica isoladamente como total exato de cookies injetados |
| Storage principal | localStorage 2 chaves; sessionStorage 1; IndexedDB 1 banco |
| Storage do frame terceiro | localStorage 1 chave; sessionStorage 1; IndexedDB 0 bancos |
| Nova página `/empty` | Rede terceira zerada, tentativas/gravações zeradas; os 5 cookies existentes permaneceram no inventário |
| Redirect `/redirect` → `/` | Dois passos main_frame; primeiro como redirect; URL final correta |
| Segunda aba em `127.0.0.1/empty` | Relatório independente, sem os cookies de `localhost` |
| Interface | Renderizada pelo Firefox; screenshots de topo e storage inspecionados |
| Score | Nulo / não implementado, conforme o escopo |

Gravações correlacionadas não cobriram as cinco identidades nesta execução. As três tentativas HTTP e o inventário de cinco cookies são evidências diferentes; não somar cegamente métricas em páginas gerais, pois podem se sobrepor. A atribuição causal é uma pendência conhecida para o próximo bloco. O enunciado pede contagem de cookies injetados: esta primeira entrega não declara esse requisito definitivamente encerrado.

## Correção descoberta durante a execução

A primeira navegação podia ocorrer antes da leitura assíncrona da PSL e perder eventos. A correção registra os listeners de rede imediatamente, usando a PSL na classificação posterior. O teste foi repetido com sucesso após a alteração. O perfil foi recriado entre execuções.

## Arquivos de evidência

- `evidencias/local/firefox-report.json`: relatório real da fixture exportado pela API da extensão.
- `evidencias/local/firefox-smoke.json`: sumário das asserções bem-sucedidas e ambiente.
- `evidencias/local/fixture.png`: página controlada pronta no Firefox.
- `evidencias/local/relatorio-firefox-topo.png`: interface da própria extensão aberta em aba.
- `evidencias/local/relatorio-firefox-storage.png`: storage/limitações na mesma interface.

Os prints são da interface real em aba, para inspeção automatizada. Não são prints DDG nem screenshots do popup sobre um site sorteado.

## Limites do ambiente de teste

O ambiente Linux de execução não permite o namespace adicional do sandbox interno dos processos Firefox. Para o teste da fixture local, foram usados os parâmetros de ambiente `MOZ_DISABLE_CONTENT_SANDBOX=1`, `MOZ_DISABLE_RDD_SANDBOX=1` e `MOZ_DISABLE_GMP_SANDBOX=1`, somente no processo de teste temporário. **Isso não altera o manifest, não é necessário para o aluno e não deve ser reproduzido no navegador de uso diário.** A execução normal no Firefox do aluno é o próximo gate.

As preferências de privacidade ETP/TCP não foram reduzidas para fazer o teste passar. O Firefox de teste teve proxy automático desativado para falar com a fixture local. Os binários e o perfil do navegador não fazem parte do projeto.

## Não executado / não implementado

- Testes DDG e suas evidências obrigatórias.
- Sites reais, HAR, Blacklight, uBlock e reconciliação.
- Canvas, cookie sync, bounce tracking, hook/hijacking e blocklist.
- Score implementado/aplicado.
- Relatório final PDF e repositório remoto/histórico ao longo da semana.
- Compatibilidade real com Firefox 128: é a versão mínima declarada, não uma execução comprovada nesta entrega.

Nenhum conceito da avaliação é declarado concluído apenas com esta etapa.
