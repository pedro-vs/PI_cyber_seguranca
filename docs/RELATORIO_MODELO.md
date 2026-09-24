# Avaliação Intermediária de Cibersegurança — relatório em elaboração

Autor: Pedro Henrique Vargas Sepulveda. Matrícula: PENDENTE. Disciplina/professor: Cibersegurança / João Eduardo Luisi. Data: PENDENTE. Repositório/commit analisado: PENDENTE.

**Este arquivo é um modelo de trabalho, não o relatório final. Não entregar antes de substituir os campos pendentes por evidências reais.**

## 1. Introdução

Descrever o objetivo de observar tecnologias que afetam privacidade no Firefox e distinguir indício de ataque confirmado. Declarar o escopo e os conceitos efetivamente atingidos.

## 2. Arquitetura e ambiente

Resumir `ARQUITETURA.md`. Informar Firefox, OS, ETP, perfil, uBlock/listas, versão da extensão e PSL; instalação e permissões.

## 3. Metodologia de detecção

Rede/eTLD+1; cookies (estoque, tentativas e gravações); storage; canvas; sync/bounce; hook. Para cada detector: dado observável, regra, controle positivo, controle negativo, confiança e limitação. Só descrever como implementado o que existir na versão avaliada.

## 4. Metodologia de score

Substituir proposta v0 pela fórmula implementada/congelada. Tabela de critérios, pesos, teto e justificativa; tratamento de cobertura; análise de sensibilidade; evitar alegação de validação científica não realizada.

## 5. Execuções DuckDuckGo — entregável 2

Inserir matriz de `TESTES_E_EVIDENCIAS.md` preenchida com subtestes reais. Cada linha: esperado da página, resultado do plugin, divergência explicada e print correspondente.

## 6. Site real 1 — entregável 3

URL sorteada: PENDENTE. HAR: PENDENTE. Plugin/score: PENDENTE. Blacklight: PENDENTE. uBlock/listas/logger: PENDENTE. Tabela por rastreador e referência à entrada HAR: PENDENTE.

## 7. Site real 2 — entregável 3

Mesma estrutura do site 1. PENDENTE.

## 8. Site real 3 — entregável 3

Mesma estrutura do site 1. PENDENTE.

## 9. Comparação crítica dos scores e Blacklight — entregável 4

Tabela de três sites com descontos/cobertura, indicadores Blacklight, concordâncias/divergências e suas causas demonstradas. Não comparar escalas numéricas inexistentes.

## 10. Comparação com uBlock e reconciliação

Regra/filtro, request e decisão; distinguir rede, filtro cosmético, scriptlet e surrogate. Remeter aos casos individuais já documentados, sem justificativas genéricas.

## 11. Limitações

Observabilidade, isolamento, frames/workers, atribuição de cookies, eventos antes da instrumentação, proteção do navegador, CNAME, ruído legítimo, tamanho da amostra e dados indisponíveis. Incluir limitações reais encontradas, não apenas genéricas.

## 12. Conclusão

Responder o que a ferramenta conseguiu demonstrar nos experimentos efetivamente executados. Nenhuma nota/conceito é garantido antecipadamente.

## Referências e anexos

Fontes primárias consultadas em `FONTES.md`; lista dos HARs, screenshots, JSONs, hashes/versões e commit. Conferir o PDF renderizado antes da entrega.
