from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import Market, MarketCreate
from app.models import Market as MarketModel
from app.services.pacifica_service import PacificaClient

router = APIRouter(prefix="/markets", tags=["markets"])

# Initialize Pacifica client
pacifica = PacificaClient()


@router.get("/", response_model=list[Market])
async def get_markets(db: Session = Depends(get_db)):
    """Get all markets"""
    return db.query(MarketModel).all()


@router.get("/{symbol}")
async def get_market(symbol: str, db: Session = Depends(get_db)):
    """Get market data for a symbol"""
    import logging
    logger = logging.getLogger("app.main")
    
    # Debug: Check all markets in DB
    all_markets = db.query(MarketModel).all()
    logger.info(f"Total markets in DB: {len(all_markets)}")
    logger.info(f"Symbols in DB: {[m.symbol for m in all_markets]}")
    logger.info(f"Looking for symbol: '{symbol}'")
    
    market = db.query(MarketModel).filter(MarketModel.symbol == symbol).first()
    logger.info(f"Query result: {market}")
    
    if not market:
        return {"symbol": symbol, "error": "Market not found"}
    
    # Convert to dict for response
    return {
        "symbol": market.symbol,
        "price": market.price,
        "price_change_1h": market.price_change_1h,
        "price_change_24h": market.price_change_24h,
        "price_change_7d": market.price_change_7d,
        "open_interest": market.open_interest,
        "open_interest_change": market.open_interest_change,
        "funding_rate": market.funding_rate,
        "funding_rate_8h": market.funding_rate_8h,
        "volume_24h": market.volume_24h,
        "liquidation_long": market.liquidation_long,
        "liquidation_short": market.liquidation_short,
        "last_updated": market.last_updated,
    }


@router.post("/{symbol}/refresh")
async def refresh_market_data(symbol: str, db: Session = Depends(get_db)):
    """Refresh market data from Pacifica API"""
    # Note: PacificaClient doesn't have a direct get_market_data method
    # This would need to be implemented based on Pacifica API endpoints
    # For now, return market from database
    market = db.query(MarketModel).filter(MarketModel.symbol == symbol).first()
    
    if not market:
        return {"status": "error", "message": f"Market {symbol} not found"}

    return {"status": "success", "data": market}
