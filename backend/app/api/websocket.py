"""
WebSocket endpoints for real-time data streaming
Includes JWT authentication and rate limiting
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from typing import Optional
from app.websocket_manager import connection_manager
from app.security import verify_token, TokenData
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["websocket"])


async def authenticate_websocket(websocket: WebSocket, token: Optional[str] = None) -> Optional[str]:
    """
    Authenticate WebSocket connection with JWT token
    
    Args:
        websocket: WebSocket connection
        token: JWT token from query param
        
    Returns:
        Wallet address if authenticated, None otherwise
    """
    if not token:
        logger.warning("WebSocket connection attempt without token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
        return None
    
    try:
        token_data = verify_token(token)
        logger.info(f"WebSocket authenticated for wallet: {token_data.wallet_address[:10]}...")
        return token_data.wallet_address
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return None


@router.websocket("/connect")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    """
    Main WebSocket endpoint for real-time updates
    Requires JWT token for authentication
    
    Query Parameters:
        token: JWT access token (required)
    
    Subscription format (send from client):
    {
        "action": "subscribe",
        "channel": "prices" | "sentiment" | "liquidations" | "whales",
        "symbols": ["BTC", "ETH"]  // for prices only
    }
    """
    # Authenticate connection
    wallet_address = await authenticate_websocket(websocket, token)
    if not wallet_address:
        return
    
    await connection_manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle client message
            await connection_manager.handle_client_message(websocket, message)
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for wallet: {wallet_address[:10]}...")
        connection_manager.disconnect(websocket)
    except json.JSONDecodeError:
        await connection_manager.send_personal_message(websocket, {
            "type": "error",
            "message": "Invalid JSON format"
        })
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket)


@router.websocket("/prices/{symbol}")
async def websocket_prices_endpoint(
    websocket: WebSocket,
    symbol: str,
    token: Optional[str] = Query(None)
):
    """
    Symbol-specific WebSocket endpoint for price updates
    Requires JWT token for authentication
    """
    # Authenticate connection
    wallet_address = await authenticate_websocket(websocket, token)
    if not wallet_address:
        return
    
    await connection_manager.connect(websocket, symbol)
    
    try:
        # Send initial subscription confirmation
        await connection_manager.send_personal_message(websocket, {
            "type": "subscription_confirmation",
            "channel": "prices",
            "symbol": symbol,
            "status": "subscribed"
        })
        
        while True:
            # Keep connection alive
            await websocket.receive_text()
    
    except WebSocketDisconnect:
        logger.info(f"Price stream disconnected for {symbol}")
        connection_manager.disconnect(websocket, symbol)
    except Exception as e:
        logger.error(f"WebSocket price stream error: {e}")
        connection_manager.disconnect(websocket, symbol)


@router.websocket("/sentiment")
async def websocket_sentiment_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time sentiment updates
    Requires JWT token for authentication
    """
    # Authenticate connection
    wallet_address = await authenticate_websocket(websocket, token)
    if not wallet_address:
        return
    
    await connection_manager.subscribe(websocket, "sentiment")
    
    try:
        # Send initial subscription confirmation
        await connection_manager.send_personal_message(websocket, {
            "type": "subscription_confirmation",
            "channel": "sentiment",
            "status": "subscribed"
        })
        
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "ping":
                await connection_manager.send_personal_message(websocket, {
                    "type": "pong"
                })
    
    except WebSocketDisconnect:
        logger.info(f"Sentiment stream disconnected")
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket sentiment error: {e}")
        connection_manager.disconnect(websocket)


@router.websocket("/liquidations")
async def websocket_liquidations_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for liquidation alerts
    Requires JWT token for authentication
    """
    # Authenticate connection
    wallet_address = await authenticate_websocket(websocket, token)
    if not wallet_address:
        return
    
    await connection_manager.subscribe(websocket, "liquidations")
    
    try:
        # Send initial subscription confirmation
        await connection_manager.send_personal_message(websocket, {
            "type": "subscription_confirmation",
            "channel": "liquidations",
            "status": "subscribed"
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "ping":
                await connection_manager.send_personal_message(websocket, {
                    "type": "pong"
                })
    
    except WebSocketDisconnect:
        logger.info("Liquidation alerts disconnected")
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket liquidations error: {e}")
        connection_manager.disconnect(websocket)


@router.websocket("/whales")
async def websocket_whales_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for whale activity
    Requires JWT token for authentication
    """
    # Authenticate connection
    wallet_address = await authenticate_websocket(websocket, token)
    if not wallet_address:
        return
    
    await connection_manager.subscribe(websocket, "whales")
    
    try:
        # Send initial subscription confirmation
        await connection_manager.send_personal_message(websocket, {
            "type": "subscription_confirmation",
            "channel": "whales",
            "status": "subscribed"
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "ping":
                await connection_manager.send_personal_message(websocket, {
                    "type": "pong"
                })
    
    except WebSocketDisconnect:
        logger.info("Whale activity disconnected")
        connection_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket whales error: {e}")
        connection_manager.disconnect(websocket)
