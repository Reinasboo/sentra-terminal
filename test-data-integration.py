#!/usr/bin/env python
"""Quick endpoint validation - tests all frontend API points"""

import requests
import json
from typing import Dict, List, Tuple
import sys

API_BASE_URL = "http://localhost:8000"

ENDPOINTS = {
    "/": {"fields": ["message", "version"]},
    "/markets/": {"fields": ["symbol", "price"], "is_list": True},
    "/markets/BTC": {"fields": ["symbol", "price", "funding_rate", "volume_24h"]},
    "/analytics/sentiment/BTC": {"fields": ["token", "sentiment_score", "total_mentions", "mention_velocity", "platforms"]},
    "/analytics/liquidations/BTC": {"fields": ["symbol", "liquidation_zones"]},
    "/analytics/whales/BTC": {"fields": ["symbol", "position_concentration"]},
}

def check_endpoint(endpoint, spec):
    """Test single endpoint"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        resp = requests.get(url, timeout=5)
        
        if resp.status_code != 200:
            return f"[FAIL] {endpoint}: HTTP {resp.status_code}"
        
        data = resp.json()
        
        # For lists, check first item
        if spec.get("is_list") and isinstance(data, list) and len(data) > 0:
            data = data[0]
        
        # Check fields
        if isinstance(data, dict):
            missing = [f for f in spec["fields"] if f not in data]
            if missing:
                return f"[WARN] {endpoint}: Missing {missing}"
            else:
                return f"[PASS] {endpoint}"
        else:
            return f"[FAIL] {endpoint}: Not a dict"
    
    except Exception as e:
        return f"[FAIL] {endpoint}: {str(e)}"

def main():
    print("\n=== FRONTEND-BACKEND DATA INTEGRATION TEST ===\n")
    print(f"API: {API_BASE_URL}\n")
    
    results = []
    for endpoint, spec in ENDPOINTS.items():
        result = check_endpoint(endpoint, spec)
        results.append(result)
        print(result)
    
    passed = sum(1 for r in results if "[PASS]" in r)
    total = len(results)
    
    print(f"\n=== SUMMARY ===")
    print(f"Passed: {passed}/{total}")
    print()
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
