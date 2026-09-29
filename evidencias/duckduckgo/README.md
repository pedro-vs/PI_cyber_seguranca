# Evidências oficiais DDG — preparação

Status: **EM ANDAMENTO** — Testes 1–7 executados conforme relatos do usuário; Teste 2 com divergência top-level e ressalva IndexedDB ad registradas; Teste 3 com concordância parcial/complementar e cobertura parcial por 85 amostras fora do limite; Teste 4 com concordância alta/total nos mecanismos observados, sem atribuição de bloqueio; Teste 5 com concordância parcial / cobertura limitada, sem snapshot da auxiliar cross-site no relatório principal; Teste 6 concluído em duas passagens, com IDs 95 reutilizados e indicador de bounce nas duas. Cookie sync 0 não invalida esse resultado. Arquivos informados ainda não localizados no repositório. Teste 7 concluído conforme relato: 1/2/2/0 sinais; remoção ausente nos casos 01–03; controle sem falso positivo. Verificação documental inicial em 28/09/2026; fontes dos Testes 4–7 reconferidas em 29/09/2026. Seguir [o roteiro manual](../../docs/VALIDACAO_DDG_V04.md); fontes e revisão oficial consultada estão registradas nele.

Ordem das pastas:

1. `tracker-reporting/`
2. `storage-blocking/`
3. `fingerprinting-canvas/`
4. `tracker-blocking/`
5. `storage-partitioning/`
6. `bounce-tracking/`
7. `query-parameters/`

Cada pasta contém um `REGISTRO.md`. [RESULTADOS.md](RESULTADOS.md) registra os relatos manuais dos Testes 1–7, com conferência de artefatos pendente; os quatro casos do Teste 7 estão registrados. Os nomes dos prints coincidem com o roteiro e os registros. Nenhum PNG/JSON de resultado foi criado pelo agente.

Cada linha executada precisa de **PRINT OBRIGATÓRIO PARA ENTREGA**, capturado manualmente pelo usuário, com página DDG + plugin visíveis e identificáveis. Guardar também JSON do plugin e download DDG quando disponível. Não sobrescrever uma execução e não usar screenshots automatizados ou prints de fixtures como evidência oficial.

Os testes 1–7 permanecem como evidências da v0.4.0. O usuário autorizou Conceito A: ver [plano e validação](../../docs/CONCEITO_A.md). js-leaks permanece pendente de execução manual; não alterar os detectores B para buscar concordância.
