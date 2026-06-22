# Magnum Torque — Site Institucional

Site institucional da Magnum Torque, retífica de conversores de torque em Curitiba-PR. Top 1–3 no Google no nicho. PWA com MiniSearch para busca no blog.

## Visão geral

Site estático (HTML + CSS + JS vanilla, sem framework, sem bundler, sem backend) para a Magnum Torque. Focado em SEO e performance: Lighthouse com thresholds de performance, acessibilidade, best-practices e SEO. Deploy no Hostinger (Apache).

## Estrutura

```
magnum-site/
├── index.html              # single-page com todas as seções (âncoras)
├── blog/
│   ├── index.html          # listagem do blog com busca MiniSearch
│   └── sinais-conversor-torque-precisa-retifica/index.html  # post
├── 404.html
├── css/
│   ├── style.css           # estilos principais
│   └── blog.css            # estilos do blog
├── js/
│   ├── main.js             # nav, scrollspy, horário comercial, formulário → WhatsApp, GA4
│   ├── blog-search.js      # busca com MiniSearch (fuzzy, normalização NFD)
│   └── vendor/
│       └── minisearch.min.js
├── scripts/
│   └── build-search.mjs    # regenera blog/search-index.json
├── assets/                 # ícones PWA, logos, imagens de produtos/parceiros/blog
├── manifest.webmanifest    # PWA
├── robots.txt
├── sitemap.xml
├── humans.txt
├── .htaccess               # Apache: HTTPS forçado, cache headers, redirects
└── .well-known/security.txt
```

## Funcionalidades

- **Single-page** com seções: início, sobre, serviços, peças, parceiros, depoimentos, FAQ, contato
- **Blog** com busca via MiniSearch (indexação fuzzy, normalização de acentos, debounce 200ms)
- **PWA** instalável com manifest e ícones
- **SEO**: JSON-LD (AutoRepair, Blog, BlogPosting, BreadcrumbList), sitemap, robots.txt, meta tags
- **LGPD**: banner de consentimento de cookies integrado ao Google Consent Mode v2
- **Formulário de contato** que abre WhatsApp (sem backend, com honeypot anti-spam)
- **Horário comercial** dinâmico (America/Sao_Paulo, atualiza a cada minuto)
- **CSP** estrito em todas as páginas
- **CI**: html-validate + linkinator + Lighthouse CI

## Como rodar localmente

```bash
# qualquer servidor estático
npx http-server . -p 8080
# ou
python3 -m http.server 8080
```

## Regenerar índice de busca do blog

```bash
node scripts/build-search.mjs
# com sinônimos via IA (opcional):
ANTHROPIC_API_KEY=sk-ant-... node scripts/build-search.mjs
```

## Stack

- HTML5 semântico (`lang="pt-BR"`)
- CSS puro (custom properties, grid, flexbox)
- JavaScript ES2017+ vanilla (sem framework, sem bundler)
- MiniSearch para busca do blog
- Google Analytics 4 + Consent Mode v2
- Apache (.htaccess) no deploy

## Licença

MIT — veja [LICENSE](LICENSE).