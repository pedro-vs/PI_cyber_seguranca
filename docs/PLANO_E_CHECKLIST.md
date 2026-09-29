# Plano e checklist — conferência final

Fonte oficial: [enunciado](referencias/enunciado-avaliacao.pdf), páginas 2–4. Situação em 29/09/2026: finalização documental e PDF produzidos; evidências incompletas impedem declarar todos os requisitos atendidos.

A matriz definitiva, requisito a requisito, está em [AUDITORIA_FINAL.md](AUDITORIA_FINAL.md). Substitui a checklist preliminar vazia, sem apagar o cronograma histórico abaixo.

- Implementação, instalação Firefox, rede/cookies/storage, canvas/tracking, hooks, score e blocklist: evidenciados por código e controles.
- Oito testes DDG documentados; subcasos com pareamento insuficiente estão explicitados.
- Três HAR recebidos; G1/Mercado Livre têm cobertura parcial da carga.
- Três sites com quatro fontes. Scores parciais recalculados dos JSONs: UOL 0–31; G1 0–64; Mercado Livre 41–66. Complemento E57–E62 incorporado; janelas G1/ML não se sobrepõem aos HARs, e categorias/listas Blacklight fora dos recortes permanecem NE.
- Comparação causal js-leaks com/sem extensão e reconciliação de todos os trackers externos: parciais.
- Relatório PDF/fonte, catálogo e mapa de fontes: presentes. Sorteio por matrícula: não comprovado.
- Nenhum commit ou push automático nesta finalização.

## Riscos e como reduzi-los

| Risco | Por que é difícil | Decisão verificável |
|---|---|---|
| Cookies “injetados” | `getAll` mostra estoque; `onChanged` não contém aba; Set-Cookie pode ser rejeitado | Três métricas distintas; perfil limpo; janela documentada; confrontar headers e armazenamento |
| ETP/TCP e uBlock | Podem bloquear o evento antes de a extensão observá-lo | Registrar versões/proteções; execuções separadas; consultar HAR e logger; não presumir que zero é ausência |
| eTLD+1 | Últimos dois rótulos falham em com.br e hospedagens compartilhadas | PSL completa e testada; snapshot versionado |
| Canvas e hooks | Content script tem contexto isolado; instrumentação muda a página | Instrumentação Firefox e identificação própria implementadas; controles locais presentes; par js-leaks completo ainda ausente |
| Cookie sync | Parâmetro parecido com ID não prova sincronismo | Comparar parâmetros entre sites com chave efêmera, sem comparar valores de cookies; baixa confiança se faltarem elos |
| Bounce | Redirect também serve login e pagamento; estado por página é insuficiente | Histórico curto por aba entre documentos, tempo/interação/identificadores; explicar indícios, sem rótulo definitivo |
| Storage partitioning | Snapshot isolado não compara a mesma origem sob dois top sites | Protocolo A→T/B→T no DDG, chaves de partição de cookies; inferência de storage só com execução cruzada |
| Hook/hijacking | WebSocket/polling legítimos são comuns; privilégio limitado | Exigir contexto e combinações de sinais; não alegar acesso a ataques no sistema operacional |
| Comparação externa | Localização, consentimento, cache, proteção e horário mudam o tráfego | Congelar condições, registrar URLs/filtros/requests, repetir apenas para hipótese concreta |
| Prazo | Evidências e reconciliação exigem tempo humano | Coleta desde o dia 24; reservar o dia 29 para redação/revisão |

## Cronograma originalmente planejado — não é registro de execução

| Data | Bloco | Critério de saída / evidência | Commit sugerido após validação |
|---|---|---|---|
| 24/09 | Etapa 1: manifest, rede, cookies, storage, popup, fixture, testes e documentação | Instalar no seu Firefox; JSON e prints locais; criar repositório | `feat: add initial Firefox network cookies and storage report` |
| 25/09 | Canvas, atribuição de cookies, controles positivos/negativos e DDG mínimo de C | Prints de Tracker Reporting/Storage Blocking/Canvas; registrar divergências | `feat: detect canvas readback and document DDG baseline` |
| 26/09 | Query params, redirects entre documentos, bounce/cookie sync, partições, score | Evidências das cadeias; DDG correspondente; fórmula congelada e teste de sensibilidade | `feat: add tracking correlations and privacy scoring` |
| 27/09 | Hook/hijacking, blocklist persistente, DDG restante | Bloquear/desbloquear domínio real da fixture; js-leaks com/sem extensão; todas as linhas DDG documentadas | `feat: add security indicators and custom domain blocking` |
| 28/09 | Três sites oficiais, HAR, Blacklight, uBlock e reconciliação | Três conjuntos de evidências e tabela por domínio/request; score aplicado | `test: compare assigned sites with HAR Blacklight and uBlock` |
| 29/09 | Corrigir problemas críticos, relatório PDF, revisar acesso/entrega | PDF conferido, prints/HAR presentes, README reproduzível, link ao professor | `docs: finalize evidence reconciliation and report` |

Se C atrasar, proteger primeiro seus testes e entregáveis gerais. Não declarar A apenas porque existem botões de recursos avançados.

## Estrutura planejada

Arquivos atuais estão descritos no README. Os módulos implementados ficam em `extension/lib/` (incluindo security, score e blocklist), com coleta em `extension/content/` e integração no background/popup. Não há módulo `extension/detectors/` nesta organização.

Estrutura final: `evidencias/INDEX.md`, `desenvolvimento/`, `duckduckgo/`, `sites/{uol,g1,mercadolivre}/`, `conceito-a/`; artefatos históricos locais/screenshots preservados.

## Escopo exato da Etapa 1

Entregar uma base observacional instalável, testável e compreensível, com rede/cookies/storage e interface; comprovar os cálculos de classificação; fornecer fixture e instruções. Na Etapa 1, score, fingerprinting, bloqueio e reconhecimento de hook não recebiam resultados simulados. A v0.2.0 acrescenta somente canvas, descrito no roteiro atual. A validação manual da Etapa 1 foi informada como concluída. Esse era o próximo bloco histórico. O estado final é descrito na auditoria, sem reclassificar o cronograma como execução real.
