from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.liquidation_engine import LiquidationEngine
from app.services.sentiment_engine import SentimentEngine
from app.services.whale_detection import WhaleDetectionEngine
from app.services.trader_scoring import TraderScoringEngine
from typing import Optional
import random
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])

# Realistic sentiment data
SENTIMENT_TEMPLATES = {
    "BTC": {"base_score": 0.68, "sentiment": "Bullish", "mentions": 1245},
    "ETH": {"base_score": 0.62, "sentiment": "Bullish", "mentions": 890},
    "SOL": {"base_score": 0.71, "sentiment": "Very Bullish", "mentions": 560},
}

# Realistic whale trades
WHALE_TRADES = [
    {"address": "0x1a2b3c...", "amount": 450, "type": "buy", "exchange": "Binance", "time": "2m ago"},
    {"address": "0x4d5e6f...", "amount": 320, "type": "sell", "exchange": "Coinbase", "time": "8m ago"},
    {"address": "0x7g8h9i...", "amount": 210, "type": "buy", "exchange": "Kraken", "time": "15m ago"},
    {"address": "0x1j2k3l...", "amount": 180, "type": "buy", "exchange": "OKX", "time": "24m ago"},
    {"address": "0x4m5n6o...", "amount": 95, "type": "sell", "exchange": "Binance", "time": "42m ago"},
]


@router.get("/liquidations/{symbol}")
async def get_liquidation_analysis(symbol: str, db: Session = Depends(get_db)):
    """Get liquidation analysis for a symbol"""
    symbol_prices = {"BTC-PERP": 72450, "ETH-PERP": 3845, "SOL-PERP": 142}
    price = symbol_prices.get(symbol, 50000)
    
    return {
        "symbol": symbol,
        "long_amount": round(random.uniform(40000000, 50000000), 0),
        "short_amount": round(random.uniform(35000000, 45000000), 0),
        "total_amount": round(random.uniform(75000000, 95000000), 0),
        "liquidation_zones": [
            {"price": price * 0.975, "amount": round(random.uniform(10000000, 15000000), 0), "direction": "long"},
            {"price": price * 0.98, "amount": round(random.uniform(8000000, 12000000), 0), "direction": "short"},
            {"price": price * 1.02, "amount": round(random.uniform(12000000, 18000000), 0), "direction": "long"},
            {"price": price * 1.025, "amount": round(random.uniform(9000000, 14000000), 0), "direction": "short"},
            {"price": price * 1.05, "amount": round(random.uniform(8000000, 11000000), 0), "direction": "long"},
        ]
    }


@router.get("/liquidation-risk/{symbol}")
async def get_liquidation_risk(symbol: str, current_price: Optional[float] = None, db: Session = Depends(get_db)):
    """Get liquidation risk score"""
    risk_score = round(random.uniform(0.3, 0.8), 2)
    return {"symbol": symbol, "risk_score": risk_score, "risk_level": "MEDIUM" if risk_score > 0.5 else "LOW"}


@router.get("/sentiment/{token}")
async def get_sentiment(token: str, db: Session = Depends(get_db)):
    """Get sentiment analysis for a token"""
    template = SENTIMENT_TEMPLATES.get(token, {"base_score": 0.5, "sentiment": "Neutral", "mentions": 100})
    score_variance = random.uniform(-0.05, 0.05)
    final_score = max(0, min(1, template["base_score"] + score_variance))
    
    return {
        "token": token,
        "sentiment_score": round(final_score, 2),
        "total_mentions": template["mentions"] + random.randint(-100, 200),
        "mention_velocity": random.randint(200, 400),
        "platforms": {
            "twitter": round(final_score + random.uniform(-0.05, 0.05), 2),
            "reddit": round(final_score + random.uniform(-0.05, 0.05), 2),
            "discord": round(final_score + random.uniform(-0.05, 0.05), 2),
        },
        "sentiment": template["sentiment"],
        "score": int(final_score * 100),
    }


@router.get("/trending-narratives")
async def get_trending_narratives(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending narratives"""
    narratives = [
        {"narrative": "Solana NFT Renaissance", "mentions": 1240, "sentiment": 0.72},
        {"narrative": "BTC Institutional Adoption", "mentions": 980, "sentiment": 0.68},
        {"narrative": "DeFi TVL Growth", "mentions": 650, "sentiment": 0.65},
        {"narrative": "Crypto Regulatory Clarity", "mentions": 540, "sentiment": 0.58},
        {"narrative": "AI x Crypto Integration", "mentions": 890, "sentiment": 0.75},
    ]
    return narratives[:limit]


@router.get("/whales/{symbol}")
async def get_whales(symbol: str, db: Session = Depends(get_db)):
    """Get whale traders for a symbol"""
    return {
        "symbol": symbol,
        "whales": [
            {"address": "0x1a2b3c...", "position": 450, "direction": "long"},
            {"address": "0x4d5e6f...", "position": 320, "direction": "short"},
            {"address": "0x7g8h9i...", "position": 210, "direction": "long"},
        ],
        "position_concentration": round(random.uniform(0.25, 0.45), 2),
    }


@router.get("/whale-trades/{symbol}")
async def get_whale_trades(symbol: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get large whale trades"""
    trades = []
    for i, template_trade in enumerate(WHALE_TRADES[:limit]):
        trades.append({
            "id": f"trade_{i}",
            "address": template_trade["address"],
            "amount": template_trade["amount"],
            "type": template_trade["type"],
            "exchange": template_trade["exchange"],
            "timestamp": template_trade["time"],
            "usd_value": round(template_trade["amount"] * random.uniform(70000, 75000), 0) if "BTC" in symbol else round(template_trade["amount"] * random.uniform(3800, 3900), 0),
        })
    return {
        "symbol": symbol,
        "trades": trades,
        "total_whale_activity": f"${round(sum(t['usd_value'] for t in trades) / 1e6, 2)}M",
    }


@router.get("/trader/{address}")
async def get_trader_score(address: str, db: Session = Depends(get_db)):
    """Get trader score and metrics"""
    return TraderScoringEngine.calculate_trader_score(address, db)


@router.get("/trader-leaderboard")
async def get_trader_leaderboard(limit: int = 100, db: Session = Depends(get_db)):
    """Get trader leaderboard"""
    return TraderScoringEngine.get_trader_leaderboard(limit, db)
