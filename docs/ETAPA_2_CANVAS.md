# Etapa 2A — Canvas e fixture controlada — v0.2.0

Escopo deste bloco: observação de canvas no JavaScript da página, classificação heurística, UI, fixture, testes e evidências de desenvolvimento. Atribuição de cookies e DDG vêm depois da validação manual deste bloco. Score, hook/hijacking e blocklist não foram implementados.

O PDF da avaliação foi relido integralmente. Na p. 2, o relatório DDG exige print do plugin em cada teste; as p. 3–4 exigem HARs, reconciliação e evidências no repositório. Esta entrega não considera C/B/A concluídos.

## 1. Estratégia confirmada para Firefox

Content script em `document_start` e `all_frames`, com `window.wrappedJSObject` para alcançar os protótipos reais da página e `exportFunction` para disponibilizar os wrappers nesses protótipos. O estado e a comunicação `browser.runtime` ficam no escopo da extensão. Nenhuma ponte por postMessage/CustomEvent aceita eventos fabricados pela página, nenhum script inline é inserido e nenhuma permissão foi acrescentada.

Chamadas feitas pelo site passam pelo wrapper e pela implementação capturada. A extensão devolve o resultado original, mantém o callback de toBlob sem substituir seu corpo e relança a exceção original. Name, length e flags dos descritores são preservados. Identidade de função e sua representação/reflexão continuam observáveis: não há tentativa de esconder a instrumentação nem de falsificar Function.toString.

Fontes consultadas em 24/09/2026:

- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts/exportFunction
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData

O teste automatizado usa JavaScript servido pela própria fixture, sob CSP `script-src 'self'`, sem chamar a extensão. Compara saídas com/sem extensão em Firefox real. Isso verifica a observação do contexto da página, não apenas do content script.

## 2. Regra explícita: canvas-sequence-v1

| Nível | Evidência | Texto na interface |
|---|---|---|
| Nenhuma chamada | Sem chamadas nas APIs observadas | Nenhuma chamada canvas observada |
| Desenho | fillRect/strokeRect/fillText/strokeText/drawImage/putImageData/fill/stroke | Canvas utilizado · indicador não detectado |
| Leitura/exportação | getImageData, toDataURL ou toBlob, sem sequência elegível | Leitura/exportação observada · sem sequência compatível |
| Indício | Desenho e leitura/exportação no mesmo objeto canvas, no mesmo frame, em até 5.000 ms, dimensões não nulas e sem exceção síncrona | Indicador de canvas fingerprinting detectado |
| Cobertura ausente | Nenhum frame instrumentado | Canvas não observável · recarregue a página |

O prazo de 5 s é uma escolha operacional explícita para correlacionar eventos próximos, não um limiar cientificamente validado. O timestamp usa performance.now no mesmo documento. A regra exige sequência, não a existência da tag canvas. IDs são locais ao documento; nunca se correlaciona desenho em um canvas/frame com leitura em outro.

`getImageData` e `toDataURL`: “retorno sem exceção”. `toBlob`: “exportação solicitada”, pois seu retorno é assíncrono; sem modificar o callback não afirmamos que houve Blob. A fixture separadamente verifica o Blob que recebe. Exceções são registradas como tentativas falhas e não ativam o indício.

Um editor que desenha e salva uma imagem pode satisfazer exatamente esta regra. Portanto, o resultado tem **baixa especificidade**, não é ataque, nem comprova intenção de rastreamento. Classificação mais forte exigiria evidências adicionais, por exemplo código chamador e uso/transmissão do resultado; não foram implementadas neste bloco.

## 3. Dados e limites

Coletados: frame/URL da página, ID efêmero do canvas, nomes de APIs, contadores, dimensões, tempo desde o desenho, resultado síncrono/solicitação/erro. Não coletados: texto desenhado, pixels, dataURL, bytes do Blob, argumentos ou hash do conteúdo. O baseline PNG usado pelo teste fica somente na memória da fixture/teste, não no relatório do detector.

