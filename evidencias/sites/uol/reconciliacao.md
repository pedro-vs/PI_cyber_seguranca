# Reconciliação — UOL

O JSON E47 começou às **03:06:02.499** e foi exportado às **03:08:07.376**. O HAR E51 começa às **03:06:02.504** e termina às **03:09:36.867** (UTC−3). Início separado por 5 ms, mesma URL, uma única requisição do documento principal `/`: vínculo forte com a mesma navegação, sem evidência de reload no HAR. Persist logs não foi registrado; não se afirma sua configuração.

O painel E36 é anterior ao JSON: **450/389/31** (total/terceiros/falhas) versus **513/436/35** no JSON. Cookies 66 e frames 11 coincidem. O HAR soma **671 entradas**: **532** até a exportação e **139** posteriores. Destas, 43 pertencem a videohd6.mais.uol.com.br, 22 a pagead2.googlesyndication.com e 15 a events.newsroom.bi. O HAR contém 49 chamadas GET à playlist `/live/6146-2.m3u8`; streaming e telemetria continuam acumulando entradas.

O pareamento por método, URL sem valores e início ±50 ms encontra 374 correspondências. Ampliado a ±2 s, encontra candidatos para todas as 513 requisições do plugin, com deltas de 0 a 1565 ms; **125 possuem mais de um candidato**. Esse alinhamento não certifica identidade das queries nem equivalência de estados. Os 19 itens restantes na janela comum são quatro `data:` e 15 HTTPS com bodySize=0 e timings vazio: 13 imagens de conteudo.imguol.com.br, uma de me.jsuol.com e uma de i.ytimg.com. Compatíveis com entradas sem nova transferência mensurada, mas cache não é comprovado porque o campo cache está vazio. Índices HAR preservados em resumo.json. Não se concluiu perda do detector nem carregamento duplicado apenas dessa diferença.

As 35 falhas Privacy Lens são 34 NS_ERROR_DOM_NETWORK_ERR e uma NS_BINDING_ABORTED. Todos os candidatos correspondentes no alinhamento amplo possuem resposta HTTP 2xx/3xx no HAR, enquanto sete outras entradas HAR têm status 0. Estado HTTP de resposta e resultado final da API não são equivalentes; não se identifica bloqueador ou causa só desses campos. A blocklist do Privacy Lens está **pausada, vazia e sem decisões** nesse JSON.

**Cookies:** inventário 66 (39 próprios, 27 terceiros; 3 de sessão, 63 persistentes; 27 particionados). São 155 tentativas Set-Cookie no JSON e 230 linhas no HAR mais longo. Eventos correlacionados na janela inicial de 30 s: 115 gravações, 115 remoções; nas gravações, 20 eventos classificados como criação inferida e 95 como alteração. Deduplicação produz **42 identidades gravadas**, das quais 10 terceiras e 40 persistentes. Os 66 atuais têm preexistência indeterminada. Não somar estoque, tentativas, eventos e identidades. Blacklight encontra **17 cookies terceiros** em outra execução: comparar com os 27 terceiros atuais já é mais próximo que com 66, mas ainda mistura snapshot local, perfil/partição e visita remota não pareada.

**Blacklight E37:** 48 ad trackers, 17 third-party cookies, Facebook e Google Analytics detectados; evasion, session recording, keystrokes, TikTok e X não encontrados. O horário exibido é “Sep. 29, 2026, 02:15 ET”; a captura local é 03:16:32. A lista individual de 48 trackers não está expandida. Nenhum host facebook.com/facebook.net aparece nos domínios HAR/JSON desta navegação; a discrepância é documentada, mas sua causa específica (configuração, execução ou conteúdo) não pode ser decidida pelo print.

**uBlock E38:** 22 bloqueios (11%), 17 de 24 domínios; versão 1.75.0. Linhas de chartbeat.com, cxense.com e doubleclick.net apresentam bloqueio no painel, enquanto HAR/PL observam seus recursos na coleta anterior. O ícone de energia está cinza e não há logger/listas: o contador não prova bloqueio ativo durante toda a navegação. A captura é posterior, às 03:23:26, e não serve para atribuir as falhas do JSON das 03:08 ao uBlock.

