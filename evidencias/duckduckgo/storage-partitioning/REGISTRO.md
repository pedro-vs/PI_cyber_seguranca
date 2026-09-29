# DDG — Storage Partitioning

Conferência final: 29/09/2026. Fontes recebidas, preservadas e identificadas por conteúdo; nenhuma nova captura produzida. Este registro substitui as conclusões condicionais anteriores.

## Objetivo e esperado documental

O DDG compara o acesso ao mesmo estado em contextos same-site e cross-site. Espera acesso no primeiro e separação no segundo para os mecanismos particionados; ausência de suporte é reportada separadamente.

## Resultado da página

E50 contém 21 mecanismos: 19 pass, WebSQL unsupported e Prefetch Cache error. document.cookie, HTTP Cookie, Cookie Store API, localStorage, sessionStorage e IndexedDB passam. E20 mostra o mesmo identificador em dois resultados same-site e null nos dois cross-site das três APIs HTML5.

## Resultado do Privacy Lens

E22 mostra www.first-party.site: frame 0 coletado às 01:13:20 com 1 chave local, 1 de sessão e 1 banco. Dois frames embedded anteriores, coletados às 01:08:09, também mostram 1/1/1 e estão removidos. O plugin declara particionamento HTML5 não estabelecido.

## Concordância e divergência

Complementar, com cobertura parcial da comparação entre contextos. O DDG fornece o contraste controlado; o plugin confirma apenas a presença de storage na origem mostrada.

Contagens iguais não demonstram igualdade de valores. A extensão não agrega nem compara identificadores entre abas; seus snapshots não reproduzem a prova cross-site. Não se devem somar os três frames da mesma origem como três bancos distintos. O horário final confirmado é 01:13:20, substituindo 01:11:48 que constava no relato antigo sem captura correspondente.

## Evidências

- **E20** — [ddg-storage-partitioning-detalhes.png](ddg-storage-partitioning-detalhes.png)
- **E21** — [ddg-storage-partitioning-pagina.png](ddg-storage-partitioning-pagina.png)
- **E22** — [ddg-storage-partitioning-plugin.png](ddg-storage-partitioning-plugin.png)
- **E50** — [storage-partitioning-results.json](storage-partitioning-results.json)

[Consolidação](../RESULTADOS.md) · [Inventário](../../INDEX.md) · [Ambiguidades](../../../docs/AMBIGUIDADES_EVIDENCIAS.md). Horários locais em UTC−3. Perfil, ETP, cache e demais extensões não foram integralmente documentados.
