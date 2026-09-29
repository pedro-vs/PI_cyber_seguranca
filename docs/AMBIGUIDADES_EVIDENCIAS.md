# Ambiguidades e lacunas da coleta final

Inventário concluído antes da movimentação. Identificação por conteúdo, não apenas pelo horário do arquivo. A matriz completa e os hashes estão em `evidencias/INDEX.md` e `evidencias/manifesto-recebidos.json`.

| Evidência | O que é demonstrado | O que não está estabelecido | Tratamento |
|---|---|---|---|
| E29 e E30, painéis com dois sinais de parâmetros | Dois sinais potenciais, zero sync, bounce insuficiente | Qual painel corresponde a utm_source/utm_medium e qual a fbclid/fb_source; não há URL nem detalhes abertos | Preservados em query-parameters/pendentes; não pareados arbitrariamente |
| E27 e E32, painéis sem URL | Um sinal e zero sinais, respectivamente | Identidade da URL pelo recorte; caso 01 tem confirmação independente no JSON E46; caso controle não tem página de resultado | Associação parcial explicitada |
| E33, js-leaks com plugin | Privacy Lens 100/100, seis categorias cobertas e nenhum indicador de hook nas APIs observadas | Resultado do Check: listas vazias e botão de download desabilitado indicam captura anterior à comparação | Não usado como prova de ausência de diferenças no DDG |
| E34 e E49, js-leaks | Captura com menu de extensões vazio; JSON com referência Firefox 92 e diferenças exportadas | Condição com/sem Privacy Lens do único JSON, pareamento de duas execuções concluídas | Não atribuir diferenças à extensão nem afirmar igualdade entre execuções |
| E23, E24 e E45, bounce | IDs 95 na página fotografada; indicador e parâmetros; sequência posterior no JSON | Igualdade dos IDs entre duas passagens: JSON não exporta valores e não há dois pares completos de página/relatório | Duas passagens não confirmadas integralmente pelos arquivos |
| E13, storage | Top-level 0/0/0 às 23:47:09, anterior ao Store; frame broken 1/1/1 anterior/removido | Contagens de todos os frames, pois há recorte; estado no instante do Retrieve | Não completar contagens fora da imagem nem inferir bloqueio do zero |
| E07, setup cookies | document.cookie mostra dois nomes; inventário contém três cookies | Identidade do terceiro cookie e causa da diferença | Manter como observação histórica, sem diagnosticar bug a partir do total |
| G1 — complemento E57/E59/E61 | JSON e painel confirmam score 0–64, 2/6; Blacklight 27 trackers/14 cookies | JSON das 04:47–04:48 sem janela comum com HAR das 03:25–03:26; Blacklight de 28/09 e categorias inferiores não visíveis | Lacunas documentais preenchidas; visitas separadas e reconciliação individual ainda parcial |
| Mercado Livre — complemento E58/E60/E62 | JSON e painel confirmam score 41–66, 3/6; Blacklight 11 trackers/16 cookies | JSON das 04:50 sem janela comum com HAR das 03:30; Blacklight de 28/09, URL com query truncada e categorias inferiores não visíveis | Lacunas documentais preenchidas; score só do JSON; sem reconstruir URL ou inferir pixels pelas empresas citadas |
| UOL | JSON/HAR com início separado por 5 ms; screenshots e Blacklight | Identidade completa da configuração entre execuções; listas uBlock e ETP, persist logs | Alinhar janelas; não comparar totais como equivalentes |
| E35, blocklist manual | Regra 127.0.0.1 e cancelamento solicitado | Pausa e retorno da requisição nessa captura | Etapas de pausa/retorno sustentadas pelo JSON automatizado local já versionado |
| Identificação acadêmica | Nome em docs/RELATORIO_MODELO.md e professor no enunciado | Matrícula e comprovação do sorteio dos três sites | Nome reaproveitado do próprio repositório; matrícula/sorteio não estabelecidos; acesso público do repositório confirmado por API, publicação destes novos arquivos ainda pendente |

O HAR adicional `www.uol.com.br_Archive [26-09-29 03-09-21].har` foi encontrado no diretório de origem, mas não integra o lote explicitamente fornecido e não foi usado nem movido. O relatório de outro aluno serve somente de referência visual; o relatório Roteiro 1 é de outro trabalho. Ambos ficam fora da entrega e dos resultados.

Os seis arquivos complementares foram recebidos do aluno e incorporados como E57–E62; não se produziu nova coleta durante a análise. Ausência de evidência não foi convertida em resultado negativo ou aprovação de requisito.
