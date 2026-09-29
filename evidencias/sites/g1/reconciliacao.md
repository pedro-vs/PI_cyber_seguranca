# Reconciliação — G1

O HAR E52 cobre **03:25:50.898–03:26:18.134**; o painel E39 foi fotografado às **03:26:48**. O painel apresenta **559 requisições, 516 terceiras, 20 falhas, 166 cookies e 36 frames**. O JSON complementar E57 é de outra navegação, **04:47:40.954–04:48:48.979**, e não substitui os totais deste painel anterior.

O HAR contém **296 entradas**, inclusive uma `data:` sem host. Não contém a requisição principal de g1.globo.com/; onContentLoad=-2215 ms e onLoad=-1 indicam que a exportação não cobre integralmente o carregamento principal. Há 73 respostas de redirecionamento (68 HTTP 302, três 303, duas 307), 15 status 0, uma 404 e uma 451. Os 265 Set-Cookie são linhas de resposta em 126 entradas, não 265 cookies aceitos. Há 24 grupos de URL completa repetida, totalizando 68 ocorrências adicionais.

As diferenças com o painel não permitem subtrair 296 de 559 e chamar o resultado de bloqueios. O painel é posterior e cobre uma janela mais ampla; a exportação começa depois do evento DOM e omite o documento principal. Persist logs/reload não estão documentados. Os hosts mais numerosos no painel (s3.glbimg.com 67; sdk-metrics.g.globo 18; mab.g.globo 16; simage2.pubmatic.com 14) podem ser comparados somente ao que o recorte visual revela.

**uBlock E40**, às 03:28:39: 42 bloqueios (3%), 145 de 145 domínios conectados. O DevTools mostra explicitamente “Bloqueado por uBlock Origin” em icu.newsroom.bi/ingest.php, horizon-track.globo.com/g1 e googleads.g.doubleclick.net/pagead/interaction. O HAR anterior contém uma, cinco e três entradas nesses hosts, respectivamente. Há concordância na identidade dos endpoints observados, mas as execuções têm estados diferentes. Não há logger/regra que permita listar cada filtro. O total de domínios conectados não equivale ao total de requisições bloqueadas.

## Complemento Privacy Lens e Blacklight

O JSON **E57**, v0.5.0 / Firefox 156.0.1, registra **1.066 requisições: 108 próprias, 958 terceiras, 31 falhas**. Há 172 hosts no JSON e 111 no HAR; a união tem 203 (31 só no HAR, 92 só no JSON). **Não há sobreposição das janelas**, portanto o script não tenta parear requests nem interpreta diferenças como omissões do detector. O painel de score **E59**, às 04:49:08, confirma 0–64, duas categorias cobertas, sete alterações, dois canais e nenhuma combinação. Os nomes dos arquivos de download não substituem o generatedAt interno.

O inventário soma **232 cookies: 41 próprios, 191 terceiros; três de sessão, 229 persistentes, 184 particionados**. São 513 eventos de gravação (87 criações inferidas, 426 alterações) e 450 remoções; a deduplicação deixa **153 identidades gravadas, 129 terceiras e 150 persistentes**. As 606 tentativas Set-Cookie não são aceites confirmados. A correlação de eventos com a aba não comprova autoria exclusiva.

O score recalculado pela implementação é **0–64/100, parcial, 2/6 categorias**: N=10, C=20, S=6, F=0, T=0, H=0. N e C têm cobertura; S/F/T/H não. S usa três origens recentes: eus.rubiconproject.com, apps.sascdn.com e www.google.com. As sete alterações e dois canais isolados não atendem à combinação de H. Limite superior 64; incerteza residual 4+15+25+20=64; inferior 0. Tracking omite 734 observações e 40 parâmetros; ausência de sync moderado não é zero confirmado. A blocklist está desativada, sem regras/decisões.

