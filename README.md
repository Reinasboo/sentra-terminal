# Sentra Terminal

Professional-grade analytics platform for crypto trading. Sentra Terminal transforms raw perpetual market data and social sentiment into actionable intelligence for traders.

## Features

### Core Analytics
- **Real-time Market Analytics** - Live price, volume, open interest, funding rates
- **Trader Performance Insights** - Win rate, PnL, Sharpe ratio, trader leaderboard
- **Liquidation Pressure Analysis** - Identify liquidation clusters and risk zones
- **Whale Activity Tracking** - Track large traders and position concentration
- **Liquidity Provider Risk Analytics** - APR, funding earnings, volatility exposure
- **Social Sentiment Intelligence** - Real-time sentiment from X, Telegram, prediction markets

### AI-Powered Features
- **Market Move Explanations** - AI generates explanations for price movements
- **Narrative Tracking** - Monitor trending narratives across social platforms
- **Smart Account Intelligence** - Filter high-quality signal sources

### Visualizations
- **Cinematic 3D Data Visualizations** - 3D liquidation map and trading activity globe
- **Professional Charts** - TradingView-quality price, funding, and volume charts
- **Interactive Dashboards** - Draggable widgets, real-time updates

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - High-performance async web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Data persistence

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **TanStack Query** - Server state management
- **Recharts & D3.js** - Data visualization

### Integrations
- **Pacifica Finance API** - Market data, trades, liquidations, positions
- **Elfa AI** - Social sentiment, trending narratives, AI chat

## Project Structure

```
sentra-terminal/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── db/            # Database config
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   └── styles/        # Global styles
│   ├── package.json
│   └── tsconfig.json
├── data/
│   └── scripts/           # Data ingestion scripts
└── docs/                  # Documentation
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

5. **Initialize database**
   ```bash
   # Create PostgreSQL database first
   python -c "from app.db import init_db; init_db()"
   ```

6. **Start the server**
   ```bash
   python app/main.py
   ```
   
   Or with uvicorn:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Set NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Markets
- `GET /markets/` - List all markets
- `GET /markets/{symbol}` - Get market data for symbol
- `POST /markets/{symbol}/refresh` - Refresh market data

### Analytics
- `GET /analytics/liquidations/{symbol}` - Liquidation analysis
- `GET /analytics/liquidation-risk/{symbol}` - Risk score
- `GET /analytics/sentiment/{token}` - Social sentiment
- `GET /analytics/trending-narratives` - Trending narratives
- `GET /analytics/whales/{symbol}` - Whale positions
- `GET /analytics/whale-trades/{symbol}` - Large trades
- `GET /analytics/trader/{address}` - Trader metrics
- `GET /analytics/trader-leaderboard` - Top traders

### AI Intelligence
- `POST /ai/explain-market-move` - Generate market explanation
- `GET /ai/insight/{symbol}` - Get latest insight

## Data Ingestion

Run data ingestion scripts to populate the database:

```bash
cd data/scripts

# Ingest market data
python ingest_pacifica_markets.py

# Ingest trades
python ingest_pacifica_trades.py

# Ingest social data
python ingest_elfa_social_data.py
```

Or set up cron jobs for periodic ingestion:

```bash
# Update every 5 minutes
*/5 * * * * cd /path/to/sentra-terminal/data/scripts && python ingest_pacifica_markets.py

# Update every 10 minutes
*/10 * * * * cd /path/to/sentra-terminal/data/scripts && python ingest_elfa_social_data.py
```

## Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/sentra_terminal
PACIFICA_API_KEY=your_api_key
PACIFICA_API_BASE_URL=https://api.pacifica.fi
ELFA_API_KEY=your_api_key
ELFA_API_BASE_URL=https://api.elfa.ai
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=False
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Docker Compose

Use Docker Compose to run the full stack locally:

```bash
docker-compose up
```

### Cloud Deployment

#### AWS
- Backend: ECS, App Runner, or EC2
- Frontend: CloudFront + S3, or Vercel
- Database: RDS PostgreSQL

#### Vercel
- Deploy frontend to Vercel: `vercel deploy`
- Backend on AWS, Railway, or Heroku

#### Heroku
```bash
# Backend
heroku create sentra-terminal-api
heroku buildpacks:add heroku/python
git push heroku main

# Frontend
vercel deploy
```

## Performance Optimization

### Backend
- Caching with Redis for frequently accessed data
- Database connection pooling
- Query optimization with proper indexing
- Background jobs for data ingestion

### Frontend
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Memoization for expensive computations
- WebSocket for real-time updates

## Monitoring & Logging

- **Backend**: OpenTelemetry, Prometheus metrics
- **Frontend**: Sentry for error tracking
- **Logs**: ELK Stack or CloudWatch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/pacifica-fi/sentra-terminal/issues)
- Documentation: [Docs](./docs)
- Discord: [Pacifica Community](https://discord.gg/pacifica)

## Changelog

### Version 1.0.0
- Initial release
- Core analytics platform
- Real-time market data
- AI-powered explanations
- Social sentiment integration
