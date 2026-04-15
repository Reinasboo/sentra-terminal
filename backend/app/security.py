"""
Authentication and security utilities for Pacifica API
Handles wallet signature verification, JWT token generation, and authorization
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import base58
import hashlib
import hmac
from solders.keypair import Keypair
from solders.message import Message
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "pacifica-dev-secret-key-change-in-production":
    raise ValueError("JWT_SECRET_KEY must be set in production environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
JWT_REFRESH_EXPIRE_DAYS = 7

# Security Config
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW_SECONDS = 900  # 15 minutes
TOKEN_REFRESH_THRESHOLD = 300  # Refresh if within 5 minutes of expiry

security = HTTPBearer()


class TokenData(BaseModel):
    """JWT token payload"""
    wallet_address: str
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None


class AuthSignatureRequest(BaseModel):
    """Request for wallet signature authentication"""
    wallet_address: str
    message: str  # Message that was signed
    signature: str  # Base58 encoded signature


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str
    wallet_address: str
    expires_in: int


def create_access_token(wallet_address: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token for a wallet address
    
    Args:
        wallet_address: Public wallet address
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token (short-lived)
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_MINUTES) if isinstance(ACCESS_TOKEN_EXPIRE_MINUTES, int) else timedelta(hours=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "wallet_address": wallet_address,
        "token_type": "access",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(wallet_address: str) -> str:
    """
    Create JWT refresh token for token renewal
    
    Args:
        wallet_address: Public wallet address
        
    Returns:
        Encoded JWT refresh token (long-lived)
    """
    expire = datetime.utcnow() + timedelta(days=JWT_REFRESH_EXPIRE_DAYS)
    
    payload = {
        "wallet_address": wallet_address,
        "token_type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_token_pair(wallet_address: str) -> tuple[str, str]:
    """
    Create both access and refresh tokens
    
    Returns:
        Tuple of (access_token, refresh_token)
    """
    access_token = create_access_token(wallet_address)
    refresh_token = create_refresh_token(wallet_address)
    return access_token, refresh_token


def verify_token(token: str) -> TokenData:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData with wallet address
        
    Raises:
        HTTPException if token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        wallet_address: str = payload.get("wallet_address")
        
        if wallet_address is None:
            logger.warning("Token missing wallet_address")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing wallet address"
            )
        
        return TokenData(wallet_address=wallet_address)
    
    except jwt.ExpiredSignatureError:
        logger.warning(f"Token expired for wallet: {wallet_address if 'wallet_address' in locals() else 'unknown'}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def verify_refresh_token(token: str) -> str:
    """
    Verify and decode refresh token, return wallet address
    
    Args:
        token: Refresh token string
        
    Returns:
        Wallet address
        
    Raises:
        HTTPException if token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        wallet_address: str = payload.get("wallet_address")
        if not wallet_address:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return wallet_address
    
    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired - please login again"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid refresh token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Dependency for protected endpoints - extracts wallet address from JWT token
    
    Args:
        credentials: HTTP Bearer token
        
    Returns:
        Wallet address from token
    """
    token = credentials.credentials
    token_data = verify_token(token)
    return token_data.wallet_address


# Rate limiting for login attempts
class LoginAttemptTracker:
    """Track login attempts per wallet to prevent brute force"""
    
    def __init__(self):
        self.attempts: Dict[str, list] = {}  # wallet -> list of attempt timestamps
    
    def is_rate_limited(self, wallet_address: str) -> bool:
        """Check if wallet is rate limited"""
        now = datetime.utcnow()
        if wallet_address not in self.attempts:
            return False
        
        # Remove old attempts outside the window
        window_start = now - timedelta(seconds=LOGIN_ATTEMPT_WINDOW_SECONDS)
        self.attempts[wallet_address] = [
            t for t in self.attempts[wallet_address]
            if t > window_start
        ]
        
        return len(self.attempts[wallet_address]) >= MAX_LOGIN_ATTEMPTS
    
    def record_attempt(self, wallet_address: str):
        """Record a login attempt"""
        if wallet_address not in self.attempts:
            self.attempts[wallet_address] = []
        self.attempts[wallet_address].append(datetime.utcnow())
    
    def clear_attempts(self, wallet_address: str):
        """Clear attempts after successful login"""
        if wallet_address in self.attempts:
            del self.attempts[wallet_address]


login_attempt_tracker = LoginAttemptTracker()


def verify_wallet_signature(
    wallet_address: str,
    message: str,
    signature_b58: str
) -> bool:
    """
    Verify that a message was signed by a specific wallet using Solana's Ed25519 signature scheme
    
    Args:
        wallet_address: Public wallet address (Base58 encoded Solana pubkey)
        message: Original message that was signed
        signature_b58: Base58 encoded signature (should be 88 chars when decoded = 64 bytes)
        
    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Validate inputs
        if not wallet_address or not message or not signature_b58:
            logger.warning("Missing required fields for signature verification")
            return False
        
        # Verify wallet format (valid Base58 and proper length)
        try:
            wallet_bytes = base58.b58decode(wallet_address)
            # Solana public keys are 32 bytes
            if len(wallet_bytes) != 32:
                logger.warning(f"Invalid wallet address length: {len(wallet_bytes)} bytes")
                return False
        except Exception as e:
            logger.warning(f"Invalid wallet address format: {e}")
            return False
        
        # Verify signature format (valid Base58)
        try:
            sig_bytes = base58.b58decode(signature_b58)
            # Valid Ed25519 signatures are 64 bytes
            if len(sig_bytes) != 64:
                logger.warning(f"Invalid signature length: {len(sig_bytes)} bytes, expected 64")
                return False
        except Exception as e:
            logger.warning(f"Invalid signature format: {e}")
            return False
        
        # Perform actual Ed25519 signature verification
        try:
            verify_key = VerifyKey(wallet_bytes)
            # The message needs to be encoded to bytes
            message_bytes = message.encode('utf-8')
            # Verify the signature
            verify_key.verify(message_bytes, sig_bytes)
            logger.info(f"Signature verified for wallet: {wallet_address[:10]}...")
            return True
        except BadSignatureError:
            logger.warning(f"Signature verification failed for wallet: {wallet_address[:10]}...")
            return False
        except Exception as e:
            logger.error(f"Signature verification error: {e}")
            return False
        
    except Exception as e:
        logger.error(f"Unexpected error in signature verification: {e}")
        return False


def generate_auth_message(wallet_address: str, nonce: str = None) -> str:
    """
    Generate message for user to sign during authentication
    
    Args:
        wallet_address: User's wallet address
        nonce: Random nonce for replay protection
        
    Returns:
        Message for user to sign
    """
    if nonce is None:
        import uuid
        nonce = str(uuid.uuid4())
    
    timestamp = datetime.utcnow().isoformat()
    message = f"""Pacifica Authentication

Wallet: {wallet_address}
Nonce: {nonce}
Timestamp: {timestamp}

Sign this message to authenticate with Pacifica.
This request will not trigger any blockchain transaction or cost any gas fees."""
    
    return message


class AuthorizationError(HTTPException):
    """Raised when authorization fails"""
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class AuthenticationError(HTTPException):
    """Raised when authentication fails"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )
