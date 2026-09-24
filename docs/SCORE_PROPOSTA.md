# Score — proposta preliminar v0, ainda não implementada

O enunciado exige critérios, pesos, justificativa e comparação. Não exige reproduzir uma nota do Blacklight. Esta proposta é um índice de exposição e indícios observáveis, **não probabilidade de ataque nem garantia de segurança**. A versão 0.1.0 mostra “Em preparação”; não pontua três sites que ainda não foram informados.

## Fórmula a validar no bloco de 26/09

`Score = max(0, 100 - N - C - S - F - T - H)`.

| Categoria | Regra proposta | Máximo | Justificativa |
|---|---|---:|---|
| N: exposição a terceiros | 2 por site terceiro com requisição completada | 10 | Mais destinatários ampliam a exposição; teto baixo porque CDNs podem ser legítimas |
| C: identificadores em cookies | 3 por cookie terceiro com uso/gravação associado; +1 por cookie persistente observado, até 5 desse segundo termo | 20 | Identificação entre sites e persistência têm impacto maior que uma conexão isolada; estoque sem evidência não conta como uso |
| S: persistência em storage terceiro | 2 por origem terceira com localStorage ou IndexedDB não vazio | 10 | Persistência adicional; sessão e storage próprio não recebem punição automática |
| F: canvas | 15 se houver sequência compatível de desenho e leitura para fingerprint, após controles | 15 | Coleta de características do navegador é um mecanismo distinto; leitura isolada é indício e deve ter confiança documentada |
| T: ligação entre sites | 15 por cookie sync corroborado + 10 por bounce com identificador corroborado | 25 | Ligação de identidades entre contextos tem maior impacto; o mesmo fluxo não acumula duas penalizações, usa-se a maior |
| H: indicadores de hook | 10 por canal persistente terceiro associado a outro sinal relevante; +10 por alteração de globais relevante, independente e não causada pela extensão | 20 | Sinais combinados têm mais evidência; WebSocket/chat ou polling isolados não pontuam |

“Cookie”, “origem”, “site” e “fluxo” são unidades diferentes e precisam ser deduplicadas com regras explícitas. Máximos somam 100; a proposta reduz dominância por volume. Tentativas bloqueadas entram em seção própria e não têm o mesmo peso de exposição realizada. Um evento pode fundamentar categorias diferentes somente se representar dimensões diferentes; dentro de uma categoria não se repete.

Os pesos são uma **escolha normativa declarada**, não coeficientes cientificamente estimados. Sua defesa é a hierarquia entre contato, persistência e ligação de identidades, com tetos para evitar que centenas de recursos triviais determinem sozinhos a nota. Não há como alegar uma escala objetiva validada sem uma base empírica. Antes da aplicação final, comparar controles positivos/negativos e testar sensibilidade de ±20% nos pesos; congelar versão e regras sem ajustá-las para imitar Blacklight.

Faixas descritivas preliminares: 80–100 exposição observada baixa; 50–79 atenção; 0–49 exposição observada elevada. Elas também são convencionais. Evitar o rótulo “site seguro”.

## Cobertura e incerteza

- API ausente, frame inacessível ou coleta truncada não equivalem a detector negativo.
- Se houver categorias não avaliadas, mostrar nota parcial e cobertura, ou intervalo conservador: `máximo possível = 100 - penalizações observadas`; `mínimo possível = máximo possível - tetos das categorias não avaliadas`, limitado a zero.
- Uma categoria vazia só vale como zero quando o detector operou dentro da janela/protocolo; mesmo assim significa “não observado”.
- Cada desconto deve apontar para uma evidência e uma versão de regra.
- Hipóteses de baixa confiança aparecem em separado; não usar como prova de sync/hijacking.

## Comparação crítica ao Blacklight

Comparar as dimensões sobrepostas (terceiros/trackers, cookies e técnicas de fingerprint), guardando a saída original do Blacklight. Não presumir que o Blacklight fornece um score 0–100 equivalente. Se uma edição da ferramenta reportar apenas contagens/indicadores, usar esses dados e explicar como nossa nota os pondera. Sinais específicos de hook ou métricas não presentes no Blacklight ficam “sem contraparte”, não “discordância”.

Usar uma linha por divergência com domínio, requisição/HAR, horário, tipo, filtro do uBlock e hipótese testada. Configuração geográfica, dispositivo e cache do Blacklight devem ser anotadas. “Metodologias diferentes” não explica sozinha nenhum caso.
