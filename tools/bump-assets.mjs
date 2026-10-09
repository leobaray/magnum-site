#!/usr/bin/env node
/**
 * bump-assets.mjs — invalida o cache dos assets versionados por querystring.
 *
 * POR QUE ISSO EXISTE
 * .htaccess serve .css/.js com `Cache-Control: public, max-age=31536000, immutable`.
 * O token `immutable` faz o browser NAO revalidar por um ano, nem com reload forcado.
 * A unica forma de entregar um asset novo e mudar a URL — ou seja, o `?v=`.
 * Sem bump, quem ja visitou o site continua vendo a versao antiga indefinidamente.
 *
 * ARMADILHAS QUE ESTE SCRIPT RESOLVE (todas reais neste repo)
 *  1. index.html referencia `css/style.css?v=` com caminho RELATIVO; todas as outras
 *     paginas usam `/css/style.css?v=` absoluto. Um find-and-replace por caminho
 *     pula justamente a home. Aqui casamos pela EXTENSAO, entao os dois formatos caem.
 *  2. js/blog-search.js:73 tem '/js/vendor/minisearch.min.js?v=...' hardcoded DENTRO
 *     do JS, invisivel para qualquer varredura que so olhe .html.
 *  3. manifest.webmanifest tem 2 refs de icone que ninguem lembra de atualizar.
 *  4. Ha duas familias de versao independentes (css/js e icones). Bumpar tudo junto
 *     forcaria re-download de icone a toa, por isso as classes sao separadas.
 *
 * USO
 *   node tools/bump-assets.mjs --check          # so relata, nao escreve (comece por aqui)
 *   node tools/bump-assets.mjs --apply          # bumpa css+js para a data de hoje
 *   node tools/bump-assets.mjs --apply icons    # bumpa so os icones
 *   node tools/bump-assets.mjs --apply css js icons
 *   node tools/bump-assets.mjs --apply --version 20260901
 *
 * Dev-only: nao precisa subir para a Hostinger.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const CLASSES = {
  css:   { label: 'CSS',    re: /(\.css)(\?v=)([\w.-]+)/g },
  js:    { label: 'JS',     re: /(\.js)(\?v=)([\w.-]+)/g },
  icons: { label: 'Icones', re: /(\.(?:ico|png|svg|webp))(\?v=)([\w.-]+)/g },
}

const SCAN_EXT = new Set(['.html', '.js', '.webmanifest'])
const SKIP_DIR = new Set(['node_modules', '.git', 'tools', 'assets'])

const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const CHECK = argv.includes('--check') || !APPLY
const vIdx = argv.indexOf('--version')
const chosen = argv.filter(a => a in CLASSES)
const CLASS_KEYS = chosen.length ? chosen : ['css', 'js']

function today() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.isDirectory()) continue
    if (entry.isDirectory()) {
      if (!SKIP_DIR.has(entry.name)) walk(path.join(dir, entry.name), out)
    } else if (SCAN_EXT.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

const files = walk(ROOT)
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/')

// ---- Levantamento -----------------------------------------------------------
const found = {}   // classe -> Map(versao -> [{file, asset}])
for (const key of Object.keys(CLASSES)) found[key] = new Map()

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  for (const [key, { re }] of Object.entries(CLASSES)) {
    for (const m of src.matchAll(new RegExp(re.source, 'g'))) {
      if (!found[key].has(m[3])) found[key].set(m[3], [])
      found[key].get(m[3]).push({ file: rel(file), asset: m[0] })
    }
  }
}

console.log(`\n  Raiz: ${ROOT}`)
console.log(`  ${files.length} arquivo(s) varrido(s) (.html, .js, .webmanifest)\n`)

let divergencia = false
for (const [key, { label }] of Object.entries(CLASSES)) {
  const versoes = [...found[key].keys()]
  const total = [...found[key].values()].reduce((n, a) => n + a.length, 0)
  const alvo = CLASS_KEYS.includes(key)
  const marca = alvo ? '>' : ' '
  if (!total) { console.log(`  ${marca} ${label.padEnd(7)} — nenhuma ref`); continue }
  console.log(`  ${marca} ${label.padEnd(7)} — ${total} ref(s), versao(oes): ${versoes.join(', ')}`)
  if (versoes.length > 1) {
    divergencia = true
    console.log(`      !! DIVERGENCIA: a mesma classe usa ${versoes.length} versoes diferentes.`)
    for (const [v, refs] of found[key]) {
      console.log(`         ${v}: ${refs.length} ref(s) — ex.: ${refs[0].file}`)
    }
  }
}

// ---- Fontes sem versao (divida conhecida) -----------------------------------
const fontesSemVersao = []
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  for (const m of src.matchAll(/[\w/.-]+\.woff2(\?v=[\w.-]+)?/g)) {
    if (!m[1]) fontesSemVersao.push({ file: rel(file), ref: m[0] })
  }
}
if (fontesSemVersao.length) {
  console.log(`\n  AVISO — ${fontesSemVersao.length} referencia(s) a .woff2 SEM querystring de versao.`)
  console.log(`  .htaccess serve font/woff2 com "access plus 1 year", entao elas sao praticamente`)
  console.log(`  impossiveis de atualizar. Corrigir exige adicionar ?v= em DOIS lugares ao mesmo tempo:`)
  console.log(`  o <link rel=preload> de cada pagina E o src:url() de css/fonts.css. Se as duas URLs`)
  console.log(`  divergirem, o preload deixa de casar e a fonte e baixada DUAS vezes. Decisao a parte;`)
  console.log(`  este script nao mexe nelas.`)
}

// ---- Aplicacao --------------------------------------------------------------
if (CHECK && !APPLY) {
  console.log(`\n  Modo --check: nada foi escrito.`)
  console.log(`  Para bumpar: node tools/bump-assets.mjs --apply ${CLASS_KEYS.join(' ')}\n`)
  process.exit(divergencia ? 1 : 0)
}

let NOVA = vIdx !== -1 ? argv[vIdx + 1] : today()

// Se a versao nova ja esta em uso na classe alvo, o bump NAO invalidaria nada.
const emUso = new Set(CLASS_KEYS.flatMap(k => [...found[k].keys()]))
if (emUso.has(NOVA)) {
  const base = NOVA
  let n = 2
  while (emUso.has(`${base}-${n}`)) n++
  NOVA = `${base}-${n}`
  console.log(`\n  ATENCAO: "${base}" ja esta em uso — bumpar para ela nao invalidaria cache nenhum.`)
  console.log(`  Usando "${NOVA}" no lugar.`)
}

console.log(`\n  Aplicando versao "${NOVA}" nas classes: ${CLASS_KEYS.join(', ')}\n`)

let totalTrocas = 0
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  let out = src, trocas = 0
  for (const key of CLASS_KEYS) {
    out = out.replace(new RegExp(CLASSES[key].re.source, 'g'), (full, ext, qs, ver) => {
      if (ver === NOVA) return full
      trocas++
      return `${ext}${qs}${NOVA}`
    })
  }
  if (trocas) {
    fs.writeFileSync(file, out, 'utf8')
    totalTrocas += trocas
    console.log(`  ${String(trocas).padStart(3)}x  ${rel(file)}`)
  }
}

console.log(`\n  ${totalTrocas} ref(s) atualizada(s) para ?v=${NOVA}.`)
console.log(`  Suba os .html, .webmanifest e js/blog-search.js junto com os assets alterados.\n`)
