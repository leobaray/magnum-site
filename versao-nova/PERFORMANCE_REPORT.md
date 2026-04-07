# Relatório de Performance - Magnum Torque

**Capturado em:** 7 de abril de 2026, 13:58 BRT  
**URL:** https://magnumtorque.com.br  
**Ferramenta:** Lighthouse 13.0.1

---

## 📊 Scores Gerais

| Métrica | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| **Desempenho** | 98/100 | 81/100 | 🟡 Mobile precisa melhorar |
| **Acessibilidade** | 86/100 | 84/100 | 🟡 Precisa melhorar |
| **Práticas Recomendadas** | 100/100 | 100/100 | 🟢 Excelente |
| **SEO** | 100/100 | 100/100 | 🟢 Excelente |

---

## 🎯 Core Web Vitals

### Desktop
| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **First Contentful Paint (FCP)** | 0,9 s | < 1,8 s | 🟢 Ótimo |
| **Largest Contentful Paint (LCP)** | 0,9 s | < 2,5 s | 🟢 Ótimo |
| **Total Blocking Time (TBT)** | 0 ms | < 200 ms | 🟢 Ótimo |
| **Cumulative Layout Shift (CLS)** | 0,02 | < 0,1 | 🟢 Ótimo |
| **Speed Index** | 1,0 s | < 3,4 s | 🟢 Ótimo |

### Mobile (4G lento)
| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **First Contentful Paint (FCP)** | 2,7 s | < 1,8 s | 🟡 Precisa melhorar |
| **Largest Contentful Paint (LCP)** | 2,7 s | < 2,5 s | 🟡 Precisa melhorar |
| **Total Blocking Time (TBT)** | 0 ms | < 200 ms | 🟢 Ótimo |
| **Cumulative Layout Shift (CLS)** | 0,213 | < 0,1 | 🔴 Crítico |
| **Speed Index** | 2,8 s | < 4,3 s | 🟢 Bom |

---

## ⚠️ Problemas Identificados

### 📱 MOBILE - PROBLEMAS CRÍTICOS

#### CLS Alto (0,213) - LAYOUT SHIFT

**Problema:** Layout shift excessivo no mobile (0,213 vs meta de 0,1).

**Causa:** Carregamento de fontes do Google Fonts (memvYaGs1 + JTUSjIg1)

**Elemento afetado:**
```
<div class="container"> (hero section)
```

**Solução:** 
- Adicionar `font-display: swap` no CSS das fontes
- Ou usar `preload` para fontes críticas
- Ou definir dimensões fixas/ reserva de espaço para texto

---

#### LCP Atrasado (2,7s) - MOBILE

**Problema:** LCP de 2,7s no mobile (meta: < 2,5s)

**Causa principal:** Atraso na renderização do elemento (1.240 ms)

**Elemento LCP:**
```
<h1> (texto: "Especialistas em Retífica de Conversores de Torque")
```

**Solução:**
- Inline do CSS crítico
- Preload de fontes
- Remover CSS não crítico do caminho de renderização

---

### 1. Acessibilidade (Desktop: 86/100, Mobile: 84/100) - CONTRASTE

**Problema:** Cores de primeiro e segundo plano sem contraste suficiente.

**Elementos afetados:**
- Badges "NOSSOS SERVIÇOS" e "VENDA DE PEÇAS"
- Botões "Solicitar Orçamento" (btn-ghost)
- Textos no footer
- Link "LBWMA INC." no footer
- Botão "Trabalhe Conosco"

**Solução:** Ajustar cores para atender WCAG AA (mínimo 4.5:1 para texto normal)

---

### 2. Acessibilidade - PONTO DE REFERÊNCIA PRINCIPAL (MOBILE)

**Problema:** Página sem elemento `<main>` para ponto de referência.

**Elemento afetado:**
```
<html lang="pt-BR">
```

**Solução:** Adicionar `<main>` envolvendo o conteúdo principal ou usar `role="main"`

**Impacto:** Usuários de leitores de tela não têm navegação por landmarks

---

### 3. Acessibilidade - ÁREAS DE TOQUE

**Problema:** Áreas de toque sem tamanho ou espaçamento suficiente.

**Elementos afetados:**
- Botões do carousel de depoimentos (dots de navegação)

**Solução:** Aumentar tamanho mínimo para 44x44px ou espaçamento entre elementos

---

### 4. Acessibilidade - NAVEGAÇÃO POR TÍTULOS

**Problema:** Títulos não aparecem em ordem sequencial descendente.

**Elementos afetados:**
- `<h3>` "Diagnóstico Preciso" (hero cards)
- `<h4>` "Edevan Ferrarezi" (depoimentos)

**Solução:** Revisar hierarquia de headings (h1 → h2 → h3 → h4)

---

### 5. Acessibilidade - LINKS DISTINGUÍVEIS

**Problema:** Links dependem apenas da cor para serem distinguíveis.

**Elementos afetados:**
- Link "LBWMA INC." no footer

**Solução:** Adicionar underline ou outro indicador visual além da cor

---

