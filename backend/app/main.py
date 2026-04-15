import logging
import logging.handlers
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware import Middleware
from contextlib import asynccontextmanager
from app.db import init_db
from app.api import markets, analytics, ai, trading, auth, websocket
from dotenv import load_dotenv
import uuid
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configure logging
def setup_logging():
    """Configure structured logging for production"""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_dir = os.getenv("LOG_DIR", "logs")
    
    # Create logs directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    return logging.getLogger(__name__)

logger = setup_logging()

# Initialize database
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sentra Terminal API")
    init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Application shutting down")


# Create FastAPI app
app = FastAPI(
    title="Sentra Terminal",
    description="Production-grade analytics platform for crypto trading",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Allowed origins for CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# CORS middleware - restricted to specific domains in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # 1 hour
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost").split(",")
)

# Request ID middleware for tracking
@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    """Add request ID for tracking and logging"""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    
    # Add to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    logger.info(f"[{request_id}] {request.method} {request.url.path} - {response.status_code}")
    return response

# Include routers
app.include_router(auth.router)
app.include_router(websocket.router)
app.include_router(markets.router)
app.include_router(analytics.router)
app.include_router(ai.router)
app.include_router(trading.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sentra Terminal API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        from app.db import SessionLocal
        db = SessionLocal()
        # Test database connection
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected"
        }, 503


@app.get("/ready")
async def readiness():
    """Kubernetes readiness probe"""
    try:
        from app.db import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"ready": True}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"ready": False}, 503


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVER_PORT", 8000))
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENV", "development") == "development",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
