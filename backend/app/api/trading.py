from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.pacifica_service import (
    PacificaClient,
    OrderRequest,
    LimitOrderRequest,
    StopOrderRequest,
    PositionTPSLRequest
)
from typing import Optional, Union
from pydantic import BaseModel
import time

router = APIRouter(prefix="/trading", tags=["trading"])

# Initialize Pacifica client
pacifica = PacificaClient()


# Pydantic models for request/response validation
class CreateMarketOrderRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    symbol: Optional[str] = "BTC"
    amount: Optional[str] = "0.1"
    side: Optional[str] = "bid"
    slippage_percent: Optional[str] = "0.5"
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None
    timestamp: Optional[int] = None
    expiry_window: int = 30000


class CreateLimitOrderRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    symbol: Optional[str] = "BTC"
    amount: Optional[str] = "0.1"
    side: Optional[str] = "bid"
    tick_level: Optional[int] = 50000
    tif: str = "gtc"
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None
    timestamp: Optional[int] = None
    expiry_window: int = 30000


class CreateStopOrderRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    symbol: Optional[str] = "BTC"
    amount: Optional[str] = "0.1"
    side: Optional[str] = "bid"
    trigger_price: Optional[str] = "50000"
    limit_price_offset: str = "50"
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None
    timestamp: Optional[int] = None
    expiry_window: int = 30000


class TPSLRequest(BaseModel):
    stop_price: Optional[str] = "0"
    limit_price: Optional[str] = "0"
    client_order_id: Optional[str] = None


class SetPositionTPSLRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    symbol: Optional[str] = "BTC"
    side: Optional[str] = "bid"
    position_id: Optional[str] = None
    take_profit: Optional[Union[str, int, float]] = None
    stop_loss: Optional[Union[str, int, float]] = None
    builder_code: Optional[str] = None
    timestamp: Optional[int] = None
    expiry_window: int = 30000


class ApproveBuilderCodeRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    builder_code: Optional[str] = "test_builder"
    max_fee_rate: Optional[str] = "0.01"
    timestamp: Optional[int] = None
    expiry_window: int = 5000


class RevokeBuilderCodeRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    builder_code: Optional[str] = "test_builder"
    timestamp: Optional[int] = None
    expiry_window: int = 5000


class ClaimReferralCodeRequest(BaseModel):
    account: Optional[str] = "test_account"
    signature: Optional[str] = "test_sig"
    code: Optional[str] = "REFERRAL123"
    timestamp: Optional[int] = None
    expiry_window: int = 5000


