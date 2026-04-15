#!/usr/bin/env python3
"""
Comprehensive Pacifica Endpoints Checker
Tests all backend API endpoints and reports detailed results
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, List, Tuple

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 10

class Colors:
    PASS = "\033[92m"  # Green
    FAIL = "\033[91m"  # Red
    WARN = "\033[93m"  # Yellow
    INFO = "\033[94m"  # Blue
    RESET = "\033[0m"
    BOLD = "\033[1m"

class EndpointChecker:
    def __init__(self):
        self.results = []
        self.client = httpx.AsyncClient(timeout=TIMEOUT)
        
    async def check_endpoint(self, method: str, path: str, description: str, payload: Dict = None) -> Tuple[bool, str, any]:
        """Check a single endpoint"""
        url = f"{BASE_URL}{path}"
        status = "✓"
        status_code = None
        response_data = None
        
        try:
            if method.upper() == "GET":
                response = await self.client.get(url)
            elif method.upper() == "POST":
                response = await self.client.post(url, json=payload or {})
            else:
                return False, f"Unknown method: {method}", None
            
            status_code = response.status_code
            
            # Check response
            if 200 <= status_code < 300:
                status = f"{Colors.PASS}✓{Colors.RESET}"
                try:
                    response_data = response.json()
                except:
                    response_data = response.text
                return True, status, response_data
            else:
                status = f"{Colors.FAIL}✗{Colors.RESET}"
                return False, status, f"HTTP {status_code}"
                
        except asyncio.TimeoutError:
            return False, f"{Colors.WARN}⏱{Colors.RESET}", "Timeout"
        except Exception as e:
            return False, f"{Colors.FAIL}✗{Colors.RESET}", str(e)
    
    async def run_all_checks(self):
        """Run all endpoint checks"""
        endpoints = self.get_all_endpoints()
        
        print(f"\n{Colors.BOLD}🔍 Pacifica Endpoints Check{Colors.RESET}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Base URL: {BASE_URL}\n")
        
        # Group endpoints by category
        categories = {}
        for category, items in endpoints.items():
            categories[category] = []
            
            for item in items:
                method = item["method"]
                path = item["path"]
                description = item["description"]
                payload = item.get("payload", None)
                
                success, status, data = await self.check_endpoint(method, path, description, payload)
                
                result = {
                    "success": success,
                    "status": status,
                    "method": method,
                    "path": path,
                    "description": description,
                    "data": data
                }
                categories[category].append(result)
        
        # Print results by category
        total_pass = 0
        total_fail = 0
        
        for category, results in categories.items():
            print(f"\n{Colors.BOLD}{category}{Colors.RESET}")
            print("─" * 80)
            
            for result in results:
                success = result["success"]
                status = result["status"]
                method = result["method"].ljust(6)
                path = result["path"].ljust(40)
                desc = result["description"][:35]
                
                if success:
                    total_pass += 1
                    print(f"{status} {Colors.BOLD}{method}{Colors.RESET} {path} {desc}")
                    if isinstance(result["data"], dict):
                        if "symbol" in result["data"] or "symbols" in result["data"]:
                            print(f"     └─ Data: {json.dumps(result['data'], indent=8)[:150]}...")
                else:
                    total_fail += 1
                    error_msg = str(result["data"])[:50]
                    print(f"{status} {Colors.BOLD}{method}{Colors.RESET} {path} {desc}")
                    print(f"     └─ Error: {error_msg}")
        
        # Summary
        print(f"\n{Colors.BOLD}Summary{Colors.RESET}")
        print("─" * 80)
        
        total = total_pass + total_fail
        pass_pct = (total_pass / total * 100) if total > 0 else 0
        
        print(f"Total Endpoints: {total}")
        print(f"Passed: {Colors.PASS}{total_pass}{Colors.RESET}")
        print(f"Failed: {Colors.FAIL}{total_fail}{Colors.RESET}")
        print(f"Success Rate: {Colors.BOLD}{pass_pct:.1f}%{Colors.RESET}")
        
        if total_fail == 0:
            print(f"\n{Colors.PASS}{Colors.BOLD}✓ All endpoints operational!{Colors.RESET}")
        else:
            print(f"\n{Colors.FAIL}{Colors.BOLD}✗ Some endpoints failed - see details above{Colors.RESET}")
        
        await self.client.aclose()
    
    def get_all_endpoints(self) -> Dict[str, List[Dict]]:
        """Define all endpoints to check"""
        return {
            "Health": [
                {"method": "GET", "path": "/", "description": "Root/Health Check"},
                {"method": "GET", "path": "/health", "description": "Health Endpoint"},
            ],
            
            "Markets": [
                {"method": "GET", "path": "/markets/", "description": "Get All Markets"},
                {"method": "GET", "path": "/markets/BTC", "description": "Get BTC Market"},
                {"method": "GET", "path": "/markets/ETH", "description": "Get ETH Market"},
                {"method": "POST", "path": "/markets/BTC/refresh", "description": "Refresh BTC Data"},
            ],
            
            "Analytics - Liquidations": [
                {"method": "GET", "path": "/analytics/liquidations/BTC", "description": "BTC Liquidations"},
                {"method": "GET", "path": "/analytics/liquidation-risk/BTC", "description": "BTC Liquidation Risk"},
                {"method": "GET", "path": "/analytics/liquidations/ETH", "description": "ETH Liquidations"},
            ],
            
            "Analytics - Sentiment": [
                {"method": "GET", "path": "/analytics/sentiment/BTC", "description": "BTC Sentiment"},
                {"method": "GET", "path": "/analytics/sentiment/ETH", "description": "ETH Sentiment"},
                {"method": "GET", "path": "/analytics/trending-narratives", "description": "Trending Narratives"},
            ],
            
            "Analytics - Whales": [
                {"method": "GET", "path": "/analytics/whales/BTC", "description": "BTC Whales"},
                {"method": "GET", "path": "/analytics/whales/ETH", "description": "ETH Whales"},
                {"method": "GET", "path": "/analytics/whale-trades/BTC", "description": "BTC Whale Trades"},
            ],
            
            "Analytics - Traders": [
                {"method": "GET", "path": "/analytics/trader-leaderboard", "description": "Trader Leaderboard"},
                {"method": "GET", "path": "/analytics/trader/whale_1", "description": "Whale 1 Stats"},
            ],
            
            "AI Endpoints": [
                {"method": "POST", "path": "/ai/explain-market-move", "description": "Explain Market Move", 
                 "payload": {"symbol": "BTC", "change_percent": 5.2}},
                {"method": "GET", "path": "/ai/insight/BTC", "description": "BTC Insight"},
            ],
            
            "Trading - Orders": [
                {"method": "POST", "path": "/trading/orders/market", "description": "Market Order",
                 "payload": {"symbol": "BTC", "side": "BUY", "quantity": 0.1}},
                {"method": "POST", "path": "/trading/orders/limit", "description": "Limit Order",
                 "payload": {"symbol": "BTC", "side": "BUY", "quantity": 0.1, "price": 45000}},
                {"method": "POST", "path": "/trading/orders/stop", "description": "Stop Order",
                 "payload": {"symbol": "BTC", "side": "SELL", "quantity": 0.1, "stop_price": 40000}},
            ],
            
            "Trading - Positions": [
                {"method": "POST", "path": "/trading/positions/tpsl", "description": "Set Take Profit/Stop Loss",
                 "payload": {"position_id": "pos_1", "take_profit": 50000, "stop_loss": 40000}},
            ],
            
            "Trading - Builder": [
                {"method": "POST", "path": "/trading/builder/approve", "description": "Approve Builder",
                 "payload": {"builder_code": "test_builder", "amount": 1000}},
                {"method": "GET", "path": "/trading/builder/approvals/0x123", "description": "Get Approvals"},
                {"method": "GET", "path": "/trading/builder/trades/test_builder", "description": "Builder Trades"},
                {"method": "GET", "path": "/trading/builder/overview/0x123", "description": "Builder Overview"},
            ],
            
            "Trading - Account": [
                {"method": "GET", "path": "/trading/history/0x123", "description": "Trade History"},
            ],
            
            "Trading - Referral": [
                {"method": "POST", "path": "/trading/referral/claim", "description": "Claim Referral",
                 "payload": {"referral_code": "REF123"}},
            ],
        }

async def main():
    """Main entry point"""
    checker = EndpointChecker()
    await checker.run_all_checks()

if __name__ == "__main__":
    asyncio.run(main())
