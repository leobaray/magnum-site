#!/usr/bin/env python3
"""
Verificador de posicionamento do magnumtorque.com.br em buscadores.

USO (sempre idêntico, para os resultados serem comparáveis entre rodadas):
    python3 seo/rank-check.py            # roda tudo e salva seo/rank-YYYY-MM-DD.json
    python3 seo/rank-check.py --print    # também imprime a tabela em markdown

METODOLOGIA (não alterar entre rodadas, senão a comparação perde validade):
  - Lista FIXA de consultas em QUERIES (adicionar novas só no FIM da lista,
    nunca remover/editar as existentes).
  - 3 buscadores, sem login/cookies, sem personalização:
      * DuckDuckGo HTML (html.duckduckgo.com, região br-pt) — espelha índice Bing
      * Bing (bing.com, cc=br, mercado pt-BR)
      * Google (google.com, hl=pt-BR&gl=BR&num=20) — frequentemente bloqueia
        requisições automatizadas; quando bloquear, a posição fica "BLOQ" e a
        comparação Google deve ser feita no Search Console (Desempenho>Consultas).
  - Posição = índice (1-based) do primeiro resultado ORGÂNICO cujo domínio
    contém "magnumtorque.com.br", dentro dos ~20 primeiros resultados.
    ">20" = não encontrado entre os coletados.
  - Pausa de 3s entre requisições (educação com os buscadores).
  - Saída: seo/rank-<data>.json com posições + URLs encontradas.

Comparar duas rodadas:
    python3 seo/rank-check.py --compare seo/rank-2026-07-08.json seo/rank-2026-07-13.json
"""
import json, re, sys, time, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

DOMAIN = "magnumtorque.com.br"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

QUERIES = [
    # — marca / cabeça (home) —
    "magnum torque",
    "retifica de conversor de torque",
    "retifica de conversor de torque curitiba",
    "conversor de torque curitiba",
    "recondicionamento de conversor de torque",
    "conserto de conversor de torque",
    "reparo de conversor de torque",
    "conversor de torque para caminhão",
    "retifica de conversor de torque preço",
    "onde retificar conversor de torque",
    "vale a pena retificar conversor de torque",
    "peças para transmissão automática curitiba",
    # — informacional coberto pelos posts atuais —
    "sinais de conversor de torque com problema",
    "conversor de torque com defeito sintomas",
    "teste de stall",
    "teste de stall conversor de torque",
    "codigo p0740",
    "p0740 o que significa",
    "fluido atf errado",
    "atf universal pode usar",
    "conversor de torque o que é",
    "lock-up conversor de torque",
    # — alvos dos próximos posts (baseline de antes de existirem) —
    "cambio automatico tremendo",
    "carro treme quando acelera cambio automatico",
    "cambio automatico em emergencia",
    "cambio automatico esquentando",
    "superaquecimento cambio automatico",
    "teste de pressão cambio automatico",
    "quanto custa retificar um conversor de torque",
    "cvt nissan problema",
    "cambio al4 problema",
]


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def ddg(query):
    q = urllib.parse.quote_plus(query)
    html = fetch(f"https://html.duckduckgo.com/html/?q={q}&kl=br-pt")
    links = re.findall(r'class="result__a"[^>]+href="([^"]+)"', html)
    out = []
    for href in links:
        m = re.search(r"uddg=([^&]+)", href)
        out.append(urllib.parse.unquote(m.group(1)) if m else href)
    return out[:20]


def bing(query):
    q = urllib.parse.quote_plus(query)
    html = fetch(f"https://www.bing.com/search?q={q}&cc=br&setlang=pt-BR&count=20",
                 headers={"Accept-Language": "pt-BR,pt;q=0.9"})
    return re.findall(r'<li class="b_algo".*?<h2><a href="([^"]+)"', html, re.S)[:20]


def google(query):
    q = urllib.parse.quote_plus(query)
    try:
        html = fetch(f"https://www.google.com/search?q={q}&hl=pt-BR&gl=BR&num=20",
                     headers={"Accept-Language": "pt-BR,pt;q=0.9"})
    except Exception as e:
        return None  # bloqueado (429/302 consent)
    if "detected unusual traffic" in html or "/sorry/" in html:
        return None
    links = re.findall(r'<a href="/url\?q=(https?://[^&"]+)', html)
    if not links:  # layout logado/JS — tenta âncoras diretas
        links = re.findall(r'<a[^>]+href="(https?://(?!www\.google)[^"]+)"[^>]*><h3', html)
    return links[:20]


def position(links):
    # None OU lista vazia = sem dados utilizáveis (bloqueio/consent/parse falhou).
    # ">20" só quando o buscador retornou resultados e o domínio não está entre eles.
    if not links:
        return "BLOQ", None
    for i, u in enumerate(links, 1):
        if DOMAIN in u:
            return i, u
    return ">20", None


def run():
    results = {"date": str(date.today()), "domain": DOMAIN, "queries": {}}
    engines = {"ddg": ddg, "bing": bing, "google": google}
    for query in QUERIES:
        row = {}
        for name, fn in engines.items():
            try:
                links = fn(query)
            except Exception:
                links = None
            pos, url = position(links)
            row[name] = {"pos": pos, "url": url}
            time.sleep(3)
        results["queries"][query] = row
        print(f"{query!r}: ddg={row['ddg']['pos']} bing={row['bing']['pos']} google={row['google']['pos']}", file=sys.stderr)
    out = Path(__file__).parent / f"rank-{results['date']}.json"
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSalvo: {out}", file=sys.stderr)
    return results


def table(results):
    lines = [f"| Consulta | DDG | Bing | Google |", "|---|---|---|---|"]
    for q, row in results["queries"].items():
        lines.append(f"| {q} | {row['ddg']['pos']} | {row['bing']['pos']} | {row['google']['pos']} |")
    return "\n".join(lines)


def compare(f1, f2):
    a = json.loads(Path(f1).read_text(encoding="utf-8"))
    b = json.loads(Path(f2).read_text(encoding="utf-8"))
    print(f"| Consulta | DDG {a['date']}→{b['date']} | Bing | Google |")
    print("|---|---|---|---|")
    for q in b["queries"]:
        pa = a["queries"].get(q, {})
        pb = b["queries"][q]
        cells = []
        for e in ("ddg", "bing", "google"):
            va = pa.get(e, {}).get("pos", "—")
            vb = pb[e]["pos"]
            cells.append(f"{va} → {vb}")
        print(f"| {q} | {' | '.join(cells)} |")


if __name__ == "__main__":
    if "--compare" in sys.argv:
        i = sys.argv.index("--compare")
        compare(sys.argv[i + 1], sys.argv[i + 2])
    else:
        r = run()
        if "--print" in sys.argv:
            print(table(r))
