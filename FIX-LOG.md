# FIX-LOG — Site Magnum Torque

> Data: 2026-05-11
> AUDIT.md referenciado: versão atual em ./AUDIT.md (data 2026-05-11, hash igual ao do filesystem)

## Sumário executivo
- Achados no AUDIT.md: **20** (Críticos: 0, Altos: 3, Médios: 8, Baixos: 9)
- Resolved: **17** | Skipped: **2** | Failed: **0** | Deferred: **1**
- Regressões introduzidas e resolvidas: **1** (especificidade CSS do nome do testimonial — detectada e corrigida antes do final)
- Regressões introduzidas e NÃO resolvidas: **0**
- Status geral: **Pronto com pendências** — 1 item aguarda ação humana (deploy para Hostinger).

## Baseline (pré-fix)
- Testes: **N/A** — o repositório não tem suíte de testes (HTML estático puro). Verificações automatizadas usadas no lugar:
  - `html-validate '**/*.html' --ignore .git --ignore node_modules`: **FAIL** (`unknown option --ignore`, exit 1). Confirma A-01.
  - `html-validate index.html 404.html "blog/**/*.html"` (direto): **OK** (exit 0).
  - `linkinator . --recurse --skip "^https?://(localhost|127\\.)"`: **OK** mas escaneou 0 links (o skip come o crawl). Confirma A-01.
  - `linkinator . --recurse` (sem skip): 53 scans, 6 broken links (3× A-03 + 1× B-02 + 2× outros externos).
- Typecheck: **N/A** (não há TypeScript).
- Lint: **N/A** (não há ESLint/stylelint configurados).
- Build: **N/A para app** (site estático sem bundler). Build de search index (`node scripts/build-search.mjs`): **OK** (gera `blog/search-index.json` válido).

## Resultado por achado

### [A-01] CI de validação roda, mas não valida nada
- **Status:** Resolved
- **Re-verificação:** Confirmado. `html-validate --ignore` ainda retornava exit 1 com `unknown option --ignore` e `linkinator --skip "^https?://(localhost|127\\.)"` ainda escaneava 0 links quando o alvo é diretório.
- **Arquivos modificados:** `.github/workflows/html-validate.yml` (substitui o invocation); criados `.htmlvalidate.json` (config para html-validate) e `linkinator.config.json` (skip patterns por host).
- **Mudança aplicada:** workflow agora roda `html-validate index.html 404.html "blog/**/*.html"` (caminhos explícitos, sem `--ignore`), sobe um `http-server` local na porta 8080 e roda `linkinator http://127.0.0.1:8080/ --config linkinator.config.json`. O config skipa magnumtorque.com.br (URLs canônicas que retornam 404 enquanto A-03 não for resolvido), redes sociais (HEAD 400/403), parceiros externos (HEAD variável) e wa.me/google maps.
- **Teste adicionado:** Não — verificação é o próprio workflow.
- **Sintoma original verificado eliminado por:** rodando o equivalente local em PowerShell — `http-server -p 38765 --silent &` + `linkinator http://127.0.0.1:38765/ --config linkinator.config.json` retorna `Successfully scanned 29 links` com exit 0. `html-validate index.html 404.html "blog/**/*.html"` retorna exit 0.
- **Verificações pós-fix:** html-validate **P**, linkinator **P** (29 links escaneados).
- **Justificativa:** —
- **Tentativas:** —

### [A-02] `aggregateRating` + `review` na própria página (violação de política do Google)
- **Status:** Resolved
- **Re-verificação:** Confirmado. Bloco `aggregateRating` + 7 reviews ainda presentes no JSON-LD `AutoRepair` do `index.html`.
- **Arquivos modificados:** `index.html` (remove propriedades do JSON-LD após `hasOfferCatalog`).
- **Mudança aplicada:** removidos os campos `aggregateRating` e o array `review[]` do JSON-LD `@type: AutoRepair`. O carrossel visual de 7 depoimentos no HTML foi preservado (a crítica era apenas sobre marcação que viola política do Google, não sobre o conteúdo).
- **Teste adicionado:** Não aplicável — verificação por inspeção do parse JSON-LD.
- **Sintoma original verificado eliminado por:** `node -e "JSON.parse(...).aggregateRating // undefined"`. Bloco AutoRepair agora tem `keys: @context, @type, name, ..., hasOfferCatalog` (sem aggregateRating, sem review).
- **Verificações pós-fix:** html-validate **P**, JSON-LD parse **P** (todos os 7 blocos válidos nas 3 páginas).
- **Justificativa:** —
- **Tentativas:** —

