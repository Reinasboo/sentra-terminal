# 🚀 Sentra Terminal - Developer Quick Reference

## Quick Start (Choose One)

### 🐳 Docker (Recommended - 1 minute)
```bash
docker-compose up
# Open http://localhost:3000
```

### 🛠️ Manual Setup (10 minutes)
```bash
# Backend
cd backend && pip install -r requirements.txt
python app/main.py

# Frontend (new terminal)
cd frontend && npm install
npm run dev
# Open http://localhost:3000
```

## Essential Commands

### Backend
```bash
# Start server
python app/main.py

# With auto-reload
uvicorn app.main:app --reload

# Run tests
pytest

# Database
python -c "from app.db import init_db; init_db()"
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npm run type-check
```

### Data Ingestion
```bash
python data/scripts/ingest_pacifica_markets.py
python data/scripts/ingest_pacifica_trades.py
python data/scripts/ingest_elfa_social_data.py
```

## Key Files Cheat Sheet

### Backend
| Need | File |
|------|------|
| Add endpoint | `backend/app/api/*.py` |
| Add database model | `backend/app/models/__init__.py` |
| Add business logic | `backend/app/services/*.py` |
| External API | `backend/app/services/*_service.py` |

### Frontend
| Need | File |
|------|------|
| Add page | `frontend/src/app/[page].tsx` |
| Add component | `frontend/src/components/Name.tsx` |
| Add hook | `frontend/src/hooks/useName.ts` |
| Add style | `frontend/src/styles/globals.css` |

## API Endpoints Quick Reference

### Markets
```bash
GET    /markets/
GET    /markets/{symbol}
POST   /markets/{symbol}/refresh
```

### Analytics
```bash
GET    /analytics/liquidations/{symbol}
GET    /analytics/sentiment/{token}
GET    /analytics/whales/{symbol}
GET    /analytics/trader/{address}
GET    /analytics/trader-leaderboard
```

### AI
```bash
POST   /ai/explain-market-move
GET    /ai/insight/{symbol}
```

Full docs: `http://localhost:8000/docs`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/sentra_terminal
PACIFICA_API_KEY=xxx
ELFA_API_KEY=xxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Quick Access

### Reset Database
```bash
# Drop all tables (development only!)
# Then reinitialize:
python -c "from app.db import init_db; init_db()"
```

### Query Database
```bash
# PostgreSQL CLI
psql postgresql://user:password@localhost:5432/sentra_terminal

# Common queries
SELECT * FROM markets;
SELECT * FROM trades WHERE symbol='BTC';
SELECT * FROM traders ORDER BY trader_score DESC LIMIT 10;
```

## Common Development Tasks

### Add New Market Data Endpoint
1. Create function in `backend/app/api/markets.py`
2. Use `marketApi` in `frontend/src/lib/api.ts`
3. Create hook in `frontend/src/hooks/useApi.ts`
4. Use in component

### Add New Analytics Engine
1. Create service in `backend/app/services/`
2. Add endpoint in `backend/app/api/analytics.py`
3. Create API client in `frontend/src/lib/api.ts`
4. Add React hook in `frontend/src/hooks/useApi.ts`
5. Create component to display results

### Add New Dashboard Widget
1. Create component in `frontend/src/components/widgets/`
2. Use API hook from `useApi.ts`
3. Add to Dashboard or section component
4. Style with TailwindCSS + Framer Motion

## Architecture Overview

```
Frontend (Next.js)
    ↓ (HTTP/REST)
Backend (FastAPI)
    ↓ (SQL)
Database (PostgreSQL)
    ↓ (APIs)
External Services (Pacifica, Elfa)
```

## Debugging Tips

### Backend
```python
# Add logging
import logging
logging.debug("Debug info")

# Test endpoints
curl http://localhost:8000/markets/

# Check database
python -c "from app.db import SessionLocal; db = SessionLocal(); print(db.query(Market).all())"
```

### Frontend
```bash
# Check API calls
# Open DevTools → Network tab

# TypeScript errors
npm run type-check

# Build errors
npm run build
```

## Performance Tips

### Backend
- Use async/await for I/O operations
- Add database indexes for frequent queries
- Cache with Redis (optional)
- Batch API requests

### Frontend
- Lazy load components with dynamic()
- Use React.memo for expensive components
- Optimize images with Next.js Image
- Debounce API calls

## Deployment Checklist

- [ ] Set environment variables in production
- [ ] Configure PostgreSQL database
- [ ] Build Docker images
- [ ] Set up CORS for frontend domain
- [ ] Configure API keys
- [ ] Set up monitoring/logging
- [ ] Enable HTTPS/TLS
- [ ] Set up CI/CD pipeline
- [ ] Configure domain/DNS
- [ ] Test all APIs
- [ ] Load test the platform

## Testing

### Backend
```bash
# Start test database
docker run -d -e POSTGRES_PASSWORD=test postgres:16

# Run tests
pytest tests/
```

### Frontend
```bash
# E2E tests with Playwright
npx playwright test

# Unit tests (optional - add if needed)
npm test
```

## Monitoring & Logs

### Docker
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v
```

### Database
```bash
# Connection issues
PGPASSWORD=password psql -h localhost -U user -d sentra_terminal

# Check active connections
SELECT * FROM pg_stat_activity;
```

## Resources

- 📖 [Full README](./README.md)
- 🏗️ [Architecture](./docs/ARCHITECTURE.md)
- ⚡ [Quick Start](./docs/QUICKSTART.md)
- 📋 [File Index](./FILE_INDEX.md)
- 📚 [API Docs](http://localhost:8000/docs)
- 🔗 [Pacifica Docs](https://docs.pacifica.fi)
- 🤖 [Elfa Docs](https://go.elfa.ai/docs-hackathon)

## Common Issues & Solutions

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill process:
lsof -i :3000  # Find process on port 3000
kill -9 <PID>
```

### Database Connection Failed
```bash
# Ensure PostgreSQL is running
# Check connection string in .env

# For Docker:
docker-compose up postgres
```

### API Keys Not Working
```bash
# Check .env file
# Verify no trailing spaces
# Test API directly:
curl -H "x-elfa-api-key: YOUR_KEY" https://api.elfa.ai/v2/aggregations/trending-tokens
```

### TypeScript Errors
```bash
npm run type-check
# Fix issues or ignore with @ts-ignore
```

## Need Help?

1. Check the **README.md** for detailed setup
2. Review **docs/ARCHITECTURE.md** for system design
3. Look at **docs/QUICKSTART.md** for quick answers
4. Check **FILE_INDEX.md** for file locations
5. Visit **http://localhost:8000/docs** for API docs

---

**Happy coding!** 🚀

Last updated: March 2026
