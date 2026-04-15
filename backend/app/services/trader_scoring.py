from sqlalchemy.orm import Session
from app.models import Trade, Position, Trader
from typing import Dict
from datetime import datetime, timedelta


class TraderScoringEngine:
    """Scores traders based on performance metrics"""

    @staticmethod
    def calculate_trader_score(address: str, db: Session) -> Dict:
        """Calculate comprehensive trader score (0-100)"""
        # Get trader from database
        trader = db.query(Trader).filter(Trader.address == address).first()

        if not trader:
            return {
                "address": address,
                "score": 0,
                "win_rate": 0,
                "total_pnl": 0,
                "avg_leverage": 0,
                "sharpe_ratio": 0,
                "trade_count": 0
            }

        # Score components (0-100 scale)
        win_rate_score = (trader.win_rate * 100) if trader.win_rate else 0
        pnl_score = min((trader.total_pnl / 1000) * 10, 100) if trader.total_pnl else 0
        leverage_score = max(0, 100 - (trader.avg_leverage * 10)) if trader.avg_leverage else 50
        sharpe_score = min((trader.sharpe_ratio * 10) + 50, 100) if trader.sharpe_ratio else 0

        # Weighted scoring
        final_score = (
            win_rate_score * 0.4 +
            pnl_score * 0.3 +
            leverage_score * 0.2 +
            sharpe_score * 0.1
        )

        return {
            "address": address,
            "score": min(final_score, 100),
            "win_rate": trader.win_rate or 0,
            "total_pnl": trader.total_pnl or 0,
            "avg_leverage": trader.avg_leverage or 0,
            "sharpe_ratio": trader.sharpe_ratio or 0,
            "trade_count": trader.trade_count
        }

    @staticmethod
    def update_trader_metrics(address: str, db: Session):
        """Update trader metrics from recent trades"""
        # Get or create trader
        trader = db.query(Trader).filter(Trader.address == address).first()
        if not trader:
            trader = Trader(address=address)
            db.add(trader)

        # Get recent trades (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        trades = db.query(Trade).filter(
            Trade.trader_address == address,
            Trade.timestamp >= thirty_days_ago
        ).all()

        if trades:
            trader.trade_count = len(trades)
            trader.last_activity = datetime.utcnow()

        # Calculate metrics (simplified)
        # In production, these would be calculated from actual trade PnL data
        if trades:
            trader.win_rate = 0.55  # Placeholder
            trader.avg_leverage = 5.0  # Placeholder
            trader.sharpe_ratio = 1.2  # Placeholder

        db.commit()

    @staticmethod
    def get_trader_leaderboard(limit: int = 100, db: Session = None) -> list:
        """Get top traders by score"""
        if not db:
            return []

        traders = db.query(Trader).order_by(
            Trader.trader_score.desc()
        ).limit(limit).all()

        return [
            {
                "rank": i + 1,
                "address": t.address,
                "score": t.trader_score,
                "win_rate": t.win_rate or 0,
                "total_pnl": t.total_pnl or 0,
                "trade_count": t.trade_count
            }
            for i, t in enumerate(traders)
        ]