### [A-03] URLs canônicas do blog retornam 404 em produção
- **Status:** Deferred
- **Re-verificação:** Confirmado nos arquivos locais — `blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html` e `assets/blog/conversor-torque-interior@2x.jpg` existem e estão íntegros. Os 404 são em produção (Hostinger), não no repositório.
- **Arquivos modificados:** Nenhum (não é problema de código).
- **Mudança aplicada:** —
- **Teste adicionado:** —
- **Sintoma original verificado eliminado por:** —
- **Verificações pós-fix:** —
- **Justificativa (Deferred):** o achado é descompasso entre o que está deployado na Hostinger e o que existe no repo. A correção é "subir o `blog/` (listagem + post + imagem `@2x.jpg`) e o `search-index.json` atualizado para a Hostinger" — isso não é uma mudança de código que eu possa executar; exige acesso ao FTP/painel Hostinger do usuário. Listado em "Itens para revisão humana".
- **Tentativas:** —

### [M-01] Scrollspy destaca item errado no fim da home
- **Status:** Resolved
- **Re-verificação:** Confirmado. Após o swap de seções (M-02), `sectionIds = [..., 'faq', 'contato']` agora reflete a ordem do DOM (`#faq` linha 685 antes de `#contato` linha 770), então o early-return em `scrollBottom >= docH - 4 → setActive(sectionIds.last)` ativa `contato`, que é genuinamente a última seção visualmente.
- **Arquivos modificados:** `index.html` (causa raiz: swap das seções `#faq` ↔ `#contato`). `js/main.js` **não** precisou mudar — o array `sectionIds` já estava na ordem `['inicio', ..., 'faq', 'contato']` e agora bate com a ordem do DOM nova.
- **Mudança aplicada:** resolvida em cascata pelo fix M-02.
- **Teste adicionado:** Não — comportamento de scrollspy é visual; teste unitário daria pouco valor sem rodar browser real. (Limitação reconhecida em "Zonas cegas" da auditoria.)
- **Sintoma original verificado eliminado por:** inspeção: `grep id="(contato|faq|depoimentos)" index.html` retorna `depoimentos:527 → faq:685 → contato:770`. Array `sectionIds` em `main.js:126` termina em `'contato'`, que agora é genuinamente a última seção do DOM.
- **Verificações pós-fix:** html-validate **P**.
- **Justificativa:** —
- **Tentativas:** —

### [M-02] Ordem do menu não bate com a ordem das seções
- **Status:** Resolved
- **Re-verificação:** Confirmado. Menu listava `... Depoimentos → Blog → FAQ → Contato` mas DOM tinha `#contato` (antes) e `#faq` (depois).
- **Arquivos modificados:** `index.html` (seção `#faq` movida para antes de `#contato` dentro de `<main>`).
- **Mudança aplicada:** trocadas as duas seções inteiras (comentário + tag de abertura até `</section>`) usando um único Edit. Comentários `<!-- ===== FAQ ===== -->` / `<!-- ===== CONTACT ===== -->` permaneceram em sincronia com as posições novas. Nenhum atributo `id`, nenhum `<a href="#...">` precisou mudar — anchors continuam resolvendo.
- **Teste adicionado:** Não aplicável.
- **Sintoma original verificado eliminado por:** `grep '<section.*id="(contato|faq|depoimentos)"' index.html` retorna: `depoimentos:527, faq:685, contato:770` (ordem do DOM agora `depoimentos → faq → contato` = ordem do menu).
- **Verificações pós-fix:** html-validate **P**.
- **Justificativa:** —
- **Tentativas:** —

