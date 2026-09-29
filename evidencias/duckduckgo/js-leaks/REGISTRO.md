# DDG — js-leaks / Conceito A

Status: **PREPARADO, NÃO EXECUTADO MANUALMENTE**. Nenhum resultado oficial atribuído à v0.5.0. Próximo teste após os sete testes da v0.4.0 registrados. [Método e controles A](../../../docs/CONCEITO_A.md).

URL completa: https://privacy-test-pages.site/security/js-leaks.html

## O que a página mede

A página compara propriedades globais com um perfil de referência: adicionadas, removidas e alteradas. Em 29/09/2026, a opção Firefox fornecida é **Firefox 92**, não Firefox 156.0.1. Diferenças entre versões do Firefox já podem aparecer sem extensão. A implementação percorre objetos até profundidade limitada e compara funções por `toString`; não cobre necessariamente os protótipos canvas. Ausência de diferenças canvas no DDG não prova transparência da instrumentação.

O Privacy Lens compara 19 descritores selecionados entre início e amostras do próprio documento; o DDG compara um inventário diferente contra referência estática. Concordância depende da propriedade efetivamente comparada. Método alterado não significa código malicioso. O bootstrap canvas do plugin é observável por identidade/representação das funções, explicitamente separado em `security.frames[].observation.ownInstrumentation`; não promete invisibilidade a páginas.

## Roteiro exato, com controle

1. Use um perfil de teste com Firefox 156.0.1 (ou registre a versão real), mantendo iguais ETP, preferências, cache/dados e demais extensões nas duas passagens. Não reutilize o perfil temporário da automação como evidência manual. Registre horário/fuso e sistema.
2. **Sem Privacy Lens:** desative/remova somente a extensão no perfil de teste. Abra a URL completa acima, sem fragmento, selecione **Firefox 92** e clique **Check** uma única vez. Aguarde **Download the results** ficar habilitado, normalmente alguns segundos. Se falhar ou demorar mais de 30 s, registre o erro e não interprete lista vazia como aprovação.
3. Anote as contagens/listas **Added / Removed / Changed**, a referência usada e erros. Clique **Download the results** e renomeie para `ddg-js-leaks-sem-extensao-results.json`. Depois de Check, clique **Download this browser’s profile** e salve `ddg-js-leaks-sem-extensao-profile.json`. Capture você mesmo `ddg-js-leaks-sem-extensao-pagina.png`.
4. **Com Privacy Lens v0.5.0:** instale/recarregue `extension/manifest.json`, confirme versão e blocklist vazia. Reabra a URL completa em nova navegação; mantenha **Firefox 92**, clique **Check** uma vez e espere o mesmo estado do botão. Salve `ddg-js-leaks-com-extensao-results.json`, `ddg-js-leaks-com-extensao-profile.json` e sua captura `ddg-js-leaks-com-extensao-pagina.png`.
5. Aos **31 s desde a navegação**, abra Privacy Lens → **Atualizar** → **Abrir relatório**. Confira Indicadores de hook, instrumentação própria, canais, cobertura e descontos do score. Exporte `ddg-js-leaks-relatorio.json`; capture você mesmo `ddg-js-leaks-plugin.png` e, se necessário, `ddg-js-leaks-detalhes.png`.
6. Compare os mesmos nomes/flags nas duas passagens, conservando os JSON originais. `date`, temporizadores, frames, foco, tamanho da janela e dados da própria página variam; não atribua toda diferença ao plugin. Repita a passagem sem extensão se uma diferença exigir confirmação. Evite exportar/compartilhar perfis DDG de páginas com dados privados: esses arquivos são produzidos pelo DDG e não usam a sanitização do relatório Privacy Lens.

**Esperado do plugin:** relatório utilizável, instrumentação própria canvas separada (normalmente 11 métodos no frame principal), sem transformá-la em hijacking/desconto H. Não há contagem DDG fixa esperada contra Firefox 92. Alterações adicionais devem ser verificadas por API e contexto; ausência de hook observado não confirma ausência universal. Score pode ser parcial conforme cobertura real.

**Erros a registrar:** popup/relatório interrompido; própria instrumentação confundida com hook externo; funções nativas quebradas; diferença DDG tratada automaticamente como malware; cobertura indisponível apresentada como zero; regra da blocklist ativa interferindo na comparação. O teste não instala código de ataque e não pede alteração do sistema operacional.

## Resultado a preencher após a execução real

| Campo | Resultado |
|---|---|
| Data/hora/fuso, Firefox/macOS, ETP, perfil/cache, demais extensões | PENDENTE |
| Privacy Lens / referência DDG | v0.5.0 a confirmar / Firefox 92 a confirmar |
| Sem extensão: added / removed / changed | PENDENTE |
| Com extensão: added / removed / changed | PENDENTE |
| Diferenças reproduzíveis atribuíveis à instrumentação, por propriedade | PENDENTE |
| Privacy Lens: APIs alteradas / próprias / canais / combinações | PENDENTE |
| Cobertura, score e descontos | PENDENTE |
| Concordância / complementaridade / divergência e explicação concreta | PENDENTE |
| Evidências inspecionadas | PENDENTE; nenhum arquivo acima foi capturado pelo agente |

Fontes consultadas em 29/09/2026: [página oficial](https://privacy-test-pages.site/security/js-leaks.html), [código da comparação](https://privacy-test-pages.site/security/leaks.js). O teste local em Firefox e a suíte Node são verificações de implementação, não resultados desta página.
