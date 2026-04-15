# Sentra Terminal - Complete Setup & Startup Guide

## System Requirements

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Python**: v3.10+ ([Download](https://www.python.org/))
- **Git**: v2.30+ ([Download](https://git-scm.com/))
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB minimum

## Directory Structure

```
sentra-terminal/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routers (markets, analytics, ai)
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database configuration
│   │   └── main.py         # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── pytest.ini          # Test configuration
│   └── Dockerfile          # Docker configuration
│
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # App router (layout, page)
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks (useApi)
│   │   ├── lib/            # Utilities (api.ts, design-system.ts)
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── next.config.js      # Next.js configuration
│   └── .env.local          # Environment variables (create this)
│
├── docs/                   # Documentation
├── data/                   # Data scripts and ingestion
├── docker-compose.yml      # Docker compose configuration
├── INTEGRATION_GUIDE.md    # API and integration documentation
├── PROJECT_SUMMARY.md      # Project overview
├── README.md               # Main readme
└── start-services.ps1      # PowerShell startup script
```

## Quick Start (Windows PowerShell)

### Option 1: Automated Startup (Recommended)

```powershell
# Navigate to project root
cd C:\Users\Admin\Pacifica\sentra-terminal

# Run startup script
.\start-services.ps1
```

This will:
1. Install Python dependencies
2. Start backend at `http://localhost:8000`
3. Install Node dependencies
4. Start frontend at `http://localhost:3000`
5. Open both in new PowerShell windows

### Option 2: Manual Startup

#### Step 1: Start Backend

```powershell
# Navigate to backend directory
cd C:\Users\Admin\Pacifica\sentra-terminal\backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

#### Step 2: Start Frontend (in new PowerShell window)

```powershell
# Navigate to frontend directory
cd C:\Users\Admin\Pacifica\sentra-terminal\frontend

# Install dependencies (first time only)
npm install

# Ensure .env.local exists with backend URL
# (or run: echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local)

# Start development server
npm run dev
```

Expected output:
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  ✓ Ready in 4.6s
```

## Access Points

Once both services are running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://localhost:3000` | Main UI - Trading Dashboard |
| Backend | `http://localhost:8000` | REST API Server |
| API Docs | `http://localhost:8000/docs` | Interactive API documentation (Swagger) |
| API Health | `http://localhost:8000/health` | Backend health check |

## Configuration

### Frontend Environment Variables (.env.local)

Create `.frontend/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NODE_ENV=development
```

### Backend Configuration (optional)

Set environment variables:
```powershell
# Windows PowerShell
$env:DATABASE_URL = "sqlite:///./sentra.db"
$env:DEBUG = "True"
$env:CORS_ORIGINS = "http://localhost:3000"
```

## Testing the Integration

### 1. Check Backend Health

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/health" | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"status":"healthy"}
```

### 2. Test API Endpoint

```powershell
# Get markets
Invoke-WebRequest -Uri "http://localhost:8000/markets/" | Select-Object -ExpandProperty Content
```

### 3. Check Frontend

Open browser to `http://localhost:3000`

- Should see trading dashboard without errors
- Check browser console (F12) for API errors
- Verify API requests in Network tab

## Troubleshooting

### Backend Issues

#### Port 8000 Already in Use
```powershell
# Find process using port 8000
Get-NetTCPConnection -LocalPort 8000

# Kill the process
Stop-Process -Id <PID> -Force

# Or use different port
python -m uvicorn app.main:app --reload --port 8001
```

#### Python Module Not Found
```powershell
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall all dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Database Errors
```powershell
# Backend creates SQLite database automatically
# If corrupted, delete it and restart
Remove-Item sentra.db -ErrorAction SilentlyContinue
```

### Frontend Issues

#### Port 3000 Already in Use
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill the process
Stop-Process -Id <PID> -Force

# Or run on different port
npm run dev -- -p 3001
```

#### Node Modules Issues
```powershell
# Clean install
Remove-Item node_modules -Recurse -Force
npm install
npm run dev
```

#### `NEXT_PUBLIC_API_URL` Not Working
```powershell
# Make sure .env.local exists in frontend directory
# Frontend (Next.js) requires NEXT_PUBLIC_ prefix for client-side access
cd frontend

# Check that file exists
Get-Content .env.local

# If missing, create it
@"
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
"@ | Set-Content .env.local

npm run dev
```

### API Connection Issues

#### "Cannot reach backend" Error
1. Verify backend is running: `http://localhost:8000/health`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check for CORS errors in browser console
4. Verify firewall isn't blocking connections

#### No Data Showing in Dashboard
1. Check browser console (F12) for errors
2. Look for failed API requests in Network tab
3. Verify backend `/markets/` endpoint returns data
4. Check React Query DevTools for cache state

## Build & Deployment

### Production Build (Frontend)

```powershell
cd frontend

# Build optimized version
npm run build

# Start production server
npm start
```

### Production Build (Backend)

```powershell
cd backend

# Using Gunicorn (production-grade)
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app

# Or using Uvicorn with workers
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Deployment

```powershell
# Build and start with Docker Compose
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Development Workflow

### Hot Reload
Both services support hot reload:
- **Frontend**: Edit `.tsx` files and see changes instantly
- **Backend**: Edit `.py` files and see changes instantly (with `--reload`)

### Debugging

#### Frontend Debugging
```powershell
# Start with browser DevTools
npm run dev

# Open browser DevTools (F12)
# - Console: Check for JavaScript errors
# - Network: Inspect API calls
# - Application: Check React Query cache
```

#### Backend Debugging
```powershell
# View logs in terminal where backend is running
# Add print statements in Python code
# Access Swagger UI at http://localhost:8000/docs
```

### Code Structure Tips

**Frontend**:
- Components: Reusable React components in `src/components/`
- Hooks: Data fetching hooks in `src/hooks/useApi.ts`
- API Client: Axios configuration in `src/lib/api.ts`

**Backend**:
- Routers: API endpoints in `app/api/`
- Models: Database schemas in `app/models/`
- Services: Business logic in `app/services/`

## Common Tasks

### Add a New API Endpoint

1. **Create in Backend** (`app/api/new_endpoint.py`):
```python
from fastapi import APIRouter
router = APIRouter(prefix="/new", tags=["new"])

@router.get("/data")
async def get_data():
    return {"data": [...]}

# Register in app/main.py
# app.include_router(new_endpoint.router)
```

2. **Create Hook in Frontend** (`src/hooks/useApi.ts`):
```typescript
export const useNewData = () => {
  return useQuery({
    queryKey: ["new-data"],
    queryFn: () => apiClient.get("/new/data"),
    refetchInterval: 5000
  });
};
```

3. **Use in Component**:
```typescript
const { data, isLoading } = useNewData();
```

### Run Tests

```powershell
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

## Resources

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/

## Support

- Check `INTEGRATION_GUIDE.md` for API details
- Check `PROJECT_SUMMARY.md` for project architecture
- Check backend logs for API errors
- Check browser console for frontend errors

## Next Steps

1. ✅ Start both services
2. ✅ Access dashboard at `http://localhost:3000`
3. ✅ Review API at `http://localhost:8000/docs`
4. ✅ Explore components in `src/components/`
5. ✅ Connect to real data sources (optional)
6. ✅ Deploy to production (optional)
