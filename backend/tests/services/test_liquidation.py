import pytest
from app.services.liquidation_engine import LiquidationEngine
from app.models import Liquidation


def test_liquidation_clustering():
    """Test liquidation cluster identification"""
    # Mock liquidations
    mock_liquidations = [
        Liquidation(symbol="BTC", price=45000, amount=1000000, side="LONG", timestamp=None),
        Liquidation(symbol="BTC", price=45100, amount=500000, side="LONG", timestamp=None),
        Liquidation(symbol="BTC", price=47000, amount=2000000, side="SHORT", timestamp=None),
    ]
    
    clusters = LiquidationEngine.identify_clusters(mock_liquidations)
    assert len(clusters) > 0
    assert all("price_level" in c for c in clusters)
    assert all("total_amount" in c for c in clusters)
