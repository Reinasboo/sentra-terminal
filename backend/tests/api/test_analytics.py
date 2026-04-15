import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_liquidation_endpoint():
    response = client.get("/analytics/liquidations/BTC")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert "long_amount" in data
    assert "short_amount" in data


def test_trader_leaderboard():
    response = client.get("/analytics/trader-leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