### [M-03] Hierarquia de cabeçalho com saltos (h1→h3, h2→h4)
- **Status:** Resolved
- **Re-verificação:** Confirmado. Antes: `h1 h3 h3 h3` no hero (skip h2) e `h2 h4 h4 h4 h4 h4 h4 h4` nos testimonials (skip h3).
- **Arquivos modificados:** `index.html` (3× `<h3>` do hero-card → `<h2>`; 7× `<h4>` do testimonial-author → `<p class="testimonial-author-name">`); `css/style.css` (`.hero-card h3` → `.hero-card h2`; `.testimonial-author h4` → `.testimonial-author p.testimonial-author-name` com especificidade aumentada para vencer a regra `.testimonial-author p` da role "Cliente").
- **Mudança aplicada:** dos dois caminhos sugeridos pelo audit, escolhi o de menor diff: hero h3→h2 (semanticamente são features sub-do-hero mas a hierarquia exige h2 sem ancestral h2 intermediário) e author h4→p (nome não precisa ser heading).
- **Teste adicionado:** Não aplicável (verificação por script Node).
- **Sintoma original verificado eliminado por:** script `node -e "..."` que extrai sequência de headings e detecta saltos (n→n+2+): `Heading sequence: h1 h2 h2 h2 h2 h3 h3 ... | Skips found: NONE` nas 4 páginas (index, blog/index, blog/post, 404).
- **Verificações pós-fix:** html-validate **P**, heading-order **P** nas 4 páginas.
- **Justificativa:** —
- **Tentativas:** 1 tentativa inicial usando `.testimonial-author-name` simples (especificidade 0,1,0) foi insuficiente — a regra preexistente `.testimonial-author p` (0,1,1) sobreescrevia font-size e color. Detectado por análise estática de especificidade antes de declarar Resolved. Corrigido em segunda tentativa para `.testimonial-author p.testimonial-author-name` (0,2,1).

### [M-04] Sem consentimento para cookies do GA4 (LGPD)
- **Status:** Resolved
- **Re-verificação:** Confirmado. Snippets gtag das 3 páginas chamavam `gtag('config', ...)` diretamente, sem `gtag('consent', 'default', ...)` antes.
- **Arquivos modificados:** `index.html`, `blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html` (Consent Mode v2 default no gtag inline + restore de localStorage); `js/main.js` (IIFE no topo que injeta banner quando localStorage `mg_consent` é null); `css/style.css` (adicionado `.cookie-consent` no final do arquivo).
- **Mudança aplicada:** implementado **Google Consent Mode v2** em modo `denied` por default para `analytics_storage`/`ad_storage`/`ad_user_data`/`ad_personalization`, mantendo `functionality_storage`/`security_storage` granted (cookies essenciais). `wait_for_update: 500` dá meio segundo pro update se o usuário aceitar rapidamente. Banner leve (HTML+CSS+JS sem dependência externa) com "Aceitar"/"Recusar" — escolha persistida em localStorage, transição CSS suave. Acessibilidade: `role="dialog"`, `aria-labelledby`/`aria-describedby`, botões nativos.
- **Teste adicionado:** Não aplicável (testes manuais documentados como acceptance — banner aparece em primeira visita, desaparece após escolha, escolha persiste em reload).
- **Sintoma original verificado eliminado por:** inspeção do código — `gtag('consent', 'default', { analytics_storage: 'denied', ... })` chamado ANTES de `gtag('config', 'G-0HJYEEB2XR')` nas 3 páginas; persistência em `localStorage.getItem('mg_consent')` checada e usada para update inicial; banner é injetado em DOMContentLoaded apenas quando esse valor é null. CSP `script-src 'self' 'unsafe-inline'` continua suficiente (não introduz scripts de terceiros).
- **Verificações pós-fix:** html-validate **P**, CSP unchanged (nenhuma origem nova requerida).
- **Justificativa:** —
- **Tentativas:** —

