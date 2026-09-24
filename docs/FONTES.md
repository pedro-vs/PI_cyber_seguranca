# Fontes primárias consultadas em 24/09/2026

Fonte da avaliação: `Avaliacao_Intermediaria_Ciberseguranca(1).pdf`, fornecido pelo aluno, 4 páginas. O enunciado é a fonte dos critérios; os trechos históricos sobre plug-ins não descrevem as permissões de uma WebExtension moderna.

| Fonte | Aplicação |
|---|---|
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background | background.scripts, persistência e diferença para service worker |
| https://blog.mozilla.org/addons/2024/03/13/manifest-v3-manifest-v2-march-2024-update/ | suporte a MV2 no Firefox |
| https://blog.mozilla.org/en/firefox/firefox-manifest-v3-adblockers/ | política de Firefox para extensões e bloqueio |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest | eventos, permissões e limites de observação |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/getAll | inventário, storeId, firstPartyDomain e partitionKey |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/onChanged | evento de alteração, sem atribuição de aba |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts | contexto e limitações de content scripts |
| https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases | snapshot de bancos IndexedDB |
| https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/publicSuffix/getDomain | conceito de domínio registrável; API recente não exigida por esta versão |
| https://publicsuffix.org/list/ | PSL oficial e formato |
| https://publicsuffix.org/list/public_suffix_list.dat | snapshot local completo, fonte oficial |
| https://privacy-test-pages.site/ | índice dos testes DDG |
| https://github.com/duckduckgo/privacy-test-pages | código e propósito das páginas DDG |
| https://privacy-test-pages.site/security/js-leaks.html | alterações observáveis em objetos globais; não prova de malware |
| https://themarkup.org/blacklight | comparação futura, opções de localização/dispositivo/cache |
| https://github.com/gorhill/uBlock/wiki/The-logger | logger, filtros, bloqueios, redirecionamentos e scriptlets |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Usage.html | teste local em Firefox real via WebDriver |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | acesso à UI em perfil temporário de teste |

A leitura destas páginas não equivale à execução dos testes que elas descrevem. Nenhum resultado externo foi inferido da documentação.
