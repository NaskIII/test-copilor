# FinançasPro — Gerenciador de Finanças Pessoais

Aplicação **monorepo** para gerenciamento de finanças pessoais com suporte a múltiplos usuários, gráficos interativos e lançamento diário de receitas e despesas.

## 🗂️ Estrutura do projeto

```
├── backend/          # API REST com Python + FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── transactions.py
│   │       ├── categories.py
│   │       ├── reports.py
│   │       └── budgets.py
│   ├── tests/
│   └── requirements.txt
└── frontend/         # SPA com Angular 19 + Material + Chart.js
    └── src/app/
        ├── components/
        │   ├── auth/         # Login e Cadastro
        │   ├── layout/       # Shell (sidebar + toolbar)
        │   ├── dashboard/    # Visão geral com gráficos
        │   ├── transactions/ # CRUD de lançamentos
        │   ├── categories/   # Gerenciar categorias
        │   ├── reports/      # Relatórios mensais e anuais
        │   └── budgets/      # Controle de orçamento
        ├── services/
        └── models/
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

## 🚀 Como executar

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Linux/Mac
# .venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponível em `http://localhost:8000`  
Documentação interativa: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
ng serve
```

App disponível em `http://localhost:4200`

> O proxy `proxy.conf.json` redireciona `/api` para o backend automaticamente.

### Testes do Backend

```bash
cd backend
python -m pytest tests/ -v
```

## 🛠️ Tecnologias

**Backend:**
- Python 3.12 + FastAPI
- SQLAlchemy (ORM) + SQLite (dev) / PostgreSQL (prod)
- Alembic (migrações)
- JWT (python-jose + passlib)
- Pydantic v2

**Frontend:**
- Angular 19 (standalone components)
- Angular Material 19 (UI components)
- Chart.js + ng2-charts (gráficos)
- RxJS

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