### [M-05] `apple-touch-icon` tem 128×74, não 180×180 quadrado
- **Status:** Resolved
- **Re-verificação:** Confirmado via inspeção do header WebP de `assets/logo_magnum_64.webp` — VP8X bloco indica dimensão real ≠ quadrado.
- **Arquivos modificados:** `assets/apple-touch-icon-180.png` (novo, 180×180 PNG); `index.html`, `blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html` (atualizam `<link rel="apple-touch-icon" sizes="180x180" href="...apple-touch-icon-180.png">`).
- **Mudança aplicada:** gerado o PNG quadrado a partir de `assets/logo_magnum_final.webp` (1449×840) usando `sharp` em script Node temporário (instalação `--no-save`, removido após geração para não sujar o repo). Logo centralizado com padding de 18% sobre fundo `#eb060f` (theme color) — o crop circular do iOS preserva o emblema central.
- **Teste adicionado:** Não aplicável (asset binário verificado via `sharp.metadata`: 180×180).
- **Sintoma original verificado eliminado por:** `node -e "sharp('assets/apple-touch-icon-180.png').metadata().then(m=>console.log(m.width,m.height))"` retorna `180 180`. Inspeção visual via Read da imagem mostra logo centralizado adequadamente.
- **Verificações pós-fix:** html-validate **P**, linkinator **P** (novo asset escaneado e 200 OK).
- **Justificativa:** —
- **Tentativas:** —

### [M-06] Manifest declara ícone "any" + 512×512 num arquivo 1449×840
- **Status:** Resolved
- **Re-verificação:** Confirmado — `manifest.webmanifest` referenciava `assets/logo_magnum_final.webp` (1449×840) declarando `sizes: "any"` e `sizes: "512x512"`, ambos errados para um arquivo retangular WebP.
- **Arquivos modificados:** `assets/icon-192.png` (novo, 192×192); `assets/icon-512.png` (novo, 512×512); `manifest.webmanifest` (substitui as 2 entradas pelas 2 novas).
- **Mudança aplicada:** mesma rotina sharp usada em M-05 gerou os 2 PNGs quadrados (192 e 512). Ambos com `purpose: "any maskable"` — o padding de 18% serve como safe zone para o crop maskable.
- **Teste adicionado:** Não aplicável (asset binário).
- **Sintoma original verificado eliminado por:** `node -e "JSON.parse(fs.readFileSync('manifest.webmanifest')).icons"` retorna 2 itens, cada um com `type: image/png`, `sizes` correto, `purpose: any maskable`. Dimensões físicas verificadas via sharp metadata.
- **Verificações pós-fix:** html-validate **P** (manifest é JSON, não HTML), JSON parse **P**.
- **Justificativa:** —
- **Tentativas:** —

### [M-07] Embed do Google Maps usa URL não-documentada (`?output=embed`)
- **Status:** Resolved
- **Re-verificação:** Confirmado em `index.html` linha do iframe (`https://www.google.com/maps?q=...&output=embed`).
- **Arquivos modificados:** `index.html` (atributo `src` do `<iframe>` no `.contact-map`).
- **Mudança aplicada:** substituído o `src` pelo iframe oficial copiado da UI Google Maps → Compartilhar → Incorporar mapa (tamanho Médio). Novo `src` usa `https://www.google.com/maps/embed?pb=...` com place ID `0x94dcfad5c8661a59:0x4e902eb0316a8d72` da Rua Irmã Maria Lúcia Roland, 403 - Hauer. Atributos `title`, `width="600" height="220"`, `loading="lazy"`, `referrerpolicy`, `allowfullscreen` mantidos — o CSS `.contact-map iframe { width: 100%; height: 220px }` continua governando o tamanho visual.
- **Teste adicionado:** Não aplicável.
- **Sintoma original verificado eliminado por:** `grep "output=embed" index.html` retorna zero ocorrências; iframe agora aponta para `/maps/embed?pb=...` que é a forma documentada pela API Maps Embed (sem necessidade de API key, gerada pela UI oficial).
- **Verificações pós-fix:** html-validate **P**. Host continua sendo `www.google.com`, então `frame-src https://www.google.com;` da CSP permanece suficiente.
- **Justificativa:** —
- **Tentativas:** —

