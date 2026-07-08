/**
 * Blog Search — MiniSearch client-side
 *
 * Estrategia:
 * - Input controla visibilidade dos cards ja renderizados (filtra no DOM, nao remonta)
 * - MiniSearch indexa title/excerpt/body/synonyms/category com boost e fuzzy
 * - Duas passadas: fuzzy=0.2 (precisa) -> se zero, fuzzy=0.4 (tolerante)
 * - Normalizacao de acentos nos dois lados
 * - Debounce 200ms, highlight do termo, empty state amigavel
 */
(function () {
  const input = document.getElementById('blog-search-input');
  if (!input) return;

  const clearBtn = document.getElementById('blog-search-clear');
  const listEl = document.getElementById('blog-list');
  const emptyEl = document.getElementById('blog-search-empty');
  const emptyQuery = document.getElementById('blog-search-empty-query');
  const hintEl = document.getElementById('blog-search-hint');
  const cards = listEl ? Array.from(listEl.querySelectorAll('[data-slug]')) : [];
  const cardBySlug = new Map(cards.map(c => [c.dataset.slug, c]));
  // Guarda HTML original de cada campo textual para poder desfazer highlight
  const cardOrig = new Map();
  cards.forEach(c => {
    cardOrig.set(c, {
      title: c.querySelector('.blog-list-card__title')?.innerHTML || '',
      excerpt: c.querySelector('.blog-list-card__excerpt')?.innerHTML || ''
    });
  });

  let mini = null;
  let indexPosts = [];
  let loadPromise = null;

  const stripAccents = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const norm = (s) => stripAccents(String(s || '').toLowerCase());

  function buildIndex(posts) {
    const MS = window.MiniSearch;
    if (!MS) throw new Error('MiniSearch nao carregado');
    const ms = new MS({
      idField: 'id',
      fields: ['title', 'excerpt', 'category', 'body', 'synonyms'],
      storeFields: ['id', 'slug', 'title', 'excerpt'],
      processTerm: (term) => norm(term),
      tokenize: (text) => norm(text).split(/[^a-z0-9]+/).filter(Boolean),
      searchOptions: {
        boost: { title: 3, synonyms: 2.5, excerpt: 1.5, category: 1.5, body: 1 },
        prefix: true,
        fuzzy: 0.2,
        combineWith: 'AND'
      }
    });
    ms.addAll(posts.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      body: p.body,
      synonyms: Array.isArray(p.synonyms) ? p.synonyms.join(' · ') : ''
    })));
    return ms;
  }

  function loadIndex() {
    if (loadPromise) return loadPromise;
    loadPromise = fetch('/blog/search-index.json', { cache: 'force-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        indexPosts = data.posts || [];
        mini = buildIndex(indexPosts);
        return mini;
      })
      .catch(err => {
        console.warn('[blog-search] falha ao carregar indice:', err);
        loadPromise = null; // permite retry
        throw err;
      });
    return loadPromise;
  }

  function search(query) {
    if (!mini) return [];
    let results = mini.search(query);
    if (results.length === 0) {
      // Fallback tolerante: typos maiores, mas AINDA exige que todos os termos tenham match
      // (evita que uma palavra qualquer puxe resultado irrelevante).
      results = mini.search(query, { fuzzy: 0.4, prefix: true, combineWith: 'AND' });
    }
    return results;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function highlight(text, terms) {
    if (!terms || terms.length === 0) return text;
    // Divide o texto em runs de caracteres preservando acentos originais;
    // matching e feito sobre a versao normalizada, mas reaplica no texto bruto
    const original = text;
    const normLower = norm(original);
    const sortedTerms = Array.from(new Set(terms.map(norm).filter(Boolean))).sort((a, b) => b.length - a.length);
    if (sortedTerms.length === 0) return text;
    const pattern = new RegExp('(' + sortedTerms.map(escapeRegex).join('|') + ')', 'g');
    // Percorre normalizado, registra spans, e reconstroi no bruto
    const marks = [];
    let m;
    while ((m = pattern.exec(normLower)) !== null) {
      marks.push({ start: m.index, end: m.index + m[0].length });
      if (m.index === pattern.lastIndex) pattern.lastIndex++;
    }
    if (marks.length === 0) return original;
    let out = '';
    let cursor = 0;
    for (const mk of marks) {
      out += escapeHtml(original.slice(cursor, mk.start));
      out += '<mark>' + escapeHtml(original.slice(mk.start, mk.end)) + '</mark>';
      cursor = mk.end;
    }
    out += escapeHtml(original.slice(cursor));
    return out;
  }

  function resetCards() {
    cards.forEach(c => {
      c.hidden = false;
      const orig = cardOrig.get(c);
      const t = c.querySelector('.blog-list-card__title');
      const e = c.querySelector('.blog-list-card__excerpt');
      if (t) t.innerHTML = orig.title;
      if (e) e.innerHTML = orig.excerpt;
    });
    if (emptyEl) emptyEl.hidden = true;
    if (hintEl) { hintEl.hidden = true; hintEl.textContent = ''; }
  }

  function applyResults(query, results) {
    const visibleSlugs = new Set(results.map(r => r.slug || r.id));
    let anyVisible = false;
    cards.forEach(c => {
      const show = visibleSlugs.has(c.dataset.slug);
      c.hidden = !show;
      if (show) anyVisible = true;
    });

    // Reordena visualmente pela relevancia
    if (anyVisible && listEl) {
      results.forEach(r => {
        const card = cardBySlug.get(r.slug || r.id);
        if (card) listEl.appendChild(card);
      });
    }

    // Highlight
    const terms = norm(query).split(/\s+/).filter(t => t.length >= 2);
    cards.forEach(c => {
      if (c.hidden) return;
      const orig = cardOrig.get(c);
      const t = c.querySelector('.blog-list-card__title');
      const e = c.querySelector('.blog-list-card__excerpt');
      if (t) t.innerHTML = highlight(stripHtml(orig.title), terms);
      if (e) e.innerHTML = highlight(stripHtml(orig.excerpt), terms);
    });

    if (emptyEl) {
      emptyEl.hidden = anyVisible;
      if (emptyQuery) emptyQuery.textContent = query;
    }
    if (hintEl) {
      if (anyVisible) {
        hintEl.hidden = false;
        const n = results.length;
        hintEl.textContent = `${n} artigo${n === 1 ? '' : 's'} encontrado${n === 1 ? '' : 's'}`;
      } else {
        hintEl.hidden = true;
      }
    }
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Debounce
  let debounceTimer = null;
  let lastTrackedSearch = '';
  function onInput() {
    const raw = input.value.trim();
    if (clearBtn) clearBtn.hidden = raw.length === 0;
    clearTimeout(debounceTimer);
    if (raw.length === 0) { resetCards(); return; }
    if (raw.length < 2) return; // evita buscar com 1 letra
    debounceTimer = setTimeout(async () => {
      try {
        await loadIndex();
        const results = search(raw);
        applyResults(raw, results);
        // Só rastreia termos "assentados" (>=3 chars) e não repetidos,
        // senão cada pausa de digitação infla a métrica de busca no GA.
        if (typeof window.gtag === 'function' && raw.length >= 3 && raw !== lastTrackedSearch) {
          lastTrackedSearch = raw;
          window.gtag('event', 'search', { search_term: raw, results: results.length });
        }
      } catch (_) {
        // Se indice nao carregar, nao quebra a pagina
        resetCards();
      }
    }, 200);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; onInput(); input.blur(); }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => { input.value = ''; input.focus(); onInput(); });
  }

  // Pre-carrega no primeiro focus para ter indice pronto ao digitar
  input.addEventListener('focus', () => { loadIndex().catch(() => {}); }, { once: true });

  // Suporte a /blog/?q=termo (usado pelo SearchAction do schema WebSite)
  try {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { input.value = q; onInput(); }
  } catch (_) {}
})();