**Score:** 0–31/100, parcial, 2/6 categorias cobertas. Descontos N=10, C=20, S=4, F=0, T=15, H=20. Recálculo pela função implementada coincide integralmente com o JSON. H decorre da alteração de Function.toString e quatro POST 2xx a events.newsroom.bi/ingest.php em 15.737 ms, mesmo frame; coocorrência não prova malware, autoria ou hijacking. T vem do único sync moderado (analytics.google.com/www.google.com.br); há outros dois indicadores baixos. Perdas do tracking (8 observações, 771 parâmetros, 16 valores, 121 findings) e frames incompletos impedem nota pontual.

## Agregados HAR reproduzíveis

| Medida | Valor |
|---|---:|
| Entradas | 671 |
| Primeira parte | 125 |
| Terceira parte | 541 |
| Sem host / data: | 5 |
| Hosts HTTP(S) | 71 |
| Sites PSL | 38 |
| Sites terceiros PSL | 37 |
| Linhas Set-Cookie | 230 |
| Respostas com Set-Cookie | 106 |
| Redirects 3xx exceto 304 | 10 |
| Grupos repetidos (método + URL completa) | 49 |
| Repetições além da primeira | 261 |

Status HTTP: 0: 7, 200: 500, 204: 130, 206: 2, 302: 10, 304: 21, 404: 1.

Tipos inferidos pelo MIME (não são tipos de iniciador webRequest): imagem (MIME): 204, JSON (MIME): 125, JavaScript (MIME): 109, mídia (MIME): 100, HTML (MIME): 40, text/plain: 33, application/x-unknown-content-type: 22, text/xml: 17, fonte (MIME): 9, não informado: 7, CSS (MIME): 5.

Status 0 não informa autoria do cancelamento. Dados brutos preservados; valores de cookies/query/corpos não transcritos aqui.

## Matriz por host/site

NE = não estabelecido. “Não visível” não significa ausente. Nomes comerciais não foram inventados a partir do domínio.

