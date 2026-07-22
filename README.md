# Magnum Torque — Website & Technical Blog

Static marketing site and technical blog for a torque-converter (automatic-transmission) repair shop based in Curitiba, Brazil. Hand-written HTML5, CSS3 and vanilla JavaScript — no framework, no bundler, no build step for the pages themselves.

## Context

The business rebuilds torque converters and sells automatic-transmission parts, serving customers across Brazil by courier. The site has two jobs: convert visitors into WhatsApp/e-mail leads, and rank for the technical questions people type before they realize they need a specialist ("shudder", "P0740", "stall test", "limp mode"). That second job is why a plain brochure site grew a searchable technical blog with structured data — the goal is organic reach, not a heavy stack. Everything ships as flat files behind Apache; the only moving parts are two offline scripts that never run in the browser.

## Features

Confirmed in the source, not aspirational:

- **Single-page landing** with scrollspy navigation, an accessible testimonials carousel (autoplay that respects `prefers-reduced-motion`, keyboard arrows, touch swipe, pause-on-hover/off-screen), a "Work with us" modal with a full focus trap + `Esc` handling, and a WhatsApp lead form that validates client-side and hands off to `wa.me`.
- **Live business-hours indicator** computed in the `America/Sao_Paulo` timezone via `Intl.DateTimeFormat` (DST-safe), pausing its interval when the tab is hidden.
- **Technical blog** (8 posts) with a client-side fuzzy search: MiniSearch over title/excerpt/body/synonyms/category, accent-insensitive, two-pass fuzzy matching, in-DOM filtering with term highlighting, and `?q=` deep-linking wired to the site's `SearchAction` schema.
- **SEO/structured data**: per-page Schema.org JSON-LD (`AutoRepair` LocalBusiness, `WebSite` + `SearchAction`, `FAQPage`, `Blog`, `BlogPosting`, `BreadcrumbList`), Open Graph + Twitter cards, `sitemap.xml`, `robots.txt`, `humans.txt`, and a `.well-known/security.txt`.
- **Privacy by default**: GA4 loaded through Google **Consent Mode v2** initialised to `denied`, gated behind an LGPD cookie banner; consent is persisted in `localStorage` and revocable from the privacy page.
- **Performance & hardening**: self-hosted WOFF2 font subsets (Montserrat / Open Sans), lazy-loaded images with explicit dimensions, a strict per-page `Content-Security-Policy`, and Apache security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` with FLoC/Topics opt-out, `Cross-Origin-Opener-Policy`).
- **Offline tooling**: a Node script that regenerates the blog search index from the posts, and a Python script that records search-engine positions over time for before/after comparisons.

## Tech stack

| Layer | Choice |
|---|---|
| Markup / styling | HTML5, CSS3 (custom properties, fl/grid), no preprocessor |
| Behaviour | Vanilla JavaScript (ES2017+), no framework |
| Blog search | [MiniSearch](https://github.com/lucaong/minisearch) 6.3.0 (vendored, UMD) |
| Fonts | Montserrat (600/700/800) + Open Sans (400/500/600/700), self-hosted WOFF2 subsets |
| Analytics | Google Analytics 4 + Consent Mode v2 |
| Search-index build | Node.js 18+ (ES modules, native `fetch`, `node:` built-ins only) |
| Rank tracking | Python 3 (standard library only) |
| Serving | Apache (Hostinger) via `.htaccess` |

There is no dependency manifest: the site has zero runtime npm dependencies (MiniSearch is committed directly), and the two scripts rely only on their respective standard libraries.

## Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │          Apache (Hostinger) + .htaccess         │
                    │  HTTPS/www redirects · vanity routes · caching  │
                    │  MIME types · CSP · security headers (HSTS…)    │
                    └───────────────────────┬─────────────────────────┘
                                            │ serves flat files
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
  index.html                        blog/ (index + 8 posts)          privacidade/, 404.html
  css/ · js/main.js                 js/blog-search.js  ──fetch──►  blog/search-index.json
  self-hosted fonts                 MiniSearch (vendored)
        │
        ▼
  GA4 + Consent Mode v2  ◄── gated by the LGPD cookie banner (js/main.js / js/analytics.js)

  Offline tooling — runs on your machine, never in the browser:
    scripts/build-search.mjs   (Node)   → regenerates blog/search-index.json from the posts
    seo/rank-check.py          (Python) → records search-engine positions into seo/rank-<date>.json
```

