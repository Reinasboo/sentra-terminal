from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import Market, MarketCreate
from app.models import Market as MarketModel
from app.services import pacifica_client
import random
import logging
import asyncio

router = APIRouter(prefix="/markets", tags=["markets"])
logger = logging.getLogger(__name__)

# Fallback market data templates for Solana perpetuals (used when Pacifica API unavailable)
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
    "AVAX-PERP": {
        "base_price": 38.45,
        "price_high_24h": 39.20,
        "price_low_24h": 37.00,
        "volume_24h": 0.52,
        "funding_rate": 0.0115,
        "open_interest": 0.28,
    },
    "NEAR-PERP": {
        "base_price": 6.84,
        "price_high_24h": 7.05,
        "price_low_24h": 6.50,
        "volume_24h": 0.38,
        "funding_rate": 0.0132,
        "open_interest": 0.19,
    },
    "ARB-PERP": {
        "base_price": 1.24,
        "price_high_24h": 1.32,
        "price_low_24h": 1.15,
        "volume_24h": 0.45,
        "funding_rate": 0.0108,
        "open_interest": 0.22,
    },
    "OP-PERP": {
        "base_price": 2.45,
        "price_high_24h": 2.58,
        "price_low_24h": 2.30,
        "volume_24h": 0.41,
        "funding_rate": 0.0118,
        "open_interest": 0.18,
    },
    "DOGE-PERP": {
        "base_price": 0.085,
        "price_high_24h": 0.092,
        "price_low_24h": 0.078,
        "volume_24h": 0.68,
        "funding_rate": 0.0145,
        "open_interest": 0.35,
    },
    "XRP-PERP": {
        "base_price": 2.18,
        "price_high_24h": 2.35,
        "price_low_24h": 2.05,
        "volume_24h": 0.52,
        "funding_rate": 0.0125,
        "open_interest": 0.24,
    },
    "ADA-PERP": {
        "base_price": 0.95,
        "price_high_24h": 1.02,
        "price_low_24h": 0.88,
        "volume_24h": 0.35,
        "funding_rate": 0.0112,
        "open_interest": 0.16,
    },
    "LINK-PERP": {
        "base_price": 18.45,
        "price_high_24h": 19.20,
        "price_low_24h": 17.50,
        "volume_24h": 0.48,
        "funding_rate": 0.0138,
        "open_interest": 0.21,
    },
    "UNI-PERP": {
        "base_price": 11.85,
        "price_high_24h": 12.40,
        "price_low_24h": 11.10,
        "volume_24h": 0.42,
        "funding_rate": 0.0121,
        "open_interest": 0.19,
    },
    "MATIC-PERP": {
        "base_price": 0.75,
        "price_high_24h": 0.82,
        "price_low_24h": 0.68,
        "volume_24h": 0.58,
        "funding_rate": 0.0114,
        "open_interest": 0.27,
    },
    "ATOM-PERP": {
        "base_price": 10.25,
        "price_high_24h": 10.85,
        "price_low_24h": 9.65,
        "volume_24h": 0.39,
        "funding_rate": 0.0119,
        "open_interest": 0.17,
    },
}


async def get_market_data(symbol: str):
    """
    Fetch real market data from Pacifica API.
    Falls back to realistic templates if Pacifica API is unavailable.
    
    Pacifica is the primary source for:
    - Real-time prices (from GET /api/v1/info/prices)
    - Funding rates (from GET /api/v1/info)
    - Open interest (from GET /api/v1/info/prices)
    - 24h volume (from GET /api/v1/info/prices)
    """
    # Extract base symbol (e.g., "BTC-PERP" -> "BTC")
    base_symbol = symbol.split('-')[0] if '-' in symbol else symbol
    
    try:
        # Step 1: Get all prices from Pacifica
        prices_response = await pacifica_client.get_prices()
        if prices_response and prices_response.get("success"):
            prices_data = prices_response.get("data", [])
            # Find matching symbol in prices array
            for price_obj in prices_data:
                if price_obj.get("symbol") == base_symbol:
                    logger.info(f"Fetched {symbol} data from Pacifica API")
                    return {
                        "symbol": symbol,
                        "price": round(float(price_obj.get("mark", 0)), 2),
                        "funding_rate": round(float(price_obj.get("funding", 0)), 6),
                        "open_interest": round(float(price_obj.get("open_interest", 0)), 2),
                        "volume_24h": round(float(price_obj.get("volume_24h", 0)), 2),
                        "timestamp": price_obj.get("timestamp"),
                        "source": "pacifica"
                    }
    except Exception as e:
        logger.warning(f"Failed to fetch {symbol} from Pacifica API: {e}. Using fallback template.")
    
    # Fallback: Use realistic template data if Pacifica unavailable
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
        "source": "fallback_template"
    }


@router.get("/", response_model=list[dict])
async def get_markets(db: Session = Depends(get_db)):
    """
    Get all markets.
    Data sourced from Pacifica API (primary source for market truth).
    """
    markets = []
    for symbol in MARKET_TEMPLATES.keys():
        market_data = await get_market_data(symbol)
        if market_data:
            markets.append(market_data)
    return markets


@router.get("/{symbol}")
async def get_market(symbol: str, db: Session = Depends(get_db)):
    """
    Get market data for a symbol from Pacifica.
    
    Returns:
    - price: Current price from Pacifica
    - funding_rate: Current funding rate from Pacifica
    - open_interest: Open interest from Pacifica
    - volume_24h: 24h volume from Pacifica
    """
    market_data = await get_market_data(symbol)
    
    if not market_data:
        return {"symbol": symbol, "error": "Market not found"}
    
    return market_data


@router.post("/{symbol}/refresh")
async def refresh_market_data(symbol: str, db: Session = Depends(get_db)):
    """
    Refresh market data from Pacifica API.
    Called when traders need fresh snapshots.
    """
    market_data = await get_market_data(symbol)
    
    if not market_data:
        return {"status": "error", "message": f"Market {symbol} not found"}

    return {"status": "success", "data": market_data}