**Blacklight E61**: **27 ad trackers, 14 cookies terceiros**, visita **Sep. 28, 2026, 01:01 ET** (dia anterior ao JSON). O recorte expandido cita DoubleVerify e Twitter, Inc. mais 17 empresas em publicidade; LiveIntent Inc. e Twitter, Inc. mais duas em cookies. Contagem de empresas não equivale à de trackers/cookies. Evasion aparece como não encontrado; demais categorias inferiores não estão visíveis.

Os hosts doubleverify.com presentes no HAR/JSON incluem cdn (2/10), pub (2/4), tps (1/5) e tpsc-ue1 (2/24). static.ads-twitter.com aparece apenas no JSON (2). Isso permite comparar nomes de destinos observados com empresas citadas, sem afirmar identidade individual com os 27 trackers: o Blacklight não exibe URLs/hosts na captura. Os **191 cookies terceiros locais versus 14 remotos** são inventários de visitas e estados distintos, não 177 cookies omitidos pelo Blacklight. O PL limita C a 20 e N a 10; esses tetos impedem interpretar as contagens Blacklight como nota equivalente.

As quatro fontes estão presentes; a reconciliação por tracker continua parcial por falta da lista completa externa e de execuções pareadas.

## Agregados HAR reproduzíveis

| Medida | Valor |
|---|---:|
| Entradas | 296 |
| Primeira parte | 5 |
| Terceira parte | 290 |
| Sem host / data: | 1 |
| Hosts HTTP(S) | 111 |
| Sites PSL | 68 |
| Sites terceiros PSL | 67 |
| Linhas Set-Cookie | 265 |
| Respostas com Set-Cookie | 126 |
| Redirects 3xx exceto 304 | 73 |
| Grupos repetidos (método + URL completa) | 24 |
| Repetições além da primeira | 68 |

Status HTTP: 0: 15, 200: 150, 201: 1, 204: 55, 302: 68, 303: 3, 307: 2, 404: 1, 451: 1.

Tipos inferidos pelo MIME (não são tipos de iniciador webRequest): imagem (MIME): 77, JSON (MIME): 58, text/plain: 47, HTML (MIME): 37, JavaScript (MIME): 28, application/x-unknown-content-type: 22, não informado: 15, text/xml: 10, application/octet-stream: 1, application/x-binary: 1.

Status 0 não informa autoria do cancelamento. Dados brutos preservados; valores de cookies/query/corpos não transcritos aqui.

## Matriz por host/site

União dos hosts do HAR e do JSON complementar. **Colunas de visitas diferentes, sem janela comum**; zero significa nenhuma request naquele arquivo, não ausência geral na página. O painel anterior do G1 permanece descrito acima. Blacklight cita empresas, mas não fornece sua lista completa de hosts; correspondência individual fica NE. uBlock só é atribuído quando visível no recorte.