The browser only ever receives static assets. `search-index.json` is a build artifact: whenever a post changes you regenerate it locally and upload it. Page HTML is authored by hand — there is no template engine.

## Getting started

### Prerequisites

- Any static file server for local preview. The blog uses root-relative paths (`/css/…`, `/blog/…`), so **serve from the repository root**.
- **Node.js 18+** — only if you need to regenerate the blog search index.
- **Python 3** — only if you run the SEO rank tracker.

### Run it locally

```bash
git clone <this-repo> magnum-site
cd magnum-site
python3 -m http.server 8080     # or any static server, from the repo root
# open http://localhost:8080/
```

### Regenerate the blog search index

Run this after adding or editing a post, then commit/upload the updated `blog/search-index.json`:

```bash
node scripts/build-search.mjs
```

It reads every `blog/<slug>/index.html`, extracts metadata + body, merges the hand-curated synonyms from each `blog/<slug>/synonyms.json`, and writes `blog/search-index.json`. It can optionally augment those synonyms via an external LLM API when an API key is set in the environment; with no key it runs fully offline on the hand-curated lists.

### Track search rankings

```bash
python3 seo/rank-check.py                 # writes seo/rank-<date>.json
python3 seo/rank-check.py --print         # also prints a markdown table
python3 seo/rank-check.py --compare seo/rank-A.json seo/rank-B.json
```

### Optional local checks

Config files for both tools are included; run them ad hoc with `npx` (no install committed):

```bash
npx html-validate index.html 404.html "blog/**/*.html"
npx linkinator http://127.0.0.1:8080/ --config linkinator.config.json
```

## Project structure

```
.
├── index.html                 # single-page landing (hero, services, parts, FAQ, contact)
├── 404.html
├── blog/
│   ├── index.html             # blog listing + client-side search UI
│   ├── search-index.json      # generated artifact consumed by blog-search.js
│   └── <slug>/
│       ├── index.html         # one article (with BlogPosting + FAQPage JSON-LD)
│       └── synonyms.json      # hand-curated search synonyms for that post
├── privacidade/index.html     # privacy policy (+ consent revocation)
├── css/                       # style.css, blog.css, fonts.css
├── js/
│   ├── analytics.js           # GA4 bootstrap + Consent Mode v2 defaults
│   ├── main.js                # nav, carousel, form, modal, cookie banner, hours indicator
│   ├── blog-search.js         # MiniSearch-backed blog search
│   └── vendor/minisearch.min.js
├── assets/                    # logos, product/partner images, blog images, fonts, icons
├── scripts/build-search.mjs   # regenerates blog/search-index.json (Node)
├── seo/rank-check.py          # search-rank tracker (Python)
├── .htaccess                  # Apache: redirects, caching, MIME, CSP, security headers
├── manifest.webmanifest       # PWA manifest (icons, theme)
├── sitemap.xml · robots.txt · humans.txt · .well-known/security.txt
├── .htmlvalidate.json · linkinator.config.json   # local validation configs
└── AUDIT.md · FIX-LOG.md      # internal engineering notes (Portuguese)
```

## Status & limitations

- **In production** for a real business at `https://www.magnumtorque.com.br/`. Content, structured data, and contact details are live and specific to that company.
- **Manual deploy.** Files are uploaded to Hostinger; there is no CI/CD pipeline in this repository. `AUDIT.md` and `FIX-LOG.md` are point-in-time internal notes and may reference tooling that no longer exists in the tree.
- **No automated test suite** — appropriate for a static site. The included `html-validate` and `linkinator` configs are run by hand.
- **No service worker**, so the manifest makes the site installable but not offline-capable.
- **Localization**: the site and its inline documentation are in Brazilian Portuguese (`pt-BR`); this README is the English entry point.

## License

Released under the [MIT License](LICENSE).
