# Sites reais

[UOL](uol/reconciliacao.md), [G1](g1/reconciliacao.md) e [Mercado Livre](mercadolivre/reconciliacao.md) são os sites informados pelo aluno. A comprovação do sorteio por matrícula não foi recebida.

Cada site contém originais disponíveis, `har/resumo.json`, `har/dominios.csv` e reconciliação por host. `analise.json` consolida a saída de `node scripts/analyze-evidence.cjs`. `transcricao-capturas.json` contém transcrições visuais. O complemento E57–E62 inclui JSONs e painéis de score G1/Mercado Livre e seus Blacklight; os antigos avisos de ausência dessas pastas foram removidos.

O HAR UOL está em gzip sem perdas; o hash bruto pode ser verificado após descompressão. G1 e Mercado Livre não incluem o documento principal na janela exportada. Os scores recalculados exclusivamente dos JSONs são UOL 0–31 (2/6), G1 0–64 (2/6) e Mercado Livre 41–66 (3/6), todos parciais. Blacklight registra 48/17, 27/14 e 11/16 trackers/cookies, respectivamente. Nos novos JSONs G1/Mercado Livre, não há janela comum com os HARs; `collectionRelation` documenta isso e o script não tenta parear requests. As matrizes usam a união dos hosts, com visitas distintas. Categorias Blacklight fora dos recortes permanecem não visíveis.
