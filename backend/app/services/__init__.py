import aiohttp
import os
from typing import Dict, List, Optional


class PacificaClient:
    def __init__(self):
        self.api_key = os.getenv("PACIFICA_API_KEY")
        self.base_url = os.getenv("PACIFICA_API_BASE_URL", "https://api.pacifica.fi")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def get_market_data(self, symbol: str) -> Dict:
        """Fetch current market data for a symbol"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/markets/{symbol}",
                    headers=self.headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return {}
            except Exception as e:
                print(f"Error fetching market data: {e}")
                return {}

    async def get_trades(self, symbol: str, limit: int = 100) -> List[Dict]:
        """Fetch recent trades for a symbol"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/trades/{symbol}",
                    headers=self.headers,
                    params={"limit": limit}
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return []
            except Exception as e:
                print(f"Error fetching trades: {e}")
                return []

    async def get_liquidations(self, symbol: str, limit: int = 100) -> List[Dict]:
        """Fetch liquidation data for a symbol"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/liquidations/{symbol}",
                    headers=self.headers,
                    params={"limit": limit}
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return []
            except Exception as e:
                print(f"Error fetching liquidations: {e}")
                return []

    async def get_positions(self, symbol: str) -> List[Dict]:
        """Fetch open positions for a symbol"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/positions/{symbol}",
                    headers=self.headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return []
            except Exception as e:
                print(f"Error fetching positions: {e}")
                return []

    async def get_open_interest(self, symbol: str) -> float:
        """Fetch open interest for a symbol"""
        data = await self.get_market_data(symbol)
        return data.get("open_interest", 0)

    async def get_funding_rate(self, symbol: str) -> float:
        """Fetch current funding rate for a symbol"""
        data = await self.get_market_data(symbol)
        return data.get("funding_rate", 0)


pacifica_client = PacificaClient()
