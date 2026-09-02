# LabAcess Frontend

Frontend web do LabAcess, sistema de controle de acesso a laboratorio. A aplicacao oferece autenticacao, gerenciamento de usuarios e treinamentos, upload de arquivos, consultas de registros, relatorios e graficos para acompanhar o uso dos laboratorios.

Este frontend e uma aplicacao React com TypeScript. Ele se comunica com os servicos Django do projeto por HTTP e Server-Sent Events (SSE), usando o Kong como entrada da API quando a aplicacao completa esta em execucao.

## Funcionalidades

- Login e autenticacao baseada em JWT.
- Protecao de rotas privadas.
- Consulta de registros dos ultimos cinco minutos ou por intervalo de data e hora.
- Upload de arquivos `.xls` e `.csv`.
- Acompanhamento em tempo real do processamento e das respostas do RPA.
- Indicacao da quantidade e da data da ultima busca finalizada.
- Relatorios de ultimos acessos, acessos indevidos e status de usuarios.
- Graficos de acessos anuais e usuarios mais ativos.
- Gerenciamento de treinamentos de seguranca.
- Gerenciamento de usuarios e e-mails de notificacao.
- Interface responsiva com componentes reutilizaveis.

## Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Linguagem | TypeScript 5.9 |
| Framework | React 19.2 |
| Build e desenvolvimento | Vite 7.3 |
| Rotas | React Router 7.13 |
| UI | Chakra UI 3.33, Material UI 7.3, classes utilitarias Bootstrap |
| Graficos | Chart.js 4.5 e react-chartjs-2 |
| Animacoes | Framer Motion 12.34 |
| Autenticacao | JWT e jwt-decode 4.0 |
| Eventos em tempo real | @microsoft/fetch-event-source |
| Feedback visual | react-loader-spinner, React Toastify e SweetAlert2 |
| Qualidade de codigo | ESLint, typescript-eslint e eslint-plugin-react-hooks |
| Servidor de producao | Nginx em imagem Docker |

## Estrutura

```text
frontend/
├── public/                 # Arquivos estaticos
├── src/
│   ├── assets/             # Imagens e outros recursos
│   ├── components/         # Componentes reutilizaveis
│   │   ├── filtros/         # Filtros
│   │   ├── graficos/        # Visualizacoes com Chart.js
│   │   ├── relatorios/      # Relatorios
│   │   └── style/           # Componentes visuais e menu
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Paginas da aplicacao
│   ├── routes/             # Configuracao e protecao de rotas
│   ├── services/           # Clientes e chamadas para as APIs
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Funcoes utilitarias e configuracoes
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Ponto de entrada
├── Dockerfile              # Build React e imagem final Nginx
├── nginx.conf               # Configuracao para servir a SPA
├── vite.config.ts           # Configuracao do Vite
├── tsconfig.json            # Configuracao TypeScript
└── package.json             # Scripts e dependencias
```

## Paginas e areas principais

- `Login`: entrada do usuario e obtencao dos tokens JWT.
- `Upload`: envio de arquivos, buscas de registros e acompanhamento do RPA.
- Relatorios: visualizacao de acessos, usuarios, treinamentos e ocorrencias.
- Graficos: analise de acessos anuais e usuarios ativos.
- Rotas privadas: restringem as paginas que exigem autenticacao.

## Integracao com os servicos

O host da API esta definido em `src/utils/static.ts` como `localhost`. Em desenvolvimento local, as chamadas usam as seguintes portas:

| Servico | URL base | Uso |
| Users service | `http://localhost:8001` | Login, refresh de JWT, usuarios e treinamentos |
| SmartCard backend | `http://localhost:8000` | Acessos, uploads, relatorios e processamento |

Principais rotas consumidas:

- `/api/users/api/token/`: login.
- `/api/users/api/token/refresh/`: renovacao do access token.
- `/api/users/user/`: dados do usuario autenticado.
- `/api/users/safety-training/`: treinamentos de seguranca.
- `/api/acesso/upload-xls/`: upload de arquivos.
- `/api/acesso/buscar-registro/`: busca de registros.
- `/api/acesso/ultima-resposta/`: ultima resposta da busca.
- `/api/acesso/receber-resposta/`: eventos SSE das respostas do RPA.
- `/api/acesso/processamento/`: eventos SSE do processamento de arquivos.
- `/api/acesso/usuarios/` e `/api/acesso/usuarios-ativos`: dados para relatorios.

Quando o projeto completo e executado com Docker Compose, a porta `8000` normalmente e fornecida pelo Kong, que encaminha as requisicoes para o backend correspondente.

## Requisitos

- Node.js 20 ou superior, recomendado para acompanhar o `Dockerfile`.
- npm.
- Backend e servicos de infraestrutura do projeto executando para usar dados reais.

## Desenvolvimento local

Na pasta `frontend`, instale as dependencias e inicie o Vite:

```bash
npm install
npm run dev
```

Por padrao, o Vite informa no terminal a URL do servidor de desenvolvimento. A aplicacao espera encontrar os servicos nas portas `8000` e `8001`.

Scripts disponiveis:

```bash
npm run dev      # inicia o servidor Vite
npm run build    # executa o typecheck e gera o build de producao
npm run lint     # executa o ESLint
npm run preview  # serve o build localmente
```

## Docker

O `Dockerfile` usa duas etapas:

1. Imagem `node:20` para instalar dependencias e gerar o build com Vite.
2. Imagem `nginx:alpine` para servir os arquivos gerados em `dist`.

Para construir e executar apenas o frontend:

```bash
docker build -t labacess-frontend:latest .
docker run --rm -p 3000:80 labacess-frontend:latest
```

Nesse modo, acesse `http://localhost:3000`. O Nginx usa `try_files` para direcionar rotas desconhecidas para `index.html`, permitindo a navegacao da SPA. Ele nao configura proxy para as APIs; as APIs continuam sendo acessadas pelo host definido em `src/utils/static.ts`.

Para executar a aplicacao completa, use o `docker-compose.yml` na raiz do repositorio:

```bash
docker compose up --build
```

## Autenticacao

O login envia as credenciais ao Users service e armazena os tokens no `localStorage`. As chamadas autenticadas usam o access token no header `Authorization: Bearer`. O servico de autenticacao renova o token quando necessario usando o endpoint de refresh.

As rotas privadas verificam a existencia da sessao antes de renderizar o conteudo protegido. O backend continua sendo responsavel pela validacao efetiva das permissoes.

## Server-Sent Events

O frontend usa `fetch-event-source` para acompanhar eventos enviados pelo backend. Esses eventos permitem atualizar a interface sem polling durante:

- processamento de uploads;
- buscas de registros;
- notificacoes de e-mail do ambiente de desenvolvimento.

As conexoes SSE sao encerradas quando os componentes que as utilizam sao desmontados.

## Observacoes

- A configuracao atual usa `http://localhost` diretamente e nao define variaveis `VITE_API_*` no `vite.config.ts`.
- Para acessar o frontend por outro computador ou dominio, ajuste `src/utils/static.ts` e a configuracao de CORS do backend/Kong.
- A porta `3000` e usada pelo container frontend no Docker Compose; o servidor Vite local pode usar outra porta se a `3000` estiver ocupada.
