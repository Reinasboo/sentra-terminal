from sqlalchemy.orm import Session
from app.models import Trade, Position
from typing import List, Dict
import statistics


class WhaleDetectionEngine:
    """Detects and tracks whale activity"""

    WHALE_POSITION_THRESHOLD = 500000  # USD
    WHALE_TRADE_SIZE_THRESHOLD = 100000  # USD

    @staticmethod
    def identify_whales(symbol: str, db: Session) -> List[Dict]:
        """Identify whale traders for a symbol"""
        positions = db.query(Position).filter(
            Position.symbol == symbol,
            Position.collateral >= WhaleDetectionEngine.WHALE_POSITION_THRESHOLD
        ).all()

        whales = []
        for position in positions:
            whales.append({
                "address": position.trader_address,
                "symbol": symbol,
                "size": position.size,
                "collateral": position.collateral,
                "side": position.side,
                "leverage": position.leverage,
                "entry_price": position.entry_price,
                "liquidation_price": position.liquidation_price
            })

        return sorted(whales, key=lambda x: x["collateral"], reverse=True)

    @staticmethod
    def detect_large_trades(symbol: str, db: Session, limit: int = 50) -> List[Dict]:
        """Detect recent large trades (potential whale activity)"""
        trades = db.query(Trade).filter(
            Trade.symbol == symbol
        ).order_by(Trade.timestamp.desc()).limit(limit).all()

        large_trades = []
        for trade in trades:
            trade_value = trade.price * trade.size
            if trade_value >= WhaleDetectionEngine.WHALE_TRADE_SIZE_THRESHOLD:
                large_trades.append({
                    "trader": trade.trader_address or "Unknown",
                    "symbol": symbol,
                    "price": trade.price,
                    "size": trade.size,
                    "value": trade_value,
                    "side": trade.side,
                    "timestamp": trade.timestamp.isoformat(),
                    "is_whale": trade.is_whale
                })

        return sorted(large_trades, key=lambda x: x["value"], reverse=True)

    @staticmethod
    def calculate_position_concentration(symbol: str, db: Session) -> float:
        """Calculate position concentration (whale dominance 0-100)"""
        positions = db.query(Position).filter(Position.symbol == symbol).all()

        if not positions:
            return 0.0

        collaterals = [p.collateral for p in positions]
        total_collateral = sum(collaterals)

        if total_collateral == 0:
            return 0.0

        # Calculate Herfindahl index
        market_shares = [c / total_collateral for c in collaterals]
        herfindahl = sum(share ** 2 for share in market_shares)

        # Convert to 0-100 scale
        concentration = (herfindahl - 1.0 / len(positions)) / (1 - 1.0 / len(positions)) * 100
        return max(0, min(concentration, 100))

    @staticmethod
    def get_whale_activity_feed(symbol: str, limit: int = 50, db: Session = None) -> List[Dict]:
        """Get recent whale activity feed"""
        if not db:
            return []

        trades = db.query(Trade).filter(
            Trade.symbol == symbol,
            Trade.is_whale == True
        ).order_by(Trade.timestamp.desc()).limit(limit).all()

        return [
            {
                "id": t.id,
                "trader": t.trader_address or "Whale",
                "side": t.side,
                "size": t.size,
                "price": t.price,
                "value": t.price * t.size,
                "timestamp": t.timestamp.isoformat()
            }
            for t in trades
        ]
