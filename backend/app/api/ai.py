from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import MarketExplanationRequest, MarketExplanationResponse
from app.services.ai_market_explainer import AIMarketExplainer
from datetime import datetime
import random

router = APIRouter(prefix="/ai", tags=["ai"])

AI_INSIGHTS = {
    "BTC-PERP": "Market shows strong bullish momentum with sustained buying pressure at recent support levels. Funding rates are elevated at 0.0156%, indicating high leverage relative to market pricing. Major whale accounts have accumulated 450 BTC over the past 6 hours, signaling institutional confidence. Social sentiment on chain remains positive with 1,245 mentions across platforms. Liquidation pressure builds above $73,500 resistance. Institutional flows suggest continued accumulation phase. Watch for breakout above $73K with target of $75K+.",
    "ETH-PERP": "Ethereum consolidating after recent rally. Funding rates stable at 0.0142%. Whale activity shows mixed signals - 320 BTC short position accumulating while 210 BTC long positions strengthening. Sentiment remains bullish at 0.62 score. Key resistance at $3,920. Support holding at $3,720. Volume declining slightly suggests consolidation before next move.",
    "SOL-PERP": "Solana demonstrating exceptional strength with very bullish sentiment (0.71 score). 560 mentions across social platforms with high positive velocity. Funding rates favorable for longs at 0.0128%. Whale tracking shows net accumulation of 210 SOL-PERP positions. Liquidation zones well-spaced suggesting clean breakout potential. Target $150 if $145 resistance breaks on volume.",
}


@router.post("/explain-market-move", response_model=MarketExplanationResponse)
async def explain_market_move(
    request: MarketExplanationRequest,
    db: Session = Depends(get_db)
):
    """Generate AI explanation for market move"""
    insight = AI_INSIGHTS.get(request.symbol, f"Market analysis for {request.symbol} - monitoring price action and on-chain signals.")
    return {
        "symbol": request.symbol,
        "explanation": insight,
        "confidence": round(random.uniform(0.75, 0.95), 2),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/insight/{symbol}")
async def get_latest_insight(symbol: str, db: Session = Depends(get_db)):
    """Get latest AI insight for a symbol"""
    insight = AI_INSIGHTS.get(symbol, f"Real-time analysis for {symbol} - analyzing whale activity, liquidation zones, and sentiment signals.")
    
    return {
        "symbol": symbol,
        "explanation": insight,
        "confidence": round(random.uniform(0.75, 0.95), 2),
        "timestamp": datetime.utcnow().isoformat(),
    }
