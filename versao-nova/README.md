# Magnum Torque - Site Institucional

Site one-page da **Magnum Torque Retífica LTDA**, especialista em retífica de conversores de torque em Curitiba-PR.

## 📋 Visão Geral

| Item | Descrição |
|------|-----------|
| **Tipo** | Site estático one-page |
| **Tecnologias** | HTML5, CSS3, JavaScript (Vanilla) |
| **Público-alvo** | Donos de mecânica e oficinas automotivas |
| **Objetivo** | Apresentar serviços e gerar leads via WhatsApp/formulário |

## 🚀 Funcionalidades

- **Navegação suave** entre seções com scroll animado
- **Menu responsivo** com hamburger para mobile
- **Carousel de depoimentos** com suporte a touch/swipe
- **Formulário de contato** que redireciona para WhatsApp
- **Modal "Trabalhe Conosco"** para recrutamento
- **Botão "Voltar ao topo"** que aparece ao scrollar
- **Ano automático** no footer (atualizado via JS)

## 📁 Estrutura do Projeto

```
versao-nova/
├── index.html              # Página principal (693 linhas)
├── css/
│   └── style.css           # Estilos (328 linhas)
├── js/
│   └── main.js             # Lógica do frontend (161 linhas)
├── assets/
│   ├── logo_10anos.webp    # Logo comemorativo
│   ├── logo_magnum_final.webp  # Logo principal
│   ├── partners/           # Logos dos parceiros (11 arquivos)
│   │   ├── raybestos.webp
│   │   ├── sonnax.svg
│   │   ├── tricomponent.webp
│   │   └── ...
│   └── products/           # Imagens dos serviços (3 arquivos)
│       ├── retifica_completa.webp
│       ├── orcamento_rapido.webp
│       └── substituicao_componentes.webp
├── CLAUDE.md               # Instruções para IA + info do negócio
└── README.md               # Esta documentação
```

## 🎨 Seções do Site

1. **Header** - Logo + navegação desktop/mobile
2. **Hero (Início)** - Apresentação principal com cards de destaque
3. **Sobre** - História da empresa e estatísticas
4. **Diferenciais** - Por que escolher a Magnum Torque (autoridade)
5. **Serviços** - Retífica Completa, Orçamento Rápido, Substituição de Componentes
6. **Peças** - Venda de peças para transmissão automática
7. **Parceiros** - Grid com 9 parceiros premium
8. **Depoimentos** - Carousel com 7 avaliações de clientes
9. **FAQ** - 8 perguntas frequentes com Schema Markup
10. **Contato** - Informações + formulário WhatsApp
11. **Footer** - Links rápidos, redes sociais

## 🛠️ Como Rodar

### Opção 1: Abrir diretamente
```bash
# Basta abrir o arquivo no navegador
start index.html
```

### Opção 2: Servidor local (recomendado)
```bash
# Com Python
python -m http.server 8000

# Com Node.js (npx)
npx serve

# Com PHP
php -S localhost:8000
```

Acesse: `http://localhost:8000`

## 📱 Responsividade

| Breakpoint | Dispositivos |
|------------|--------------|
| < 640px | Celulares pequenos |
| ≥ 640px | Celulares grandes |
| ≥ 768px | Tablets |
| ≥ 1024px | Desktops |

## 🎯 Cores e Tipografia

### Cores Principais
```css
--primary: #EB060F;        /* Vermelho Magnum */
--primary-dark: #c9050d;
--dark: #111827;
--gray-900: #111827;
--white: #ffffff;
```

### Fontes
- **Títulos**: Montserrat (600, 700, 800)
- **Corpo**: Open Sans (400, 500, 600)

## 🔌 Integrações

| Serviço | Uso |
|---------|-----|
| **WhatsApp** | Formulário e botões de contato |
| **Google Fonts** | Fontes Montserrat e Open Sans |
| **Redes Sociais** | Links para Facebook, Instagram, TikTok |

## ⚠️ Limitações Atuais

- [ ] Formulário não envia e-mail (apenas WhatsApp)
- [ ] Sem backend para processamento de dados
- [ ] Sem analytics configurado
- [ ] Sem mapa do Google no endereço
- [ ] Sem política de privacidade (LGPD)

## ✅ SEO para IAs Implementado

- [x] **Schema Markup LocalBusiness** - Dados estruturados da empresa
- [x] **Schema Markup FAQPage** - 8 perguntas estruturadas para IAs
- [x] **Meta tags Open Graph** - Compartilhamento em redes sociais
- [x] **Twitter Cards** - Cards otimizados para Twitter
- [x] **Conteúdo de autoridade** - Seção "Diferenciais" com 6 cartões
- [x] **Venda de peças** - Seção dedicada com 6 categorias de produtos

## 🔧 Melhorias Sugeridas

1. Implementar envio real de e-mail do formulário
2. Adicionar Google Analytics 4
3. Embed do Google Maps na seção de contato
4. Página de política de privacidade (LGPD)

## 📞 Dados da Empresa

```
Magnum Torque Retifica LTDA
Rua Irma Maria Lucia Roland, 403 - Hauer, Curitiba-PR, 81610-090
Telefone/WhatsApp: (41) 3503-6828
Email: contato@magnumtorque.com.br
Horário: Seg-Sex, 8h-18h (sem fechamento para almoço)
```

## 👨‍💻 Desenvolvimento

Desenvolvido por **LBWMA INC.** - [lbwma.com](https://lbwma.com)

---

*Última atualização: Abril 2026*