| Domínio/site | HAR anterior | PL complementar | Blacklight | uBlock | Interpretação |
|---|---:|---:|---|---|---|
| a.sportradarserving.com (sportradarserving.com; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| a.tribalfusion.com (tribalfusion.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| aa.agkn.com (agkn.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| aax-eu.amazon-adsystem.com (amazon-adsystem.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ab.g.globo (g.globo; third) | 2 | 13 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| acdn.adnxs.com (adnxs.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| ad.doubleclick.net (doubleclick.net; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ad.sxp.smartclip.net (smartclip.net; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ad.turn.com (turn.com; third) | 2 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| ade.googlesyndication.com (googlesyndication.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ads-library.globo.com (globo.com; first) | 0 | 12 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ads.pubmatic.com (pubmatic.com; third) | 2 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| ads.rubiconproject.com (rubiconproject.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ag.gbc.criteo.com (criteo.com; third) | 2 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| analytics.google.com (google.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| api.permutive.app (permutive.app; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| api.permutive.com (permutive.com; third) | 7 | 20 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| api.rlcdn.com (rlcdn.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| apps.sascdn.com (sascdn.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| b1sync.outbrain.com (outbrain.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| b41bfb489de1c292c6f9e59b7311fb38.safeframe.googlesyndication.com (googlesyndication.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| b6560a8a965f20db98d4890de829205f.safeframe.googlesyndication.com (googlesyndication.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| bcp.crwdcntrl.net (crwdcntrl.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| bh.contextweb.com (contextweb.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| bttrack.com (bttrack.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| c.bing.com (bing.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| c1.adform.net (adform.net; third) | 3 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| capi.connatix.com (connatix.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| cdn.debugbear.com (debugbear.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| cdn.doubleverify.com (doubleverify.com; third) | 2 | 10 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| cdn.id5-sync.com (id5-sync.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| cdn.jsdelivr.net (jsdelivr.net; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| cdn.permutive.com (permutive.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| ce.lijit.com (lijit.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ced-ns.sascdn.com (sascdn.com; third) | 0 | 5 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| check.analytics.rlcdn.com (rlcdn.com; third) | 4 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| cm.ctnsnet.com (ctnsnet.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| cm.g.doubleclick.net (doubleclick.net; third) | 8 | 16 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| cms.analytics.yahoo.com (yahoo.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| cms.quantserve.com (quantserve.com; third) | 0 | 4 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| connect.facebook.net (facebook.net; third) | 2 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| cs.admanmedia.com (admanmedia.com; third) | 1 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| cs.lkqd.net (lkqd.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| csi.gstatic.com (gstatic.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| csync.loopme.me (loopme.me; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| csync.smartadserver.com (smartadserver.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| d.adroll.com (adroll.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| d39f98ec-9259-4f8b-896d-7ab58be1f900.edge.permutive.app (permutive.app; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| d39f98ec-9259-4f8b-896d-7ab58be1f900.prmutv.co (prmutv.co; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| dis.criteo.com (criteo.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| dnacdn.net (dnacdn.net; third) | 3 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| dpm.demdex.net (demdex.net; third) | 2 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| dsp-cookie.adfarm1.adition.com (adition.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| dsp.360yield.com (360yield.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| dsum-sec.casalemedia.com (casalemedia.com; third) | 0 | 8 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ep1.adtrafficquality.google (adtrafficquality.google; third) | 0 | 6 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ep2.adtrafficquality.google (adtrafficquality.google; third) | 0 | 6 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| equativ-match.dotomi.com (dotomi.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| eu-u.openx.net (openx.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| eus.rubiconproject.com (rubiconproject.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| events.newsroom.bi (newsroom.bi; third) | 11 | 13 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| experiences.newsroom.bi (newsroom.bi; third) | 2 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| fastlane.rubiconproject.com (rubiconproject.com; third) | 9 | 22 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| functions.adnami.io (adnami.io; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| fundingchoicesmessages.google.com (google.com; third) | 13 | 28 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| g1.globo.com (globo.com; first) | 0 | 6 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| gem.gbc.criteo.com (criteo.com; third) | 2 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| globo-ab.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| go.mediagotechnology.com (mediagotechnology.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| goidc.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| google-bidout-d.openx.net (openx.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| googleads.g.doubleclick.net (doubleclick.net; third) | 3 | 12 | Host individual NE | Bloqueado por uBlock no DevTools E40 | Presente nas duas visitas; sem pareamento. |
| googleads4.g.doubleclick.net (doubleclick.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| grid-bidder.criteo.com (criteo.com; third) | 7 | 18 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| gum.criteo.com (criteo.com; third) | 6 | 5 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| hbopenbid.pubmatic.com (pubmatic.com; third) | 6 | 16 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| horizon-schemas.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| horizon-track.globo.com (globo.com; first) | 5 | 46 | Host individual NE | Bloqueado por uBlock no DevTools E40 | Presente nas duas visitas; sem pareamento. |
| horizon.globo.com (globo.com; first) | 0 | 8 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| i.ctnsnet.com (ctnsnet.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ib.adnxs.com (adnxs.com; third) | 11 | 30 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| icu.newsroom.bi (newsroom.bi; third) | 1 | 6 | Host individual NE | Bloqueado por uBlock no DevTools E40 | Presente nas duas visitas; sem pareamento. |
| id.rlcdn.com (rlcdn.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| id5-sync.com (id5-sync.com; third) | 1 | 10 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| idsync.rlcdn.com (rlcdn.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| idx.liadm.com (liadm.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| image2.pubmatic.com (pubmatic.com; third) | 5 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| image4.pubmatic.com (pubmatic.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| image6.pubmatic.com (pubmatic.com; third) | 2 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| imasdk.googleapis.com (imasdk.googleapis.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| l.clarity.ms (clarity.ms; third) | 6 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| live.primis.tech (primis.tech; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| m.adnxs.com (adnxs.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| mab.g.globo (g.globo; third) | 0 | 27 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| macro.adnami.io (adnami.io; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| marfeelexperimentsexperienceengine.mrf.io (mrf.io; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| match.adsrvr.org (adsrvr.org; third) | 6 | 9 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| match.deepintent.com (deepintent.com; third) | 1 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| match.prod.bidr.io (bidr.io; third) | 3 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| match.sharethrough.com (sharethrough.com; third) | 0 | 6 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| n.clarity.ms (clarity.ms; third) | 0 | 22 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| novabarra.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| oa.openxcdn.net (openxcdn.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| odr.mookie1.com (mookie1.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| p.rfihub.com (rfihub.com; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| pagead2.googlesyndication.com (googlesyndication.com; third) | 7 | 34 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| pixel-eu.rubiconproject.com (rubiconproject.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| pixel-sync.sitescout.com (sitescout.com; third) | 2 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| pixel.nordicdataresources.net (nordicdataresources.net; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| pixel.onaudience.com (onaudience.com; third) | 3 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| pixel.rubiconproject.com (rubiconproject.com; third) | 0 | 12 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| pixel.tapad.com (tapad.com; third) | 3 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| prebid-a.rubiconproject.com (rubiconproject.com; third) | 7 | 18 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| prg.smartadserver.com (smartadserver.com; third) | 5 | 14 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| pub.doubleverify.com (doubleverify.com; third) | 2 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| pub.dv.tech (dv.tech; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| pubmatic-match.dotomi.com (dotomi.com; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| px.ads.linkedin.com (linkedin.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| pxl.iqm.com (iqm.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| qvdt3feo.com (qvdt3feo.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| rec.ads.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| recomendacao.globo.com (globo.com; first) | 0 | 5 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| recusers.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| rp.liadm.com (liadm.com; third) | 2 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| rtb-csync.smartadserver.com (smartadserver.com; third) | 1 | 45 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| rtb.adentifi.com (adentifi.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| rtb.openx.net (openx.net; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| rtd-tm.everesttech.net (everesttech.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| s.ad.smaato.net (smaato.net; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| s.amazon-adsystem.com (amazon-adsystem.com; third) | 2 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| s.company-target.com (company-target.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| s.glbimg.com (glbimg.com; third) | 0 | 4 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| s0.2mdn.net (2mdn.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| s2-g1.glbimg.com (glbimg.com; third) | 2 | 22 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| s3.glbimg.com (glbimg.com; third) | 0 | 119 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sb.scorecardresearch.com (scorecardresearch.com; third) | 1 | 8 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| scripts.clarity.ms (clarity.ms; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| sdk-metrics.g.globo (g.globo; third) | 0 | 28 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sdk.mrf.io (mrf.io; third) | 2 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| secure-assets.rubiconproject.com (rubiconproject.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| secure.adnxs.com (adnxs.com; third) | 5 | 5 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| secure.insightexpressai.com (insightexpressai.com; third) | 1 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| securepubads.g.doubleclick.net (doubleclick.net; third) | 6 | 22 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| sentry.globoi.com (globoi.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sg.semasio.net (semasio.net; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| simage2.pubmatic.com (pubmatic.com; third) | 8 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| simage4.pubmatic.com (pubmatic.com; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| ssc-cms.33across.com (33across.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ssp-sync.criteo.com (criteo.com; third) | 6 | 7 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| ssp.disqus.com (disqus.com; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ssp.wp.pl (wp.pl; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ssum-sec.casalemedia.com (casalemedia.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ssum.casalemedia.com (casalemedia.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| static.ads-twitter.com (ads-twitter.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| static.criteo.net (criteo.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| stx-match.dotomi.com (dotomi.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| su.semasio.net (semasio.net; third) | 2 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| sync-tm.everesttech.net (everesttech.net; third) | 2 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| sync.1rx.io (1rx.io; third) | 0 | 3 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.adotmob.com (adotmob.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.intentiq.com (intentiq.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.ipredictive.com (ipredictive.com; third) | 1 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| sync.mathtag.com (mathtag.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.search.spotxchange.com (spotxchange.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.springserve.com (springserve.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.srv.stackadapt.com (stackadapt.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| sync.taboola.com (taboola.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.targeting.unrulymedia.com (unrulymedia.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| sync.visx.net (visx.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| t.adx.opera.com (opera.com; third) | 2 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| t.oa.opera.com (opera.com; third) | 2 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| tags.crwdcntrl.net (crwdcntrl.net; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| target.digitalaudience.io (digitalaudience.io; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| token.rubiconproject.com (rubiconproject.com; third) | 0 | 6 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| tpc.googlesyndication.com (googlesyndication.com; third) | 2 | 9 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| tps.doubleverify.com (doubleverify.com; third) | 1 | 5 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| tpsc-ue1.doubleverify.com (doubleverify.com; third) | 2 | 24 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| tr.blismedia.com (blismedia.com; third) | 1 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| trace.mediago.io (mediago.io; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| trace.us.rtbwise.com (rtbwise.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| trackid.globoid.globo.com (globo.com; first) | 0 | 8 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| tracking-api-use1.smartadserver.com (smartadserver.com; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| tracookiepixel.xyz (tracookiepixel.xyz; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| u.openx.net (openx.net; third) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| uipglob.semasio.net (semasio.net; third) | 3 | 1 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| um.simpli.fi (simpli.fi; third) | 1 | 0 | Host individual NE | Não visível no recorte | Só no HAR recebido; visita anterior. |
| ups.analytics.yahoo.com (yahoo.com; third) | 6 | 6 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| us-u.openx.net (openx.net; third) | 4 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| user-sync.fwmrm.net (fwmrm.net; third) | 1 | 10 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| usergate.globo.com (globo.com; first) | 0 | 4 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| ut.pubmatic.com (pubmatic.com; third) | 2 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| visitor.omnitagjs.com (omnitagjs.com; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| vtrk.dv.tech (dv.tech; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| weather.api.g1.globo.com (globo.com; first) | 0 | 2 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| web-api.globoid.globo.com (globo.com; first) | 0 | 5 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| wt.rqtrk.eu (rqtrk.eu; third) | 0 | 1 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| www.clarity.ms (clarity.ms; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| www.facebook.com (facebook.com; third) | 1 | 2 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| www.google.com (google.com; third) | 2 | 13 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| www.google.com.br (google.com.br; third) | 1 | 4 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| www.googletagmanager.com (googletagmanager.com; third) | 0 | 16 | Host individual NE | Não visível no recorte | Só no JSON recebido; visita posterior. |
| www.temu.com (temu.com; third) | 3 | 3 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |
| x.bidswitch.net (bidswitch.net; third) | 4 | 5 | Host individual NE | Não visível no recorte | Presente nas duas visitas; sem pareamento. |

Fonte computável: [har/resumo.json](har/resumo.json), [dominios.csv](har/dominios.csv). Transcrições visuais: [transcricao-capturas.json](../transcricao-capturas.json). Reproduzir: `node scripts/analyze-evidence.cjs`. `collectionRelation.overlaps=false` impede alinhamento artificial. O score é recalculado exclusivamente do JSON real e comparado integralmente ao exportado, sem alterar a função da extensão.
