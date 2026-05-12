# Auditoria de código — Site Magnum Torque

> Data: 2026-05-11
> Stack auditada: site estático (HTML5 + CSS3 + JS vanilla ES2017+, sem bundler), 1 script Node ESM para regenerar o índice de busca do blog, CI no GitHub Actions (html-validate + linkinator + Lighthouse CI), deploy manual em Hostinger (Apache + `.htaccess`). Locale `pt-BR`. Sem backend; formulário monta `wa.me` URL e abre nova aba. GA4 inline em todas as páginas. Sem service worker.
> Suposições assumidas:
> 1. O site **está em produção** em `https://www.magnumtorque.com.br/` com a estrutura de URL declarada nos `<link rel="canonical">`, `og:url` e `sitemap.xml`. Se a versão atual ainda não foi enviada para a Hostinger, alguns achados de "URL canônica retorna 404" perdem severidade (mas o risco se materializa no momento do go-live).
> 2. Não há mecanismo de consentimento (cookie banner / CMP) externo injetado fora dos arquivos auditados.
> 3. Os depoimentos hard-coded no HTML são reais (são pessoas reais) e não fabricados — a crítica em A-02 é sobre a *política do Google*, não sobre veracidade.

## Sumário executivo
- Total de achados: **20** (Críticos: 0, Altos: 3, Médios: 8, Baixos: 9)
- Top 5 prioridades:
  1. [A-01 — CI roda sem validar nada (`--ignore` inexistente + `--skip` que come o próprio crawl)](#a-01-ci-de-validacao-roda-mas-nao-valida-nada)
  2. [A-02 — `aggregateRating` + `review[]` no próprio domínio (Google não exibe e pode descontar)](#a-02-aggregaterating--review-na-propria-pagina-violacao-de-politica-do-google)
  3. [A-03 — URLs canônicas de blog retornam 404 em produção (validado por linkinator)](#a-03-urls-canonicas-do-blog-retornam-404-em-producao)
  4. [M-01 — Scrollspy destaca item errado no fim da home (ordem da lista ≠ ordem do DOM)](#m-01-scrollspy-destaca-item-errado-no-fim-da-home)
  5. [M-04 — Sem consentimento de cookies; GA4 grava `_ga` em primeiro hit (LGPD)](#m-04-sem-consentimento-para-cookies-do-ga4-lgpd)
- Avaliação geral: o site é tecnicamente competente para um projeto estático sem bundler — CSP rigorosa por página, schema.org abundante, lazy-loading, `width`/`height` em todas as imagens, indicador de horário com `Intl` em `America/Sao_Paulo`. **Mas** a rede de segurança em CI é cosmética (não roda checagem nenhuma), há violações concretas de diretrizes do Google e WCAG, e o canonical do blog aponta hoje para URL 404. Antes de promover a próxima release vale destravar pelo menos os três itens Altos.

## Achados por severidade

### 🔴 Críticos

(Nenhum achado classificado como crítico nesta auditoria.)

### 🟠 Altos

#### [A-01] CI de validação roda, mas não valida nada
- **Localização:** `.github/workflows/html-validate.yml` linhas 25 e 28
- **Trecho relevante:**
  ```yaml
  - name: Validate HTML
    run: html-validate '**/*.html' --ignore .git --ignore node_modules

  - name: Check links (internal + external)
    run: linkinator . --recurse --skip "^https?://(localhost|127\\.)" --retry
  ```
- **Problema:**
  - **`html-validate --ignore` não existe.** A v9 do `html-validate` aceita só `--ext`, `--formatter`, `--max-warnings`, `--rule`, `--preset` e `--config` (`html-validate --help`). Passar `--ignore` produz `unknown option --ignore` e exit code 1.
  - **`linkinator . --skip "^https?://(localhost|127\\.)"` zera o crawl.** Quando recebe um diretório como alvo, o `linkinator` sobe um servidor estático interno em `http://127.0.0.1:<port>/` e começa o crawl pela raiz desse servidor — que casa exatamente com o regex `--skip` e é pulada antes de visitar qualquer link. Resultado: "Successfully scanned 0 links".
- **Impacto:** o passo `Validate HTML` falha imediatamente em todo push/PR; o passo `Check links` nunca chega a rodar (depende do anterior). Mesmo se o primeiro fosse consertado, o segundo continuaria não escaneando nada. A "CI" prometida no `CLAUDE.md` é teatro — nem HTML quebrado nem link 404 são detectados.
- **Evidência / verificação:**
  ```
  $ npx -y html-validate@9.x '**/*.html' --ignore .git --ignore node_modules
  unknown option --ignore   (EXIT=1)

  $ npx -y linkinator@6.x . --recurse --skip "^https?://(localhost|127\\.)" --retry
  🏊‍♂️ crawling .
  🤖 Successfully scanned 0 links in 0.018 seconds.   (EXIT=0)

  $ npx -y linkinator@6.x . --recurse    # sem --skip, mesmo alvo
  ERROR: Detected 6 broken links. Scanned 53 links in 1.883 seconds.   (EXIT=1)
  ```
- **Fonte:**
  - html-validate CLI options: https://html-validate.org/usage/cli.html (não há `--ignore`; ignores são configurados em `.htmlvalidate.json` via `ignoreFiles`/`exclude` ou via a config recommended).
  - linkinator README — comportamento de `LOCATION` como diretório: https://github.com/JustinBeckwith/linkinator#readme
- **Recomendação:** trocar `--ignore` por arquivo de config (`.htmlvalidate.json` com `root` e `exclude`, ou usar `--ext html` e listar paths explícitos); para o linkinator, ou separar em dois passos (serve com `http-server` em uma porta fixa + `linkinator http://localhost:<port>/`) ou usar `linkinator '**/*.html'` com glob expandido. Ajustar `--skip` para escapar só o que de fato é localhost-externo, não a própria raiz do crawl.
- **Risco de regressão se corrigido:** ao destravar a CI, ela vai começar a apontar problemas que estavam silenciados. Espere falhas nos primeiros pushes — especialmente links externos (Facebook 400, TCRA 403) que precisam entrar no `--skip` ou no `linkinator.config.json`.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta — replicado localmente nas duas direções.
- **Esforço estimado:** Pequeno.

#### [A-02] `aggregateRating` + `review` na própria página (violação de política do Google)
- **Localização:** `index.html` linhas 142-192 (bloco JSON-LD `AutoRepair`, propriedades `aggregateRating` e `review`)
- **Trecho relevante:**
  ```json
  "@type": "AutoRepair",
  "aggregateRating": { "ratingValue": "5", "reviewCount": "7", ... },
  "review": [
    { "@type": "Review", "author": ..., "reviewRating": { "ratingValue": "5" }, "reviewBody": "..." },
    ... 6 outros
  ]
  ```
- **Problema:** Google considera "self-serving reviews" — avaliações sobre uma `LocalBusiness`/`Organization` publicadas no próprio site da empresa — fora dos critérios elegíveis para rich results. A diretriz é literal: "Não permitimos avaliações de auto-promoção para `LocalBusiness` e `Organization` em que a avaliação é sobre o próprio `LocalBusiness` ou `Organization`."
- **Impacto:** (1) os snippets ricos com estrelas não devem aparecer na SERP a partir desses blocos, então o trabalho de marcação não rende o efeito visual esperado; (2) em casos de fiscalização da política, o Search Console pode emitir aviso de "Review snippet — Critical issue: Self-serving review" e parar de renderizar qualquer review desse domínio; (3) reviewCount=7 com todos 5★ é um padrão típico que filtros heurísticos consideram suspeito mesmo sendo verdadeiro.
- **Evidência / verificação:**
  ```
  $ node -e "...JSON-LD parse..."
  AutoRepair aggregateRating.reviewCount: 7
  reviews array length: 7
  testimonial-card HTML count: 7
  ```
  Dados consistentes entre HTML e schema — o problema não é discrepância, é a categoria das reviews (self-serving).
- **Fonte:** Diretrizes do Review Snippet, Google Search Central — https://developers.google.com/search/docs/appearance/structured-data/review-snippet (seção "Critical guidelines" → "We don't allow self-serving reviews for LocalBusiness and Organization where the review is about the LocalBusiness or Organization itself").
- **Recomendação:** remover `aggregateRating` e `review[]` do bloco `AutoRepair` no `index.html`. Para preservar prova social na página, manter o carrossel de depoimentos visual (sem schema) e migrar a captação de reviews para Google Business Profile (que é a fonte canônica que o Google usa para mostrar estrelas em LocalBusiness na SERP). Se quiser manter algum schema, considere `@type: "Person"` falando sobre uma `Service` específica em vez do negócio inteiro.
- **Risco de regressão se corrigido:** se o site já recebia rich snippet de review (improvável dado A-03), removê-lo derruba a estrela visível. Em compensação, fica imune a um Search Console alert e a futuras revisões da política.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta — diretriz explícita do Google, padrão de implementação inequívoco.
- **Esforço estimado:** Trivial.

#### [A-03] URLs canônicas do blog retornam 404 em produção
- **Localização:** referências espalhadas; as três 404 observadas:
  - `blog/index.html` linhas 13, 17, 20 → canonical/og:url/og:image apontam para `https://www.magnumtorque.com.br/blog/` e `.../conversor-torque-interior@2x.jpg`
  - `blog/sinais-conversor-torque-precisa-retifica/index.html` linhas 22, 26 → canonical/og:url apontam para `https://www.magnumtorque.com.br/blog/sinais-conversor-torque-precisa-retifica/`
  - `sitemap.xml` linhas 27 e 33 listam ambas URLs
- **Problema:** o crawler externo confirmou que três URLs canônicas/sitemap retornam 404 em produção *agora* (2026-05-11):
  ```
  [404] https://www.magnumtorque.com.br/blog/
  [404] https://www.magnumtorque.com.br/blog/sinais-conversor-torque-precisa-retifica/
  [404] https://www.magnumtorque.com.br/assets/blog/conversor-torque-interior@2x.jpg
  ```
- **Impacto:**
  - Search engines que descobrirem o `sitemap.xml` recebem 404 em 2 de 3 URLs listadas → potencial sinal "Submitted URL not found" no Google Search Console e índice não ranqueia.
  - Compartilhamentos do blog em redes sociais resolvem `og:image` 404 → preview quebrado.
  - Se a aba "Blog" do menu na home for clicada por um visitante real (`<a href="/blog/">Blog</a>` em `index.html:221`) o usuário cai no `/404.html`.
- **Evidência / verificação:** `linkinator http://127.0.0.1:38765/ --recurse` rodando contra o build local detectou os 3 alvos como 404. Os arquivos locais (`blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html`, `assets/blog/conversor-torque-interior@2x.jpg`) existem no repo — então é descompasso de deploy, não conteúdo faltando. Saída completa em "Apêndice A".
- **Fonte:**
  - Google Search Central — "How sitemaps work": https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview ("URLs in the sitemap must respond with 200 OK").
  - Google Search Central — Canonical URL guidance: https://developers.google.com/search/docs/crawling-indexing/canonicalization ("rel=canonical should point to a real, indexable URL").
- **Recomendação:** subir o `blog/` (listagem + post + imagem `@2x.jpg`) e o `search-index.json` atualizado para a Hostinger antes do próximo passo. Validar via `curl -I https://www.magnumtorque.com.br/blog/` (200) antes de re-submeter o `sitemap.xml` no Search Console.
- **Risco de regressão se corrigido:** zero — está corrigindo, não introduzindo.
- **Pré-requisitos:** acesso ao FTP/painel da Hostinger.
- **Confiança:** Alta sobre o fato (HTTP 404 verificado). Média sobre a interpretação — pode ser que a versão atual ainda esteja sendo finalizada e nunca tenha sido deployada; nesse caso o achado é "lembrete antes de marcar como feito" em vez de "regressão".
- **Esforço estimado:** Trivial (upload).

### 🟡 Médios

#### [M-01] Scrollspy destaca item errado no fim da home
- **Localização:** `js/main.js` linhas 126, 170-172; ordem do DOM em `index.html` (section `#contato` na linha 736, section `#faq` na linha 875)
- **Trecho relevante:**
  ```js
  const sectionIds = ['inicio', 'sobre', 'servicos', 'pecas', 'parceiros', 'depoimentos', 'faq', 'contato'];
  ...
  if (scrollBottom >= docH - 4) {
    setActive(sectionIds[sectionIds.length - 1]);  // sempre "contato"
    return;
  }
  ```
- **Problema:** o array `sectionIds` termina em `contato`, mas a ordem real das seções no HTML é `...depoimentos → contato → faq` (FAQ é a última seção visualmente). Quando o usuário rola até o final da página, o heurístico "último elemento da lista" força ativar `contato` enquanto o usuário olha para a FAQ.
- **Impacto:** o item do menu destacado conflita com o conteúdo visível na parte de baixo da página — pequeno, mas confuso para o usuário e gera flicker na navegação porque o cálculo `bestVisible` que rodaria antes do early-return diria `faq` (mais visível) e o override muda para `contato` ao bater o fim.
- **Evidência / verificação:**
  ```
  $ grep -oE '<section[^>]*id="[^"]+' index.html | sed 's/.*id="//'
  inicio
  sobre
  servicos
  pecas
  parceiros
  depoimentos
  contato     ← linha 736
  faq         ← linha 875 (último)
  ```
  vs lista no JS `['inicio', 'sobre', 'servicos', 'pecas', 'parceiros', 'depoimentos', 'faq', 'contato']`.
- **Fonte:** A heurística "última seção" pressupõe ordem do DOM. Referência sobre scrollspy intencional: Bootstrap docs sobre scrollspy e a relação com ordem do DOM — https://getbootstrap.com/docs/5.3/components/scrollspy/#how-it-works ("Anchors are required and must point to an element with that ID … in the order they appear in the document").
- **Recomendação:** ou ordenar `sectionIds` para refletir a ordem do DOM (`...depoimentos, contato, faq`) ou substituir o heurístico "último elemento da lista" por "última seção vista pela última iteração de `bestVisible`". Veja também [M-02] (ordem do menu).
- **Risco de regressão se corrigido:** mínimo — o destaque pode mudar entre `contato` e `faq` no scroll final, dependendo do alvo.
- **Pré-requisitos:** nenhum (pode ser resolvido junto com M-02).
- **Confiança:** Alta.
- **Esforço estimado:** Trivial.

#### [M-02] Ordem do menu não bate com a ordem das seções
- **Localização:** `index.html` linhas 214-223 (menu desktop) e 245-957 (seções)
- **Trecho relevante:** menu lista `... Depoimentos → Blog → FAQ → Entre em Contato`; o DOM coloca `contato` (linha 736) **antes** de `faq` (linha 875).
- **Problema:** clicar em "FAQ" no menu envia o usuário para uma seção que está visualmente *abaixo* de "Entre em Contato" — quem clica em FAQ rola para baixo passando pela seção de Contato no caminho. É um descasamento entre a ordem de leitura sugerida pelo menu e a ordem narrativa real da página.
- **Impacto:** experiência de navegação inconsistente; usuários que abrem o menu mobile podem percorrer o conteúdo numa ordem diferente da pretendida. Também é a causa de [M-01].
- **Evidência / verificação:** mesmo grep da M-01; menu em `index.html:214-223`.
- **Fonte:** Princípio de "consistência de ordem na navegação" — WCAG 2.1 SC 3.2.3 "Consistent Navigation" (https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation.html) e Nielsen Norman Group — "Information Scent" (https://www.nngroup.com/articles/information-foraging/).
- **Recomendação:** decida qual ordem é canônica. Opção A: mover a section `#faq` para *antes* de `#contato` no DOM (mais comum em marketing pages — FAQ é último-antes-do-CTA). Opção B: inverter no menu (`...Depoimentos → Blog → Contato → FAQ` ficaria estranho porque o CTA fica enterrado). Recomendado: reordenar DOM (Opção A) — alinha com o menu existente e com o padrão de blog post (FAQ vem antes do CTA também no post).
- **Risco de regressão se corrigido:** baixo — seções são independentes; mover preserva os anchors.
- **Pré-requisitos:** nenhum; resolve M-01 simultaneamente se a opção for "reordenar DOM".
- **Confiança:** Alta.
- **Esforço estimado:** Pequeno.

#### [M-03] Hierarquia de cabeçalho com saltos (h1→h3, h2→h4)
- **Localização:**
  - `index.html` linhas 285-300 — três `<h3>` (`Diagnóstico Preciso`, `Remanufatura Completa`, `Garantia de Qualidade`) dentro de `.hero-cards`, **sem h2 entre o `<h1>` do hero e elas**
  - `index.html` linhas 607, 625, 643, 661, 679, 697, 715 — sete `<h4>` (nome do autor de cada testimonial) **diretamente abaixo do `<h2>` da seção depoimentos, sem h3 intermediário**
- **Problema:** WCAG SC 1.3.1 (Info and Relationships) e a regra de "sem saltos de nível de heading" (que o Lighthouse a11y testa via `heading-order`) exigem hierarquia sem pulos descendentes. `h1 → h3` e `h2 → h4` violam isso.
- **Impacto:** usuários de leitor de tela navegando por headings perdem a noção de subordinação (o `<h3>` "Diagnóstico Preciso" parece estar dentro de uma seção h2 que não existe); a meta de Lighthouse a11y 0.95 fica em risco — o teste `heading-order` derruba pontos cada vez que falha.
- **Evidência / verificação:**
  ```
  $ grep -oE '<h[1-6][^>]*' index.html | sed 's/<h\([1-6]\).*/h\1/'
  h1 h3 h3 h3 h2 h3 h3 ... h2 h2 h4 h4 h4 h4 h4 h4 h4 h2 ...
  ```
  Primeira sequência mostra `h1→h3→h3→h3` (hero-cards) antes do primeiro `h2`. Mais à frente, `h2→h4` (sete vezes) na seção testimonials.
- **Fonte:**
  - WCAG 2.1 — Understanding SC 1.3.1: https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
  - Lighthouse audit "heading-order": https://web.dev/articles/heading-order
- **Recomendação:** trocar os três `<h3>` do hero por `<h2>` (eles são, semanticamente, sub-features do hero, mas o padrão atual quebra a hierarquia) **ou** envolver os hero-cards numa section com `<h2>` invisível (`.sr-only`) tipo "Diferenciais". Para a seção depoimentos, ou trocar `<h4>` de autor por `<p class="...">` (nome não precisa ser heading) ou inserir `<h3>` por testimonial (overkill). Pessoalmente: `<p>` no autor + h3 só se houver título de depoimento.
- **Risco de regressão se corrigido:** mudança de tamanho/peso CSS dos elementos afetados — preciso ajustar `.testimonial-author h4` (style.css linha 249) e `.hero-card h3` (style.css linha 123) para o novo nível.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta.
- **Esforço estimado:** Pequeno.

#### [M-04] Sem consentimento para cookies do GA4 (LGPD)
- **Localização:** GA4 inline em `index.html` linhas 7-14, `blog/index.html` linhas 45-51, `blog/sinais-conversor-torque-precisa-retifica/index.html` linhas 7-14
- **Trecho relevante:**
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0HJYEEB2XR"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-0HJYEEB2XR');
  </script>
  ```
- **Problema:** o snippet roda `gtag('config', ...)` no primeiro hit da página, o que faz o GA4 gravar `_ga`, `_ga_<container-id>` (e potencialmente `_gid`) antes de qualquer interação do usuário. Não há banner / mecanismo de consentimento, nem `gtag('consent', 'default', ...)` em modo `denied` configurado. Para uma empresa atuando no Brasil, isso conflita com a LGPD (Lei 13.709/2018, art. 7 sobre bases legais) e com o entendimento atual da ANPD sobre cookies não-essenciais.
- **Impacto:** risco regulatório (ANPD pode notificar/multar; o histórico ainda é tímido mas crescente em 2025-2026); risco reputacional com clientes B2B do setor automotivo que checam compliance; e risco operacional se o domínio for citado em alguma reclamação no portal da ANPD.
- **Evidência / verificação:**
  ```
  $ grep -n 'gtag\|consent' js/main.js js/blog-search.js
  js/main.js:62: if (typeof window.gtag === 'function') { ... }
  # nenhuma chamada gtag('consent', ...)
  ```
  Nenhum CMP / cookie consent component está presente no DOM.
- **Fonte:**
  - LGPD — Lei 13.709/2018 art. 7º e art. 8º (bases legais e consentimento): http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
  - ANPD — Guia Orientativo sobre Cookies (2023): https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-cookies-anpd-versao-final.pdf
  - Google — Consent Mode v2 (implementação técnica): https://developers.google.com/tag-platform/security/guides/consent
- **Recomendação:** implementar Consent Mode v2 do Google. No `<head>`, antes do `gtag('config', ...)`, declarar `gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ... })` e atualizar para `'granted'` só após interação afirmativa num banner. Como o site não usa publicidade, `ad_storage`/`ad_user_data` ficam permanentemente `denied`. Banner pode ser leve (umas 30 linhas de JS+CSS, sem dependência); biblioteca pronta como **klaro!** (https://klaro.org) também serve.
- **Risco de regressão se corrigido:** se Consent Mode "denied" persistir, o GA4 entra em modo cookieless (pings sem identificador) — métricas continuam, mas o número de "usuários únicos" cai/é modelado. Aceitável.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta sobre a falta de consent; Média sobre o risco de fiscalização efetiva (que depende da escala da empresa e queixas concretas).
- **Esforço estimado:** Pequeno (banner + 5 chamadas `gtag('consent', ...)`).

#### [M-05] `apple-touch-icon` tem 128×74, não 180×180 quadrado
- **Localização:** `index.html` linha 45, `blog/index.html` linha 34, `blog/sinais-conversor-torque-precisa-retifica/index.html` linha 51 — todos apontam para `assets/logo_magnum_64.webp`
- **Problema:** o arquivo nominalmente "64" tem na verdade dimensão **128×74** (verificado via parser de WebP). `apple-touch-icon` é renderizado pelo iOS quando o usuário adiciona o site à tela inicial — o iOS espera **180×180** PNG/WebP quadrado e, recebendo retângulo não-quadrado, esticará (gerando logo distorcido) ou aplicará crop centralizado (cortando partes do logo).
- **Impacto:** quando um cliente salva o site no iPhone, o ícone fica com aparência amadora. Também: o Safari pode usar a mesma URL como fallback para Touch Bar / Reading List, herdando o problema.
- **Evidência / verificação:**
  ```
  $ node -e "...parser webp..."
  assets/logo_magnum_64.webp 128x74
  assets/logo_magnum_final.webp 1449x840
  assets/logo_10anos.webp 1052x653
  ```
- **Fonte:** Apple WebKit guidance / MDN — `apple-touch-icon`: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#sizes (180×180 é a recomendação corrente); spec original Apple Configuring Web Applications.
- **Recomendação:** gerar `assets/apple-touch-icon-180.png` (180×180 quadrado, PNG ou WebP, com a logo centralizada e padding suficiente para o crop do iOS) e usar `<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180.png">`. Manter o `assets/logo_magnum_64.webp` só para `<link rel="icon">` se ele cumpre o papel de favicon.
- **Risco de regressão se corrigido:** mínimo; arquivo separado.
- **Pré-requisitos:** Acesso à imagem-fonte do logo em alta resolução (existe — `logo_magnum_final.webp` 1449×840).
- **Confiança:** Alta — dimensões do arquivo verificadas.
- **Esforço estimado:** Trivial.

#### [M-06] Manifest declara ícone "any" + 512×512 num arquivo 1449×840
- **Localização:** `manifest.webmanifest` linhas 14-27
- **Trecho relevante:**
  ```json
  "icons": [
    { "src": "/assets/logo_magnum_final.webp", "sizes": "any",       "type": "image/webp", "purpose": "any" },
    { "src": "/assets/logo_magnum_final.webp", "sizes": "512x512",   "type": "image/webp", "purpose": "maskable" }
  ]
  ```
- **Problema:** dois problemas se cruzam:
  1. `sizes: "any"` é convencionado para formatos vetoriais (SVG, ICO) — usar para WebP raster é tecnicamente permitido mas confunde o user-agent; alguns browsers caem para skip de critério "installable".
  2. `sizes: "512x512"` aponta para um arquivo que **na verdade tem 1449×840**, não 512×512 nem quadrado. O `purpose: "maskable"` exige imagem **quadrada com safe zone** — uma máscara aplicada sobre uma imagem 1449×840 vai cortar tudo que não couber no quadrado central, escondendo metade do logo.
- **Impacto:** "Add to home screen" no Android/Chrome renderiza ícone distorcido/cortado; Lighthouse PWA flag dispara `manifest-icons` warning; se um dia o site adicionar service worker para virar PWA real, o critério de instalação falha.
- **Evidência / verificação:**
  ```
  $ node -e "...parser webp..."
  assets/logo_magnum_final.webp 1449x840
  ```
  Manifest declara 512×512.
- **Fonte:**
  - W3C — Web App Manifest spec, seção `sizes` e `purpose`: https://www.w3.org/TR/appmanifest/#sizes-member ("any" é "intended for use with formats that support resizing of the image without quality loss, such as media types of image/svg+xml") e https://www.w3.org/TR/appmanifest/#purpose-member.
  - Chrome — Install criteria & maskable icons: https://web.dev/articles/maskable-icon
- **Recomendação:** gerar dois PNGs/WebPs **quadrados** com a logo centralizada e safe zone (40% padding em volta) — `192x192` e `512x512`, ambos `purpose: "any maskable"` ou separar em entradas — e atualizar o manifest.
- **Risco de regressão se corrigido:** se um usuário já tinha o site na home screen, o ícone pode ser atualizado na próxima instalação. Mínimo.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta.
- **Esforço estimado:** Trivial (gerar 2 PNGs).

#### [M-07] Embed do Google Maps usa URL não-documentada (`?output=embed`)
- **Localização:** `index.html` linhas 795-801
- **Trecho relevante:**
  ```html
  <iframe
    src="https://www.google.com/maps?q=Rua+Irm%C3%A3+Maria+Lucia+Roland+403+Hauer+Curitiba+PR&output=embed"
    ...></iframe>
  ```
- **Problema:** o parâmetro `output=embed` em `/maps?q=...` é uma forma "shortcut" que funciona há anos mas **não consta da documentação oficial** do Maps Embed API. A forma documentada é `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=...` ou o iframe gerado pelo botão "Compartilhar → Incorporar um mapa" no próprio Google Maps (que produz um `embed?pb=...` mais longo). Google já deprecou caminhos similares no passado sem aviso longo.
- **Impacto:** risco médio de o iframe parar de renderizar com pouco aviso; quando isso acontecer, a seção "Contato" vai mostrar uma área branca / "página não pode ser exibida" sem fallback.
- **Evidência / verificação:** o URL responde 200 hoje (verificado pelo linkinator), mas não está na lista de URLs documentados em https://developers.google.com/maps/documentation/embed/get-started.
- **Fonte:** Google Maps Embed API — Get Started: https://developers.google.com/maps/documentation/embed/get-started; histórico de deprecation de Maps APIs: https://developers.google.com/maps/deprecations.
- **Recomendação:** migrar para o iframe gerado oficialmente (Google Maps → Share → Embed) que produz um `embed?pb=...` — não exige API key e é a forma suportada. Atualizar o `frame-src` da CSP para `https://www.google.com` apenas (linha 20 do index.html já permite); `maps.google.com` pode sair da CSP porque o novo iframe não usa esse host (ver L-03).
- **Risco de regressão se corrigido:** o novo URL é mais longo e específico do local; se a empresa mudar de endereço, precisa regerar.
- **Pré-requisitos:** nenhum.
- **Confiança:** Média — "não está documentado" é um sinal forte, mas a URL funciona há muito tempo.
- **Esforço estimado:** Trivial.

#### [M-08] Form de contato sem `action`/`method` — submit com JS off vaza dados na URL
- **Localização:** `index.html` linha 817; lógica em `js/main.js` linhas 337-410
- **Trecho relevante:**
  ```html
  <form id="contact-form" novalidate>
  ```
  Em JS, `e.preventDefault()` é chamado **dentro** do handler `submit`. Se o JS não carregar (CSP issue, network, ad blocker que bloqueie `main.js`, erro no script anterior), o submit cai no comportamento default do HTML.
- **Problema:** `<form>` sem `action` faz submit para a URL atual; sem `method` o default é GET. Resultado: clicar "Enviar Mensagem" sem JS recarrega a página com **todos os campos do form na query string** — incluindo o honeypot `_gotcha`. Os dados ficam no histórico do navegador e no log do servidor Apache (e potencialmente no proxy da Hostinger).
- **Impacto:** privacidade — dados de contato + mensagem livre acabam no histórico/log. UX — usuário não tem feedback de que a submissão "funcionou" (já que recarrega a página com query string mas sem mensagem). Também: `novalidate` desativa a validação HTML5 nativa, então sem JS não há nem feedback de campo obrigatório.
- **Evidência / verificação:**
  ```
  $ grep -n 'form.*contact-form' index.html
  817:          <form id="contact-form" novalidate>
  ```
  Nenhum `action` ou `method` no elemento.
- **Fonte:** MDN — `<form>` defaults: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attributes ("If not set, the form is submitted to the page that contains the form, using GET as the default HTTP method"); OWASP — "Information Exposure Through Query Strings in URL": https://cwe.mitre.org/data/definitions/598.html
- **Recomendação:** dois caminhos defensivos:
  1. `<form id="contact-form" action="https://wa.me/554135036828" method="get" novalidate>` — não previne o submit no caso JS-off, mas pelo menos manda o usuário para o WhatsApp em vez de recarregar a home com a mensagem na URL.
  2. Tag `<noscript>` mostrando "Para enviar mensagem, habilite o JavaScript ou ligue para (41) 3503-6828" e CSS escondendo o `<form>` quando `noscript` está ativo.
  Preferir (2) — mais explícito; o usuário sem JS ainda tem o `tel:` e o WhatsApp direto.
- **Risco de regressão se corrigido:** zero se for `noscript` + esconder.
- **Pré-requisitos:** nenhum.
- **Confiança:** Alta sobre o comportamento; Média sobre a relevância (proporção de usuários com JS off é pequena, mas o vazamento na URL é real e silencioso).
- **Esforço estimado:** Trivial.

### 🟢 Baixos

#### [B-01] `404.html` sem CSP — inconsistente com a política das outras páginas
- **Localização:** `404.html` linhas 1-101 (não há `<meta http-equiv="Content-Security-Policy">`)
- **Problema:** as três outras páginas têm CSP rigorosa; a `404.html` não tem nenhuma. Como a página tem `<script>` inline (linhas 39-66 e 77-99) e `<style>` inline, qualquer CSP seria precisaria de `'unsafe-inline'` — o que reduz o ganho. Mesmo assim, manter consistência ajuda a evitar regressão futura (qualquer alguém adicionar um `<img>` ou `<script>` de origem externa sem perceber que essa página é mais permissiva).
- **Impacto:** baixo. A página é servida com status 404 (não indexada), atinge usuário fora do fluxo principal.
- **Fonte:** MDN — Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Recomendação:** copiar a CSP da `blog/index.html` para a `404.html` (sem `frame-src`, já que a 404 não tem iframe). É 1 linha.
- **Confiança:** Alta.
- **Esforço estimado:** Trivial.

#### [B-02] Crédito de desenvolvedor no rodapé (`https://lbwma.com`) com erro de conexão
- **Localização:** `index.html` linha 1088, `blog/index.html` linha 275, `blog/sinais-conversor-torque-precisa-retifica/index.html` linha 491
- **Problema:** o linkinator reportou status `[0]` (falha de conexão — não 404, mas indisponível) ao tentar `https://lbwma.com/`. Visitantes que clicam batem em "site não responde".
- **Impacto:** muito baixo — link de assinatura no rodapé, raríssimo clique. Mas é uma falha visível.
- **Evidência:**
  ```
  [0] https://lbwma.com/
  ```
- **Fonte:** linkinator status `0` = "could not establish connection" — https://github.com/JustinBeckwith/linkinator/blob/main/src/links.ts (campo `status: 0` corresponde a network error). MDN sobre `noopener` para `target=_blank` (já presente, sem problema lá): https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener.
- **Recomendação:** trocar para `target="_self"` (link interno) ou remover o anchor mantendo "Desenvolvido por LBWMA" como texto puro até o site voltar.
- **Confiança:** Média (status `0` pode ser intermitente).
- **Esforço estimado:** Trivial.

#### [B-03] CSP da home tem `frame-src https://maps.google.com` ocioso
- **Localização:** `index.html` linha 20
- **Trecho relevante:** `frame-src https://www.google.com https://maps.google.com;`
- **Problema:** o iframe único da home usa `https://www.google.com/maps?...` (host `www.google.com`). O segundo host `maps.google.com` não é usado por nenhum iframe — é resíduo histórico. Não é falha, mas amplia a CSP sem motivo.
- **Impacto:** zero funcional; "superfície de ataque" da CSP marginal.
- **Fonte:** MDN — `frame-src`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-src
- **Recomendação:** remover `https://maps.google.com` da diretiva. Manter só `https://www.google.com`.
- **Confiança:** Alta.
- **Esforço estimado:** Trivial.

#### [B-04] `MiniSearch` vendored em 6.3.0; atual é 7.2.0
- **Localização:** `js/vendor/minisearch.min.js` linha 3 (header informa `npm/minisearch@6.3.0/dist/umd/index.js`)
- **Problema:** uma versão major atrás (7.x trouxe breaking changes na API de query). Sem CVE publicado, mas a 6.3.0 já tem 2+ anos e o ecossistema pode evoluir.
- **Impacto:** zero hoje; baixo no médio prazo.
- **Evidência:** `npm view minisearch versions` confirma versões 6.3.0 (atual no repo) e 7.2.0 (latest publicada em 2025-09-16).
- **Fonte:** changelog MiniSearch: https://github.com/lucaong/minisearch/releases
- **Recomendação:** ao atualizar para 7.x, revisar a documentação de breaking changes — a API de `processTerm` e algumas defaults mudaram. Não é urgente.
- **Confiança:** Alta.
- **Esforço estimado:** Pequeno (incluindo teste manual da busca).

#### [B-05] Imagem do card do blog tem `loading="lazy"` apesar de above-the-fold
- **Localização:** `blog/index.html` linhas 183-187
- **Trecho relevante:** `<img src="/assets/blog/conversor-torque-interior.jpg" ... loading="lazy" ...>`
- **Problema:** com um único post no blog, esse card é o primeiro elemento visível abaixo do hero — é o LCP (Largest Contentful Paint) candidato. Marcar como `lazy` faz o browser esperar a primeira pintura para começar a baixar; isso atrasa o LCP em 200-500ms tipicamente.
- **Impacto:** o score "perf" do Lighthouse em mobile (target 0.85) pode cair perto do limite por causa do LCP.
- **Fonte:** web.dev — "Optimize LCP": https://web.dev/articles/optimize-lcp ("Avoid lazy-loading above-the-fold images") e https://web.dev/articles/lcp-lazy-loading.
- **Recomendação:** trocar `loading="lazy"` por `loading="eager"` + `fetchpriority="high"` no primeiro card. O blog post já faz isso para a featured image (linha 221 da `blog/sinais-conversor-torque-precisa-retifica/index.html`).
- **Confiança:** Alta.
- **Esforço estimado:** Trivial.

#### [B-06] Custo declarado para sinônimos via IA está ~5× abaixo do real
- **Localização:** `scripts/README.md` linhas 34 ("Custo aproximado: ~$0.01 por post"); `CLAUDE.md` parágrafo "Adding a new blog post" ("costs ~$0.01/post")
- **Problema:** o prompt em `scripts/build-search.mjs` envia ~3-4k tokens de input (prompt + corpo do post) com `max_tokens: 2000`. Usando preço do **Claude Sonnet 4.6** ($3/MTok input + $15/MTok output), uma execução típica chega a ~$0.04-0.06/post, não $0.01. A estimativa parece ter sido feita com pricing antigo de Haiku ou de Sonnet 3.5.
- **Impacto:** zero funcional; gera surpresa só se alguém rodar o script para 20+ posts de uma vez achando que vai gastar $0.20.
- **Fonte:** Pricing oficial Claude: https://www.anthropic.com/pricing#anthropic-api (Sonnet 4.6: $3/MTok input, $15/MTok output, válido em 2026).
- **Recomendação:** atualizar a doc para "~$0.04-0.06 por post" ou medir uma execução real e usar o número observado.
- **Confiança:** Média (a estimativa precisa varia com tamanho de output da IA).
- **Esforço estimado:** Trivial.

#### [B-07] Hash-on-load fix não decoda URL fragments
- **Localização:** `js/main.js` linhas 84-103
- **Trecho relevante:** `const id = hash.slice(1); ... document.getElementById(id);`
- **Problema:** se a hash contiver caracteres percent-encoded (ex.: `#caf%C3%A9` para "café"), `slice(1)` produz `caf%C3%A9` que não casa com `id="café"`. Hoje todos os IDs do site são ASCII puro, então é só um edge case latente.
- **Impacto:** zero hoje; pequeno se algum dia for adicionada section com ID não-ASCII.
- **Fonte:** WHATWG URL — fragment percent-encoding: https://url.spec.whatwg.org/#fragment-percent-encode-set
- **Recomendação:** `const id = decodeURIComponent(hash.slice(1));`. Mínima e defensiva.
- **Confiança:** Alta.
- **Esforço estimado:** Trivial.

#### [B-08] Honeypot usa `name="_gotcha"` — conhecido por ferramentas anti-spam
- **Localização:** `index.html` linha 820
- **Problema:** `_gotcha` é o nome reservado do Formspree para honeypot (https://help.formspree.io/hc/en-us/articles/360013580813); bots que detectam Formspree pulam esse campo automaticamente. Para um honeypot ser eficaz, o nome deve parecer um campo real que um bot tentaria preencher (ex.: `company`, `website`, `address2`).
- **Impacto:** baixo — bots mais simples (que preenchem todos os campos) ainda caem; bots especializados em Formspree passam batido.
- **Fonte:** OWASP — Anti-spam techniques: https://owasp.org/www-community/controls/Honey_Pot.
- **Recomendação:** renomear para algo neutro como `website` (que bots de SEO frequentemente tentam preencher) ou `endereco_complemento`.
- **Confiança:** Média.
- **Esforço estimado:** Trivial.

#### [B-09] CSP depende de `'unsafe-inline'` para `script-src`
- **Localização:** linhas 20, 12, 21 (CSP nas 3 páginas)
- **Problema:** `script-src 'self' 'unsafe-inline' ...` desativa a principal proteção contra XSS injetado em conteúdo dinâmico. Como o site é estático, o risco prático é pequeno — mas perde defesa em profundidade.
- **Impacto:** baixo no contexto (sem CMS, sem campos refletidos).
- **Fonte:** Google Web Fundamentals — Strict CSP: https://web.dev/articles/strict-csp ("Avoid 'unsafe-inline' in script-src and style-src").
- **Recomendação:** migrar para CSP com nonces — gerar um nonce por request no Apache (`mod_unique_id` + `mod_rewrite`) ou pre-gerar e injetar no deploy. Esforço médio.
- **Confiança:** Alta sobre o débito; Baixa sobre a urgência (impacto residual baixo).
- **Esforço estimado:** Médio.

## Achados por camada

| Camada            | IDs                                       |
|-------------------|-------------------------------------------|
| Correctness       | M-01, M-02, B-07                          |
| Frontend          | M-01, M-02, M-03, M-05, M-06, M-08, B-05  |
| Backend           | (não aplicável — site estático)           |
| Arquitetura       | A-01                                      |
| Dados             | A-03 (consistência canônica vs deploy)    |
| Segurança         | M-04, M-08, B-01, B-03, B-08, B-09        |
| Performance       | B-05                                      |
| Testes            | A-01                                      |
| Build / CI / Deploy | A-01, A-03                              |
| DX                | B-06                                      |
| Dependências      | B-04                                      |
| Configs           | M-06, B-01, B-02                          |
| SEO/Schema        | A-02, A-03, M-03                          |

## O que está bem feito

Decisões que merecem preservação num próximo fix-pass:

1. **CSP por página, restritiva e diferenciada** (`index.html:20`, `blog/index.html:12`, `blog/sinais-.../index.html:21`). Cada página tem só as permissões que precisa — a home permite `frame-src` para o Maps, as duas páginas de blog não. Padrão raramente bem feito em sites de pequeno porte.
2. **Skip link + `<main id="main">` consistente** (linhas 198/244, 98/141, 132/178). Pequeno, mas presente em todas as páginas e funcional.
3. **Headers de segurança no `.htaccess`** (linhas 83-96) cobrindo HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy com opt-outs explícitos de `interest-cohort`, `browsing-topics` e `attribution-reporting` (FLoC/Topics). Vai além do padrão.
4. **Indicador de horário com timezone explícito** (`js/main.js` 5-58). Usa `Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'` em vez de aritmética de offset — imune a DST (Brasil aboliu em 2019 mas pode voltar) e a usuários acessando de fuso diferente. `visibilitychange` pausa o `setInterval` quando aba está oculta. Bem pensado.
5. **Build search com fallback em camadas** (`scripts/build-search.mjs` 56-89). Title cai em 3 níveis (og:title → h1.post-title → `<title>` sem suffix); date em 2 níveis (meta article:published_time → `<time datetime>`); body em 2 níveis (post-content específico → article inteiro). Cada extração tem fallback explícito.
6. **Fuzzy search em dois passos** (`js/blog-search.js` 83-92). Primeiro passa com `fuzzy: 0.2` exigente; só se zero hits cai para `fuzzy: 0.4`, mantendo `combineWith: 'AND'` para não puxar resultado irrelevante por causa de uma palavra. Boa heurística.
7. **Honra `prefers-reduced-motion`** em três lugares: scroll-behavior global (`style.css:6` e :445), carrossel autoplay (`main.js:236, 280`), animação do pulse de WhatsApp e do `is-open` do indicador de horas (`style.css:377, 425`). Difícil de ver bem feito num site de PME.
8. **Modal com focus trap, ESC e restoration** (`js/main.js` 446-483). Salva `lastFocus` antes de abrir, retorna depois de fechar; trap funciona com Tab/Shift+Tab; clicar no overlay (não no modal) fecha. Padrão acessível completo.
9. **Schema markup variado e estruturado** — `AutoRepair` na home, `FAQPage` separada, `Blog` + `BlogPosting` + `BreadcrumbList` no blog, `FAQPage` específica para o post. Todos parseiam como JSON válido (verificado). Apesar do problema em A-02, o restante é exemplar.
10. **`scroll-padding-top: 80px` global** (`style.css:3`) cobre o offset do header fixo para *qualquer* anchor link automaticamente — em vez de hackar com `scroll-margin` caso a caso.

## Zonas cegas desta auditoria

1. **Comportamento real em produção** — todos os testes foram contra o filesystem local + um `http-server` local. Não testei a Hostinger nem se o `.htaccess` realmente está sendo lido (Hostinger tem perfis que ignoram `.htaccess` em alguns planos). Os achados sobre `.htaccess` (RewriteRule, FilesMatch, Headers) pressupõem que `AllowOverride` permite as diretivas usadas; não pude verificar.
2. **Render real do CSP no browser** — não rodei `Chrome --disable-web-security` nem inspecionei console com CSP violations. Pode haver violations em produção que só aparecem com GA4 carregado sob certas condições (ex.: regional endpoints do GA4 sem `img-src https://*.google-analytics.com`).
3. **Acessibilidade dinâmica (carrossel, modal)** — verifiquei estaticamente os atributos ARIA, mas não rodei axe-core / Lighthouse contra a página rodando. Casos sutis (live regions, focus management durante autoplay) podem ter problemas que análise estática não pega.
4. **iOS/Android render do PWA add-to-home-screen** — A inferência sobre o ícone maskable é baseada na spec; não testei manualmente.
5. **Comportamento real do `linkinator` em CI** — testei localmente e identifiquei que `--skip` mata o crawl quando o alvo é diretório. Mas nunca rodei numa Action real para confirmar comportamento idêntico (Ubuntu vs Windows bash). Confiança Alta mas não 100%.
6. **Lighthouse CI scores reais** — não tive acesso aos relatórios em `.lighthouseci/` (gitignored). O Lighthouse desktop preset roda contra localhost — alguns achados (LCP de B-05, heading-order de M-03) podem ou não estourar os thresholds atuais; não validado empiricamente.
7. **Análise dos depoimentos quanto a veracidade** — assumi como reais por padrão. Não pude verificar (e nem é tarefa desta auditoria).
8. **Performance real de bundle** — não há bundler, mas não medi tempo de DOMContentLoaded ou os requests externos (GA4, fonts.googleapis). Stack waterfall não verificada.
9. **Comportamento do `<details name="...">`** em Safari 17.2-17.3 (que tem bug conhecido de animação) — não pude testar.

## Apêndice A — Comandos executados

| Comando                                                                                      | O que revelou                                                                                                              |
|----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `ls -la` (em raiz + subdirs)                                                                 | mapa do repo: 4 páginas HTML, 2 CSS, 3 JS, 1 script, configs CI                                                            |
| `wc -l <todos arquivos principais>`                                                          | contagem de linhas — 1131 index, 533 post, 483 main.js                                                                     |
| `npx -y html-validate@9.x '**/*.html' --ignore .git --ignore node_modules`                   | EXIT=1, "unknown option --ignore" → confirma A-01                                                                          |
| `npx -y html-validate@9.x index.html blog/index.html ...`                                    | EXIT=0 — HTML em si é válido                                                                                               |
| `npx -y linkinator@6.x . --recurse --skip "^https?://(localhost\|127\\.)" --retry`           | "Successfully scanned 0 links" → confirma A-01 (skip eats own crawl)                                                       |
| `npx -y linkinator@6.x . --recurse` (sem skip)                                               | 6 links quebrados detectados — alimenta A-03 e B-02                                                                        |
| `npx -y http-server@14 . -p 38765 && linkinator http://127.0.0.1:38765/ --recurse`           | 53 links escaneados, 6 broken — confirma A-03 (3 URLs prod 404)                                                            |
| `node -e "JSON.parse(... manifest/search-index/synonyms ...)"`                               | todos os JSONs parseiam — sem erros estruturais                                                                            |
| `node -e "...parse JSON-LD blocks..."`                                                       | 7 blocos JSON-LD em 3 páginas, todos válidos (`AutoRepair`, `FAQPage`, `Blog`, `BreadcrumbList`, `BlogPosting`)            |
| `node -e "...check FAQ schema vs <details> count..."`                                        | 9 questions × 9 details no index; 3 × 3 no post — consistente                                                              |
| `node -e "...check reviewCount vs review[] vs testimonial-card count..."`                    | reviewCount=7, review.length=7, .testimonial-card=7 — consistente (mas vide A-02)                                          |
| `node -e "...WebP/JPG dimension parser..."`                                                  | logo_magnum_64.webp=128×74; logo_magnum_final.webp=1449×840 — alimenta M-05 e M-06                                         |
| `grep ... phone/email/CSP/headings`                                                          | telefone consistente, email consistente, CSP comparada lado-a-lado, hierarquia de heading capturada (alimenta M-03)        |
| `git log --oneline -- .github/workflows/`                                                    | confirmou que o flag `--ignore` está no workflow desde a criação                                                           |
| `npm view minisearch versions`                                                               | versão 6.3.0 do site vs 7.2.0 latest — alimenta B-04                                                                       |
| `npm audit` em projeto temp com `minisearch@6.3.0`                                           | 0 vulnerabilities                                                                                                          |
| `grep <use href="#..."> e <symbol id=>` por página                                           | confirmou que cada `<use>` resolve para `<symbol>` na mesma página                                                         |
| `grep -oE 'href="#..."' + 'id="..."` por página                                              | confirmou que todos os anchor links internos resolvem                                                                      |

## Apêndice B — Referências

1. **html-validate CLI documentation** — https://html-validate.org/usage/cli.html — usada em A-01 para confirmar que `--ignore` não é flag válida.
2. **linkinator README** — https://github.com/JustinBeckwith/linkinator#readme — usada em A-01 para entender comportamento de LOCATION como diretório e regex `--skip`.
3. **Google Search Central — Review snippet (structured data)** — https://developers.google.com/search/docs/appearance/structured-data/review-snippet — usada em A-02 para citar a política "self-serving reviews".
4. **Google Search Central — Sitemaps overview** — https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview — usada em A-03 para a regra "URLs in the sitemap must respond with 200".
5. **Google Search Central — Canonical URLs** — https://developers.google.com/search/docs/crawling-indexing/canonicalization — usada em A-03 sobre `rel=canonical` precisar apontar para URL real.
6. **WCAG 2.1 SC 1.3.1 — Info and Relationships** — https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html — usada em M-03 sobre hierarquia de headings.
7. **web.dev — heading-order audit** — https://web.dev/articles/heading-order — usada em M-03 sobre o que o Lighthouse a11y mede.
8. **WCAG 2.1 SC 3.2.3 — Consistent Navigation** — https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation.html — usada em M-02.
9. **LGPD — Lei 13.709/2018** — http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — usada em M-04.
10. **ANPD — Guia Orientativo sobre Cookies (2023)** — https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-cookies-anpd-versao-final.pdf — usada em M-04.
11. **Google — Consent Mode v2 implementation** — https://developers.google.com/tag-platform/security/guides/consent — referência de implementação em M-04.
12. **MDN — apple-touch-icon sizes** — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#sizes — usada em M-05 sobre 180×180.
13. **W3C — Web App Manifest spec** — https://www.w3.org/TR/appmanifest/#sizes-member e https://www.w3.org/TR/appmanifest/#purpose-member — usadas em M-06 sobre `sizes` e `purpose: maskable`.
14. **web.dev — Adaptive icons (maskable)** — https://web.dev/articles/maskable-icon — usada em M-06.
15. **Google Maps Embed API — Get Started** — https://developers.google.com/maps/documentation/embed/get-started — usada em M-07 sobre URL oficial.
16. **Google Maps deprecations history** — https://developers.google.com/maps/deprecations — base do argumento de fragilidade em M-07.
17. **MDN — `<form>` element default behavior** — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attributes — usada em M-08.
18. **CWE-598 — Information Exposure Through Query Strings** — https://cwe.mitre.org/data/definitions/598.html — usada em M-08.
19. **Google Web Fundamentals — Strict CSP** — https://web.dev/articles/strict-csp — usada em B-09.
20. **web.dev — Optimize Largest Contentful Paint** — https://web.dev/articles/optimize-lcp e https://web.dev/articles/lcp-lazy-loading — usadas em B-05.
21. **Anthropic API Pricing** — https://www.anthropic.com/pricing — usada em B-06.
22. **MiniSearch releases** — https://github.com/lucaong/minisearch/releases — usada em B-04.
23. **Formspree honeypot docs** — https://help.formspree.io/hc/en-us/articles/360013580813 — usada em B-08 para identificar `_gotcha` como nome conhecido.
24. **MDN — Content Security Policy** — https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP — base geral para B-01, B-03, B-09.
25. **Bootstrap docs — Scrollspy** — https://getbootstrap.com/docs/5.3/components/scrollspy/#how-it-works — referência de heurística para M-01.
26. **Nielsen Norman Group — Information Scent** — https://www.nngroup.com/articles/information-foraging/ — base de argumento para M-02.
27. **WHATWG URL spec — Fragment percent-encoding** — https://url.spec.whatwg.org/#fragment-percent-encode-set — usada em B-07.