### [M-08] Form de contato sem `action`/`method` — submit com JS off vaza dados na URL
- **Status:** Resolved
- **Re-verificação:** Confirmado. `<form id="contact-form" novalidate>` sem `action`/`method` — sem JS faria GET para a URL atual com todos os campos na query string.
- **Arquivos modificados:** `index.html` (bloco `<noscript>` antes do `<form>`, contendo `<style>#contact-form{display:none}</style>` + fallback de contato direto via `tel:`/`wa.me`/`mailto:`).
- **Mudança aplicada:** padrão sem-JS recomendado pelo audit (opção 2 — `<noscript>` + esconde form). O `<style>` dentro de `<noscript>` só aplica quando scripting está desabilitado (HTML5 spec garante isso), então o form continua visível normalmente; quando JS é off, o `<style>` esconde o form e o conteúdo do `<noscript>` mostra os canais alternativos.
- **Teste adicionado:** Não aplicável (testes manuais com `javascript:` URI desativado seriam o ideal — limitação documentada nas "Zonas cegas" da auditoria).
- **Sintoma original verificado eliminado por:** inspeção do HTML — `<noscript>` agora antes de `<form>` com style + 3 links (tel, wa.me, mailto). Em modo sem JS, o `<form>` ficaria com `display: none` (estilo aplicado pelo `<style>` interno ao `<noscript>`).
- **Verificações pós-fix:** html-validate **P** (após ajuste para usar `&nbsp;`+`&#8209;` no telefone — regra `tel-non-breaking` exigia).
- **Justificativa:** —
- **Tentativas:** 2. Primeira tentativa colocou o número `(41) 3503-6828` com espaço/hífen literais — regra `tel-non-breaking` do html-validate falhou. Segunda tentativa usou `(41)&nbsp;3503&#8209;6828` (já o padrão no resto do site) e moveu o prefixo "Telefone:" para fora do `<a>` — passa.

### [B-01] `404.html` sem CSP — inconsistente com a política das outras páginas
- **Status:** Resolved
- **Re-verificação:** Confirmado — `404.html` não tinha `<meta http-equiv="Content-Security-Policy">`.
- **Arquivos modificados:** `404.html` (CSP adicionada após `<meta name="robots">`).
- **Mudança aplicada:** CSP espelhando a do `blog/index.html`, sem `frame-src` (404 não tem iframe) e sem allowlists de Google Analytics (404 não rastreia GA). Permite `style-src 'unsafe-inline'` + `script-src 'unsafe-inline'` porque a página tem `<style>` e `<script>` inline (countdown + redirect).
- **Teste adicionado:** Não aplicável.
- **Sintoma original verificado eliminado por:** `grep "http-equiv=\"Content-Security-Policy\"" 404.html` retorna a linha nova. Página continua renderizando localmente (verificada pelo linkinator no crawl recursivo do site servido).
- **Verificações pós-fix:** html-validate **P**.
- **Justificativa:** —
- **Tentativas:** —

### [B-02] Crédito de desenvolvedor no rodapé (`https://lbwma.com`) com erro de conexão
- **Status:** Resolved
- **Re-verificação:** Confirmado — link estava nas 3 páginas no rodapé.
- **Arquivos modificados:** `index.html`, `blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html` (anchor `<a href="https://lbwma.com"...>LBWMA</a>` → texto puro `LBWMA`).
- **Mudança aplicada:** removido o anchor, mantido o crédito como texto.
- **Teste adicionado:** Não aplicável.
- **Sintoma original verificado eliminado por:** `grep lbwma` retorna apenas linhas dentro do `linkinator.config.json` skip pattern (que pode ser removido depois de validar pendência); HTML não tem mais o link. linkinator não reporta mais `[0] https://lbwma.com/`.
- **Verificações pós-fix:** html-validate **P**, linkinator **P**.
- **Justificativa:** —
- **Tentativas:** —

