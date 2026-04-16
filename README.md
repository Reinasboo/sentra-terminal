# Sentra Terminal

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Reinasboo/sentra-terminal/ci-cd.yml?branch=main&style=flat-square)](https://github.com/Reinasboo/sentra-terminal/actions)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square)](https://www.python.org/)
[![Node 18+](https://img.shields.io/badge/Node-18+-green?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)

**Sentra Terminal** is an enterprise-grade analytics platform for perpetual futures trading on Solana. It transforms market data and social sentiment into actionable intelligence using **Pacifica Finance API** as the authoritative source of truth for on-chain market data.

---

## Table of Contents

- [Overview](#overview)
- [Pacifica Integration](#pacifica-integration)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development Guide](#development-guide)
- [API Endpoints](#api-endpoints)
- [Data Integration](#data-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview

Sentra Terminal provides institutional-grade market analytics for Solana perpetual futures traders. The platform combines real-time on-chain market data from **Pacifica Finance API** with off-chain sentiment analysis and AI-powered intelligence to deliver comprehensive trading insights.

**Key Value Propositions:**
- Real-time market analytics with sub-second latency
- AI-generated market move explanations
- Liquidation pressure forecasting
- Whale activity tracking and alerts
- Social sentiment intelligence from X, Telegram, and prediction markets
- Professional 3D visualizations and interactive dashboards

---

## Pacifica Integration

Sentra Terminal uses **Pacifica Finance API** as the primary data source for all market information. Pacifica provides authoritative, trustless market data directly from Solana's on-chain perpetual contracts.

### Data Points from Pacifica

| Data Point | Use Case | Update Frequency |
|-----------|----------|------------------|
| Prices (OHLCV) | Price charts, technical indicators | Real-time |
| Funding Rates | Position profitability analysis, trader alerts | 1-minute |
| Open Interest | Market depth, liquidation risk modeling | 1-minute |
| Volume | Market activity, trade intensity | Real-time |
| Liquidations | Liquidation pressure heatmaps, risk zones | Real-time |
| Positions | Whale tracking, concentration analysis | 5-minute |
| Orders | Order book depth, large order alerts | Real-time |

### Architecture: Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sentra Terminal Frontend                      │
│                 (Next.js + React + TypeScript)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Analytics Layer                                            │ │
│  │ - Liquidation clustering & pressure analysis              │ │
│  │ - Whale activity identification & alerts                  │ │
│  │ - Trader performance scoring                              │ │
│  │ - Market correlation analysis                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AI Intelligence Layer                                      │ │
│  │ - Market move explanations via LLM                         │ │
│  │ - Narrative tracking & trending analysis                  │ │
│  │ - Anomaly detection                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Data Integration Layer                                     │ │
│  │ ├─ Pacifica Markets: Price, funding, OI, volume, position│ │
│  │ ├─ Pacifica Trades: Liquidations, large orders, trades   │ │
│  │ └─ Elfa Sentiment: Social signals, narratives             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Cache & Database Layer (PostgreSQL + Redis)              │ │
│  │ - Market candles (OHLCV)                                  │ │
│  │ - Analytics summaries                                     │ │
│  │ - Trader profiles & historical metrics                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────────────────────────────────┘
             │ Async Ingest (aiohttp)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  External Data Sources (Pacifica Finance API)                   │
│  └─ Primary Market Data Source: prices, funding, OI, positions  │
│  └─ Elfa Sentiment: Social signals, trending narratives         │
│  └─ CoinGecko: Historical pricing & fallback data               │
└─────────────────────────────────────────────────────────────────┘
```

### Pacifica SDK Integration

Sentra uses the Pacifica Python SDK to fetch market data:

```python
# Example: Fetching market data from Pacifica
from app.services.pacifica_service import PacificaService

pacifica = PacificaService()

# Get current market prices
markets = await pacifica.get_markets(['BTC-PERP', 'ETH-PERP', 'SOL-PERP'])
# Returns: {symbol: price, funding_rate, open_interest, ...}

# Get liquidations for a market
liquidations = await pacifica.get_liquidations('BTC-PERP', hours=24)
# Returns: {long_amount, short_amount, cluster_zones, ...}

# Get whale positions
positions = await pacifica.get_positions('BTC-PERP', min_usd=100000)
# Returns: [position_1, position_2, ...]
```

### Supported Markets (14 Total)

Sentra Terminal tracks the following perpetual futures markets:

- **Majors**: BTC-PERP, ETH-PERP, SOL-PERP
- **Layer 1s**: AVAX-PERP, NEAR-PERP, ATOM-PERP
- **Layer 2s**: ARB-PERP, OP-PERP
- **Alts**: DOGE-PERP, XRP-PERP, ADA-PERP, LINK-PERP, UNI-PERP, MATIC-PERP

---

## Features

### Core Analytics

- **Real-time Market Analytics** - Live prices, volume, open interest, funding rates from Pacifica
- **Liquidation Pressure Analysis** - Identifies liquidation clusters and risk zones based on Pacifica data
- **Whale Activity Tracking** - Tracks large traders and position concentration from on-chain data
- **Trader Performance Insights** - Win rate, PnL, Sharpe ratio, trader leaderboard
- **Liquidity Provider Risk Analytics** - APR, funding earnings, volatility exposure
- **Social Sentiment Intelligence** - Real-time sentiment from X, Telegram, prediction markets

### AI-Powered Features

- **Market Move Explanations** - AI generates contextual explanations for price movements
- **Narrative Tracking** - Monitors trending narratives across social platforms
- **Smart Account Intelligence** - Filters high-quality signal sources
- **Anomaly Detection** - Identifies unusual market activity patterns

### Visualizations

- **Cinematic 3D Data Visualizations** - 3D liquidation map and trading activity globe
- **Professional Charts** - TradingView-quality price, funding, and volume charts
- **Interactive Dashboards** - Draggable widgets, real-time updates, custom layouts
- **Heatmaps & Heatgrids** - Visual representation of liquidation zones and trader concentration

---

## Architecture

### System Design

```
┌───────────────────────────────────────┐
│     Web Browser / Mobile Client       │
│     (TypeScript + React)              │
└────────────────┬──────────────────────┘
                 │ HTTP/WebSocket
                 ▼
         ┌───────────────────┐
         │  CDN / Vercel     │
         │  (Frontend)       │
         └─────────┬─────────┘
                   │ API Calls
                   ▼
    ┌──────────────────────────────────┐
    │     FastAPI Backend (Python)     │
    │  ┌──────────────────────────────┐│
    │  │  REST/WebSocket Routes       ││
    │  │  - /markets/                 ││
    │  │  - /analytics/               ││
    │  │  - /ai/                      ││
    │  │  - /auth/                    ││
    │  └──────────────────────────────┘│
    │  ┌──────────────────────────────┐│
    │  │  Business Logic Services     ││
    │  │  - Market analysis           ││
    │  │  - Liquidation clustering    ││
    │  │  - Whale identification      ││
    │  │  - AI explanations           ││
    │  └──────────────────────────────┘│
    │  ┌──────────────────────────────┐│
    │  │  Data Layer (SQLAlchemy)     ││
    │  │  - Market data cache         ││
    │  │  - Analytics summaries       ││
    │  │  - User sessions             ││
    │  └──────────────────────────────┘│
    └─────┬──────────────────────────┬─┘
          │                          │
    ┌─────▼──────┐            ┌─────▼──────┐
    │  PostgreSQL│            │ Redis Cache│
    │  Database  │            │  (optional)│
    └────────────┘            └────────────┘
          │                          │
    ┌─────▴──────────────────────────┴─────┐
    │   Data Ingestion Jobs (cron/async)   │
    │   ┌─────────────────────────────┐    │
    │   │ Pacifica Market Ingestion   │    │
    │   │ - Prices & OHLCV            │    │
    │   │ - Funding rates             │    │
    │   │ - Open interest             │    │
    │   │ - Liquidations (real-time)  │    │
    │   └─────────────────────────────┘    │
    │   ┌─────────────────────────────┐    │
    │   │ Pacifica Trade Ingestion    │    │
    │   │ - Large trades              │    │
    │   │ - Liquidations              │    │
    │   └─────────────────────────────┘    │
    │   ┌─────────────────────────────┐    │
    │   │ Sentiment Data Ingestion    │    │
    │   │ (via Elfa AI)               │    │
    │   └─────────────────────────────┘    │
    └─────┬─────────────────────────────────┘
          │
    ┌─────▴─────────────────────────────┐
    │  External APIs (Third-party)      │
    │  ┌─────────────────────────────┐  │
    │  │ Pacifica Finance API        │  │
    │  │ (Market data - primary)     │  │
    │  └─────────────────────────────┘  │
    │  ┌─────────────────────────────┐  │
    │  │ Elfa Sentiment API          │  │
    │  │ (Social signals)            │  │
    │  └─────────────────────────────┘  │
    │  ┌─────────────────────────────┐  │
    │  │ CoinGecko API               │  │
    │  │ (Fallback/historical data)  │  │
    │  └─────────────────────────────┘  │
    └───────────────────────────────────┘
```

---

## Tech Stack

### Backend
- **Python 3.11+** - High-performance, type-safe Python
- **FastAPI 0.114+** - Modern async web framework with OpenAPI documentation
- **SQLAlchemy 2.0+** - ORM with async support
- **PostgreSQL 15+** - Primary data store
- **Redis (optional)** - Caching layer for performance
- **aiohttp** - Async HTTP client for API integrations
- **PyJWT** - Wallet signature verification (Ed25519)
- **PyNaCl** - Cryptographic operations

### Frontend
- **Next.js 14.2+** - React framework with App Router and Server Components
- **React 18.2+** - UI component library
- **TypeScript 5.x** - Type-safe development
- **Tailwind CSS 3+** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **TanStack React Query v5** - Server state management
- **Recharts & D3.js** - Interactive data visualization
- **shadcn/ui** - High-quality component library
- **Zustand** - Lightweight state management

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **PostgreSQL 16** - Production database
- **Vercel** - Frontend deployment (recommended)
- **AWS/Railway/Heroku** - Backend deployment options

### External Integrations
- **Pacifica Finance API** - Market data source
- **Elfa AI API** - Sentiment analysis
- **CoinGecko API** - Historical pricing fallback

---

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher  
- PostgreSQL 15 or higher (or use Docker)
- Git

### 60-Second Setup (with Docker Compose)

```bash
# 1. Clone the repository
git clone https://github.com/Reinasboo/sentra-terminal.git
cd sentra-terminal

# 2. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start all services
docker-compose up

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup (Local Development)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development

# Configure environment
cp .env.example .env
# Edit .env with your Pacifica API key and database URL

# Initialize database
alembic upgrade head  # Run migrations

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Development Guide

### Project Structure

```
sentra-terminal/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── markets.py        # Market data endpoints
│   │   │   ├── analytics.py      # Analytics endpoints
│   │   │   └── ai.py             # AI intelligence endpoints
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── pacifica_service.py    # Pacifica API client
│   │   │   ├── sentiment_service.py   # Elfa sentiment analysis
│   │   │   ├── analytics_service.py   # Market analytics
│   │   │   └── ai_service.py          # AI explanations
│   │   ├── db/                   # Database configuration
│   │   ├── main.py               # FastAPI application
│   │   ├── security.py           # JWT & signature verification
│   │   └── websocket_manager.py  # WebSocket connections
│   ├── tests/
│   │   ├── api/                  # API endpoint tests
│   │   ├── services/             # Service unit tests
│   │   └── conftest.py           # Pytest configuration
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/            # Layout and pages
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── trading/          # Trading interface
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/
│   │   │   ├── features/         # Feature components
│   │   │   │   ├── MarketStoryTimeline.tsx
│   │   │   │   ├── LiquidationRadar.tsx
│   │   │   │   ├── WhaleTracker.tsx
│   │   │   │   └── ...
│   │   │   └── layout/           # Layout components
│   │   ├── hooks/
│   │   │   ├── useApi.ts         # React Query hooks
│   │   │   ├── useAuth.ts        # Auth management
│   │   │   └── useWebSocket.ts   # Real-time updates
│   │   ├── lib/
│   │   │   ├── api/              # API client
│   │   │   └── utils/            # Utility functions
│   │   └── styles/               # Global styles
│   ├── __tests__/                # Component tests
│   ├── vitest.config.ts          # Vitest configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
│
├── data/
│   └── scripts/
│       ├── ingest_pacifica_markets.py  # Market data ingestion
│       ├── ingest_pacifica_trades.py   # Trade data ingestion
│       └── ingest_elfa_social_data.py  # Sentiment ingestion
│
├── docs/
│   ├── ARCHITECTURE.md           # System architecture
│   └── QUICKSTART.md             # Quick start guide
│
├── docker-compose.yml
├── .github/workflows/ci-cd.yml   # CI/CD pipeline
└── README.md
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Update code in the relevant directory
   - Write/update tests
   - Update documentation

3. **Run tests locally**
   ```bash
   # Backend
   cd backend && pytest -v

   # Frontend
   cd frontend && npm run test
   ```

4. **Run linting and type checking**
   ```bash
   # Backend
   cd backend && flake8 app

   # Frontend
   cd frontend && npm run type-check
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: describe your feature"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Link related issues
   - Describe changes and impact
   - Ensure CI/CD checks pass

### Code Quality Standards

- **Python**: PEP 8, type hints (mypy), docstrings
- **TypeScript**: Strict mode, ESLint rules, proper typing
- **Tests**: Minimum 80% coverage, integration tests for critical paths
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)

---

## API Endpoints

### Authentication
- `POST /auth/message` - Generate auth message for wallet signature
- `POST /auth/login` - Verify signature and get JWT token
- `GET /auth/profile` - Get current user profile
- `POST /auth/logout` - Logout and invalidate token

### Markets (Powered by Pacifica)
- `GET /markets/` - List all supported markets
- `GET /markets/{symbol}` - Get current market data (price, funding, OI, etc.)
- `POST /markets/{symbol}/refresh` - Manually refresh market data
- `GET /markets/{symbol}/candles` - Get OHLCV candles (1h, 4h, daily)

### Analytics (Pacifica-based)
- `GET /analytics/liquidations/{symbol}` - Liquidation pressure analysis
- `GET /analytics/liquidation-risk/{symbol}` - Liquidation risk score (0-100)
- `GET /analytics/whale-trades/{symbol}` - Large trades (whale activity)
- `GET /analytics/whales/{symbol}` - Top whale positions
- `GET /analytics/trader/{wallet_address}` - Trader performance metrics
- `GET /analytics/trader-leaderboard` - Top traders by PnL

### Social Sentiment (Elfa-based)
- `GET /analytics/sentiment/{token}` - Current sentiment score
- `GET /analytics/trending-narratives` - Trending topics/narratives
- `GET /analytics/social-signals` - Real-time social signals

### AI Intelligence
- `POST /ai/explain-market-move` - Generate explanation for price movement
- `GET /ai/insight/{symbol}` - Latest AI-generated market insight
- `POST /ai/chat` - Chat with AI market analyst

### WebSocket
- `WS /ws/prices` - Real-time price updates
- `WS /ws/liquidations` - Real-time liquidation alerts
- `WS /ws/whale-activity` - Real-time whale activity
- `WS /ws/sentiment` - Real-time sentiment updates

**Full API Documentation**: http://localhost:8000/docs (Swagger UI)

---

## Data Integration

### Pacifica Market Data Ingestion

Sentra Terminal continuously ingests market data from Pacifica Finance API:

```bash
# Manual ingestion (one-time)
python data/scripts/ingest_pacifica_markets.py

# Set up scheduled ingestion (every 5 minutes)
*/5 * * * * cd /path/to/sentra-terminal && python data/scripts/ingest_pacifica_markets.py
```

**Data ingested:**
- OHLCV candles (1-minute frequency)
- Current prices and 24h changes
- Funding rates and prediction
- Open interest levels
- Trade volume

### Liquidation Alerts (Real-time from Pacifica)

The backend subscribes to Pacifica's liquidation stream and immediately:
1. Processes liquidation data
2. Clusters nearby liquidations into zones
3. Broadcasts alerts via WebSocket
4. Stores historical data for analysis

### Social Sentiment Ingestion

```bash
# Elfa sentiment data (every 10 minutes)
*/10 * * * * cd /path/to/sentra-terminal && python data/scripts/ingest_elfa_social_data.py
```

### Database Schema

Key tables for Pacifica data:

```sql
-- Market data from Pacifica
CREATE TABLE market_data (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  price DECIMAL,
  funding_rate DECIMAL,
  open_interest DECIMAL,
  volume_24h DECIMAL,
  source VARCHAR(50),  -- 'pacifica', 'coingecko', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_symbol_created (symbol, created_at)
);

-- Liquidations from Pacifica
CREATE TABLE liquidations (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20),
  price DECIMAL,
  side VARCHAR(10),  -- 'long' or 'short'
  size DECIMAL,
  timestamp TIMESTAMP,
  source VARCHAR(50),  -- 'pacifica'
  INDEX idx_symbol_timestamp (symbol, timestamp)
);

-- Whale positions from Pacifica
CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255),
  symbol VARCHAR(20),
  side VARCHAR(10),
  size DECIMAL,
  entry_price DECIMAL,
  unrealized_pnl DECIMAL,
  last_updated TIMESTAMP,
  source VARCHAR(50),  -- 'pacifica'
  INDEX idx_wallet_symbol (wallet_address, symbol)
);
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/api/test_markets.py -v

# Run specific test class or function
pytest tests/api/test_markets.py::test_markets_endpoint -v
```

**Test organization:**
- `tests/api/` - Endpoint tests
- `tests/services/` - Business logic tests
- `tests/test_auth_integration.py` - Authentication tests
- `tests/conftest.py` - Pytest fixtures

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### E2E Testing

For end-to-end testing, we use Playwright (optional):

```bash
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

### CI/CD Testing

GitHub Actions automatically runs tests on every push:
- Python tests with PostgreSQL
- TypeScript type checking
- Build verification
- Linting checks

---

## Deployment

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sentra_terminal
REDIS_URL=redis://localhost:6379/0  # Optional

# Pacifica API (required)
PACIFICA_API_KEY=your_pacifica_api_key
PACIFICA_API_BASE_URL=https://api.pacifica.fi
PACIFICA_PRIVATE_KEY=your_private_key_for_signing  # Optional

# Elfa AI API
ELFA_API_KEY=your_elfa_api_key
ELFA_API_BASE_URL=https://api.elfa.ai

# Server configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=False
LOG_LEVEL=INFO

# Security
JWT_SECRET_KEY=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:3000,https://sentra.example.com

# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Docker Deployment

#### Build Docker Images

```bash
# Backend
docker build -t sentra-backend:latest -f backend/Dockerfile ./backend

# Frontend
docker build -t sentra-frontend:latest -f frontend/Dockerfile ./frontend
```

#### Run with Docker Compose (Local Development)

```bash
docker-compose up --build
```

**Services started:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Production Deployment

#### Option 1: Vercel (Frontend) + AWS (Backend)

```bash
# Deploy frontend to Vercel
vercel deploy --prod

# Backend: Deploy to AWS ECS/App Runner
# Push Docker image to ECR, then create/update ECS service
```

#### Option 2: Railway

```bash
# Deploy both services to Railway
railway up
```

#### Option 3: Self-hosted (VPS/Dedicated Server)

```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/Reinasboo/sentra-terminal.git
cd sentra-terminal

# Create environment files
nano backend/.env
nano frontend/.env.local

# Build and run with Docker Compose
docker-compose up -d

# Set up Nginx reverse proxy and SSL (recommended)
sudo apt-get install nginx
sudo certbot certonly --nginx -d your-domain.com
```

#### Nginx Configuration (SSL + Reverse Proxy)

```nginx
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring & Alerts

**Recommended Tools:**
- **Backend**: Prometheus + Grafana for metrics
- **Frontend**: Sentry for error tracking
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime**: Datadog or UptimeRobot

---

## Security

### Authentication & Authorization

- **Wallet-based Auth**: Sign-in with wallet (Ed25519 signature verification)
- **JWT Tokens**: 1-hour access tokens + 7-day refresh tokens
- **Rate Limiting**: 100 requests/minute per user
- **CORS**: Strict origin validation

### Data Protection

- **HTTPS/WSS**: All traffic encrypted in transit
- **Database Encryption**: PostgreSQL SSL connections
- **API Key Management**: Environment variables, never hardcoded
- **Sensitive Data**: Passwords/keys never logged

### Solana Security

- **Signature Verification**: Ed25519 using PyNaCl
- **Account Derivation**: PDA-based patterns
- **Transaction Validation**: Verify program ID and instruction type

### Best Practices

1. **Never commit secrets** - Use environment variables
2. **Enable 2FA** on GitHub repository
3. **Rotate API keys** regularly (Pacifica, Elfa)
4. **Keep dependencies updated** - Run `npm audit`, `pip-audit`
5. **Enable branch protection** on main branch
6. **Code review** all pull requests before merging

### Security Audit Checklist

- [ ] All API endpoints require authentication (except public endpoints)
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (SQLAlchemy ORM used)
- [ ] XSS prevention (Next.js sanitization)
- [ ] CORS properly configured
- [ ] Secrets management in place
- [ ] HTTPS enforced in production
- [ ] Database backups automated
- [ ] Logging configured (no sensitive data)
- [ ] Dependency vulnerabilities scanned

---

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError: No module named 'app'"
```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt
```

#### "psycopg2 installation fails"
```bash
# Install system dependencies (Ubuntu)
sudo apt-get install python3-dev postgresql-client libpq-dev

# Then retry pip install
pip install -r requirements.txt
```

#### "Pacifica API connection timeout"
```bash
# Check API key in .env
cat backend/.env | grep PACIFICA_API_KEY

# Test connectivity
python -c "import requests; r = requests.get('https://api.pacifica.fi/health'); print(r.status_code)"
```

### Frontend Issues

#### "npm ERR! code ERR_MODULE_NOT_FOUND"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "TypeScript compilation errors"
```bash
# Run type checking
npm run type-check

# Fix automatically
npx tsc --noEmit
```

#### "WebSocket connection refused"
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify NEXT_PUBLIC_API_URL in .env.local
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL
```

### Database Issues

#### "Database connection refused"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in backend/.env
psql $(grep DATABASE_URL backend/.env | cut -d= -f2)
```

#### "Migration errors"
```bash
# Rollback last migration
alembic downgrade -1

# Reapply migrations
alembic upgrade head
```

---

## Contributing

### Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** with clear messages (`git commit -m 'feat: add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request with description and linked issues

### Contribution Areas

- Bug fixes and improvements
- New data sources/integrations
- UI/UX enhancements
- Performance optimizations
- Documentation improvements
- Testing coverage

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

## License

**Proprietary License** - All rights reserved

Sentra Terminal is proprietary software. Unauthorized copying, distribution, or modification is prohibited. For licensing inquiries, contact the maintainers.

---

## Support & Community

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/Reinasboo/sentra-terminal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Reinasboo/sentra-terminal/discussions)
- **Documentation**: [/docs](./docs)

### Community

- **Discord**: [Pacifica Community](https://discord.gg/pacifica)
- **Twitter**: [@SentraTerminal](https://twitter.com/sentraterminal)

### Feedback

We'd love to hear your feedback! Open an issue or discussion with your ideas.

---

## Changelog

### Version 1.1.0 (Current)
- ✨ Pacifica Finance API integration as primary data source
- ✨ Real-time liquidation alerts via WebSocket
- ✨ 14-market multi-market support
- ✨ Whale activity tracking improvements
- 🐛 TypeScript strict mode compliance
- 🐛 Backend test infrastructure fixes
- 🚀 CI/CD pipeline optimization
- 📚 Comprehensive architecture documentation

### Version 1.0.0
- Initial release
- Core analytics platform
- Real-time market data (basic)
- AI-powered explanations
- Social sentiment integration

---

## Acknowledgments

- **Pacifica Finance** - Market data provider
- **Elfa AI** - Sentiment analysis
- **Solana Foundation** - Blockchain infrastructure
- **Open-source community** - Amazing libraries and tools

---

**Last Updated**: April 16, 2026

**Maintainers**: [Reinasboo](https://github.com/Reinasboo)

For questions or concerns, please open an issue or reach out to the maintainers.