- 100 canvas, 20.000 eventos processados e 40 amostras de leitura por documento. O restante marca perda de cobertura; não passa a ser zero.
- Coleta é agrupada por 250 ms; Atualizar pede snapshot imediatamente.
- Cada leitura se refere ao último desenho observado naquele canvas. Desenhos sem efeito, clearRect e resize/reset entre desenho e leitura podem causar indício excessivo; os resets não são instrumentados nesta versão.
- Não cobre WebGL/readPixels, OffscreenCanvas, workers, frames opacos/about:blank/srcdoc, funções nativas guardadas antes da instrumentação, chamadas anteriores à carga ou técnicas de evasão por outros contextos.
- Não atribui a chamada a um arquivo JavaScript específico: a origem exibida é a do documento/frame. Um script terceiro executando na página pode desenhar sob a origem da própria página.
- Uma página/outra extensão pode substituir métodos ou usar uma cópia nativa de outro contexto. A substituição dos wrappers instalados é exibida como perda de cobertura, não como detector de hook/hijacking.
- Instrumentação pode ser perceptível em js-leaks; essa avaliação será feita no bloco apropriado. Não alteramos preventivamente a reflexão para disfarçá-la.
- APIs ausentes/falhas, método substituído ou limites excedidos tornam a cobertura parcial. “Não observado” não garante inexistência de fingerprinting.
- Snapshots por frame podem perder histórico de frames removidos; recarregar/iniciar outra navegação reinicia a coleta. BFCache/SPAs não recebem uma reconstrução histórica neste bloco.
- Após recarregar/remover a extensão, recarregue também as páginas: wrappers de um contexto anterior podem ter sido invalidados.

## 4. Atualizar seu repositório preservando o histórico

Esta cópia usa a base 0.1.0 entregue aqui e o estado de validação que você informou. O conteúdo adicional dos commits no GitHub não foi baixado, pois não foi fornecida a URL. A lista de commits está registrada em `evidencias/desenvolvimento/etapa-1/VALIDACAO_INFORMADA_PELO_ALUNO.md` como relato seu.

1. Extraia o novo ZIP **fora** da pasta do seu repositório.
2. Abra o ZIP extraído e o seu repositório no editor. Copie os arquivos novos/alterados listados em `ARQUIVOS_ETAPA_2_CANVAS.md` para os mesmos caminhos.
3. Preserve `.git` e suas evidências já capturadas. Não substitua a pasta inteira, não rode git init/reset/rebase/squash. Documentos que você já editou devem receber somente as atualizações pertinentes, usando a comparação do editor.
4. As pastas de evidência novas são aditivas. Não sobrescreva seus prints ou registros com modelos PENDENTE. As evidências antigas incluídas no ZIP são históricas, não novas capturas suas.
5. Confira `git diff --stat` e `git status --short` antes de testar. Ainda não faça commit; primeiro executar e enviar a validação abaixo.

O ZIP é completo, não somente um patch. Para testar sem misturar pastas, também é possível carregar o manifest da cópia extraída e incorporar os arquivos ao repositório após conferir. Não carregar duas cópias simultâneas com o mesmo ID.

## 5. Rodar e recarregar no macOS

Na raiz do projeto atualizado:

```bash
npm test
npm run check
npm run fixture
```

São esperados 26 testes de lógica. Não há `npm install` nem dependência de produção nova. Se o servidor antigo já estiver usando 8787, encerre-o com Ctrl+C antes de iniciar este.

No Firefox 156.0.1, abra `about:debugging#/runtime/this-firefox` e clique **Recarregar** no Privacy Lens. Confira versão **0.2.0**. Se estiver testando outra pasta, remova a instalação temporária antiga e carregue o novo `extension/manifest.json`.

Use janelas normais. Mantenha ETP na configuração habitual e anote qual é; não é necessário desativar proteção, RFP ou limpar cookies/storage para estas fixtures. Use as mesmas condições entre os casos. Para uma medição inicial isolada, mantenha outras extensões que alteram canvas desligadas apenas no perfil de laboratório, registrando isso. Se usar RFP/antifingerprinting, anote e guarde qualquer divergência; não a esconda.

Abra cada caso em **aba nova** depois de recarregar a extensão. Espere a página mostrar **PRONTO**, aguarde **3 segundos** e clique **Atualizar** no popup. Não reutilize uma aba sem recarregá-la após mudar a versão da extensão.

## 6. EVIDÊNCIA A CAPTURAR — caso negativo

**PRINT OBRIGATÓRIO**

1. Página: `http://localhost:8787/canvas/negative`, aba nova.
2. Ação: deixar a fixture executar; não fazer capturas/exportações do canvas por código adicional. Abrir Privacy Lens → Atualizar.
3. Espera: PRONTO + 3 s.
4. Seção visível: Canvas, no início do popup; detalhes podem ficar fechados.
5. Print: identificação da página/caso negativo, URL no cabeçalho do plugin, “Canvas utilizado · indicador não detectado”, 2 desenhos, 0 leituras/exportações, 0 canvas com indício. Preferir popup sobre a página com o título do caso visível.
6. Nome: `canvas-negativo-plugin.png`.
7. Pasta: `evidencias/desenvolvimento/etapa-2-canvas/manual/`.

Exportar também `canvas-negativo-relatorio.json` nessa pasta. A captura é obrigatória mesmo quando o resultado divergir: registrar o que apareceu.

