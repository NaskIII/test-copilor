# FinançasPro — Gerenciador de Finanças Pessoais

Aplicação **monorepo** para gerenciamento de finanças pessoais com suporte a múltiplos usuários, gráficos interativos e lançamento diário de receitas e despesas.

## 🗂️ Estrutura do projeto

```
├── backend/              # API REST com Python + FastAPI
│   ├── app/
│   │   ├── main.py       # Ponto de entrada da API
│   │   ├── models.py     # Modelos do banco de dados (SQLAlchemy)
│   │   ├── schemas.py    # Schemas de validação (Pydantic)
│   │   ├── crud.py       # Operações no banco de dados
│   │   ├── auth.py       # JWT e segurança
│   │   ├── database.py   # Conexão com o banco de dados
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── transactions.py
│   │       ├── categories.py
│   │       ├── reports.py
│   │       └── budgets.py
│   ├── tests/
│   ├── Dockerfile
│   ├── .env.example      # Variáveis de ambiente documentadas
│   └── requirements.txt
├── frontend/             # SPA com Angular 19 + Material + Chart.js
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── auth/         # Login e Cadastro
│   │   │   ├── layout/       # Shell (sidebar + toolbar)
│   │   │   ├── dashboard/    # Visão geral com gráficos
│   │   │   ├── transactions/ # CRUD de lançamentos
│   │   │   ├── categories/   # Gerenciar categorias
│   │   │   ├── reports/      # Relatórios mensais e anuais
│   │   │   └── budgets/      # Controle de orçamento
│   │   ├── services/
│   │   └── models/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml    # Sobe tudo com um comando
```

## ⚡ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 👥 Multi-usuário | Cadastro, login com JWT e isolamento por usuário |
| 💸 Lançamentos diários | Adicione receitas e despesas com data, categoria e notas |
| 📊 Dashboard | Cards de resumo + gráfico de pizza + linha de tendência |
| 📈 Relatórios | Por categoria, fluxo diário, visão anual com gráficos interativos |
| 🏷️ Categorias | Categorias personalizadas com ícone emoji e cor |
| 💰 Orçamentos | Defina limites mensais por categoria e acompanhe o progresso |
| 🔍 Filtros | Filtre lançamentos por tipo, categoria e período |
| 📱 Responsivo | Interface adaptada para desktop e mobile |

---

## 🗄️ Banco de Dados

### Qual banco é usado?

Por padrão, o backend usa **SQLite** — um banco de dados leve que **não precisa de instalação**. Um arquivo chamado `finance.db` é criado automaticamente na pasta `backend/` na primeira vez que a aplicação é iniciada.

```
backend/
└── finance.db   ← criado automaticamente pelo SQLAlchemy ao iniciar o servidor
```

### Por que SQLite?

| | SQLite (padrão) | PostgreSQL (produção) |
|---|---|---|
| Instalação | ✅ Nenhuma | Requer servidor Postgres |
| Arquivo gerado | `finance.db` na pasta `backend/` | Banco no servidor |
| Ideal para | Desenvolvimento local | Produção / múltiplos usuários simultâneos |

### Como usar PostgreSQL

Instale o driver e exporte a variável de ambiente antes de iniciar:

```bash
pip install psycopg2-binary
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/financaspro"
uvicorn app.main:app --reload
```

Ou via arquivo `.env` (veja a seção abaixo).

> **Nota:** O SQLAlchemy cria as tabelas automaticamente ao iniciar (`Base.metadata.create_all`), por isso **não é necessário rodar migrações manualmente** para o desenvolvimento.

---

## 🚀 Como subir a aplicação Python (Backend)

### Pré-requisitos

- **Python 3.10+** — verifique com `python --version`
- **pip** — incluso no Python

### Passo a passo

#### 1. Acesse a pasta do backend

```bash
cd backend
```

#### 2. Crie e ative um ambiente virtual

```bash
# Criar
python -m venv .venv

# Ativar — Linux / macOS
source .venv/bin/activate

# Ativar — Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Ativar — Windows (CMD)
.venv\Scripts\activate.bat
```

> 💡 Você saberá que o venv está ativo quando o prompt mostrar `(.venv)` antes do cursor.

#### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

#### 4. Configure as variáveis de ambiente (opcional)

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.example .env
```

Abra o `.env` e ajuste pelo menos a `SECRET_KEY`:

```env
# .env
DATABASE_URL=sqlite:///./finance.db   # padrão, não precisa alterar para dev
SECRET_KEY=sua-chave-secreta-aqui     # gere com: python -c "import secrets; print(secrets.token_hex(32))"
```

> ⚠️ O arquivo `.env` **nunca deve ser commitado** no repositório (já está no `.gitignore`).

#### 5. Inicie o servidor

```bash
uvicorn app.main:app --reload
```

O servidor sobe em segundos. Você verá:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

#### 6. Acesse a API

| URL | Descrição |
|---|---|
| `http://localhost:8000` | Endpoint raiz (healthcheck) |
| `http://localhost:8000/docs` | **Swagger UI** — teste todos os endpoints interativamente |
| `http://localhost:8000/redoc` | ReDoc — documentação alternativa |

---

## 🖥️ Como subir o Frontend (Angular)

### Pré-requisitos

- **Node.js 18+** — verifique com `node --version`
- **npm** — incluso no Node.js

```bash
cd frontend
npm install
npm start          # ou: npx ng serve
```

App disponível em `http://localhost:4200`

> O arquivo `proxy.conf.json` redireciona automaticamente todas as chamadas `/api/*` para `http://localhost:8000`, então não é necessário configurar CORS manualmente durante o desenvolvimento.

---

## 🐳 Subindo tudo com Docker (forma mais fácil)

Se você tiver **Docker** e **Docker Compose** instalados, suba o backend e o frontend com um único comando:

```bash
# Apenas o backend (SQLite)
docker compose up backend

# Backend + Frontend
docker compose up

# Com PostgreSQL ao invés de SQLite
docker compose --profile postgres up
```

| Serviço | URL |
|---|---|
| Backend API | `http://localhost:8000/docs` |
| Frontend | `http://localhost:4200` |
| PostgreSQL | `localhost:5432` |

---

## 🧪 Testes do Backend

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

---

## 🛠️ Tecnologias

**Backend:**
- Python 3.12 + FastAPI
- SQLAlchemy 2.0 (ORM) + **SQLite** (dev) / PostgreSQL (prod)
- JWT (python-jose + passlib/bcrypt)
- Pydantic v2

**Frontend:**
- Angular 19 (standalone components)
- Angular Material 19 (UI components)
- Chart.js + ng2-charts (gráficos)
- RxJS

---

## 💡 Sugestões de Melhorias Futuras

1. **🔔 Alertas e notificações** — Alertas por email/push quando ultrapassar o orçamento
2. **📎 Anexos** — Upload de comprovantes (fotos de notas fiscais)
3. **🔄 Lançamentos recorrentes** — Assinaturas e pagamentos fixos automáticos
4. **🏦 Múltiplas contas** — Conta corrente, poupança, cartão de crédito
5. **💱 Multi-moeda** — Suporte a USD, EUR, BTC com conversão automática
6. **📤 Exportação** — Exportar para Excel/CSV/PDF
7. **🤖 Análise com IA** — Sugestões de economia com base nos gastos
8. **🎯 Metas financeiras** — Definir metas de poupança com progresso visual
9. **👨‍👩‍👧 Finanças compartilhadas** — Controle de gastos de família/casais
10. **🌙 Tema escuro** — Modo dark/light toggle