### 6. Performance - CSS BLOQUEANTE (MOBILE)

**Impacto:** ~1.760 ms de atraso na renderização (MOBILE)

**Arquivos:**
- `/css/style.css` (5,7 KiB, 290 ms)
- Google Fonts CSS (2,6 KiB, 750 ms)

**Solução:** 
- Inline do CSS crítico
- `preload` para Google Fonts
- `media="print"` + JS swap para CSS não crítico

---

### 7. Performance - IMAGENS NÃO OTIMIZADAS

**Economia estimada:** 279 KiB

| Imagem | Tamanho Atual | Dimensões Atuais | Dimensões Exibidas | Economia |
|--------|---------------|------------------|-------------------|----------|
| retifica_completa.webp | 93,3 KiB | 1311x768 | 401x224 | 85,0 KiB |
| substituicao_componentes.webp | 102,0 KiB | 1024x600 | 382x382 | 78,3 KiB |
| orcamento_rapido.webp | 82,7 KiB | 1309x768 | 411x224 | 75,1 KiB |
| logo_10anos.webp | 46,2 KiB | 1052x653 | 358x222 | 40,9 KiB |

**Solução:** 
- Redimensionar imagens para dimensões reais de exibição
- Implementar imagens responsivas (`srcset` + `sizes`)

---

### 8. Performance - CACHE DE IMAGENS

**Problema:** Cache TTL de apenas 7 dias para imagens estáticas.

**Solução:** Configurar cache de longo prazo (1 ano) para assets estáticos no servidor

---

### 9. Performance - FONTES SEM FONT-DISPLAY

**Problema:** Fontes do Google sem `font-display: swap` causam FOIT/FOUT e layout shift.

**Solução:** Adicionar `&display=swap` na URL do Google Fonts ou usar `font-display: swap` no CSS

---

### 10. Segurança - CABEÇALHOS AUSSENTES

**Problema:** Cabeçalhos de segurança não configurados.

| Cabeçalho | Gravidade |
|-----------|-----------|
| Content-Security-Policy (CSP) | Alto |
| Strict-Transport-Security (HSTS) | Alto |
| Cross-Origin-Opener-Policy (COOP) | Alto |
| X-Frame-Options | Alto |

**Solução:** Configurar no servidor web (Apache/Nginx)

---

## ✅ Pontos Fortes

- [x] FCP e LCP abaixo de 1 segundo
- [x] TBT zerado (JavaScript eficiente)
- [x] CLS mínimo (0,02)
- [x] SEO 100/100
- [x] Práticas recomendadas 100/100
- [x] Imagens em formato WebP
- [x] Preconnect configurado para Google Fonts
- [x] Schema markup válido (LocalBusiness + FAQPage)
- [x] Meta tags Open Graph e Twitter Cards
- [x] Links canônicos válidos
- [x] Robots.txt válido

---

## 📋 Plano de Ação Prioritário

### 🔴 Prioridade Crítica (Mobile Performance)

1. **Corrigir CLS alto (0,213)** - Layout shift no mobile
   - Adicionar `font-display: swap` nas fontes
   - Ou fazer preload das fontes críticas
   - Reservar espaço para texto antes do carregamento

2. **Melhorar LCP (2,7s)** - Mobile
   - Inline do CSS crítico
   - Preload de fontes
   - Remover CSS não crítico do caminho de renderização

### 🟡 Alta Prioridade (Acessibilidade)

3. **Ajustar contraste de cores** no CSS
   - Badges em seções claras
   - Botões btn-ghost
   - Textos do footer

4. **Adicionar `<main>`** para landmark de acessibilidade

5. **Corrigir hierarquia de headings**
   - Garantir sequência h1 → h2 → h3

6. **Aumentar áreas de toque** dos dots do carousel (44x44px mínimo)

7. **Adicionar underline** no link do footer

### 🟢 Média Prioridade (Performance Desktop/Mobile)

8. **Otimizar imagens**
   - Redimensionar para dimensões reais
   - Implementar `srcset` para responsividade
   - Economia: ~279 KiB

9. **Melhorar cache de assets**
   - Configurar no servidor (1 ano para estáticos)

### ⚪ Baixa Prioridade (Segurança)

10. **Configurar cabeçalhos de segurança**
    - CSP, HSTS, COOP, X-Frame-Options

---

## 📝 Notas

### Desktop
- **Performance:** Excelente (98/100)
- **Acessibilidade:** Precisa melhorar (86/100)
- **Impacto no usuário:** Mínimo (site carrega em < 1s)

### Mobile
- **Performance:** Precisa melhorar (81/100)
- **Acessibilidade:** Precisa melhorar (84/100)
- **Principal gargalo:** CLS alto (0,213) e LCP (2,7s)
- **Causa principal:** Fontes do Google Fonts bloqueando renderização

### Geral
- **SEO:** Perfeito para ranqueamento (100/100 desktop e mobile)
- **TBT:** Excelente em ambos (0 ms)
- **JavaScript:** Eficiente, sem tarefas longas

---

*Relatório gerado automaticamente a partir do PageSpeed Insights*