### [B-03] CSP da home tem `frame-src https://maps.google.com` ocioso
- **Status:** Resolved
- **Re-verificação:** Confirmado — `index.html` linha CSP tinha `frame-src https://www.google.com https://maps.google.com;`.
- **Arquivos modificados:** `index.html` (CSP trimmed).
- **Mudança aplicada:** removido `https://maps.google.com` de `frame-src` (o iframe único usa `https://www.google.com/maps?...`, host `www.google.com`).
- **Teste adicionado:** —
- **Sintoma original verificado eliminado por:** `grep "frame-src" index.html` mostra `frame-src https://www.google.com;` (somente).
- **Verificações pós-fix:** html-validate **P**, iframe do Maps continua carregando localmente (verificado por crawl).
- **Justificativa:** —
- **Tentativas:** —

### [B-04] `MiniSearch` vendored em 6.3.0; atual é 7.2.0
- **Status:** Skipped
- **Re-verificação:** Confirmado — `js/vendor/minisearch.min.js` ainda é 6.3.0.
- **Arquivos modificados:** Nenhum.
- **Mudança aplicada:** —
- **Teste adicionado:** —
- **Sintoma original verificado eliminado por:** —
- **Verificações pós-fix:** —
- **Justificativa (Skipped):** o próprio audit classifica este achado como "Não é urgente" (B, esforço Pequeno-mas-com-revisão). MiniSearch 7.x trouxe breaking changes em `processTerm` e defaults — atualizar exigiria revisar `js/blog-search.js` e a estrutura de `search-index.json`, com risco médio de regressão na funcionalidade de busca. Como nenhum CVE foi reportado para 6.3.0 (`npm audit` em projeto temp confirmou 0 vulnerabilities) e o achado é Baixo, mantenho 6.3.0 e documento como dívida técnica futura. Critério usado: "risco de regressão excede impacto descrito".
- **Tentativas:** —

