# Programa de Mentoria em Lean

Uma plataforma web completa e profissional para programa de mentoria focada em Metodologia Enxuta (Lean), Melhoria de Processos e Gestão de Pessoas.

## 🚀 Tecnologias

- **Next.js 16.2.2** - Framework React com App Router
- **React 19** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Vercel** - Plataforma de deploy (recomendada)

## ✨ Funcionalidades

### Páginas Implementadas

1. **Home** (`/`)
   - Hero section com call-to-action
   - Benefícios do programa
   - Público-alvo
   - Áreas de foco (Metodologia Enxuta, Melhoria de Processos, Gestão de Pessoas)
   - Seções de CTA

2. **Conteúdo Gratuito** (`/free-content`)
   - 9 itens de conteúdo (vídeos, e-books, guias)
   - Sistema de filtros por tipo de conteúdo
   - Contadores de visualizações
   - CTA para programa de mentoria

3. **Agendar Sessão** (`/schedule-session`)
   - Formulário completo de agendamento
   - Validação de campos
   - Seleção de data (apenas datas futuras)
   - Seleção de horário (slots pré-definidos)
   - Tela de confirmação
   - Informações sobre o que esperar da sessão

4. **Programa de Mentoria** (`/mentorship-program`)
   - Showcase de 6 features principais
   - Como funciona (4 passos)
   - 2 planos de precificação:
     - Trimestral: R$ 999/mês
     - Semestral: R$ 1.799/mês (mais popular)
   - FAQ com 4 perguntas frequentes
   - Múltiplos CTAs

5. **Admin Dashboard** (`/admin`)
   - 3 abas principais: Visão Geral, Conteúdos, Sessões
   - Métricas principais (4 cards)
   - Gerenciamento de conteúdos com tabela
   - Gerenciamento de sessões com atualização de status
   - Dados mockados para demonstração

### Componentes Reutilizáveis

- **Button** - 3 variantes (primary, secondary, outline) e 3 tamanhos (sm, md, lg)
- **Card** - Componente de card com hover opcional
- **Navigation** - Menu responsivo com mobile menu
- **Footer** - Rodapé com links e informações

## 🎨 Design

- **Cor Principal**: #2563EB (Blue 600)
- **Cores Secundárias**: Green (#16A34A), Purple (#9333EA)
- **Tipografia**: Geist Sans (variável do Next.js)
- **Responsivo**: Design mobile-first
- **Acessibilidade**: Cores com contraste adequado

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Entre no diretório
cd mentorship-platform

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Abra no navegador
# http://localhost:3000
```

## 🏗️ Build e Deploy

```bash
# Build de produção
npm run build

# Executar build de produção localmente
npm start
```

### Deploy na Vercel (Recomendado)

1. Faça push do código para GitHub/GitLab/Bitbucket
2. Conecte o repositório na Vercel
3. A Vercel detectará automaticamente o Next.js
4. Deploy automático a cada push

## 📁 Estrutura do Projeto

```
mentorship-platform/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Dashboard administrativo
│   ├── free-content/
│   │   └── page.tsx           # Página de conteúdo gratuito
│   ├── mentorship-program/
│   │   └── page.tsx           # Página do programa
│   ├── schedule-session/
│   │   └── page.tsx           # Página de agendamento
│   ├── layout.tsx             # Layout raiz com Nav e Footer
│   ├── page.tsx               # Home page
│   └── globals.css            # Estilos globais
├── components/
│   ├── layout/
│   │   ├── Footer.tsx         # Componente de rodapé
│   │   └── Navigation.tsx     # Componente de navegação
│   └── ui/
│       ├── Button.tsx         # Componente de botão
│       └── Card.tsx           # Componente de card
├── public/                    # Arquivos estáticos
├── package.json
├── tailwind.config.ts         # Configuração do Tailwind
├── tsconfig.json              # Configuração do TypeScript
└── README.md
```

## 🎯 Customização

### Alterar Cores do Brand

Edite os arquivos de componentes substituindo `#2563EB` pela cor desejada:
- `components/ui/Button.tsx`
- `components/layout/Navigation.tsx`
- Páginas individuais

### Alterar Conteúdo

- **Nome da plataforma**: Edite `components/layout/Navigation.tsx`
- **Conteúdos gratuitos**: Edite o array `contentData` em `app/free-content/page.tsx`
- **Planos de precificação**: Edite o array `pricingTiers` em `app/mentorship-program/page.tsx`
- **FAQ**: Edite o array `faqs` em `app/mentorship-program/page.tsx`

## 🔧 Limitações do MVP

Esta é uma versão MVP (Minimum Viable Product). As seguintes funcionalidades **NÃO** estão implementadas:

- ❌ Backend real (todos os formulários apenas fazem console.log)
- ❌ Banco de dados
- ❌ Autenticação de usuários
- ❌ Sistema de pagamentos
- ❌ Envio de emails
- ❌ Proteção da página admin
- ❌ Upload de arquivos
- ❌ Sistema de videoconferência

## 🚀 Próximos Passos

Para transformar este MVP em uma aplicação completa:

1. **Backend**: Implementar API com Node.js/Express ou usar serviços como Supabase
2. **Autenticação**: Adicionar NextAuth.js ou Clerk
3. **Banco de Dados**: PostgreSQL, MySQL ou MongoDB
4. **Pagamentos**: Integrar Stripe ou PagSeguro
5. **Emails**: Usar SendGrid, Mailgun ou Resend
6. **CMS**: Adicionar Sanity.io ou Contentful para gerenciar conteúdos
7. **Analytics**: Google Analytics ou Plausible
8. **SEO**: Otimizar meta tags, sitemap, robots.txt

## 📄 Licença

Este projeto foi criado como MVP para fins de demonstração.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

---

Desenvolvido com ❤️ usando Next.js e Tailwind CSS
