# Sentra Terminal - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker & Docker Compose
- OR Python 3.11+ and Node.js 18+

### Option 1: Docker Compose (Recommended)

1. **Clone or download the project**
   ```bash
   cd sentra-terminal
   ```

2. **Create .env file**
   ```bash
   cat > .env << EOF
   PACIFICA_API_KEY=your_api_key_here
   ELFA_API_KEY=your_api_key_here
   EOF
   ```

3. **Start the application**
   ```bash
   docker-compose up
   ```

4. **Access the platform**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Initialize database (requires PostgreSQL running)
python -c "from app.db import init_db; init_db()"

# Start server
python app/main.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Start development server
npm run dev
```

## 📊 First Steps

### 1. Configure API Keys

Get your API keys from:
- **Pacifica**: https://docs.pacifica.fi/api-documentation/api
- **Elfa**: https://go.elfa.ai/docs-hackathon

Update `.env` or `.env.local` with your keys.

### 2. Populate Initial Data

Run data ingestion scripts:
```bash
python data/scripts/ingest_pacifica_markets.py
python data/scripts/ingest_pacifica_trades.py
python data/scripts/ingest_elfa_social_data.py
```

### 3. Access the Dashboard

Open http://localhost:3000 and explore:
- **Dashboard**: Overview of key metrics
- **Liquidation Radar**: Analyze liquidation zones
- **Whale Tracker**: Track large traders
- **Market Sentiment**: Monitor social trends
- **AI Intelligence**: Generate market explanations

## 🔌 API Endpoints

### Markets
```bash
# Get all markets
curl http://localhost:8000/markets/

# Get BTC market data
curl http://localhost:8000/markets/BTC

# Refresh market data
curl -X POST http://localhost:8000/markets/BTC/refresh
```

### Analytics
```bash
# Get liquidation analysis
curl http://localhost:8000/analytics/liquidations/BTC

# Get sentiment analysis
curl http://localhost:8000/analytics/sentiment/BTC

# Get trader leaderboard
curl http://localhost:8000/analytics/trader-leaderboard
```

### AI Intelligence
```bash
# Generate market explanation
curl -X POST http://localhost:8000/ai/explain-market-move \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC"}'
```

## 📁 Key Files

### Backend
- `backend/app/main.py` - FastAPI application
- `backend/app/models/__init__.py` - Database models
- `backend/app/services/` - Business logic
- `backend/app/api/` - API endpoints

### Frontend
- `frontend/src/app/page.tsx` - Main dashboard
- `frontend/src/components/` - React components
- `frontend/src/hooks/useApi.ts` - API hooks
- `frontend/src/lib/api.ts` - API client

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/sentra_terminal
PACIFICA_API_KEY=your_key
ELFA_API_KEY=your_key
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Pacifica Docs**: https://docs.pacifica.fi
- **Elfa Docs**: https://go.elfa.ai/docs-hackathon
- **Next.js Guide**: https://nextjs.org/docs
- **FastAPI Guide**: https://fastapi.tiangolo.com

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml or .env
# Frontend: ports: ["3001:3000"]
# Backend: SERVER_PORT=8001
```

### Database Connection Error
```bash
# Ensure PostgreSQL is running
# Check DATABASE_URL is correct
# Verify database exists
```

### API Keys Not Working
```bash
# Verify keys are correctly set in .env
# Check for trailing spaces
# Ensure API endpoint URLs are correct
```

### Frontend Not Loading
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Ensure backend is running
# Check browser console for errors
```

## 💡 Next Steps

1. **Customize the dashboard** - Add/remove widgets in Dashboard.tsx
2. **Extend APIs** - Add new endpoints in backend/app/api/
3. **Deploy** - Use Docker Compose or cloud platforms
4. **Monitor** - Set up logging and monitoring
5. **Optimize** - Add caching, indexing, and performance tuning

## 📞 Support

- GitHub Issues: Report bugs and feature requests
- Discord: Join Pacifica community
- Email: support@pacifica.fi

Happy trading! 📈
