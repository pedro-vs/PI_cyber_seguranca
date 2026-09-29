# Reconciliação — Mercado Livre

O HAR E53 cobre **03:30:06.464–03:30:44.259** e contém **24 entradas**, todas HTTP 200, em três hosts. São 16 respostas MIME JSON e oito imagens. Não há documento principal de www.mercadolivre.com.br/; onContentLoad=-5348 ms e onLoad=-3485 ms mostram que a janela começa após esses eventos. Trata-se de uma captura parcial do site, não de evidência de somente 24 recursos na carga inteira.

Nove chamadas a o11y-proxy-otel-frontend.meli.com, oito a http2.mlstatic.com e sete a api.mercadolibre.com. Os três sites registráveis são diferentes de mercadolivre.com.br segundo a PSL, embora os nomes possam pertencer ao ecossistema comercial da mesma organização. Classificação técnica por site não prova empresa independente nem tracker. Há nove linhas Set-Cookie em nove respostas, zero redirects e três grupos de URL repetida com 15 ocorrências adicionais.

**uBlock E41**, às 03:36:15: 40 bloqueios (9%), oito de dez domínios conectados. Hotjar e mercadoclics.com aparecem com bloqueio; não estão no HAR recebido. Como o HAR é tardio e a captura uBlock é posterior, não há prova de que esses domínios deveriam aparecer nessa janela. Bloqueio cedo pode impedir scripts e chamadas descendentes, mas a cadeia causal específica não é reconstruível sem logger/HAR pareados. CNAMEs CloudFront aparecem no painel uBlock; o Privacy Lens classifica o hostname observado e não resolve CNAME. Não se equiparam esses aliases automaticamente aos três hosts do HAR.

## Complemento Privacy Lens e Blacklight

O JSON **E58**, v0.5.0 / Firefox 156.0.1, cobre **04:50:08.707–04:50:59.031**, sem sobreposição com o HAR. Registra **148 requisições: quatro próprias, 144 terceiras, seis falhas**, em dez hosts. Sete desses hosts não estão no HAR anterior. O painel **E60**, às 04:51:05, confirma score **41–66/100, parcial, 3/6**, cinco alterações, dois canais e uma combinação. A análise não tenta parear requisições entre essas execuções.

O inventário soma **22 cookies: 14 próprios, oito terceiros, um de sessão, 21 persistentes, três particionados**. Dez gravações (duas criações inferidas, oito alterações) e dez remoções resultam em **cinco identidades gravadas: nenhuma terceira, quatro persistentes**. Portanto C=4, embora o inventário contenha oito cookies terceiros: estoque e gravação correlacionada são dimensões distintas. Há 22 tentativas Set-Cookie, não 22 gravações comprovadas.

Recálculo integral: **N=10, C=4, S=0, F=0, T=0, H=20**. N/C/T cobertos; S/F/H parciais. Seis sites terceiros elegíveis saturam N. O superior é 66; incerteza residual S=10 e F=15, H já no teto; inferior 41. H correlaciona cinco alterações (Function.toString, Window.fetch, Window.XMLHttpRequest, XMLHttpRequest.open/send) com quatro respostas 2xx em api.mercadolibre.com/melidata/tracks/component_prints: requests 9568/9569/9571/9588, intervalo 15.685 ms, frame 0. Isso não prova sequestro; instrumentação/telemetria legítimas podem gerar coocorrência. O outro canal, o11y-proxy-otel-frontend.meli.com/v1/metrics, não gerou outra combinação. Não há perdas/erros de hash/comparações pendentes em tracking; cobertura S/F/H continua limitada. A blocklist própria está desativada e vazia.

O JSON contém script.hotjar.com (1), static.hotjar.com (1) e print1.mercadoclics.com (13), sites presentes nas linhas de bloqueio do uBlock **em outra execução**. Eles não estão no HAR tardio. Logo a presença no JSON posterior não contradiz o controle anterior nem prova que o uBlock falhou. api.mercadolibre.com soma 25 no JSON versus sete no HAR; http2.mlstatic.com 90 versus oito; o11y-proxy-otel-frontend.meli.com 11 versus nove. Não se subtraem esses totais como requisições perdidas.

