from sqlalchemy.orm import Session
from app.models import Liquidation, LiquidationCluster, Market
from typing import List, Dict, Tuple
import numpy as np


class LiquidationEngine:
    """Analyzes liquidation pressure and creates clusters"""

    @staticmethod
    def analyze_liquidation_pressure(symbol: str, db: Session) -> Dict:
        """Analyze liquidation pressure for a symbol"""
        liquidations = db.query(Liquidation).filter(
            Liquidation.symbol == symbol
        ).order_by(Liquidation.timestamp.desc()).limit(1000).all()

        if not liquidations:
            return {
                "symbol": symbol,
                "long_amount": 0,
                "short_amount": 0,
                "total_amount": 0,
                "liquidation_zones": []
            }

        long_amount = sum(l.amount for l in liquidations if l.side == "LONG")
        short_amount = sum(l.amount for l in liquidations if l.side == "SHORT")

        return {
            "symbol": symbol,
            "long_amount": long_amount,
            "short_amount": short_amount,
            "total_amount": long_amount + short_amount,
            "liquidation_zones": LiquidationEngine.identify_clusters(liquidations)
        }

    @staticmethod
    def identify_clusters(liquidations: List[Liquidation], price_bin: float = 100) -> List[Dict]:
        """Identify liquidation clusters by price level"""
        if not liquidations:
            return []

        clusters = {}
        for liq in liquidations:
            price_bin_key = round(liq.price / price_bin) * price_bin
            if price_bin_key not in clusters:
                clusters[price_bin_key] = {"long": 0, "short": 0}
            if liq.side == "LONG":
                clusters[price_bin_key]["long"] += liq.amount
            else:
                clusters[price_bin_key]["short"] += liq.amount

        result = []
        for price, amounts in sorted(clusters.items()):
            result.append({
                "price_level": price,
                "long_amount": amounts["long"],
                "short_amount": amounts["short"],
                "total_amount": amounts["long"] + amounts["short"]
            })

        return result

    @staticmethod
    def calculate_liquidation_risk(symbol: str, current_price: float, db: Session) -> float:
        """Calculate liquidation risk score (0-100)"""
        analysis = LiquidationEngine.analyze_liquidation_pressure(symbol, db)
        zones = analysis["liquidation_zones"]

        if not zones:
            return 0.0

        # Find zones within 5% of current price
        nearby_zones = [z for z in zones if abs(z["price_level"] - current_price) / current_price < 0.05]
        total_nearby = sum(z["total_amount"] for z in nearby_zones)
        total_all = analysis["total_amount"]

        if total_all == 0:
            return 0.0

        concentration = (total_nearby / total_all) * 100
        return min(concentration, 100)
