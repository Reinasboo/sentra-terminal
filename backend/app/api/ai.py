from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import MarketExplanationRequest, MarketExplanationResponse
from app.services.ai_market_explainer import AIMarketExplainer

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/explain-market-move", response_model=MarketExplanationResponse)
async def explain_market_move(
    request: MarketExplanationRequest,
    db: Session = Depends(get_db)
):
    """Generate AI explanation for market move"""
    return await AIMarketExplainer.explain_market_move(request.symbol, db)


@router.get("/insight/{symbol}")
async def get_latest_insight(symbol: str, db: Session = Depends(get_db)):
    """Get latest AI insight for a symbol"""
    from app.models import AIInsight
    insight = db.query(AIInsight).filter(
        AIInsight.symbol == symbol
    ).order_by(AIInsight.timestamp.desc()).first()

    if not insight:
        return {"error": "No insights available"}

    return {
        "id": insight.id,
        "symbol": insight.symbol,
        "type": insight.insight_type,
        "content": insight.content,
        "confidence": insight.confidence_score,
        "timestamp": insight.timestamp.isoformat()
    }