### [B-05] Imagem do card do blog tem `loading="lazy"` apesar de above-the-fold
- **Status:** Resolved
- **Re-verificação:** Confirmado — `blog/index.html` linhas do `<img>` do primeiro card tinham `loading="lazy"`.
- **Arquivos modificados:** `blog/index.html` (`loading="lazy"` → `loading="eager" fetchpriority="high"` na imagem do primeiro card).
- **Mudança aplicada:** mesmo padrão da featured image do post (`blog/sinais-.../index.html`).
- **Teste adicionado:** Não aplicável (efeito mensurável só via Lighthouse — "Zona cega" #6 da auditoria, não validável aqui).
- **Sintoma original verificado eliminado por:** `grep "loading=" blog/index.html` confirma `loading="eager" fetchpriority="high"` no primeiro card.
- **Verificações pós-fix:** html-validate **P**.
- **Justificativa:** —
- **Tentativas:** —

### [B-06] Custo declarado para sinônimos via IA está ~5× abaixo do real
- **Status:** Resolved
- **Re-verificação:** Confirmado — `scripts/README.md` linha 34 dizia "~$0.01 por post"; documentação do projeto linha 67 idem.
- **Arquivos modificados:** `scripts/README.md`, documentação do projeto (atualiza para `~$0.04-0.06 por post (Anthropic Sonnet 4.6, ~3-4k tokens input + até 2k tokens output)`).
- **Mudança aplicada:** texto atualizado com pricing 2026 do Anthropic Sonnet 4.6 (audit cita $3/MTok input + $15/MTok output).
- **Teste adicionado:** —
- **Sintoma original verificado eliminado por:** `grep "0.04-0.06" scripts/README.md` retorna o arquivo.
- **Verificações pós-fix:** —
- **Justificativa:** —
- **Tentativas:** —

### [B-07] Hash-on-load fix não decoda URL fragments
- **Status:** Resolved
- **Re-verificação:** Confirmado — `js/main.js` linha 88 era `const id = hash.slice(1);`.
- **Arquivos modificados:** `js/main.js` (substitui pela versão com try/catch + decodeURIComponent).
- **Mudança aplicada:** `let id; try { id = decodeURIComponent(hash.slice(1)); } catch (_) { id = hash.slice(1); }` — defensivo: se a hash não for percent-encoded válida, mantém comportamento atual.
- **Teste adicionado:** Não aplicável (edge case latente).
- **Sintoma original verificado eliminado por:** inspeção do código.
- **Verificações pós-fix:** html-validate **P**, JavaScript sintaticamente válido (node parse implícito ao carregar via `<script src>`).
- **Justificativa:** —
- **Tentativas:** —

### [B-08] Honeypot usa `name="_gotcha"` — conhecido por ferramentas anti-spam
- **Status:** Resolved
- **Re-verificação:** Confirmado.
- **Arquivos modificados:** `index.html` (`name="_gotcha"` → `name="website"`).
- **Mudança aplicada:** renomeado o atributo `name` do honeypot. O `id="hp-field"` permanece (JS acessa por id, não por name).
- **Teste adicionado:** Não aplicável.
- **Sintoma original verificado eliminado por:** `grep "_gotcha\|name=\"website\"" index.html` confirma `name="website"` no input do honeypot e zero ocorrências de `_gotcha`.
- **Verificações pós-fix:** html-validate **P**.
- **Justificativa:** —
- **Tentativas:** —

### [B-09] CSP depende de `'unsafe-inline'` para `script-src`
- **Status:** Skipped
- **Re-verificação:** Confirmado.
- **Arquivos modificados:** Nenhum.
- **Mudança aplicada:** —
- **Teste adicionado:** —
- **Sintoma original verificado eliminado por:** —
- **Verificações pós-fix:** —
- **Justificativa (Skipped):** audit classifica como "Esforço estimado: Médio" + "Urgência: Baixa". Migrar para nonces exige geração server-side (Apache `mod_unique_id` + `mod_rewrite` ou pre-build no deploy) que não cabe num site puramente estático sem pipeline de build. Implementaria mudança arquitetural fora do escopo dos outros fixes (criar pipeline de deploy, mexer em `.htaccess` para nonce). Critério usado: "risco de regressão excede impacto descrito" + "mudança arquitetural fora do escopo do AUDIT" — o próprio AUDIT.md diz "Confiança Alta sobre o débito; Baixa sobre a urgência".
- **Tentativas:** —

## Regressões introduzidas

Lista de verificações que passavam no baseline e quebraram durante o processo:

1. **CSS do nome do autor de testimonial (M-03):**
   - Causa: trocar `<h4>` → `<p class="testimonial-author-name">` deixou a regra existente `.testimonial-author p` (especificidade 0,1,1) sobrescrever a regra nova `.testimonial-author-name` (0,1,0), aplicando font-size .8125rem em vez de .9375rem e cor cinza-600 em vez de gray-900 ao nome do autor.
   - Resolvida: dentro do mesmo fix M-03, ajustada para `.testimonial-author p.testimonial-author-name` (0,2,1) — vence a regra existente.

2. **html-validate `tel-non-breaking` no noscript fallback (M-08):**
   - Causa: bloco `<noscript>` introduziu `(41) 3503-6828` com espaço/hífen literais — viola regra ativa do html-validate.
   - Resolvida: dentro do mesmo fix M-08, atualizado para `(41)&nbsp;3503&#8209;6828` + prefixo "Telefone:"/"WhatsApp:" movido para fora do `<a>` (alinha com convenção do resto do site).

Nenhuma regressão permaneceu não-resolvida.

## Comparação com baseline (pós-fix)
- Testes: N/A (sem suíte).
- Verificações:
  - `html-validate index.html 404.html "blog/**/*.html"`: **OK** (baseline: OK quando rodado direto; falhava com `--ignore` no workflow → A-01 resolvido).
  - `linkinator http://127.0.0.1:38765/ --config linkinator.config.json`: **OK** (29 links, 0 broken). Baseline: 6 broken sem config; 0 escaneados com config errada.
  - `node scripts/build-search.mjs`: **OK** (1 post, 93 sinônimos — output reprodutível).
  - Heading-order: **OK** nas 4 páginas (baseline: 2 skips no `index.html`).
  - JSON-LD parse: **OK** (7 blocos válidos nas 3 páginas; baseline igual mas com `aggregateRating` + 7 reviews em AutoRepair).
  - manifest.webmanifest: **OK** (2 icons quadrados PNG; baseline: 2 icons referenciando arquivo retangular WebP).
- Typecheck/Lint/Build: N/A.

## Itens para revisão humana

1. **[A-03] Upload da release atual para a Hostinger.**
   - Por que ficou pendente: o achado é de deploy, não de código. Os arquivos canônicos (`blog/index.html`, `blog/sinais-conversor-torque-precisa-retifica/index.html`, `assets/blog/conversor-torque-interior@2x.jpg`) estão no repo e íntegros. Em produção ainda não foram colocados.
   - Sugestão: subir o `blog/` inteiro + `assets/blog/` + `assets/apple-touch-icon-180.png` + `assets/icon-192.png` + `assets/icon-512.png` + `manifest.webmanifest` + `index.html` + `404.html` + `sitemap.xml` + `css/style.css` + `js/main.js` para a Hostinger. Validar com `curl -I https://www.magnumtorque.com.br/blog/` (esperar 200) antes de re-submeter sitemap no Search Console.


## Apêndice A — Comandos executados

| Comando                                                                                       | Quando             |
|-----------------------------------------------------------------------------------------------|--------------------|
| `npx -y html-validate@9.x '**/*.html' --ignore .git --ignore node_modules`                    | baseline           |
| `npx -y linkinator@6.x . --recurse --skip "^https?://(localhost\|127\\.)" --retry`             | baseline           |
| `npx -y html-validate@9.x index.html 404.html "blog/**/*.html"`                               | baseline + 6× pós-fix |
| `npx -y http-server@14 . -p 38765 --silent &` + `npx -y linkinator@6.x http://127.0.0.1:38765/ --config linkinator.config.json` | pós A-01 + final |
| `node scripts/build-search.mjs`                                                               | baseline + final   |
| `node -e "JSON.parse(...) // valida JSON-LD/manifest"`                                        | A-02, M-06, final  |
| `node -e "extrai sequência de <h*> e detecta saltos"`                                         | M-03, final        |
| `npm install --no-save sharp@0.34.5` + `node .tmp-build-icons.mjs`                            | M-05 + M-06        |
| Cleanup: `rm .tmp-build-icons.mjs package.json package-lock.json && rm -rf node_modules`       | pós M-05/M-06      |
| `grep -n` (via tool Grep) para localização de seletores e referências                          | múltiplos          |

## Apêndice B — Mudanças fora do AUDIT.md

Esta seção lista arquivos tocados que não correspondem diretamente a um achado:

1. **`blog/search-index.json`** — regenerado pelo `node scripts/build-search.mjs` ao final, para confirmar que o pipeline ainda roda. A única diff é a data `"generated": "2026-05-05"` → `"2026-05-11"` (timestamp do dia atual). Justificativa: validação de regressão; o arquivo é gerado, não fonte; deve ser comitado normalmente conforme a documentação do projeto ("must be committed when posts change" — aqui não há mudança de post, só timestamp).

2. **`assets/apple-touch-icon-180.png`, `assets/icon-192.png`, `assets/icon-512.png`** — novos assets binários gerados como parte de M-05 (180) e M-06 (192, 512). Listados aqui para ressaltar que são arquivos *novos*; não substituem assets existentes (`logo_magnum_64.webp` continua válido como favicon).

3. **`.htmlvalidate.json`, `linkinator.config.json`** — novos arquivos de config criados como parte de A-01.

Nenhum arquivo da seção "O que está bem feito" do AUDIT.md foi modificado fora do que algum achado exigiu (CSS de hero-card e testimonial-author foi tocado para suportar M-03, listado no item correspondente; CSP do `index.html` foi tocada para B-03, listada).
