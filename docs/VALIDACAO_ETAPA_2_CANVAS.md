# Validação automatizada do bloco Canvas — 0.2.0

## O que foi efetivamente executado

- `npm test`: 26 testes de lógica (11 anteriores + 15 de canvas), todos aprovados.
- `npm run check`: referências do manifest e sintaxe JavaScript aprovadas.
- `tests/firefox_canvas.py`: cinco cenários na fixture local, no Firefox 156.0.1 real, Linux/headless, geckodriver 0.37.1 e perfil temporário.
- `tests/firefox_smoke.py`: regressão do bloco anterior, incluindo rede/cookies/storage, reset de navegação, redirect e isolamento de abas.
- Screenshots reais da interface renderizada pelo Firefox, abertos em aba para inspeção. Não são mocks nem evidências DDG.

| Cenário | Desenhos | Leituras/exportações | Exceções de leitura | Canvas com indício | Classificação |
|---|---:|---:|---:|---:|---|
| Desenho normal | 2 | 0 | 0 | 0 | draw-only |
| Desenho + getImageData/toDataURL/toBlob | 2 | 3 | 0 | 1 | indicator |
| Exportação sem desenho | 0 | 1 | 0 | 0 | readback-only |
| getImageData com dimensão inválida | 2 | 1 | 1 | 0 | readback-only |
| Desenho + extração em frame terceiro | 2 | 3 | 0 | 1 | indicator, atribuído ao frame 127.0.0.1 |

O número de tentativas com exceção é subconjunto das leituras/exportações, não um número a somar.

Além dos resultados:

- DataURL PNG, ImageData e pixel conhecido, Blob/tipo/tamanho e IndexSizeError comparados com o baseline sem extensão: iguais para a fixture.
- Nome/aridade das três APIs de leitura: iguais ao baseline.
- 11 métodos instalados por frame, sem falhas/ausências/substituições nos cinco cenários.
- Script da fixture roda no contexto da página sob CSP. Não emite mensagem simulada para o detector.
- Substituir um método instrumentado pela própria fixture de teste torna a cobertura parcial; não gera classificação de ataque.
- Modelos de teste cobrem separação de canvas/frames, fronteira 5.000/5.001 ms, dimensões zero, limites e ausência de retenção de pixels/texto/dataURL.

## Correção encontrada pelo teste

A primeira tentativa preservava name/length apenas no objeto visto pela extensão. A função exportada ainda aparecia para a página com metadados diferentes por causa dos wrappers Xray. O teste diferencial detectou isso. A correção aplica os descritores à função exportada sem o Xray; a execução final passou. A identidade/reflexão da função continua podendo revelar a instrumentação, conforme documentado.

## Evidências e reprodução

- `evidencias/desenvolvimento/etapa-2-canvas/automatizado/resumo.json`: resultado real, ambiente e arquivos por caso.
- Nesse mesmo diretório: `*-pagina.png`, `*-plugin.png`, `*-relatorio.json` e hashes dos arquivos da extensão.
- `evidencias/desenvolvimento/etapa-2-canvas/regressao-etapa1/`: execução de regressão; não sobrescreve os registros históricos em `evidencias/local/`.
- `evidencias/desenvolvimento/etapa-2-canvas/manual/REGISTRO.md`: esperado da fixture, observado PENDENTE e nomes dos prints/JSONs para o aluno.

Teste Firefox opcional, em máquina com Python 3, Node, Firefox e geckodriver:

```bash
python3 tests/firefox_canvas.py --firefox /caminho/do/firefox --geckodriver /caminho/do/geckodriver
```

Para a validação do aluno, basta seguir `ETAPA_2_CANVAS.md`; não precisa instalar geckodriver.

O sandbox Linux deste ambiente exigiu overrides dos sandboxes internos do processo Firefox na fixture local: MOZ_DISABLE_CONTENT_SANDBOX, MOZ_DISABLE_RDD_SANDBOX e MOZ_DISABLE_GMP_SANDBOX, todos 1. Estão registrados no resumo. Não são configurações da extensão, não foram inseridos no manifest e não devem ser reproduzidos no navegador habitual do aluno. Preferências ETP/RFP não foram reduzidas; a execução usou perfil temporário e conexão local sem proxy.

## O que permanece pendente

A validação manual **deste bloco canvas** em macOS/Firefox do aluno e seus prints ainda não ocorreram. Somente a Etapa 1 foi confirmada pelo aluno. Nenhum teste DDG, site real, HAR, Blacklight, uBlock ou score foi executado aqui. Os registros DDG permanecem vazios de resultados.

As cinco fixtures demonstram que as APIs chamadas pela página são observadas e que os controles se distinguem. Não estimam precisão/recall em sites reais, nem provam capacidade de detectar todo fingerprinting ou intenção maliciosa.
