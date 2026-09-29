# DDG — Bounce Tracking

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

O intermediário bad.third-party.site lê IDs locais e os transporta à página de destino nos parâmetros bounceUIDlocalStorage e bounceUIDcookie. Recuperação de ID existente não é geração inicial.

## Resultado da página

E23 mostra os dois IDs como 95 e isNew vazio na página de retorno às 01:27:42. E24 mostra indicador compatível com bounce, zero sync e dois sinais de parâmetros.

## Resultado do Privacy Lens

JSON v0.4.0 exportado às 01:30:16.624: rota privacy-test-pages.site → bad.third-party.site → privacy-test-pages.site; permanência intermediária 427 ms; ligação client-redirect-inferred, confiança low. Dois nomes de UID com valor de comprimento 2; zero sync; sem omissões, falhas de hash ou comparações pendentes nesta seção.

## Concordância e divergência

Concordância quanto ao transporte observado e ao indicador heurístico. Reuso do mesmo 95 em duas passagens não está integralmente demonstrado pelos arquivos recebidos.

O usuário relatou duas passagens. Há uma captura da página e uma sequência posterior no JSON; como os valores não são exportados pelo plugin, não é possível provar igualdade entre as duas leituras. Sync exige pelo menos 8 caracteres, enquanto o identificador fotografado tem 2. A inferência de redirecionamento cliente mantém confiança baixa e não gera o desconto T de bounce moderado. Não se promoveu o relato de repetição a evidência independente.

## Evidências

- **E23** — [ddg-bounce-tracking-pagina.png](ddg-bounce-tracking-pagina.png)
- **E24** — [ddg-bounce-tracking-plugin.png](ddg-bounce-tracking-plugin.png)
- **E45** — [ddg-bounce-tracking-relatorio.json](ddg-bounce-tracking-relatorio.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
