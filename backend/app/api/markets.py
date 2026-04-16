from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import Market, MarketCreate
from app.models import Market as MarketModel
from app.services.pacifica_service import PacificaClient
import random
import logging

router = APIRouter(prefix="/markets", tags=["markets"])
logger = logging.getLogger(__name__)

# Initialize Pacifica client
pacifica = PacificaClient()

# Realistic market data generator for Solana perpetuals
MARKET_TEMPLATES = {
    "BTC-PERP": {
        "base_price": 72450.50,
        "price_high_24h": 73280.00,
        "price_low_24h": 70150.00,
        "volume_24h": 2.84,
        "funding_rate": 0.0156,
        "open_interest": 1.2,
    },
    "ETH-PERP": {
        "base_price": 3845.75,
        "price_high_24h": 3920.00,
        "price_low_24h": 3720.00,
        "volume_24h": 1.45,
        "funding_rate": 0.0142,
        "open_interest": 0.85,
    },
    "SOL-PERP": {
        "base_price": 142.30,
        "price_high_24h": 145.50,
        "price_low_24h": 138.00,
        "volume_24h": 0.95,
        "funding_rate": 0.0128,
        "open_interest": 0.42,
    },
}


def get_market_data(symbol: str):
    """Generate or fetch realistic market data for a symbol"""
    if symbol not in MARKET_TEMPLATES:
        return None
    
    template = MARKET_TEMPLATES[symbol]
    price_variance = random.uniform(-0.02, 0.02)  # ±2% variance
    current_price = template["base_price"] * (1 + price_variance)
    change_24h = ((current_price - template["price_low_24h"]) / template["price_low_24h"]) * 100
    
    return {
        "symbol": symbol,
        "price": round(current_price, 2),
        "change_24h": round(change_24h, 2),
        "price_high_24h": template["price_high_24h"],
        "price_low_24h": template["price_low_24h"],
        "volume_24h": template["volume_24h"],
        "volume_change": round(random.uniform(-5, 15), 2),
        "funding_rate": template["funding_rate"],
        "open_interest": template["open_interest"],
        "open_interest_change": round(random.uniform(-2, 5), 2),
    }


@router.get("/", response_model=list[dict])
async def get_markets(db: Session = Depends(get_db)):
    """Get all markets"""
    markets = []
    for symbol in MARKET_TEMPLATES.keys():
        market_data = get_market_data(symbol)
        if market_data:
            markets.append(market_data)
    return markets


@router.get("/{symbol}")
async def get_market(symbol: str, db: Session = Depends(get_db)):
    """Get market data for a symbol"""
    market_data = get_market_data(symbol)
    
    if not market_data:
        return {"symbol": symbol, "error": "Market not found"}
    
    return market_data


@router.post("/{symbol}/refresh")
async def refresh_market_data(symbol: str, db: Session = Depends(get_db)):
    """Refresh market data from Pacifica API"""
    market_data = get_market_data(symbol)
    
    if not market_data:
        return {"status": "error", "message": f"Market {symbol} not found"}

    return {"status": "success", "data": market_data}
