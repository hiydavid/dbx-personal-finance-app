# Personal Finance Assistant App

A personal finance app built on the Databricks GenAI App Template. Track your assets, liabilities, and net worth at a glance with AI-powered financial analysis.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      FRONTEND                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           React + TypeScript + Vite                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Dashboard  │  │   Chat UI   │  │  Cashflow   │  │  Profile    │  ...Pages     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  │         │                │                │                │                      │  │
│  │  ┌──────┴────────────────┴────────────────┴────────────────┴──────────────────┐   │  │
│  │  │                         React Contexts (State)                             │   │  │
│  │  │  UserContext │ AgentsContext │ PersonasContext │ NavigationContext │ ...   │   │  │
│  │  └────────────────────────────────────┬───────────────────────────────────────┘   │  │
│  └───────────────────────────────────────│───────────────────────────────────────────┘  │
│                                          │ HTTP/SSE                                     │
└──────────────────────────────────────────│──────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────│──────────────────────────────────────────────┐
│                                      BACKEND                                            │
│  ┌───────────────────────────────────────│───────────────────────────────────────────┐  │
│  │                           FastAPI + Uvicorn                                       │  │
│  │  ┌────────────────────────────────────┴────────────────────────────────────────┐  │  │
│  │  │                              API Routers                                    │  │  │
│  │  │     /api/invoke_endpoint  │  /api/finance/*  │  /api/profile  │  ...        │  │  │
│  │  └───────────────┬───────────────────────┬────────────────────────────────────────┘  │
│  │                  │                       │                                           │
│  │  ┌───────┴───────┐             ┌───────┴───────┐                                  │  │
│  │  │    Agent      │             │   Finance     │                                  │  │
│  │  │   Handlers    │             │   Service     │                                  │  │
│  │  │ ┌───────────┐ │             │               │                                  │  │
│  │  │ │  FMAPI    │ │             │  DBSQL or     │                                  │  │
│  │  │ │  Handler  │ │             │  Sample Data  │                                  │  │
│  │  │ └─────┬─────┘ │             └───────┬───────┘                                  │  │
│  │  │       │       │                     │                                          │  │
│  │  │ ┌─────┴─────┐ │                     │                                          │  │
│  │  │ │    MCP    │ │                     │                                          │  │
│  │  │ │   Client  │ │                     │                                          │  │
│  │  │ └───────────┘ │                     │                                          │  │
│  │  └───────────────┘                     │                                          │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────┬─────────────────────┬─────────────────────────────────────────────────────┘
              │                     │
              ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABRICKS PLATFORM                                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐                    │
│  │   Foundation      │  │   SQL Warehouse   │  │      MLflow       │                    │
│  │   Model API       │  │      (DBSQL)      │  │                   │                    │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │                    │
│  │  │Claude/GPT-4 │  │  │  │Unity Catalog│  │  │  │   Tracing   │  │                    │
│  │  │ Endpoints   │  │  │  │   Tables    │  │  │  │  Feedback   │  │                    │
│  │  └─────────────┘  │  │  │ - assets    │  │  │  │ Experiments │  │                    │
│  └───────────────────┘  │  │ - liabilit. │  │  │  └─────────────┘  │                    │
│                         │  │ - transact. │  │  └───────────────────┘                    │
│  ┌───────────────────┐  │  │ - profiles  │  │                                           │
│  │   External MCP    │  │  └─────────────┘  │                                           │
│  │    Connections    │  └───────────────────┘                                           │
│  │  ┌─────────────┐  │                                                                  │
│  │  │  you.com    │  │                                                                  │
│  │  │ Web Search  │  │                                                                  │
│  │  └─────────────┘  │                                                                  │
│  └───────────────────┘                                                                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                          │
│  ┌───────────────────┐                                                                  │
│  │      NewsAPI      │  Financial news from Bloomberg, Reuters, WSJ, CNBC, FT           │
│  └───────────────────┘                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### Frontend (React + Vite)
| Component | Description |
|-----------|-------------|
| **Pages** | Dashboard, Chat, Cashflow, Net Worth, Investments, Profile |
| **Contexts** | UserContext (auth), AgentsContext, PersonasContext, NavigationContext |
| **Chat Engine** | SSE streaming, tool call visualization, MLflow trace links |
| **Styling** | Tailwind CSS + shadcn/ui components |

#### Backend (FastAPI)
| Component | Description |
|-----------|-------------|
| **Agent Router** | `/api/invoke_endpoint` - SSE streaming with tool calling |
| **Finance Router** | `/api/finance/*` - Assets, liabilities, transactions, investments |
| **Profile Router** | `/api/profile` - User profile management |
| **FMAPI Handler** | OpenAI-compatible client for Databricks model endpoints |
| **MCP Client** | External tool integration (web search via you.com) |

#### Databricks Services
| Service | Purpose |
|---------|---------|
| **FMAPI** | LLM inference (Claude, GPT-4) with tool calling |
| **SQL Warehouse** | Financial data storage in Unity Catalog |
| **MLflow** | Tracing, feedback logging, observability |
| **MCP Proxy** | External tool connections (web search, market data) |

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              CHAT INTERACTION FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────────────┘

User Message                    Agent Processing                     Response Stream
     │                                │                                    │
     ▼                                ▼                                    ▼
┌─────────┐    POST /invoke     ┌───────────┐    Tool Calls      ┌─────────────┐
│  Chat   │ ─────────────────▶  │  FMAPI    │ ◀───────────────▶  │  Finance    │
│  Input  │    endpoint         │  Handler  │                    │   Tools     │
└─────────┘                     └─────┬─────┘                    └─────────────┘
                                      │                                 │
                                      │ MCP Call                        │ get_user_profile
                                      ▼                                 │ get_financial_summary
                                ┌───────────┐                           │ get_transactions
                                │  you.com  │                           ▼
                                │   Search  │                    ┌─────────────┐
                                └───────────┘                    │  DBSQL or   │
                                      │                          │ Sample Data │
                                      ▼                          └─────────────┘
                                ┌───────────┐
                                │   SSE     │ ────▶ text deltas, tool calls, trace_id
                                │  Stream   │
                                └───────────┘


┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              FINANCE DATA FLOW                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘

Dashboard Request               Backend Processing                   Data Source
     │                                │                                   │
     ▼                                ▼                                   ▼
┌─────────┐  GET /finance/     ┌───────────┐     DBSQL          ┌─────────────┐
│Dashboard│ ───────────────▶   │  Finance  │ ────configured?───▶│     YES     │
│  Page   │    summary         │  Router   │         │          │  Query SQL  │
└─────────┘                    └───────────┘         │          │  Warehouse  │
                                                     │          └─────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │     NO      │
                                              │ Sample Data │
                                              │ (In-Memory) │
                                              └─────────────┘
```

### Agent Tool Calling

The finance assistant has access to these tools:

| Tool | Source | Description |
|------|--------|-------------|
| `get_user_profile` | Local | User demographics, income, risk tolerance |
| `get_financial_summary` | Local | Net worth, assets, liabilities |
| `get_transactions` | Local | Transaction history and cashflow |
| `web_search` | MCP (you.com) | Real-time web search for market data |

Tools are dynamically combined at runtime:
```
FMAPI Handler
     │
     ├── Local Finance Tools (FINANCE_TOOLS constant)
     │   └── get_user_profile, get_financial_summary, get_transactions
     │
     └── MCP Tools (discovered at conversation start)
         └── you.com web search, market data, etc.
```

## Prerequisites

- Python 3.11+
- Node.js 18+ (or Bun)
- Databricks workspace with Unity Catalog (for DBSQL data backend)

## Quick Start

### 1. Setup Environment

```bash
# Create Python virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (see `.env.template` for all options):

```bash
# Databricks connection (required)
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...

# Databricks SQL data backend (optional - falls back to sample data if not set)
DBSQL_SCHEMA=catalog.schema
DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/abc123

# News API (optional)
NEWSAPI_KEY=...
```

### 3. Setup DBSQL Tables (Optional)

To use real data from Databricks SQL instead of sample data:

1. Run the DDL script in Databricks SQL Editor: `scripts/sql/create_tables.sql`
2. Seed with sample data: `scripts/sql/seed_data_alice.sql` and/or `scripts/sql/seed_data_bob.sql`
3. See `docs/DBSQL_SETUP.md` for detailed instructions

### 4. Run Development Servers

#### Option A: Using the setup script

```bash
./scripts/setup.sh      # First time only
./scripts/start_dev.sh  # Starts both backend and frontend
```

#### Option B: Manual startup

Terminal 1 - Backend (FastAPI):

```bash
source .venv/bin/activate
uvicorn server.app:app --reload --port 8000
```

Terminal 2 - Frontend (Vite):

```bash
cd client
npm run dev
```

### 5. Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

On first visit, you'll see a login page. Enter an email that matches your seed data:

- `alice@company.com` - Established professional (higher income, homeowner, moderate risk)
- `bob@company.com` - Young professional (early career, renter, aggressive risk)

> **Note:** The email you enter must match the `user_email` in your DBSQL tables. Run the corresponding seed script(s) to populate data for each demo user.

## Project Structure

```text
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       │   └── finance/    # Dashboard components
│       ├── contexts/       # React contexts (User, Theme, etc.)
│       ├── pages/          # Page components (Login, Dashboard, etc.)
│       └── lib/
├── server/                 # FastAPI backend
│   ├── data/               # Sample data (fallback when DBSQL not configured)
│   ├── db/                 # Database connections (DBSQL, Lakebase)
│   ├── models/             # Pydantic models
│   ├── routers/            # API endpoints
│   └── services/           # Business logic, agent handlers
├── scripts/
│   └── sql/                # DBSQL DDL and seed scripts
├── docs/                   # Documentation
└── config/
    └── app.json            # App configuration
```

## Data Backend

The app supports two data backends:

### 1. Sample Data (Default)

When DBSQL is not configured, the app uses in-memory sample data from `server/data/`.

### 2. Databricks SQL

When configured, the app queries Delta tables in Unity Catalog. See `docs/DBSQL_SETUP.md` for setup instructions.

Required environment variables:

- `DBSQL_SCHEMA` - Unity Catalog schema (e.g., `main.personal_finance`)
- `DATABRICKS_SERVER_HOSTNAME` - SQL Warehouse hostname
- `DATABRICKS_HTTP_PATH` - SQL Warehouse HTTP path
- `DATABRICKS_TOKEN` - Personal access token

## Authentication

The app uses a demo login system for local development:

1. User enters an email on the login page (stored in localStorage)
2. All API calls include this email in the `x-demo-user` header
3. Backend queries DBSQL tables filtered by this email

In production (Databricks Apps), authentication uses the `x-forwarded-user` header set by the platform.

## API Endpoints

| Endpoint | Method | Description |
| ---------- | -------- | ------------- |
| `/api/finance/summary` | GET | Returns financial summary with assets, liabilities, and net worth |
| `/api/finance/assets` | POST | Add a new asset |
| `/api/finance/liabilities` | POST | Add a new liability |
| `/api/finance/transactions` | GET | Returns transaction data with daily cashflow |
| `/api/finance/investments` | GET | Returns investment holdings and portfolio history |
| `/api/profile` | GET/PUT/PATCH/DELETE | User profile management |
| `/api/health` | GET | Health check |

### Example Response

```bash
curl http://localhost:8000/api/finance/summary
```

```json
{
  "success": true,
  "data": {
    "totalAssets": 655000,
    "totalLiabilities": 375500,
    "netWorth": 279500,
    "assets": [...],
    "liabilities": [...],
    "lastUpdated": "2024-12-19T..."
  }
}
```

## Deploying to Databricks Apps

### 1. Configure Environment Variables

Edit `app.yaml` with your DBSQL configuration:

```yaml
env:
  - name: ENV
    value: production
  - name: DBSQL_SCHEMA
    value: "your_catalog.your_schema"
  - name: DATABRICKS_SERVER_HOSTNAME
    value: "your-workspace.cloud.databricks.com"
  - name: DATABRICKS_HTTP_PATH
    value: "/sql/1.0/warehouses/your_warehouse_id"
```

### 2. Configure Deployment Settings

Create/update `.env.local` with deployment settings:

```bash
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_APP_NAME=personal-finance-app
WORKSPACE_SOURCE_PATH=/Workspace/Users/your-email/personal-finance-app
DATABRICKS_CONFIG_PROFILE=your-profile  # CLI profile name
```

### 3. Deploy

```bash
./scripts/deploy.sh
```

This will:
1. Build the frontend (`client/out/`)
2. Sync code to your Databricks workspace
3. Upload the build folder (gitignored, uploaded separately)
4. Deploy the app

> **Note:** If the CLI deploy fails, the script will show instructions to deploy manually via the Databricks UI (Compute → Apps).

## Development

### Type Checking

```bash
# Frontend
cd client && npx tsc --noEmit

# Backend (with ruff)
ruff check server/
```

### Modifying Sample Data

Edit files in `server/data/` to change the sample financial data, or set up DBSQL tables with your own data.

## Roadmap

Planned features and integrations:

- [ ] **Lakebase (PostgreSQL) Integration** - Persistent chat history and user profile storage using Databricks Lakebase. Infrastructure is in place (`server/db/`), pending full integration.
- [ ] **Additional MCP Tools** - More external data sources (market data APIs, financial news, economic indicators)
- [ ] **Multi-Agent Orchestration** - Specialized agents for different financial domains (tax planning, retirement, budgeting)
- [ ] **Portfolio Analytics** - Advanced investment analysis with performance attribution and risk metrics