## 7. EVIDÊNCIA A CAPTURAR — caso positivo

**PRINT OBRIGATÓRIO**

1. Página: `http://localhost:8787/canvas/positive`, outra aba nova.
2. Ação: deixar rodar. A página desenha e usa getImageData, toDataURL e toBlob. Abrir Privacy Lens → Atualizar.
3. Espera: PRONTO + 3 s (PRONTO inclui a conclusão do callback da própria fixture).
4. Seção: Canvas, detalhes fechados no primeiro print.
5. Print: título/caso identificável, URL do plugin, “Indicador de canvas fingerprinting detectado”, 2 desenhos, 3 leituras/exportações, 0 exceções, 1 canvas com indício e as três APIs. Manter a ressalva de que é indício.
6. Nome: `canvas-positivo-plugin.png`.
7. Pasta: `evidencias/desenvolvimento/etapa-2-canvas/manual/`.

Exportar `canvas-positivo-relatorio.json`.

**PRINT OBRIGATÓRIO — sequência**

1. Página: a mesma positiva; não recarregar entre as capturas.
2. Ação: clicar Abrir relatório, depois “Ver sequência e APIs observadas”.
3. Espera: a coleta concluir; não é necessário esperar mais 3 s.
4. Seção: detalhes de Canvas.
5. Print: URL/origem da fixture, Canvas #1, desenho anterior fillText e chamadas getImageData/toDataURL como retorno sem exceção e toBlob como exportação solicitada. Se não couber, usar dois recortes com sobreposição do contexto, sem recortar números/URLs; zoom normal ou 90% se necessário.
6. Nome: `canvas-positivo-sequencia.png`; se houver dois, `canvas-positivo-sequencia-1.png` e `canvas-positivo-sequencia-2.png`.
7. Pasta: a mesma `manual/`.

## 8. EVIDÊNCIA A CAPTURAR — controles complementares

Os controles abaixo verificam distinções exibidas pela interface. **PRINT OBRIGATÓRIO para cada linha**, antes de marcar o controle como validado.

| Página, sempre aba nova | Ação e espera | Seção / conteúdo que precisa aparecer | Nome na pasta `evidencias/desenvolvimento/etapa-2-canvas/manual/` |
|---|---|---|---|
| `http://localhost:8787/canvas/read-only` | PRONTO + 3 s; popup → Atualizar | Canvas, URL, leitura/exportação sem sequência; 0 desenhos, 1 leitura, 0 indícios | `canvas-leitura-isolada-plugin.png` |
| `http://localhost:8787/canvas/errors` | PRONTO + 3 s; Atualizar; abrir detalhes | Canvas, URL, 1 leitura com exceção; IndexSizeError nos detalhes; 0 indícios | `canvas-excecao-plugin.png` |
| `http://localhost:8787/canvas/frame` | PRONTO + 3 s; Atualizar; Abrir relatório e detalhes | Página principal localhost; frame 127.0.0.1 com 2 desenhos/3 leituras/1 indício; 2 frames instrumentados | `canvas-frame-plugin.png` |

Não limpar cookies/storage e não mudar ETP entre os controles. Salvar também os JSONs: `canvas-leitura-isolada-relatorio.json`, `canvas-excecao-relatorio.json`, `canvas-frame-relatorio.json`. Se o frame ficar fora do recorte, usar segundo print com URL da origem e seção relevante.

## 9. O que enviar e condição para o próximo commit

Envie os prints obrigatórios, JSONs e o resultado dos comandos; registre Firefox/macOS/ETP e outras extensões no `manual/REGISTRO.md`. Resultados observados desse modelo estão PENDENTES.

Não será sugerido commit neste bloco antes de você executar e confirmar a validação no Firefox. Após revisar evidências/resultados, definiremos os commits reais de detector e fixture, sem alterar os quatro commits existentes. Depois avançaremos para atribuição de cookies e só então os primeiros DDG.

## 10. Checklist atual

- [x] Etapa 1 validada no macOS/Firefox e commitada: informado pelo aluno.
- [x] Canvas: instrumentação de APIs reais da página implementada.
- [x] Níveis desenho/leitura/indício e limitações explícitos.
- [x] Fixture negativa, positiva, leitura isolada, exceção e frame.
- [x] Modelos/pastas de evidências preparados, sem resultados DDG fictícios.
- [ ] Canvas validado no Firefox do aluno, com prints e JSONs.
- [ ] Próximos commits deste bloco após a validação manual.
- [ ] Aprofundamento de atribuição de cookies.
- [ ] DDG C: Tracker Reporting, Storage Blocking e Canvas com prints por linha.
- [ ] Demais requisitos B/A e entregáveis gerais do enunciado.
