# DDG — Fingerprinting / Canvas

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

O DDG verifica resistência à leitura consistente, desempenho e correção da renderização. O Privacy Lens verifica desenho seguido de leitura/exportação no mesmo canvas em até 5 segundos.

## Resultado da página

E14 mostra falhas nos pixels de referência e no limiar de mudança de pixels elegíveis, falha de performance de getImageData em 277 ms frente ao limite de 250 ms, e falhas de conversão de saída/renderização de string. Também há várias asserções aprovadas. O recorte não deve ser resumido como uma única falha de performance.

## Resultado do Privacy Lens

JSON v0.4.0: 7.039 desenhos, 125 leituras/exportações, 0 exceções, 18 canvas com indício; APIs getImageData e toDataURL. Um frame instrumentado; cobertura parcial com 85 amostras omitidas e 0 eventos omitidos. Canvas #13: 2000 × 200, fill seguido de getImageData, intervalo 277 ms. Exportação 00:27:01.325.

## Concordância e divergência

Complementar. O indicador de sequência está comprovado; a extensão não implementa os mesmos testes de resistência, correção ou tempo máximo do DDG.

O intervalo de 277 ms entre desenho e leitura no plugin não mede diretamente a duração de getImageData que o DDG compara ao limite. Igualdade numérica não prova causa da lentidão. Zero exceções não implica aprovação das asserções. As 85 amostras descartadas limitam a inspeção individual, ainda que os totais agregados estejam disponíveis. Não há controle pareado suficiente para atribuir falhas do DDG à instrumentação.

## Evidências

- **E14** — [ddg-canvas-resultados.png](ddg-canvas-resultados.png)
- **E15** — [ddg-fingerprinting-canvas-plugin.png](ddg-fingerprinting-canvas-plugin.png)
- **E16** — [ddg-fingerprinting-canvas-detalhes.png](ddg-fingerprinting-canvas-detalhes.png)
- **E43** — [ddg-fingerprinting-canvas-relatorio.json](ddg-fingerprinting-canvas-relatorio.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