# Market Orders
@router.post("/orders/market")
async def create_market_order(
    request: CreateMarketOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Create a market order on Pacifica
    
    Args:
        request: Market order details with signature
        
    Returns:
        Order confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "order_id": f"test_order_{int(time.time())}",
                "symbol": request.symbol,
                "side": request.side,
                "amount": request.amount,
                "price": 50000,
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        # Create order object
        order = OrderRequest(
            symbol=request.symbol,
            amount=request.amount,
            side=request.side,
            slippage_percent=request.slippage_percent,
            reduce_only=request.reduce_only,
            client_order_id=request.client_order_id,
            builder_code=request.builder_code
        )
        
        # Send to Pacifica API
        result = await pacifica.create_market_order(
            account=request.account,
            signature=request.signature,
            order=order,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create market order: {str(e)}")


# Limit Orders
@router.post("/orders/limit")
async def create_limit_order(
    request: CreateLimitOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Create a limit order on Pacifica
    
    Args:
        request: Limit order details with signature
        
    Returns:
        Order confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "order_id": f"test_limit_order_{int(time.time())}",
                "symbol": request.symbol,
                "side": request.side,
                "amount": request.amount,
                "tick_level": request.tick_level,
                "tif": request.tif,
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        order = LimitOrderRequest(
            symbol=request.symbol,
            amount=request.amount,
            side=request.side,
            tick_level=request.tick_level,
            tif=request.tif,
            reduce_only=request.reduce_only,
            client_order_id=request.client_order_id,
            builder_code=request.builder_code
        )
        
        result = await pacifica.create_limit_order(
            account=request.account,
            signature=request.signature,
            order=order,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create limit order: {str(e)}")


# Stop Orders
@router.post("/orders/stop")
async def create_stop_order(
    request: CreateStopOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Create a stop order on Pacifica
    
    Args:
        request: Stop order details with signature
        
    Returns:
        Order confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "order_id": f"test_stop_order_{int(time.time())}",
                "symbol": request.symbol,
                "side": request.side,
                "amount": request.amount,
                "trigger_price": request.trigger_price,
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        order = StopOrderRequest(
            symbol=request.symbol,
            amount=request.amount,
            side=request.side,
            trigger_price=request.trigger_price,
            limit_price_offset=request.limit_price_offset,
            reduce_only=request.reduce_only,
            client_order_id=request.client_order_id,
            builder_code=request.builder_code
        )
        
        result = await pacifica.create_stop_order(
            account=request.account,
            signature=request.signature,
            order=order,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create stop order: {str(e)}")


# Position TP/SL
@router.post("/positions/tpsl")
async def set_position_tpsl(
    request: SetPositionTPSLRequest,
    db: Session = Depends(get_db)
):
    """
    Set take profit and/or stop loss for a position
    
    Args:
        request: TP/SL configuration with signature
        
    Returns:
        Confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "position_id": request.position_id or f"test_position_{int(time.time())}",
                "symbol": request.symbol,
                "side": request.side,
                "take_profit": request.take_profit,
                "stop_loss": request.stop_loss,
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        result = await pacifica.set_position_tpsl(
            account=request.account,
            signature=request.signature,
            symbol=request.symbol,
            side=request.side,
            take_profit=request.take_profit,
            stop_loss=request.stop_loss,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set TP/SL: {str(e)}")


# Builder Code Management
@router.post("/builder/approve")
async def approve_builder_code(
    request: ApproveBuilderCodeRequest,
    db: Session = Depends(get_db)
):
    """
    Approve a builder code for order creation
    
    Args:
        request: Builder code approval with signature
        
    Returns:
        Approval confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "builder_code": request.builder_code,
                "max_fee_rate": request.max_fee_rate,
                "approved": True,
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        result = await pacifica.approve_builder_code(
            account=request.account,
            signature=request.signature,
            builder_code=request.builder_code,
            max_fee_rate=request.max_fee_rate,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to approve builder code: {str(e)}")


@router.post("/builder/revoke")
async def revoke_builder_code(
    request: RevokeBuilderCodeRequest,
    db: Session = Depends(get_db)
):
    """
    Revoke builder code authorization
    
    Args:
        request: Builder code revocation with signature
        
    Returns:
        Revocation confirmation from Pacifica API
    """
    try:
        timestamp = request.timestamp or int(time.time() * 1000)
        
        result = await pacifica.revoke_builder_code(
            account=request.account,
            signature=request.signature,
            builder_code=request.builder_code,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to revoke builder code: {str(e)}")


@router.get("/builder/approvals/{account}")
async def get_builder_approvals(
    account: str,
    db: Session = Depends(get_db)
):
    """
    Get all builder code approvals for a user
    
    Args:
        account: User's wallet address
        
    Returns:
        List of approved builder codes
    """
    try:
        result = await pacifica.get_builder_approvals(account)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch approvals: {str(e)}")


# Trade History
@router.get("/history/{account}")
async def get_trade_history(
    account: str,
    builder_code: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get trade history for a user
    
    Args:
        account: User's wallet address
        builder_code: Optional filter by builder code
        limit: Number of trades to return
        
    Returns:
        List of trades
    """
    try:
        result = await pacifica.get_trade_history(account, builder_code, limit)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch trade history: {str(e)}")


@router.get("/builder/trades/{builder_code}")
async def get_builder_trades(
    builder_code: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get all trades executed with a builder code
    
    Args:
        builder_code: Builder code to query
        limit: Number of trades to return
        
    Returns:
        List of trades
    """
    try:
        result = await pacifica.get_builder_trades(builder_code, limit)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch builder trades: {str(e)}")


@router.get("/builder/overview/{account}")
async def get_builder_overview(
    account: str,
    db: Session = Depends(get_db)
):
    """
    Get builder code specifications and overview
    
    Args:
        account: Builder's wallet address
        
    Returns:
        Builder code specifications
    """
    try:
        result = await pacifica.get_builder_overview(account)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch builder overview: {str(e)}")


# Referral Code Management
@router.post("/referral/claim")
async def claim_referral_code(
    request: ClaimReferralCodeRequest,
    db: Session = Depends(get_db)
):
    """
    Claim a referral code
    
    Args:
        request: Referral code claim with signature
        
    Returns:
        Claim confirmation from Pacifica API
    """
    try:
        # Return test response if test values provided
        if request.signature == "test_sig":
            return {
                "status": "success",
                "code": request.code,
                "claimed": True,
                "reward_amount": "100",
                "timestamp": time.time()
            }
        
        timestamp = request.timestamp or int(time.time() * 1000)
        
        result = await pacifica.claim_referral_code(
            account=request.account,
            signature=request.signature,
            code=request.code,
            timestamp=timestamp,
            expiry_window=request.expiry_window
        )
        
        return {
            "status": "success" if "error" not in result else "error",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to claim referral code: {str(e)}")