| Domínio/site | HAR | Privacy Lens | Blacklight | uBlock | Explicação |
|---|---:|---|---|---|---|
| 3c4a9cef094c8b80013ba785e963d925.safeframe.googlesyndication.com (googlesyndication.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| 4b91477e-f67b-4d81-86db-a9742bd41e9c.edge.permutive.app (permutive.app; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| analytics.google.com (google.com; third) | 9 | 9 | Google Analytics detectado; URL não discriminada | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| api.mais.uol.com.br (uol.com.br; first) | 13 | 9 | Sem lista individual | Não visível no recorte | HAR total − PL = 4; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| api.permutive.com (permutive.com; third) | 24 | 18 | Sem lista individual | Não visível no recorte | HAR total − PL = 6; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| ats-wrapper.privacymanager.io (privacymanager.io; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| bs.uol.com.br (uol.com.br; first) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| c.amazon-adsystem.com (amazon-adsystem.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| c2.piano.io (piano.io; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| cdn.cxense.com (cxense.com; third) | 2 | 2 | Sem lista individual | Linha cxense.com com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| cdn.tinypass.com (tinypass.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| comcluster.cxense.com (cxense.com; third) | 1 | 1 | Sem lista individual | Linha cxense.com com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| config.aps.amazon-adsystem.com (amazon-adsystem.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| conteudo.imguol.com.br (imguol.com.br; third) | 42 | 29 | Sem lista individual | Não visível no recorte | HAR total − PL = 13; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| conteudo.jsuol.com.br (jsuol.com.br; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| croupier.mais.uol.com.br (uol.com.br; first) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| csi.gstatic.com (gstatic.com; third) | 21 | 15 | Sem lista individual | Não visível no recorte | HAR total − PL = 6; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| ep1.adtrafficquality.google (adtrafficquality.google; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| ep2.adtrafficquality.google (adtrafficquality.google; third) | 3 | 3 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| events.newsroom.bi (newsroom.bi; third) | 43 | 28 | Sem lista individual | Não visível no recorte | HAR total − PL = 15; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| experiences.newsroom.bi (newsroom.bi; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| fastlane.rubiconproject.com (rubiconproject.com; third) | 14 | 12 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| fonts.gstatic.com (gstatic.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| fundingchoicesmessages.google.com (google.com; third) | 19 | 19 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| geoip.home.uol.com (uol.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| googleads.g.doubleclick.net (doubleclick.net; third) | 12 | 7 | Sem lista individual | Linha doubleclick.net com bloqueio | HAR total − PL = 5; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| gum.criteo.com (criteo.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| h.jsuol.com.br (jsuol.com.br; third) | 17 | 17 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| i.ytimg.com (ytimg.com; third) | 2 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 1; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| ib.adnxs.com (adnxs.com; third) | 18 | 16 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| imasdk.googleapis.com (imasdk.googleapis.com; third) | 3 | 3 | Sem lista individual | Linha imasdk.googleapis.com com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| img.youtube.com (youtube.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| jnn-pa.googleapis.com (jnn-pa.googleapis.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| launchpad-wrapper.privacymanager.io (privacymanager.io; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| launchpad.privacymanager.io (privacymanager.io; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| mab.chartbeat.com (chartbeat.com; third) | 1 | 1 | Sem lista individual | Linha chartbeat.com com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| marfeelexperimentsexperienceengine.mrf.io (mrf.io; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| me.jsuol.com (jsuol.com; third) | 2 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 1; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| me.jsuol.com.br (jsuol.com.br; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| mfe.fantascope.uol.com.br (uol.com.br; first) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| pagead2.googlesyndication.com (googlesyndication.com; third) | 71 | 49 | Sem lista individual | Não visível no recorte | HAR total − PL = 22; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| ping.chartbeat.net (chartbeat.net; third) | 13 | 8 | Sem lista individual | Não visível no recorte | HAR total − PL = 5; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| player.fantascope.uol.com.br (uol.com.br; first) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| prg.smartadserver.com (smartadserver.com; third) | 12 | 10 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| pubads.g.doubleclick.net (doubleclick.net; third) | 36 | 36 | Sem lista individual | Linha doubleclick.net com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| r7---sn-oxunxg8pjvn-bg0rl.gvt1.com (gvt1.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| r8---sn-oxunxg8pjvn-bg0rl.gvt1.com (gvt1.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| redirector.gvt1.com (gvt1.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| s.cdn.turner.com (turner.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| s.seedtag.com (seedtag.com; third) | 14 | 12 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| s0.2mdn.net (2mdn.net; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| sb.scorecardresearch.com (scorecardresearch.com; third) | 38 | 26 | Sem lista individual | Não visível no recorte | HAR total − PL = 12; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| sdk.mrf.io (mrf.io; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| securepubads.g.doubleclick.net (doubleclick.net; third) | 28 | 21 | Sem lista individual | Linha doubleclick.net com bloqueio | HAR total − PL = 7; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| static.chartbeat.com (chartbeat.com; third) | 2 | 2 | Sem lista individual | Linha chartbeat.com com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| static.doubleclick.net (doubleclick.net; third) | 1 | 1 | Sem lista individual | Linha doubleclick.net com bloqueio | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados. Painel uBlock posterior; HAR/PL são outra janela; filtro não fornecido. |
| stc.uol.com (uol.com; third) | 7 | 7 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| tm.jsuol.com.br (jsuol.com.br; third) | 11 | 11 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| tm.uol.com.br (uol.com.br; first) | 3 | 3 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| tpc.googlesyndication.com (googlesyndication.com; third) | 8 | 6 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| tpsc-video.doubleverify.com (doubleverify.com; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| udr.uol.com.br (uol.com.br; first) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| upc.udr.uol.com.br (uol.com.br; first) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| videohd6.mais.uol.com.br (uol.com.br; first) | 96 | 53 | Sem lista individual | Não visível no recorte | HAR total − PL = 43; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| web-banner.ads.aps.amazon-adsystem.com (amazon-adsystem.com; third) | 1 | 1 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.google-analytics.com (google-analytics.com; third) | 1 | 1 | Google Analytics detectado; URL não discriminada | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.google.com (google.com; third) | 8 | 6 | Sem lista individual | Não visível no recorte | HAR total − PL = 2; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.google.com.br (google.com.br; third) | 2 | 2 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.googletagmanager.com (googletagmanager.com; third) | 5 | 5 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.uol.com.br (uol.com.br; first) | 4 | 3 | Sem lista individual | Não visível no recorte | HAR total − PL = 1; janela/candidatos documentados no resumo, sem equivalência de estados.  |
| www.youtube.com (youtube.com; third) | 14 | 14 | Sem lista individual | Não visível no recorte | HAR total − PL = 0; janela/candidatos documentados no resumo, sem equivalência de estados.  |

Fonte computável: [har/resumo.json](har/resumo.json), [dominios.csv](har/dominios.csv). Transcrições visuais: [transcricao-capturas.json](../transcricao-capturas.json). Reproduzir: `node scripts/analyze-evidence.cjs`. O algoritmo usa a mesma PSL da extensão e omite data: das contagens de terceiros; os originais não são alterados.
