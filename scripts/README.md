# Scripts

## `build-search.mjs`

Regenera `/blog/search-index.json` lendo todos os posts em `blog/<slug>/index.html`.

### Uso basico (sem IA)

Quando criar um novo post:

1. Crie a pasta `blog/<novo-slug>/index.html` com o conteudo
2. (Opcional) Crie `blog/<novo-slug>/synonyms.json` com frases manuais que o leitor pode buscar (ver exemplo em `blog/sinais-conversor-torque-precisa-retifica/synonyms.json`)
3. Rode:

```bash
node scripts/build-search.mjs
```

4. Suba `blog/search-index.json` e os arquivos novos para a Hostinger

### Uso com IA (gera sinonimos automaticamente via Anthropic)

```powershell
# PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
node scripts/build-search.mjs
```

```bash
# bash
ANTHROPIC_API_KEY=sk-ant-... node scripts/build-search.mjs
```

A IA gera 30-60 variacoes de busca por post (linguagem informal, termos tecnicos, codigos OBD, perguntas naturais). Custo aproximado: ~$0.04-0.06 por post (Anthropic Sonnet 4.6, ~3-4k tokens de input + ate 2k tokens de output).

Os sinonimos manuais (`synonyms.json`) sao MESCLADOS com os gerados por IA. Dedup automatico.

### Output

Gera `blog/search-index.json` com:

- `version`, `generated` (data)
- `posts[]` com `id`, `slug`, `url`, `title`, `excerpt`, `category`, `date`, `readTime`, `image`, `body` (primeiros 6000 chars), `synonyms[]`

Esse arquivo e consumido pelo `/js/blog-search.js` no cliente via MiniSearch.
