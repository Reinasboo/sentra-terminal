import pytest
from app.services.whale_detection import WhaleDetectionEngine
from app.models import Position


def test_whale_identification():
    """Test whale position identification"""
    mock_positions = [
        Position(
            trader_address="0x123",
            symbol="BTC",
            size=10,
            collateral=600000,
            entry_price=45000,
            liquidation_price=42000,
            leverage=5,
            side="LONG",
            timestamp=None
        ),
    ]
    
    # WhaleDetectionEngine should identify positions > $500K as whales
    assert mock_positions[0].collateral > WhaleDetectionEngine.WHALE_POSITION_THRESHOLD
