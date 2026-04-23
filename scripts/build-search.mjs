#!/usr/bin/env node
/**
 * Build do indice de busca do blog.
 *
 * Uso:
 *   node scripts/build-search.mjs
 *
 * O que faz:
 *   1. Le blog/<slug>/index.html de todos os posts (exceto o /blog/index.html raiz)
 *   2. Extrai: title, excerpt, categoria, data, readTime, url, image, corpo
 *   3. Le sinonimos manuais de blog/<slug>/synonyms.json (opcional)
 *   4. Se a chave ANTHROPIC_API_KEY existir, gera sinonimos via Claude e mescla
 *   5. Escreve blog/search-index.json
 *
 * Para gerar sinonimos automaticos:
 *   $env:ANTHROPIC_API_KEY="sk-ant-..."   # Windows PowerShell
 *   node scripts/build-search.mjs
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'blog');
const OUTPUT = join(BLOG_DIR, 'search-index.json');

// -------- Helpers de HTML --------

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function pick(html, regex) {
  const m = html.match(regex);
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractPost(html, slug) {
  const title = pick(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    || pick(html, /<h1[^>]*class=["'][^"']*post-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim()
    || pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*\|\s*.*$/, '').trim();

  const excerpt = pick(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const category = pick(html, /<div\s+class=["']post-category["'][^>]*>[\s\S]*?([^<>]+?)\s*<\/div>/i)
    || pick(html, /<meta\s+property=["']article:section["']\s+content=["']([^"']+)["']/i);
  const date = pick(html, /<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i).slice(0, 10)
    || pick(html, /<time\s+datetime=["']([^"']+)["']/i).slice(0, 10);
  const image = pick(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

  const rt = html.match(/(\d+)\s*min\s+de\s+leitura|(\d+)\s*min</i);
  const readTime = rt ? Number(rt[1] || rt[2]) : null;

  const postContentMatch = html.match(/<div\s+class=["']post-content["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/article>/i)
    || html.match(/<article[^>]*class=["'][^"']*post["'][^>]*>([\s\S]*?)<\/article>/i);
  const body = postContentMatch ? stripTags(postContentMatch[1]) : stripTags(html);

  return {
    id: slug,
    slug,
    url: `/blog/${slug}/`,
    title,
    excerpt,
    category: category || 'Geral',
    date,
    readTime: readTime || undefined,
    image: image.replace(/^https?:\/\/[^/]+/, '') || undefined,
    body: body.slice(0, 6000) // cap para nao explodir o indice
  };
}

// -------- Sinonimos --------

async function loadManualSynonyms(postDir) {
  try {
    const raw = await readFile(join(postDir, 'synonyms.json'), 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(s => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

async function generateSynonymsWithClaude(post) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return [];
  const prompt = `Voce e especialista em SEO para um blog tecnico sobre conversor de torque e cambio automatico.

Dado este artigo:
Titulo: ${post.title}
Descricao: ${post.excerpt}
Corpo (primeiros 2000 chars): ${(post.body || '').slice(0, 2000)}

Gere uma lista JSON de 30 a 60 frases curtas (2-6 palavras cada) representando TODAS as formas que um leitor brasileiro comum buscaria por esse conteudo no Google. Inclua:
- linguagem coloquial ("carro tremendo", "patina quando acelero")
- termos tecnicos em portugues ("trepidacao lock-up", "patinagem conversor")
- termos tecnicos em ingles ("shudder", "slip", "tcc solenoid")
- codigos de erro OBD relevantes
- sinonimos de sintomas descritos no artigo
- perguntas naturais ("vale a pena retificar", "quanto custa")

Responda SOMENTE com JSON valido, array de strings, sem markdown.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    console.warn(`  [IA] falhou (${res.status}): ${await res.text()}`);
    return [];
  }
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  try {
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) return [];
    const arr = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return Array.isArray(arr) ? arr.filter(s => typeof s === 'string') : [];
  } catch (e) {
    console.warn(`  [IA] JSON invalido:`, e.message);
    return [];
  }
}

// -------- Main --------

async function main() {
  const entries = await readdir(BLOG_DIR, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const postDir = join(BLOG_DIR, slug);
    const indexPath = join(postDir, 'index.html');
    try { await stat(indexPath); } catch { continue; }

    const html = await readFile(indexPath, 'utf8');
    const post = extractPost(html, slug);

    const manual = await loadManualSynonyms(postDir);
    let ai = [];
    if (process.env.ANTHROPIC_API_KEY) {
      console.log(`  [IA] gerando sinonimos para ${slug}...`);
      ai = await generateSynonymsWithClaude(post);
    }
    const synonymSet = new Set([...manual, ...ai].map(s => s.trim()).filter(Boolean));
    post.synonyms = Array.from(synonymSet);

    posts.push(post);
    console.log(`  + ${slug}  (${post.synonyms.length} sinonimos)`);
  }

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const output = {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    posts
  };
  await writeFile(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
  const size = (await stat(OUTPUT)).size;
  console.log(`\nEscrito ${OUTPUT}  (${posts.length} posts, ${(size / 1024).toFixed(1)} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
