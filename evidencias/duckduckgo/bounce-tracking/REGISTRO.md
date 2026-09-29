# DDG — Bounce Tracking

Status: **EXECUTADO E CONCLUÍDO MANUALMENTE**, conforme relato do usuário, com primeira passagem e repetição registradas separadamente. Concordância no critério observacional de bounce e no reuso informado pelo DDG. Evidências listadas pelo usuário; arquivos ainda não localizados no repositório, com conferência pendente.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-6) · [Tabela de resultados](../RESULTADOS.md)

Página oficial selecionada: https://privacy-test-pages.site/privacy-protections/bounce-tracking/

Link do roteiro: **Go to privacy-test-pages.site** → `https://bad.third-party.site/privacy-protections/bounce-tracking/bounce.html?destination=privacy-test-pages.site`.

## Contexto e esperado documental

- Teste informado: TESTE 6 — Bounce Tracking, primeira e segunda passagens concluídas.
- Ambiente de referência da sequência: Firefox 156.0.1 / Privacy Lens v0.4.0. Mudanças de configuração nesta execução não foram informadas.
- URLs inicial/final completas, requestIds, timestamps, duração no intermediário, redirectType, confiança e motivo detalhado: PENDENTES de transcrição/conferência.
- Data/hora/fuso, macOS, perfil/container, dados prévios/limpeza, cache, ETP/escudo/exceções e outras proteções: PENDENTES.
- Índice e intermediário conferidos em 29/09/2026 no commit oficial `e45b65aa6185710a1a1c7d6ee930856e051e8139`, sem execução no Firefox pelo agente.

O DDG lê o identificador de localStorage e cookie antes de construir a URL de retorno. Quando os IDs existem, retorna os valores lidos e deixa `isNew` vazio. Na geração inicial, os campos de UID estariam vazios e `isNew` preenchido. A recuperação nas duas passagens relatadas corresponde ao primeiro caso, sem evidência de nova geração nessa rodada.

## Resultado real das duas passagens

| Campo | Primeira passagem | Segunda passagem |
|---|---|---|
| bounceUIDlocalStorage | 95 | 95 |
| bounceUIDcookie | 95 | 95 |
| isNew | vazio | vazio |
| Mensagem DDG localStorage | bad.third-party.site localStorage ID: "95" | bad.third-party.site localStorage ID: "95" |
| Mensagem DDG cookie | bad.third-party.site cookie ID: "95" | bad.third-party.site cookie ID: "95" |
| Classificação Privacy Lens | Indicador compatível com bounce tracking | Indicador compatível com bounce tracking |
| Cookie sync | 0 indicadores | 0 indicadores |
| Parâmetros | 2 sinais potenciais | 2 sinais potenciais |
| Tracking avançado: omissões, falhas e pendências | Nenhuma, conforme relato | Nenhuma, conforme relato |

As mensagens e o valor 95 foram informados a partir do DDG. Não são uma leitura/exportação de valores de cookies pelo Privacy Lens.

A primeira passagem da rodada já recuperou IDs disponíveis nos dois mecanismos; não foi uma primeira geração. A repetição confirmou persistência/reuso dos mesmos IDs no intervalo observado, conforme o usuário. A origem e a data de criação desses dados anteriores não foram estabelecidas.

## Concordância e limites

**Total no critério observacional relatado:** a página DDG transportou os IDs recuperados e o Privacy Lens apresentou indicador compatível com bounce nas duas passagens, com dois sinais potenciais de parâmetros. Não foi relatada divergência nesse critério. O resultado não é um placar de bloqueio nem uma confirmação de intenção maliciosa.

**Cookie sync = 0 não invalida o resultado de bounce.** Os detectores têm critérios distintos. A regra atual de sync exclui valores com menos de 8 caracteres da comparação; o ID 95 tem 2 caracteres. Já os nomes `bounceUIDlocalStorage` e `bounceUIDcookie`, quando preenchidos, podem fornecer sinais de identificador para o detector de bounce. O plugin não compara valores de cookies com valores de URL.

Os dois sinais informados são compatíveis com esses nomes, mas as linhas individuais dos sinais, a rota detalhada, os requestIds, a duração, o tipo de redirect e a confiança não foram transcritos. Sua conferência nos artefatos permanece pendente; não se presume `client-redirect-inferred`, uma duração específica ou autoria exclusiva da aba.

A ausência de omissões/falhas/pendências foi relatada especificamente para **Tracking avançado** nas duas passagens. Não é estendida por suposição à cobertura integral do navegador ou de outras seções.

Nenhum código, critério de sync ou heurística de bounce foi alterado para produzir concordância.

## Evidências informadas pelo usuário

Pasta de destino: `evidencias/duckduckgo/bounce-tracking/`.

| Passagem | Print informado | JSON informado |
|---|---|---|
| Primeira | `ddg-bounce-tracking-primeira-plugin.png` | `ddg-bounce-tracking-primeira-relatorio.json` |
| Repetição | `ddg-bounce-tracking-repeticao-plugin.png` | `ddg-bounce-tracking-repeticao-relatorio.json` |

Os quatro arquivos foram informados como evidências, mas não foram localizados no repositório nesta conferência. Conteúdo das capturas/JSON e metadados ainda não foram inspecionados. Não há download DDG próprio nesta variante; nenhum resultado foi simulado.

Preservar os originais por passagem, com página DDG e plugin identificáveis para a mesma aba. Usar sufixos em novas rodadas, sem sobrescrever. Nenhuma captura foi feita pelo agente.

Próxima execução preparada: somente [TESTE 7 — Query Parameters](../../../docs/VALIDACAO_DDG_V04.md#teste-7).