**Blacklight E62:** **11 ad trackers e 16 cookies terceiros**. Visita **Sep. 28, 2026, 18:33 ET**, URL com query parcialmente visível (www.mercadolivre.com.br/?skipInApp=true&matt_ig…), diferente da homepage sem query em E58. Não se reconstruiu o trecho oculto. Publicidade cita Twitter, Inc. e Facebook, Inc. mais três empresas; cookies citam RTB House S.A. e ByteDance Ltd. mais três. Isso não comprova as categorias individuais de pixels Facebook/TikTok/X, que não aparecem no recorte; evasion e demais categorias inferiores são NE.

O JSON/HAR local não contém hosts das famílias facebook.com/facebook.net, ads-twitter.com, tiktok.com ou rtbhouse.com; isso descreve os arquivos, sem identificar toda infraestrutura dessas empresas nem provar ausência dos serviços na página. O resultado remoto é de outra data/URL/estado. Os oito cookies terceiros locais e os 16 remotos não equivalem às zero gravações terceiras usadas em C. A comparação crítica está sustentada, mas não há lista externa completa de hosts nem correspondência por tracker.

## Agregados HAR reproduzíveis

| Medida | Valor |
|---|---:|
| Entradas | 24 |
| Primeira parte | 0 |
| Terceira parte | 24 |
| Sem host / data: | 0 |
| Hosts HTTP(S) | 3 |
| Sites PSL | 3 |
| Sites terceiros PSL | 3 |
| Linhas Set-Cookie | 9 |
| Respostas com Set-Cookie | 9 |
| Redirects 3xx exceto 304 | 0 |
| Grupos repetidos (método + URL completa) | 3 |
| Repetições além da primeira | 15 |

Status HTTP: 200: 24.

Tipos inferidos pelo MIME (não são tipos de iniciador webRequest): JSON (MIME): 16, imagem (MIME): 8.

Status 0 não informa autoria do cancelamento. Dados brutos preservados; valores de cookies/query/corpos não transcritos aqui.

## Matriz por host/site

União dos hosts do HAR e do JSON complementar. **Colunas de visitas diferentes, sem janela comum**; zero significa nenhuma request naquele arquivo, não ausência geral na página. O painel anterior do G1 permanece descrito acima. Blacklight cita empresas, mas não fornece sua lista completa de hosts; correspondência individual fica NE. uBlock só é atribuído quando visível no recorte.

| Domínio/site | HAR anterior | PL complementar | Blacklight | uBlock | Interpretação |
|---|---:|---:|---|---|---|
| accounts.google.com (google.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| api.mercadolibre.com (mercadolibre.com; third) | 7 | 25 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| http2.mlstatic.com (mlstatic.com; third) | 8 | 90 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| matt.mercadolivre.com.br (mercadolivre.com.br; first) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| o11y-proxy-otel-frontend.meli.com (meli.com; third) | 9 | 11 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| placements.mercadolibre.com (mercadolibre.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| print1.mercadoclics.com (mercadoclics.com; third) | 0 | 13 | Host individual NE | Site na linha de bloqueio E41 | Só no JSON recebido; visita posterior. |
| script.hotjar.com (hotjar.com; third) | 0 | 1 | Host individual NE | Site na linha de bloqueio E41 | Só no JSON recebido; visita posterior. |
| static.hotjar.com (hotjar.com; third) | 0 | 1 | Host individual NE | Site na linha de bloqueio E41 | Só no JSON recebido; visita posterior. |
| www.mercadolivre.com.br (mercadolivre.com.br; first) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |

Fonte computável: [har/resumo.json](har/resumo.json), [dominios.csv](har/dominios.csv). Transcrições visuais: [transcricao-capturas.json](../transcricao-capturas.json). Reproduzir: `node scripts/analyze-evidence.cjs`. `collectionRelation.overlaps=false` impede alinhamento artificial. O score é recalculado exclusivamente do JSON real e comparado integralmente ao exportado, sem alterar a função da extensão.
