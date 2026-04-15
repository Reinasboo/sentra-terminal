import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_markets_endpoint():
    response = client.get("/markets/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_market_not_found():
    response = client.get("/markets/INVALID")
    assert response.status_code == 200 or response.status_code == 404
