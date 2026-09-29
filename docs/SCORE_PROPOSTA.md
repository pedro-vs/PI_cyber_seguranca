# Privacy score — metodologia implementada v1

`privacy-score-v1`, implementada na v0.5.0. Substitui a proposta preliminar v0 deste documento. Pesos normativos, não estimados cientificamente: o resultado mede exposição/indícios observados e **não é probabilidade de ataque nem garantia de segurança**. Maior significa menos descontos observados. Sem faixas de “site seguro”.

`Score = max(0, 100 − N − C − S − F − T − H)`.

| Categoria | Regra implementada | Teto | Justificativa/evidência |
|---|---|---:|---|
| N | 2 por site terceiro (eTLD+1 pela PSL) com resposta concluída HTTP 200–399, excluindo decisões próprias de bloqueio | 10 | Contato amplia exposição, mas CDN pode ser legítima; site, requestId e horário |
| C | 3 por identidade de cookie terceiro com gravação real correlacionada +1 por identidade persistente gravada, até 5 nesse segundo termo | 20 | Persistência/identificação; nome, domínio, path, store, partição e horário. Correlação não prova autoria exclusiva |
| S | 2 por origem terceira com localStorage ou IndexedDB >0 em snapshot ativo e atualizado nos últimos 5 s | 10 | Persistência adicional; origem, frame e horário. Sessão e storage próprio não pontuam automaticamente |
| F | 15 se o detector B indicar sequência canvas desenho + leitura/exportação | 15 | Características do navegador; frame e regra canvas-sequence-v1. Indicador de baixa especificidade, também ocorre em aplicações legítimas, não comprova fingerprinting intencional |
| T | 15 se existir cookie sync de confiança moderada, senão 10 se houver bounce indicador moderado | 25 | Ligação entre sites; domínios/indicador. Uma dimensão por navegação: usa o maior, nunca soma sync e bounce do mesmo fluxo |
| H | 20 se houver combinação de alteração de API e polling terceiro no mesmo frame/intervalo | 20 | Dois sinais coexistentes; APIs, domínio, requestIds e horário. Não comprova hijacking, causalidade ou autoria |

Refinamentos conservadores da proposta v0: C considera gravações reais correlacionadas, não inventário nem Set-Cookie; S exclui snapshots antigos/removidos; T toma o maior sinal por navegação porque o detector não demonstra independência entre todos os fluxos. T mantém o teto reservado 25, mas sua regra atual desconta no máximo 15; os 10 restantes não são inventados como observações. H não pontua WebSocket, polling ou hook isolados e não soma bootstrap canvas próprio. O sinal canvas F continua pontuado como indício de exposição de baixa especificidade, com sua limitação explícita; em T/H sinais isolados de confiança baixa não pontuam. Não se mede utilidade/necessidade do recurso para o site.

Deduplicação: N por site PSL; C por identidade completa definida pelo detector de cookies (store/domínio/path/nome/FPI/partição), mantendo a última gravação, sem duplicar overwrite; S por origem; F/H binários; T maior sinal moderado da navegação. Remoções de cookies não geram desconto. Categorias diferentes podem representar dimensões distintas do mesmo evento; a sobreposição é declarada, não implica evidências causalmente independentes. Requests bloqueados não dão bônus e não apagam observações já feitas.

## Cobertura e intervalo

O JSON contém `value` somente quando as seis categorias têm cobertura prevista. Caso contrário `status: partial`, `value: null` e intervalo, apresentado também na UI. `observedValue` é o limite superior calculado, **não nota final**.

- Superior: `max(0, 100 − descontos observados)`.
- Inferior: `max(0, superior − soma(teto − desconto observado) das categorias sem cobertura completa)`.
- Falha do cálculo: `unavailable`, sem intervalo ou nota fictícios.
- N exige início de navegação observado e rede sem truncamento; C exige janela de 30 s fechada, eventos sem perdas/erros e inventário sem mudança concorrente.
- S exige snapshots recentes de todos os frames ativos com três APIs observadas, sem snapshots removidos/defasados. Isso mantém explícita a limitação top-level registrada no DDG Storage Blocking.
- F exige todos os frames ativos com instrumentação disponível e cobertura canvas completa. T respeita a cobertura do detector B. H exige 30 s e snapshots recentes (até 5 s) de todas as APIs selecionadas dos frames ativos disponíveis, sem truncamento.

A cobertura é relativa às APIs e janelas previstas, não a tudo que o navegador/site faz. Lacunas fora desse escopo persistem mesmo em score observado. Exemplo: só H sem cobertura, sem descontos, produz 80–100; não 100 definitivo. Ponderações limitadas por teto mantêm 0–100 e testes avaliam sensibilidade ±20%. Antes de comparar sites, congelar esta versão e registrar os seis descontos, intervalo, data, consentimento, perfil, ETP e regras da blocklist; não ajustar pesos para imitar resultado externo.

## Aplicação aos três sites e Blacklight

**Conferência final:** o JSON UOL confirma **0–31/100, parcial, 2/6 categorias** (N=10, C=20, S=4, F=0, T=15, H=20). O recálculo pela implementação coincide com o exportado. O complemento E57/E58 confirma G1 **0–64/100, parcial, 2/6** (10/20/6/0/0/0) e Mercado Livre **41–66/100, parcial, 3/6** (10/4/0/0/0/20), na ordem N/C/S/F/T/H. Os três recálculos coincidem integralmente com os JSONs. No G1 N/C estão cobertos; no Mercado Livre N/C/T. Os painéis E59/E60 corroboram os intervalos, sem alimentar o cálculo. Ver [relatório final](relatorio-final.md) e [reconciliações](../evidencias/sites/README.md). Não foi atribuída nota a sites sem dados suficientes. Compare dimensões sobrepostas (terceiros, cookies, fingerprinting), preservando a saída original do Blacklight; não presumir que ele oferece nota 0–100 equivalente. Sem contraparte para H não significa discordância.

Para cada divergência, registre domínio, request/HAR, horário, resultado Blacklight/uBlock, configuração e hipótese verificada. Diferenças de método, geografia, sessão ou consentimento precisam de evidência concreta. A implementação e os controles locais não concluem a avaliação acadêmica do score.
