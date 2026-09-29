# DDG — Storage Blocking

Status: **EXECUTADO MANUALMENTE**, conforme resultado informado pelo usuário. Firefox **156.0.1**, Privacy Lens **v0.4.0**. Os quatro arquivos de evidência foram informados; ainda não foram localizados no repositório nesta conferência. Os dados abaixo vêm do relato, não de inspeção independente dos prints/JSONs.

[Procedimento e esperado documental](../../../docs/VALIDACAO_DDG_V04.md#teste-2) · [Tabela de resultados](../RESULTADOS.md)

URL do teste: https://privacy-test-pages.site/privacy-protections/storage-blocking/

## Ambiente e contexto

- Firefox: 156.0.1; Privacy Lens: v0.4.0.
- Número controlado usado pelo DDG: **855**.
- Horário exibido no snapshot principal, preservado após Store/Retrieve: **23:47:09**.
- Data/fuso, macOS, referência Git da execução, perfil/container, limpeza/cache, ETP/exceções e outras extensões: não informados; PENDENTES.
- Horários exatos dos cliques Store/Retrieve, esperas, timestamps dos terceiros e respectivos frameIds: não informados; PENDENTES da conferência dos artefatos.
- Não houve mudança de código nesta análise.

## Esperado documental

Store tenta gravar um número pelos mecanismos do documento principal e dos iframes. Retrieve deve recuperar o número onde escrita/acesso funcionarem. Valores/erros são avaliados por API/contexto; o teste não pressupõe bloqueio universal. Privacy Lens conta chaves de local/session e bancos IndexedDB, sem ler seus valores. Snapshot zero e falta de coleta não comprovam bloqueio ou particionamento.

## Baseline informado

`https://privacy-test-pages.site`, **Frame 0 · top-level**: localStorage **0**, sessionStorage **0**, IndexedDB **0**. Nenhum terceiro havia sido coletado: isso é ausência de snapshot, não contagem zero dos terceiros.

## Resultados reais informados por fase

| Origem / contexto | API | DDG Store | Privacy Lens após Store | DDG Retrieve | Privacy Lens após Retrieve |
|---|---|---|---|---|---|
| privacy-test-pages.site / Frame 0, top-level | localStorage | OK | 0 chaves; coleta 23:47:09 | 855 | 0 chaves; mesma coleta 23:47:09 |
| privacy-test-pages.site / Frame 0, top-level | sessionStorage | OK | 0 chaves; coleta 23:47:09 | 855 | 0 chaves; mesma coleta 23:47:09 |
| privacy-test-pages.site / Frame 0, top-level | IndexedDB | OK | 0 bancos; coleta 23:47:09 | 855 | 0 bancos; mesma coleta 23:47:09 |
| good.third-party.site / safe iframe | localStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| good.third-party.site / safe iframe | sessionStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| good.third-party.site / safe iframe | IndexedDB | OK | 1 banco | 855 | 1 banco; novo snapshot na fase Retrieve |
| broken.third-party.site / tracking iframe | localStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| broken.third-party.site / tracking iframe | sessionStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| broken.third-party.site / tracking iframe | IndexedDB | OK | 1 banco | 855 | 1 banco; novo snapshot na fase Retrieve |
| convert.ad-company.site / ad iframe | localStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| convert.ad-company.site / ad iframe | sessionStorage | OK | 1 chave | 855 | 1 chave; novo snapshot na fase Retrieve |
| convert.ad-company.site / ad iframe | IndexedDB | DB is not defined | 0 bancos | DB is not defined | 0 bancos; novo snapshot na fase Retrieve |

Após Store, os terceiros foram exibidos como **snapshots anteriores de frames já removidos**. Durante Retrieve foram observados novos snapshots terceiros, preservando as contagens acima. Não somar snapshots da mesma origem como bancos/chaves diferentes nem atribuir frameIds não informados.

## Concordância e divergências

- **Safe third party:** total quanto à presença de storage observada. DDG recuperou 855 nas três APIs; Privacy Lens mostrou 1 chave local, 1 chave de sessão e 1 banco. O plugin não confirmou o conteúdo 855 nem estabeleceu particionamento.
- **Tracking third party:** total no mesmo critério; mesma combinação DDG 855 e contagens 1/1/1. Nome tracking do grupo não significa que houve bloqueio.
- **Ad third party — localStorage/sessionStorage:** total quanto à presença/acesso relatados: DDG recuperou 855, plugin mostrou 1/1.
- **Ad third party — IndexedDB:** usuário classificou a concordância como total, incluindo a indisponibilidade. Preserva-se essa avaliação declarada com ressalva técnica: **compatibilidade parcial** entre erro DDG e zero bancos no plugin. `DB is not defined` significa que o helper JavaScript `DB` não estava definido naquele contexto; não é evidência de indisponibilidade da API nativa `indexedDB`. O plugin mostrou zero bancos, não reproduziu nem diagnosticou o erro do helper. A causa da ausência do helper (recurso, execução ou outra condição) permanece inconclusiva sem Rede/Console/artefatos.
- **Top-level:** divergência real de atualização/cobertura. DDG recuperou 855 nas três APIs; Privacy Lens manteve **0/0/0 no snapshot 23:47:09**, anterior à gravação. Esse snapshot não representa o estado após Store/Retrieve. Não descrever como bloqueio, storage atual vazio, particionamento ou impedimento de gravação.

Concordância geral: **parcial**, com a divergência top-level e a ressalva de causalidade do IndexedDB ad acima. Os valores das contagens não são o número armazenado pelo DDG; 1 versus 855 não é divergência de quantidade.

## Explicação técnica e dados ainda necessários

A evidência temporal concreta é a manutenção do horário 23:47:09 e das contagens iniciais no frame 0, enquanto o teste recuperou o número gravado. Isso estabelece a defasagem do relatório principal, mas não explica ainda por que a atualização não chegou/foi aceita. Antes de atribuir causa, conferir o JSON: frameId/origin/topOrigin, horário `at`, `activeAtRefresh`, status/count/reason e mensagens/coleta do documento principal, se disponíveis. Registrar também a URL final efetiva.

Para o IndexedDB ad, conferir requests de `/helpers/idb-wrapper.js` e scripts do iframe, seus estados/HTTP/erros e o Console daquele contexto. Zero bancos não identifica por si só a falha do helper. Não atribuir ação ao Firefox, bloqueador ou Privacy Lens sem evidência adicional.

Nenhuma correção foi proposta ou implementada nesta etapa; a divergência foi registrada antes de qualquer mudança do detector.

## Evidências informadas pelo usuário

Pasta: `evidencias/duckduckgo/storage-blocking/`.

- `ddg-storage-blocking-plugin.png` — print principal informado.
- `ddg-storage-blocking-detalhes.png` — print complementar informado.
- `ddg-storage-blocking-relatorio.json` — relatório Privacy Lens informado.
- `storage-blocking-results.json` — download DDG informado.

Arquivos ainda não localizados no repositório nesta conferência; inspeção visual/JSON pendente. Não foram substituídos por capturas artificiais. Os fatos acima permanecem atribuídos ao resultado manual comunicado pelo usuário.
