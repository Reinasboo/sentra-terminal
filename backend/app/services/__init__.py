"""
Pacifica Finance API Client

Official API Documentation: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api
- Mainnet: https://api.pacifica.fi/api/v1
- Testnet: https://test-api.pacifica.fi/api/v1

This client uses the official Pacifica REST API endpoints for fetching market data.
"""

import aiohttp
import os
import logging
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class PacificaClient:
    """
    Client for Pacifica Finance REST API.
    Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api
    """
    
    def __init__(self):
        self.api_key = os.getenv("PACIFICA_API_KEY")
        # Note: Pacifica API doesn't require Bearer auth for public endpoints
        self.base_url = os.getenv("PACIFICA_API_BASE_URL", "https://api.pacifica.fi/api/v1")
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

    async def get_market_info(self) -> Dict:
        """
        Get market information for all symbols.
        
        Endpoint: GET /api/v1/info
        Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api/markets/get-market-info
        
        Returns market specifications including: symbol, tick_size, max_leverage, funding_rate, etc.
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/info",
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"Fetched market info: {len(data.get('data', []))} markets")
                        return data
                    else:
                        logger.warning(f"Market info request failed: {resp.status}")
                        return {"success": False, "data": []}
            except Exception as e:
                logger.error(f"Error fetching market info: {e}")
                return {"success": False, "data": []}

    async def get_prices(self) -> Dict:
        """
        Get current prices for all symbols.
        
        Endpoint: GET /api/v1/info/prices
        Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api/markets/get-prices
        
        Returns: funding, mark, mid, next_funding, open_interest, oracle, symbol, 
                timestamp, volume_24h, yesterday_price
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/info/prices",
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"Fetched prices: {len(data.get('data', []))} symbols")
                        return data
                    else:
                        logger.warning(f"Prices request failed: {resp.status}")
                        return {"success": False, "data": []}
            except Exception as e:
                logger.error(f"Error fetching prices: {e}")
                return {"success": False, "data": []}

    async def get_market_data(self, symbol: str) -> Dict:
        """
        Fetch current market data for a specific symbol.
        
        Uses get_prices() and extracts data for the specified symbol.
        
        Args:
            symbol: Base symbol (e.g., "BTC", "ETH", "SOL") - without the "-PERP" suffix
            
        Returns:
            Market data dict with: price (mark), funding_rate, open_interest, volume_24h, etc.
            Returns empty dict if symbol not found
        """
        prices = await self.get_prices()
        
        if not prices.get("success"):
            return {}
        
        for market in prices.get("data", []):
            if market.get("symbol") == symbol:
                # Transform Pacifica response to our internal format
                return {
                    "price": float(market.get("mark", 0)),
                    "mark": float(market.get("mark", 0)),
                    "mid": float(market.get("mid", 0)),
                    "funding_rate": float(market.get("funding", 0)),
                    "next_funding_rate": float(market.get("next_funding", 0)),
                    "open_interest": float(market.get("open_interest", 0)),
                    "volume_24h": float(market.get("volume_24h", 0)),
                    "oracle_price": float(market.get("oracle", 0)),
                    "yesterday_price": float(market.get("yesterday_price", 0)),
                    "timestamp": market.get("timestamp", 0),
                    "symbol": symbol
                }
        
        logger.warning(f"Symbol {symbol} not found in prices data")
        return {}

    async def get_candles(
        self,
        symbol: str,
        interval: str = "1h",
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> Dict:
        """
        Get OHLCV candle data for a symbol.
        
        Endpoint: GET /api/v1/kline
        Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api/markets/get-candle-data
        
        Args:
            symbol: Base symbol (e.g., "BTC")
            interval: Candle interval ("1m", "5m", "15m", "1h", "4h", "1d", etc.)
            start_time: Start time in milliseconds (Unix timestamp * 1000)
            end_time: End time in milliseconds
            
        Returns:
            Candle data: t (start), T (end), s (symbol), i (interval), o, c, h, l, v, n
        """
        async with aiohttp.ClientSession() as session:
            try:
                params = {"symbol": symbol, "interval": interval}
                if start_time:
                    params["start_time"] = start_time
                if end_time:
                    params["end_time"] = end_time
                
                async with session.get(
                    f"{self.base_url}/kline",
                    headers=self.headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"Fetched {len(data.get('data', []))} candles for {symbol}")
                        return data
                    else:
                        logger.warning(f"Candles request failed: {resp.status}")
                        return {"success": False, "data": []}
            except Exception as e:
                logger.error(f"Error fetching candles for {symbol}: {e}")
                return {"success": False, "data": []}

    async def get_trades(self, symbol: str, limit: int = 100) -> Dict:
        """
        Get recent trades for a symbol.
        
        Endpoint: GET /api/v1/trades
        Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api/markets/get-recent-trades
        
        Args:
            symbol: Base symbol (e.g., "BTC")
            limit: Number of trades to return
            
        Returns:
            Recent trades with: event_type, price, amount, side, cause, created_at
            
        Note:
            - event_type can be: "fulfill_taker", "fulfill_maker"
            - side can be: "open_long", "close_long", "open_short", "close_short"
            - cause can be: "normal", "liquidation"
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/trades",
                    headers=self.headers,
                    params={"symbol": symbol},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"Fetched {len(data.get('data', []))} trades for {symbol}")
                        return data
                    else:
                        logger.warning(f"Trades request failed: {resp.status}")
                        return {"success": False, "data": []}
            except Exception as e:
                logger.error(f"Error fetching trades for {symbol}: {e}")
                return {"success": False, "data": []}

    async def get_liquidations(self, symbol: str) -> List[Dict]:
        """
        Get liquidation trades for a symbol.
        
        Liquidations are trades with cause="liquidation" in the trades endpoint.
        
        Args:
            symbol: Base symbol (e.g., "BTC")
            
        Returns:
            List of liquidation trades
        """
        trades_data = await self.get_trades(symbol)
        trades = trades_data.get("data", [])
        
        # Filter for liquidation trades
        liquidations = [t for t in trades if t.get("cause") == "liquidation"]
        logger.info(f"Found {len(liquidations)} liquidations for {symbol}")
        return liquidations

    async def get_orderbook(self, symbol: str) -> Dict:
        """
        Get orderbook for a symbol.
        
        Endpoint: GET /api/v1/orderbook
        Reference: https://pacifica.gitbook.io/docs/api-documentation/api/rest-api/markets/get-orderbook
        
        Args:
            symbol: Base symbol (e.g., "BTC")
            
        Returns:
            Orderbook with bids and asks
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/orderbook",
                    headers=self.headers,
                    params={"symbol": symbol},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"Fetched orderbook for {symbol}")
                        return data
                    else:
                        logger.warning(f"Orderbook request failed: {resp.status}")
                        return {"success": False}
            except Exception as e:
                logger.error(f"Error fetching orderbook for {symbol}: {e}")
                return {"success": False}

    async def get_open_interest(self, symbol: str) -> float:
        """Get open interest for a symbol"""
        data = await self.get_market_data(symbol)
        return float(data.get("open_interest", 0))

    async def get_funding_rate(self, symbol: str) -> float:
        """Get current funding rate for a symbol"""
        data = await self.get_market_data(symbol)
        return float(data.get("funding_rate", 0))


# Global client instance
pacifica_client = PacificaClient()
