# � LabAcess Frontend

**Laboratory Access Management System** - Interface web moderna para controle de acesso a laboratórios, gerenciamento de treinamentos de segurança e análise de dados de permanência.

---

## 📋 Visão Geral

O frontend do LabAcess é uma aplicação **React + TypeScript** que fornece uma interface intuitiva para:
- 🔐 Autenticação e controle de acesso
- 📊 Análise avançada de acessos ao laboratório
- 🎓 Gerenciamento de treinamentos de segurança
- 📈 Geração de relatórios customizados
- 👥 Administração de usuários

---

## 🚀 Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend Framework** | React 19.2.0 + TypeScript 5.9 |
| **Roteamento** | React Router 7.13.1 |
| **Build Tool** | Vite 7.3.1 |
| **UI Components** | Chakra UI 3.33.0, Material-UI 7.3.8 |
| **Gráficos** | Chart.js 4.5.1 + react-chartjs-2 |
| **Autenticação** | JWT + jwt-decode 4.0.0 |
| **Animações** | Framer Motion 12.34.3 |
| **Linting** | ESLint + TypeScript-ESLint |
| **Containerização** | Docker + Nginx |

---

## 📂 Estrutura de Pastas

```
frontend/
├── public/                      # Assets estáticos
├── src/
│   ├── assets/                 # Imagens, ícones
│   ├── components/             # Componentes reutilizáveis
│   │   ├── filtros/           # Componentes de filtro
│   │   ├── graficos/          # Componentes de visualização
│   │   ├── relatorios/        # Componentes de relatórios
│   │   └── style/             # Componentes de styling
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useApontamento.ts
│   │   ├── useTreinamento.ts
│   │   └── ...
│   ├── pages/                  # Páginas (Login, Upload, Relatórios)
│   ├── routes/                 # Roteamento (PrivateRoute)
│   ├── services/               # Serviços de API
│   ├── types/                  # Definições TypeScript
│   ├── utils/                  # Funções utilitárias
│   └── App.tsx, main.tsx
├── vite.config.ts
├── tsconfig.json
├── nginx.conf
└── Dockerfile
```

---

## 🎯 Páginas Principais

- **Login** - Autenticação JWT
- **Upload** - Upload de arquivos de dados
- **Relatórios** - 7+ relatórios analíticos especializados
- **Análises** - Visualizações de dados com gráficos

---

## 📡 Integração com Microsserviços

| Serviço | Endpoint | Propósito |
|---------|----------|----------|
| **users_service** | `8001/api/users/` | Autenticação e dados |
| **smartCard** | `8000/api/acesso/` | Logs de acesso |
| **JWT Refresh** | `8001/api/users/api/token/refresh/` | Renovação de tokens |

---

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup Local

```bash
# Instalar dependências
npm install

# Variáveis de ambiente (.env)
VITE_API_USERS=http://localhost:8001
VITE_API_ACESSO=http://localhost:8000

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint
npm run lint
```

### 🐳 Docker

```bash
docker build -t labacess-frontend:latest .
docker run -p 3000:80 labacess-frontend:latest
```

---

## 🔐 Autenticação

- **Tipo**: JWT (JSON Web Tokens)
- **Tokens**: Access (30 min), Refresh (1 dia)
- **Proteção**: PrivateRoute garante acesso apenas a usuários autenticados

---

## 📈 Features

✅ Autenticação segura com JWT  
✅ Múltiplos relatórios analíticos  
✅ Visualizações com gráficos  
✅ Filtros por tempo e usuários  
✅ Interface responsiva  
✅ Type-safe com TypeScript  

---

## 🚀 Deployment

Nginx configurado para servir assets estáticos e proxy reverso de APIs.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit + Push
4. Abra um Pull Request

---

**Desenvolvido com ❤️ para gerenciamento seguro de acesso a laboratórios**