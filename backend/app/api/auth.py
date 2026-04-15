"""
Authentication API endpoints
Handles wallet signature verification and JWT token generation
"""

import logging
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.security import (
    AuthSignatureRequest,
    TokenResponse,
    verify_wallet_signature,
    create_token_pair,
    verify_token,
    verify_refresh_token,
    generate_auth_message,
    get_current_user,
    AuthenticationError,
    login_attempt_tracker
)
from pydantic import BaseModel, Field, validator
from datetime import timedelta
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])


class AuthMessageRequest(BaseModel):
    """Request for authentication message"""
    wallet_address: str = Field(..., min_length=32, max_length=50, description="Solana wallet address (Base58)")
    nonce: Optional[str] = None
    
    @validator('wallet_address')
    def validate_wallet_address(cls, v):
        """Validate wallet address format"""
        if not v or len(v) < 32:
            raise ValueError("Invalid wallet address format")
        return v


class AuthMessageResponse(BaseModel):
    """Response with message to sign"""
    message: str
    nonce: str


class CurrentUserResponse(BaseModel):
    """Current user info"""
    wallet_address: str
    authenticated: bool


class RefreshTokenRequest(BaseModel):
    """Request to refresh access token"""
    refresh_token: str = Field(..., description="Refresh token from login response")


@router.post("/message", response_model=AuthMessageResponse)
async def get_auth_message(request: AuthMessageRequest):
    """
    Get message for wallet to sign during authentication
    
    Args:
        request: Contains wallet address and optional nonce
        
    Returns:
        Message that user should sign with their wallet
    """
    try:
        if not request.wallet_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="wallet_address is required"
            )
        
        message = generate_auth_message(request.wallet_address, request.nonce)
        
        return AuthMessageResponse(
            message=message,
            nonce=request.nonce or ""
        )
    except Exception as e:
        logger.error(f"Error generating auth message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate authentication message"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: AuthSignatureRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate wallet and generate JWT tokens
    
    Args:
        request: Wallet address, original message, and signed signature
        db: Database session
        
    Returns:
        JWT access and refresh tokens for authenticated wallet
    """
    try:
        # Check rate limiting
        if login_attempt_tracker.is_rate_limited(request.wallet_address):
            logger.warning(f"Rate limited login attempt for wallet: {request.wallet_address[:10]}...")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )
        
        login_attempt_tracker.record_attempt(request.wallet_address)
        
        # Verify the signature
        is_valid = verify_wallet_signature(
            request.wallet_address,
            request.message,
            request.signature
        )
        
        if not is_valid:
            logger.warning(f"Invalid signature for wallet: {request.wallet_address[:10]}...")
            raise AuthenticationError("Invalid signature - signature verification failed")
        
        # Clear rate limit on successful login
        login_attempt_tracker.clear_attempts(request.wallet_address)
        
        # Generate JWT tokens
        access_token, refresh_token = create_token_pair(request.wallet_address)
        
        logger.info(f"User authenticated: {request.wallet_address[:10]}...")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            wallet_address=request.wallet_address,
            expires_in=3600  # 1 hour in seconds for access token
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    
    Args:
        request: Contains refresh token
        
    Returns:
        New access token
    """
    try:
        # Verify refresh token
        wallet_address = verify_refresh_token(request.refresh_token)
        
        # Generate new tokens
        access_token, refresh_token = create_token_pair(wallet_address)
        
        logger.info(f"Token refreshed for wallet: {wallet_address[:10]}...")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            wallet_address=wallet_address,
            expires_in=3600
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user: str = Depends(get_current_user)):
    """
    Get current authenticated user info
    Requires valid JWT token in Authorization header
    
    Args:
        current_user: Wallet address from JWT token
        
    Returns:
        User info
    """
    return CurrentUserResponse(
        wallet_address=current_user,
        authenticated=True
    )


@router.post("/verify")
async def verify_signature(request: AuthSignatureRequest):
    """
    Verify a wallet signature without generating token
    Useful for testing/validation
    
    Args:
        request: Wallet address, message, and signature
        
    Returns:
        Verification result
    """
    try:
        is_valid = verify_wallet_signature(
            request.wallet_address,
            request.message,
            request.signature
        )
        
        return {
            "wallet_address": request.wallet_address,
            "is_valid": is_valid,
            "message": "Signature is valid" if is_valid else "Signature verification failed"
        }
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify signature"
        )
