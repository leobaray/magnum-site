# SEO — medição de posicionamento

Registro reproduzível de onde o `magnumtorque.com.br` aparece nos buscadores,
para comparar **antes → depois** de cada leva de conteúdo.

## Como medir (sempre do mesmo jeito)

```bash
cd /sistemas/magnum
python3 seo/rank-check.py            # salva seo/rank-<data>.json
```

Comparar duas rodadas:

```bash
python3 seo/rank-check.py --compare seo/rank-2026-07-08.json seo/rank-<nova-data>.json
```

Regras para a comparação valer:

1. **Não editar nem remover consultas** da lista `QUERIES` no script — só
   acrescentar novas **no fim**.
2. Rodar da mesma máquina/rede (o servidor da empresa), sem VPN.
3. O que cada célula significa: número = posição (1 = primeiro resultado
   orgânico); `>20` = não apareceu entre os ~20 primeiros; `BLOQ` = o buscador
   bloqueou a consulta automatizada (sem dado — não é derrota).

## Limitações conhecidas

- **DuckDuckGo** é o único buscador que responde a consultas automatizadas
  deste servidor. Ele espelha em grande parte o índice do **Bing**, então serve
  de proxy de tendência — não é o Google.
- **Google e Bing bloqueiam** scraping (marcados `BLOQ`). A medição real do
  Google é feita no **Search Console** (login do Leonardo):
  *Desempenho → Consultas → exportar*, filtrando os últimos 7 dias, e comparar
  posição média das consultas-alvo entre rodadas. Guardar o CSV exportado
  nesta pasta com o nome `gsc-consultas-<data>.csv`.
- Posições de buscador flutuam naturalmente ±2 casas por dia/localização;
  mudança relevante é a que se sustenta e passa disso.

## Rodadas

| Data | Arquivo | Contexto |
|---|---|---|
| 2026-07-08 | `rank-2026-07-08.json` | Baseline. Site com 8 posts no blog (4 novos publicados **no repo neste mesmo dia, ainda não enviados à Hostinger** — ou seja, esta rodada reflete o site em produção com 4 posts). Próxima rodada: ~2026-07-13, após upload + reindexação. |

## Baseline 2026-07-08 — destaques (DuckDuckGo, região br-pt)

Termos de cabeça (intenção comercial) — página que ranqueia é a home:

| Consulta | Posição |
|---|---|
| magnum torque | 1 |
| retifica de conversor de torque | 3 |
| retifica de conversor de torque curitiba | 1 |
| conversor de torque curitiba | 3 |
| recondicionamento de conversor de torque | 3 |
| conserto de conversor de torque | 1 |

Tabela completa (todas as 31 consultas): ver `rank-2026-07-08.json`.

Os termos informacionais (sintomas, códigos, modelos) são o alvo dos posts do
blog — a expectativa é que entrem no top 20 nas próximas rodadas conforme o
Google/Bing indexarem os artigos novos.

## Checklist pós-publicação (a cada leva de posts)

1. Subir os arquivos para a Hostinger.
2. Search Console → Sitemaps → reenviar `sitemap.xml`.
3. Search Console → Inspeção de URL → "Solicitar indexação" para cada URL nova.
4. Anotar a data; re-rodar o `rank-check.py` ~5 dias depois.
