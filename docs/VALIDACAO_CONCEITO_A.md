# Validação da implementação — v0.5.0

Data: 29/09/2026. Resultados automatizados locais; não são execução manual DDG. Nenhum commit ou screenshot foi produzido neste bloco.

## Suíte e preservação de B

- `npm test`: **142 testes, 142 passaram, 0 falharam**, sem cancelamentos, skips ou TODOs. São os 121 testes anteriores e 21 novos.
- `npm run check`: manifest/referências e sintaxe JavaScript aprovados.
- `git diff --check`: sem erros.
- SHA-256 comparado com a cópia do estado no início deste trabalho: `lib/domain.js`, `model.js`, `cookies.js`, `cookie-diagnostics.js`, `canvas.js`, `advanced-tracking.js`, `tracking-report.js`, `content/canvas.js` e `content/storage.js` **inalterados**. O background/popup receberam integração aditiva.

Os testes novos verificam bootstrap próprio versus mudança posterior, getters não invocados, sanitização, limiar temporal/frame, controles negativos, cobertura defasada, descontos e deduplicação, sensibilidade ±20%, PSL real/PRIVATE, persistência, concorrência/falhas da lista, autorização de mensagens, navegação nova, isolamento de falhas de A e invalidação do JSON depois de editar a lista. A suíte anterior continua verificando rede, cookies/ordenação, storage, canvas e tracking avançado.

## Firefox real: controles A

Firefox **156.0.1**, geckodriver **0.37.1**, perfil temporário, headless, servidor local em porta livre. `tests/firefox_concept_a.py` instala o pacote atual temporariamente, usa background/content scripts reais e abre o relatório em aba. Nenhum acesso às páginas oficiais DDG por esse teste.

| Controle | Resultado observado |
|---|---|
| negative, após 31 s | 0 alterações / 0 canais / 0 combinações; 11 métodos próprios; score 100 com cobertura prevista, H=0 |
| polling | 0 alterações / 1 canal / 0 combinações; H=0; score parcial antes de 30 s |
| hook | 1 alteração Window.fetch / 1 canal / 1 combinação; H=20; score parcial antes de 30 s |
| websocket | 0 alterações / 1 tentativa com erro / 0 combinações; H=0 |
| blocklist vazia | imagem terceira carregou; 0 decisões próprias |
| adicionar 127.0.0.1 pela UI | imagem não carregou; 1 decisão própria; request com erro e blockedBy explícito |
| pausar pela UI | imagem carregou; 0 decisões próprias |
| reativar pela UI | imagem não carregou; 1 decisão própria |
| remover pela UI | imagem carregou; 0 decisões próprias |

Relatório da execução final: [conceito-a.json](../evidencias/desenvolvimento/conceito-a/automatizado/conceito-a.json). A coleta automática não substitui screenshots/validação manual solicitados pelo enunciado.

## Regressão B no Firefox 156.0.1

`tests/firefox_cookie_diagnostics.py --scenario third --repeats 1 --exercise-cleanup`: controle de limpeza passou; `/cookies/third` retornou inventário 3, preexistentes 2, 1 gravação e diagnóstico `associated`. A regra de correlação temporal e partição permaneceu ativa; Set-Cookie sozinho não foi promovido a sucesso.

`--scenario tracking --repeats 1`: sete navegações passaram, com popup/relatório reais:

| Caso | Bounce | Sync | Parâmetros |
|---|---|---:|---:|
| bounce-negative | insufficient-evidence | 0 | 0 |
| bounce-positive | indicator | 1 | 6 |
| query-normal | insufficient-evidence | 0 | 0 |
| query-tracking | insufficient-evidence | 1 | 5 |
| cookie-sync | insufficient-evidence | 1 | 5 |
| start-client | indicator, ligação client-redirect-inferred | 0 | 1 |
| query-normal após redirects | insufficient-evidence | 0 | 0 |

O caso start-client continua com a limitação de inferência já declarada por B. Não foi alterado para forçar o resultado. Essas contagens pertencem às fixtures locais, não aos quatro casos DDG do Teste 7.

## Conferência documental posterior

Os arquivos DDG e dos sites recebidos em 29/09 foram inventariados e confrontados em [RESULTADOS.md](../evidencias/duckduckgo/RESULTADOS.md). js-leaks tem capturas e um resultado exportado, mas não um par concluído e identificado com/sem extensão. A captura manual da blocklist confirma a decisão própria; pausa/retorno continuam sustentados pelos controles automatizados acima.

Há três HAR, três Blacklight, uBlock e Privacy Lens nos três sites. Os JSONs confirmam scores parciais UOL 0–31, G1 0–64 e Mercado Livre 41–66. As novas coletas G1/ML não se sobrepõem aos HARs anteriores; listas externas completas e algumas categorias Blacklight não estão visíveis. O PDF final existe, com limites explícitos. Ver [auditoria](AUDITORIA_FINAL.md); a conclusão da implementação não significa conclusão integral da avaliação acadêmica.
