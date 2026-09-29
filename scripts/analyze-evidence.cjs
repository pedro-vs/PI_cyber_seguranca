/* Reproduz agregados sem exportar valores de URL/cookies/corpos dos HARs. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p));
const json = p => JSON.parse(read(p));
require('../extension/lib/domain.js');
require('../extension/lib/model.js');
require('../extension/lib/score.js');
const P = globalThis.PrivacyLens;
const psl = read('extension/vendor/public_suffix_list.dat');
const resolve = P.createDomainResolver(psl.toString());
const count = (a,key) => a.reduce((out,v) => {const k=key(v); out[k]=(out[k]||0)+1; return out;},{});
const sorted = obj => Object.fromEntries(Object.entries(obj).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])));
const iso = n => new Date(n).toISOString();
const write = (p,d) => fs.writeFileSync(path.join(root,p),JSON.stringify(d,null,2)+'\n');
const safe = s => P.isWeb(s) ? P.safeUrl(s).url : '';
const mimeType = m => {
 m=(m||'').split(';')[0].trim().toLowerCase();
 if (!m) return 'não informado';
 if (m.includes('javascript')) return 'JavaScript (MIME)';
 if (m.includes('json')) return 'JSON (MIME)';
 if (m==='text/html') return 'HTML (MIME)';
 if (m==='text/css') return 'CSS (MIME)';
 if (m.startsWith('image/')) return 'imagem (MIME)';
 if (m.startsWith('font/')||m.includes('font')) return 'fonte (MIME)';
 if (m.startsWith('video/')||m.startsWith('audio/')||m.includes('mpegurl')) return 'mídia (MIME)';
 return m;
};
const all={method:'PSL local da extensão; contagens de entradas HAR; erros status 0 sem atribuição; tipos inferidos do MIME, não do iniciador; repetição exata considera URL completa somente em memória; saídas omitem valores.',pslSha256:crypto.createHash('sha256').update(psl).digest('hex'),sites:{}};
for (const [site,top,file] of [['uol','www.uol.com.br','uol.har.gz'],['g1','g1.globo.com','g1.har'],['mercadolivre','www.mercadolivre.com.br','mercadolivre.har']]) {
 const harPath=`evidencias/sites/${site}/har/${file}`;
 const bytes=read(harPath); const har=JSON.parse(file.endsWith('.gz')?zlib.gunzipSync(bytes):bytes);
 const entries=har.log.entries;
 const data=entries.map((e,i)=>({index:i,at:Date.parse(e.startedDateTime),url:safe(e.request.url),host:P.host(e.request.url),site:resolve(P.host(e.request.url)),method:e.request.method,status:e.response.status,entry:e}));
 const plPath=`evidencias/sites/${site}/privacy-lens/${site}-relatorio.json`;
 const pl=fs.existsSync(path.join(root,plPath))?json(plPath):null;
 const exact=count(entries,e=>`${e.request.method} ${e.request.url}`);
 const endpoints=Object.entries(count(data,e=>`${e.method} ${e.url}`)).filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const redirects=data.filter(e=>e.status>=300&&e.status<400&&e.status!==304).map(e=>({index:e.index,at:iso(e.at),from:e.url,status:e.status,to:safe(e.entry.response.redirectURL||e.entry.response.headers.find(h=>h.name.toLowerCase()==='location')?.value||'')}));
 const setCookies=entries.flatMap((e,i)=>e.response.headers.filter(h=>h.name.toLowerCase()==='set-cookie').map(h=>({index:i,host:P.host(e.request.url),name:h.value.split('=',1)[0]})));
 const hosts=Object.keys(count(data.filter(e=>e.host),e=>e.host)).sort();
 const comparisonHosts=[...new Set([...hosts,...(pl?pl.network.requests.map(e=>e.host).filter(Boolean):[])])].sort();
 const domains=comparisonHosts.map(host=>({host,site:resolve(host),party:P.party(host,top,resolve),har:data.filter(e=>e.host===host).length,harStatus0:data.filter(e=>e.host===host&&e.status===0).length,pl:pl?pl.network.requests.filter(e=>e.host===host).length:null}));
 const s={source:harPath,topSite:resolve(top),creator:har.log.creator,browser:har.log.browser,pages:har.log.pages.map(p=>({title:p.title,startedDateTime:p.startedDateTime,pageTimings:p.pageTimings})),total:entries.length,first:data.filter(e=>e.site===resolve(top)).length,third:data.filter(e=>e.site&&e.site!==resolve(top)).length,unknown:data.filter(e=>!e.site).length,schemes:count(entries,e=>new URL(e.request.url).protocol),hostCount:hosts.length,siteCount:new Set(data.filter(e=>e.site).map(e=>e.site)).size,thirdSiteCount:new Set(data.filter(e=>e.site&&e.site!==resolve(top)).map(e=>e.site)).size,start:iso(Math.min(...data.map(e=>e.at))),end:iso(Math.max(...data.map(e=>e.at))),status:sorted(count(data,e=>e.status)),status0:data.filter(e=>e.status===0).map(e=>({index:e.index,at:iso(e.at),url:e.url,method:e.method,statusText:e.entry.response.statusText||'',comment:e.entry.comment||''})),explicitBlockedAttribution:'não informada nos campos exportados; status 0 não identifica bloqueador',setCookieHeaderLines:setCookies.length,setCookieResponses:new Set(setCookies.map(e=>e.index)).size,setCookieByHost:sorted(count(setCookies,e=>e.host)),redirectCount:redirects.length,redirects,resourceTypesInferred:sorted(count(entries,e=>mimeType(e.response.content.mimeType))),explicitResourceTypes:entries.filter(e=>e._resourceType).length,exactRepeatedGroups:Object.values(exact).filter(n=>n>1).length,exactRepeatedExtra:Object.values(exact).reduce((a,n)=>a+Math.max(0,n-1),0),repeatedEndpoints:endpoints.map(([endpoint,n])=>({endpoint,count:n})),homeDocumentRequests:data.filter(e=>e.host===top&&new URL(e.url).pathname==='/').map(e=>({index:e.index,at:iso(e.at),method:e.method,status:e.status})),domains};
 if(pl) {
  const start=pl.page.startedAt,end=Date.parse(pl.generatedAt); const common=data.filter(e=>e.at>=start-10&&e.at<=end); const used=new Set();const matches=[];const missing=[];
  const overlaps=Date.parse(s.start)<=end&&Date.parse(s.end)>=start-10;
  s.collectionRelation={overlaps,harStart:s.start,harEnd:s.end,privacyLensStart:iso(start),privacyLensEnd:iso(end),interpretation:overlaps?'Janelas sobrepostas; alinhamento aproximado por horário, método e URL sem query.':'Coletas sem sobreposição temporal; totais por host descrevem visitas diferentes, sem pareamento de requisições nem inferência de falha do detector.'};
  if(overlaps) {
  for(const r of pl.network.requests){
   const choices=common.filter(e=>!used.has(e.index)&&e.method===r.method&&e.url===r.url&&Math.abs(e.at-r.at)<=50).sort((a,b)=>Math.abs(a.at-r.at)-Math.abs(b.at-r.at));
   const e=choices[0];if(e){used.add(e.index);matches.push({requestId:r.id,harIndex:e.index,deltaMs:e.at-r.at,host:e.host,plStatus:r.status,harStatus:e.status,plType:r.type});}else missing.push({id:r.id,at:iso(r.at),url:r.url,type:r.type,status:r.status,error:r.error});
  }
  const relaxedUsed=new Set(),relaxedMatches=[];
  for(const r of pl.network.requests){
   const choices=data.filter(e=>!relaxedUsed.has(e.index)&&e.method===r.method&&e.url===r.url&&Math.abs(e.at-r.at)<=2000).sort((a,b)=>Math.abs(a.at-r.at)-Math.abs(b.at-r.at));
   const e=choices[0]; if(e){relaxedUsed.add(e.index);relaxedMatches.push({requestId:r.id,harIndex:e.index,deltaMs:e.at-r.at,candidates:choices.length,statusHAR:e.status,statusPL:r.status,statusCodePL:r.statusCode??null});}
  }
  s.approximateAlignment={method:'Candidatos por método e URL sem query, pareamento um-a-um por proximidade, tolerância 2000 ms em todo o HAR. Não prova identidade das queries; considera início HAR posterior ao evento webRequest.',matched:relaxedMatches.length,multipleCandidates:relaxedMatches.filter(e=>e.candidates>1).length,minDeltaMs:Math.min(...relaxedMatches.map(e=>e.deltaMs)),maxDeltaMs:Math.max(...relaxedMatches.map(e=>e.deltaMs)),plErrorHarSuccess:relaxedMatches.filter(e=>e.statusPL==='error'&&e.statusHAR>=200&&e.statusHAR<400).length,matchedAfterExport:relaxedMatches.filter(e=>data[e.harIndex].at>end).length,matches:relaxedMatches,harExtraWithin:common.filter(e=>!relaxedUsed.has(e.index)).map(e=>({index:e.index,host:e.host,url:e.url,status:e.status,bodySize:e.entry.response.bodySize,timings:e.entry.timings}))};
  } else {
   s.approximateAlignment={applicable:false,reason:s.collectionRelation.interpretation};
  }
  const recalculated=P.privacyScore(pl,resolve);assert.deepEqual(recalculated,pl.score);
  const writes=[...new Map(pl.cookies.events.filter(e=>!e.removed).map(e=>[P.cookieKey(e),e])).values()];
  s.privacyLens={source:plPath,generatedAt:pl.generatedAt,start:iso(start),totals:pl.network.totals,types:sorted(count(pl.network.requests,e=>e.type)),errors:sorted(count(pl.network.requests.filter(e=>e.error),e=>e.error)),cookieTotals:pl.cookies.totals,cookieEventTotals:pl.cookies.eventTotals,setCookieAttempts:pl.cookies.setCookieAttempts.length,uniqueWrittenIdentities:writes.length,thirdWrittenIdentities:writes.filter(e=>e.party==='third').length,persistentWrittenIdentities:writes.filter(e=>!e.session).length,score:pl.score,scoreRecomputedEqual:true,scoreSensitivity:Object.fromEntries([0.8,1.2].map(f=>[f,P.privacyScore(pl,resolve,f).range])),networkCompletedThirdSites:pl.score.categories[0].evidence.length};
  s.commonWindow=overlaps?{method:'Método+URL sem query/fragmento + horodatage ±50 ms, pareamento um-a-um por proximidade; valores omitidos pelo PL impedem certificar identidade das queries; margem inicial 10 ms para arredondamento HAR.',start:iso(start),end:iso(end),harWithin:common.length,harLater:data.filter(e=>e.at>end).length,harEarlier:data.filter(e=>e.at<start-10).length,matched:matches.length,matches,plUnmatched:missing,harUnmatched:common.filter(e=>!used.has(e.index)).map(e=>({index:e.index,at:iso(e.at),url:e.url,method:e.method,status:e.status})),laterByHost:sorted(count(data.filter(e=>e.at>end),e=>e.host))}:null;
 }
 write(`evidencias/sites/${site}/har/resumo.json`,s); all.sites[site]=s;
 const csv=['host,site,party,har,har_status_0,privacy_lens',...domains.map(d=>[d.host,d.site,d.party,d.har,d.harStatus0,d.pl??'NE'].join(','))].join('\n')+'\n';
 fs.writeFileSync(path.join(root,`evidencias/sites/${site}/har/dominios.csv`),csv);
}
write('evidencias/sites/analise.json',all);
for(const [key,s] of Object.entries(all.sites)) console.log(key,JSON.stringify({total:s.total,first:s.first,third:s.third,unknown:s.unknown,hosts:s.hostCount,sites:s.siteCount,thirdSites:s.thirdSiteCount,status:s.status,setCookie:s.setCookieHeaderLines,redirects:s.redirectCount,types:s.resourceTypesInferred,repeatedGroups:s.exactRepeatedGroups,repeatedExtra:s.exactRepeatedExtra,home:s.homeDocumentRequests,common:s.commonWindow?{har:s.commonWindow.harWithin,later:s.commonWindow.harLater,matched:s.commonWindow.matched,plUnmatched:s.commonWindow.plUnmatched.length,harUnmatched:s.commonWindow.harUnmatched.length}:null,pl:s.privacyLens?{cookies:s.privacyLens.cookieTotals,events:s.privacyLens.cookieEventTotals,attempts:s.privacyLens.setCookieAttempts,written:s.privacyLens.uniqueWrittenIdentities,thirdWritten:s.privacyLens.thirdWrittenIdentities,persistentWritten:s.privacyLens.persistentWrittenIdentities,sites:s.privacyLens.networkCompletedThirdSites,sensitivity:s.privacyLens.scoreSensitivity}:null}));
