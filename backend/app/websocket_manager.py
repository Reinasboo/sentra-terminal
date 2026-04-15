"""
WebSocket manager for real-time data streaming
Handles price updates, sentiment changes, liquidation alerts, and whale activity
"""

from typing import Dict, Set, Callable, Any
import json
import asyncio
from fastapi import WebSocket
from datetime import datetime
from app.models import Market, SocialData, Position
from sqlalchemy.orm import Session


class ConnectionManager:
    """Manages WebSocket connections and broadcasts real-time data"""
    
    def __init__(self):
        # Store active connections grouped by symbol
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store connections grouped by subscription type
        self.subscriptions: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, symbol: str = None):
        """Accept and store a WebSocket connection"""
        await websocket.accept()
        
        if symbol:
            if symbol not in self.active_connections:
                self.active_connections[symbol] = set()
            self.active_connections[symbol].add(websocket)
    
    async def subscribe(self, websocket: WebSocket, channel: str):
        """Subscribe to a channel (e.g., 'prices', 'sentiment', 'liquidations')"""
        if channel not in self.subscriptions:
            self.subscriptions[channel] = set()
        self.subscriptions[channel].add(websocket)
    
    def disconnect(self, websocket: WebSocket, symbol: str = None):
        """Remove a WebSocket connection"""
        if symbol and symbol in self.active_connections:
            self.active_connections[symbol].discard(websocket)
            if not self.active_connections[symbol]:
                del self.active_connections[symbol]
        
        # Also remove from subscriptions
        for channel_connections in self.subscriptions.values():
            channel_connections.discard(websocket)
    
    async def broadcast_price_update(self, symbol: str, price_data: Dict[str, Any]):
        """Broadcast price update to all clients subscribed to a symbol"""
        message = {
            "type": "price_update",
            "symbol": symbol,
            "data": price_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if symbol in self.active_connections:
            for connection in list(self.active_connections[symbol]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending price update: {e}")
                    self.disconnect(connection, symbol)
    
    async def broadcast_sentiment_update(self, token: str, sentiment_data: Dict[str, Any]):
        """Broadcast sentiment update to all sentiment subscribers"""
        message = {
            "type": "sentiment_update",
            "token": token,
            "data": sentiment_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if "sentiment" in self.subscriptions:
            for connection in list(self.subscriptions["sentiment"]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending sentiment update: {e}")
                    self.disconnect(connection)
    
    async def broadcast_liquidation_alert(self, symbol: str, liquidation_data: Dict[str, Any]):
        """Broadcast liquidation alert to all liquidation alert subscribers"""
        message = {
            "type": "liquidation_alert",
            "symbol": symbol,
            "data": liquidation_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if "liquidations" in self.subscriptions:
            for connection in list(self.subscriptions["liquidations"]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending liquidation alert: {e}")
                    self.disconnect(connection)
    
    async def broadcast_whale_activity(self, activity_data: Dict[str, Any]):
        """Broadcast whale activity to all whale tracker subscribers"""
        message = {
            "type": "whale_activity",
            "data": activity_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if "whales" in self.subscriptions:
            for connection in list(self.subscriptions["whales"]):
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending whale activity: {e}")
                    self.disconnect(connection)
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send message to a specific client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def handle_client_message(self, websocket: WebSocket, data: Dict[str, Any]):
        """
        Handle incoming message from client
        
        Expected message format:
        {
            "action": "subscribe" | "unsubscribe" | "ping",
            "channel": "prices" | "sentiment" | "liquidations" | "whales",
            "symbols": ["BTC", "ETH"]  # optional for prices channel
        }
        """
        action = data.get("action")
        channel = data.get("channel")
        symbols = data.get("symbols", [])
        
        if action == "subscribe":
            if channel == "prices" and symbols:
                for symbol in symbols:
                    await self.connect(websocket, symbol)
            elif channel in ["sentiment", "liquidations", "whales"]:
                await self.subscribe(websocket, channel)
            
            await self.send_personal_message(websocket, {
                "type": "subscription_confirmation",
                "channel": channel,
                "status": "subscribed"
            })
        
        elif action == "unsubscribe":
            if channel == "prices" and symbols:
                for symbol in symbols:
                    self.disconnect(websocket, symbol)
            else:
                self.disconnect(websocket)
            
            await self.send_personal_message(websocket, {
                "type": "subscription_confirmation",
                "channel": channel,
                "status": "unsubscribed"
            })
        
        elif action == "ping":
            await self.send_personal_message(websocket, {
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            })


# Global connection manager instance
connection_manager = ConnectionManager()


async def stream_market_prices(symbol: str, db: Session, interval: int = 5):
    """
    Background task to stream market prices every interval seconds
    
    Args:
        symbol: Trading pair symbol
        db: Database session
        interval: Update interval in seconds
    """
    while True:
        try:
            # Fetch market data
            market = db.query(Market).filter(Market.symbol == symbol).first()
            
            if market:
                price_data = {
                    "symbol": symbol,
                    "price": market.price,
                    "volume_24h": market.volume_24h,
                    "open_interest": market.open_interest,
                    "funding_rate": market.funding_rate,
                    "price_change_1h": market.price_change_1h,
                    "price_change_24h": market.price_change_24h
                }
                
                await connection_manager.broadcast_price_update(symbol, price_data)
            
            await asyncio.sleep(interval)
        
        except Exception as e:
            print(f"Error streaming prices for {symbol}: {e}")
            await asyncio.sleep(interval)


async def stream_sentiment_updates(token: str, db: Session, interval: int = 30):
    """
    Background task to stream sentiment updates every interval seconds
    
    Args:
        token: Token symbol
        db: Database session
        interval: Update interval in seconds
    """
    from app.services.sentiment_engine import SentimentEngine
    
    while True:
        try:
            # Fetch sentiment analysis
            sentiment = await SentimentEngine.analyze_token_sentiment(token, db)
            
            if sentiment:
                await connection_manager.broadcast_sentiment_update(token, sentiment)
            
            await asyncio.sleep(interval)
        
        except Exception as e:
            print(f"Error streaming sentiment for {token}: {e}")
            await asyncio.sleep(interval)
