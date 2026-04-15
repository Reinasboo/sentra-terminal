import aiohttp
import os
from typing import Dict, List, Optional
import json
import logging
import asyncio
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ElfaClient:
    def __init__(self):
        self.api_key = os.getenv("ELFA_API_KEY")
        self.base_url = os.getenv("ELFA_API_BASE_URL", "https://api.elfa.ai")
        self.headers = {
            "x-elfa-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        self.timeout = aiohttp.ClientTimeout(total=30)
        self.max_retries = 3
        self.retry_delay = 1  # seconds
    
    async def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None, json_data: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to Elfa API with retry logic and error handling"""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession(timeout=self.timeout) as session:
                    async with session.request(
                        method,
                        url,
                        headers=self.headers,
                        params=params,
                        json=json_data
                    ) as resp:
                        # Handle different status codes
                        if resp.status == 200:
                            try:
                                return await resp.json()
                            except json.JSONDecodeError:
                                logger.error(f"Invalid JSON response from {endpoint}")
                                return None
                        elif resp.status == 401:
                            logger.error(f"Authentication error (401) for Elfa API. Check ELFA_API_KEY.")
                            return None
                        elif resp.status == 429:
                            logger.warning(f"Rate limited (429). Retrying in {self.retry_delay * (attempt + 1)}s...")
                            await asyncio.sleep(self.retry_delay * (attempt + 1))
                            continue
                        elif resp.status >= 500:
                            logger.warning(f"Server error ({resp.status}). Retrying...")
                            await asyncio.sleep(self.retry_delay * (attempt + 1))
                            continue
                        else:
                            logger.error(f"HTTP error {resp.status} from Elfa API: {endpoint}")
                            return None
            except asyncio.TimeoutError:
                logger.warning(f"Timeout on {endpoint}. Attempt {attempt + 1}/{self.max_retries}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue
                else:
                    logger.error(f"Failed after {self.max_retries} retries: {endpoint}")
                    return None
            except Exception as e:
                logger.error(f"Error calling {endpoint}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue
                else:
                    return None
        
        return None

    async def get_top_mentions(self, ticker: str) -> List[Dict]:
        """Get most relevant posts for a ticker"""
        logger.info(f"Fetching top mentions for {ticker}")
        # Get data from last 24 hours
        to_time = datetime.utcnow()
        from_time = to_time - timedelta(hours=24)
        
        params = {
            "ticker": ticker,
            "from": int(from_time.timestamp() * 1000),
            "to": int(to_time.timestamp() * 1000)
        }
        
        response = await self._make_request(
            "GET",
            "/v2/data/top-mentions",
            params=params
        )
        if response and isinstance(response, list):
            logger.info(f"Got {len(response)} mentions for {ticker}")
            return response
        logger.warning(f"No valid mentions returned for {ticker}")
        return []

    async def get_keyword_mentions(self, keyword: str) -> List[Dict]:
        """Search posts using keyword logic"""
        logger.info(f"Searching keyword mentions: {keyword}")
        response = await self._make_request(
            "GET",
            "/v2/data/keyword-mentions",
            params={"keyword": keyword}
        )
        return response if isinstance(response, list) else []

    async def get_token_news(self, token: str) -> List[Dict]:
        """Get news-related mentions for a token"""
        logger.info(f"Fetching token news: {token}")
        response = await self._make_request(
            "GET",
            "/v2/data/token-news",
            params={"token": token}
        )
        return response if isinstance(response, list) else []

    async def get_trending_tokens(self) -> List[Dict]:
        """Get tokens gaining social momentum"""
        logger.info("Fetching trending tokens")
        # Get data from last 24 hours
        to_time = datetime.utcnow()
        from_time = to_time - timedelta(hours=24)
        
        params = {
            "from": int(from_time.timestamp() * 1000),  # Elfa uses milliseconds
            "to": int(to_time.timestamp() * 1000)
        }
        
        response = await self._make_request(
            "GET",
            "/v2/aggregations/trending-tokens",
            params=params
        )
        if response and isinstance(response, list):
            logger.info(f"Got {len(response)} trending tokens")
            return response
        logger.warning("No trending tokens returned")
        return []

    async def get_trending_narratives(self) -> List[Dict]:
        """Get narratives forming across social media"""
        logger.info("Fetching trending narratives")
        # Get data from last 24 hours
        to_time = datetime.utcnow()
        from_time = to_time - timedelta(hours=24)
        
        params = {
            "from": int(from_time.timestamp() * 1000),
            "to": int(to_time.timestamp() * 1000)
        }
        
        response = await self._make_request(
            "GET",
            "/v2/data/trending-narratives",
            params=params
        )
        if response and isinstance(response, list):
            logger.info(f"Got {len(response)} trending narratives")
            return response
        logger.warning("No trending narratives returned")
        return []

    async def get_trending_cas_twitter(self) -> List[Dict]:
        """Get contract addresses trending on X (Twitter)"""
        logger.info("Fetching trending CAs (Twitter)")
        response = await self._make_request(
            "GET",
            "/v2/aggregations/trending-cas/twitter"
        )
        return response if isinstance(response, list) else []

    async def get_trending_cas_telegram(self) -> List[Dict]:
        """Get contract addresses trending on Telegram"""
        logger.info("Fetching trending CAs (Telegram)")
        response = await self._make_request(
            "GET",
            "/v2/aggregations/trending-cas/telegram"
        )
        return response if isinstance(response, list) else []

    async def get_smart_stats(self, account_handle: str) -> Dict:
        """Get account intelligence metrics"""
        logger.info(f"Fetching smart stats for {account_handle}")
        response = await self._make_request(
            "GET",
            "/v2/account/smart-stats",
            params={"handle": account_handle}
        )
        return response if isinstance(response, dict) else {}

    async def chat(self, prompt: str, mode: str = "chat", context: Optional[Dict] = None) -> str:
        """Use AI Chat endpoint for market intelligence"""
        logger.info(f"Calling Elfa chat endpoint (mode={mode})")
        payload = {
            "prompt": prompt,
            "mode": mode,
            "context": context or {}
        }
        response = await self._make_request(
            "POST",
            "/v2/chat",
            json_data=payload
        )
        if response and isinstance(response, dict):
            result = response.get("response", "")
            logger.info(f"Chat endpoint returned: {len(result)} chars")
            return result
        logger.warning("No response from chat endpoint")
        return ""


elfa_client = ElfaClient()
