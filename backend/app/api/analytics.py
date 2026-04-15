from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.liquidation_engine import LiquidationEngine
from app.services.sentiment_engine import SentimentEngine
from app.services.whale_detection import WhaleDetectionEngine
from app.services.trader_scoring import TraderScoringEngine
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/liquidations/{symbol}")
async def get_liquidation_analysis(symbol: str, db: Session = Depends(get_db)):
    """Get liquidation analysis for a symbol"""
    return LiquidationEngine.analyze_liquidation_pressure(symbol, db)


@router.get("/liquidation-risk/{symbol}")
async def get_liquidation_risk(symbol: str, current_price: Optional[float] = None, db: Session = Depends(get_db)):
    """Get liquidation risk score"""
    if current_price is None:
        current_price = 0.0
    risk_score = LiquidationEngine.calculate_liquidation_risk(symbol, current_price, db)
    return {"symbol": symbol, "risk_score": risk_score}


@router.get("/sentiment/{token}")
async def get_sentiment(token: str, db: Session = Depends(get_db)):
    """Get sentiment analysis for a token"""
    try:
        result = await SentimentEngine.analyze_token_sentiment(token, db)
        if result is None:
            result = {"token": token, "sentiment_score": 0.5, "total_mentions": 0, "mention_velocity": 0, "platforms": {}}
        # Ensure sentiment_score is not None
        if result.get("sentiment_score") is None:
            result["sentiment_score"] = 0.5
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"token": token, "sentiment_score": 0.5, "total_mentions": 0, "mention_velocity": 0, "platforms": {}, "error": str(e)}


@router.get("/trending-narratives")
async def get_trending_narratives(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending narratives"""
    try:
        result = await SentimentEngine.get_trending_narratives(db, limit)
        if result is None:
            result = []
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []  # Return empty list on error


@router.get("/whales/{symbol}")
async def get_whales(symbol: str, db: Session = Depends(get_db)):
    """Get whale traders for a symbol"""
    return {
        "symbol": symbol,
        "whales": WhaleDetectionEngine.identify_whales(symbol, db),
        "position_concentration": WhaleDetectionEngine.calculate_position_concentration(symbol, db)
    }


@router.get("/whale-trades/{symbol}")
async def get_whale_trades(symbol: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get large whale trades"""
    return {
        "symbol": symbol,
        "trades": WhaleDetectionEngine.detect_large_trades(symbol, db, limit)
    }


@router.get("/trader/{address}")
async def get_trader_score(address: str, db: Session = Depends(get_db)):
    """Get trader score and metrics"""
    return TraderScoringEngine.calculate_trader_score(address, db)


@router.get("/trader-leaderboard")
async def get_trader_leaderboard(limit: int = 100, db: Session = Depends(get_db)):
    """Get trader leaderboard"""
    return TraderScoringEngine.get_trader_leaderboard(limit, db)
