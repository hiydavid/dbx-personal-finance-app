# Personal Finance Assistant App

A personal finance app built on the Databricks GenAI App Template. Track your assets, liabilities, and net worth at a glance.

## Prerequisites

- Python 3.11+
- Node.js 18+ (or Bun)
- Databricks workspace (for production deployment)

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

Create a `.env.local` file in the project root:

```bash
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...  # Only needed for local development
```

### 3. Run Development Servers

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

### 4. Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```text
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       │   └── finance/    # Dashboard components
│       ├── lib/
│       │   └── finance-types.ts
│       └── pages/
├── server/                 # FastAPI backend
│   ├── data/
│   │   └── sample_finance.py
│   ├── models/
│   │   └── finance.py
│   └── routers/
│       └── finance.py
└── config/
    └── app.json            # App configuration
```

## API Endpoints

| Endpoint | Method | Description |
| ---------- | -------- | ------------- |
| `/api/finance/summary` | GET | Returns financial summary with assets, liabilities, and net worth |
| `/api/finance/assets` | POST | Add a new asset (in-memory) |
| `/api/finance/liabilities` | POST | Add a new liability (in-memory) |
| `/api/finance/transactions` | GET | Returns transaction data with daily cashflow |
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

### 1. Build the frontend

```bash
cd client && npm run build && cd ..
```

### 2. Deploy using Databricks CLI

```bash
./scripts/deploy.sh
```

Or manually:

```bash
databricks apps deploy . --app-name personal-finance
```

## Development

### Type Checking

```bash
# Frontend
cd client && npx tsc --noEmit

# Backend (with mypy)
mypy server/
```

### Modifying Sample Data

Edit `server/data/sample_finance.py` to change the sample financial data.
