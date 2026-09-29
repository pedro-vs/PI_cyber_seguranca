# Registro manual DDG — v0.4.0

**Status: NÃO EXECUTADO.** Não há resultados observados nesta tabela. Preencher somente após execução manual, seguindo [o roteiro completo](../../docs/VALIDACAO_DDG_V04.md). As pastas já existentes e seus registros históricos foram preservados.

Execução/data/fuso: PENDENTE

Firefox / macOS / Privacy Lens: PENDENTE

Referência Git existente + alterações locais, sem criar commit: PENDENTE

Perfil/container, dados prévios/limpeza, cache: PENDENTE

ETP, exceções, preferências relevantes, outras extensões/versões/regras: PENDENTE

| Teste | Resultado esperado DDG | Privacy Lens | Concordância | Divergência | Explicação técnica | Evidência |
|------|------|------|------|------|------|------|
| 1. Tracker Reporting | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `tracker-reporting/ddg-tracker-reporting-plugin.png` |
| 2. Storage Blocking — duplicar por mecanismo/origem | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `storage-blocking/ddg-storage-blocking-plugin.png` |
| 3. Fingerprinting / Canvas — duplicar por check | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `fingerprinting-canvas/ddg-fingerprinting-canvas-plugin.png` |
| 4. Tracker Blocking — duplicar por mecanismo | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `tracker-blocking/ddg-tracker-blocking-plugin.png` |
| 5. Storage Partitioning — duplicar por API | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `storage-partitioning/ddg-storage-partitioning-plugin.png` |
| 6.1 Bounce Tracking — primeira passagem | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `bounce-tracking/ddg-bounce-tracking-primeira-plugin.png` |
| 6.2 Bounce Tracking — repetição sem limpar | PENDENTE: transcrever da página | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `bounce-tracking/ddg-bounce-tracking-repeticao-plugin.png` |
| 7.1 Query Parameters — campanha + funcional | PENDENTE: transcrever Expected e Results | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `query-parameters/ddg-query-parameters-01-plugin.png` |
| 7.2 Query Parameters — duas campanhas | PENDENTE: transcrever Expected e Results | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `query-parameters/ddg-query-parameters-02-plugin.png` |
| 7.3 Query Parameters — clique + funcional | PENDENTE: transcrever Expected e Results | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `query-parameters/ddg-query-parameters-03-plugin.png` |
| 7.4 Query Parameters — controle funcional | PENDENTE: transcrever Expected e Results | NÃO EXECUTADO | PENDENTE | PENDENTE | PENDENTE | PENDENTE: `query-parameters/ddg-query-parameters-04-plugin.png` |

Para cada linha: registrar também URL inicial/final, resultado **observado pela página DDG**, tempo de espera, JSON do plugin e download DDG quando disponível. Acrescentar arquivo/linha do JSON ou requestId, domínio, path, frame, timestamp, erro ou parâmetro que sustenta a explicação. Não exportar valores de cookies. Não usar “metodologias diferentes” como explicação sem evidência concreta. Um esperado documental não deve ocupar o lugar do resultado real DDG.

Concordância: Sim / Parcial / Não / Não comparável com a cobertura disponível. Em não comparável, especificar a lacuna (ex.: aba auxiliar já fechada; API não medida; snapshot sem valores; evento fora da janela). Não converter uma lacuna em pass.

Os nomes acima são **destinos planejados**, não arquivos já existentes. Guardar JSON junto ao print; acrescentar sufixo de repetição/data quando necessário. Nenhuma captura automática deve ser apresentada como manual. Conceito A e sites reais permanecem fora deste bloco.
