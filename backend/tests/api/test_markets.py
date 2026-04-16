import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def client():
    return TestClient(app)


def test_markets_endpoint(client):
    response = client.get("/markets/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_market_not_found(client):
    response = client.get("/markets/INVALID")
    assert response.status_code == 200 or response.status_code == 404
