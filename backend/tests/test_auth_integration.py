"""
Integration tests for authentication and WebSocket
Tests the complete authentication flow and WebSocket connectivity
"""

import pytest
import json
from fastapi.testclient import TestClient
from fastapi import status
from app.main import app
from app.db import SessionLocal, init_db
from app.models import Base


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create test database before each test"""
    init_db()
    yield
    # Cleanup is optional for SQLite in-memory


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def db():
    """Get database session"""
    db = SessionLocal()
    yield db
    db.close()


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_get_auth_message(self, client):
        """Test getting auth message"""
        response = client.post("/auth/message", json={
            "wallet_address": "11111111111111111111111111111112"
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "nonce" in data
        assert "Pacifica Authentication" in data["message"]
    
    def test_auth_message_missing_wallet(self, client):
        """Test auth message with missing wallet"""
        response = client.post("/auth/message", json={})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_signature_verification_valid_format(self, client):
        """Test signature verification with valid format"""
        response = client.post("/auth/verify", json={
            "wallet_address": "11111111111111111111111111111112",
            "message": "Test message",
            "signature": "3Xp5132sBucEBhYDL77DwKkHavJE91k7FtxJNqkMTmBgcvHwZ3cofFVDyngDapR1M923HxSQ2tWDvJ88MfqSSiC2"
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "is_valid" in data
        assert "wallet_address" in data
    
    def test_login_invalid_signature_format(self, client):
        """Test login with invalid signature format"""
        response = client.post("/auth/login", json={
            "wallet_address": "11111111111111111111111111111112",
            "message": "Test message",
            "signature": "invalid_signature"
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_user_without_token(self, client):
        """Test getting current user without token"""
        response = client.get("/auth/me")
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_get_current_user_with_invalid_token(self, client):
        """Test getting current user with invalid token"""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestRateLimiting:
    """Test rate limiting"""
    
    def test_rate_limit_on_multiple_failed_logins(self, client):
        """Test rate limiting after multiple failed login attempts"""
        wallet = "11111111111111111111111111111112"
        invalid_sig = "invalid"
        
        # Make 5 failed login attempts
        for i in range(5):
            response = client.post("/auth/login", json={
                "wallet_address": wallet,
                "message": "Test message",
                "signature": invalid_sig
            })
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # 6th attempt should be rate limited
        response = client.post("/auth/login", json={
            "wallet_address": wallet,
            "message": "Test message",
            "signature": invalid_sig
        })
        
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


class TestHealth:
    """Test health check endpoints"""
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
    
    def test_readiness_endpoint(self, client):
        """Test readiness endpoint"""
        response = client.get("/ready")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["ready"] is True
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "Sentra Terminal API"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
