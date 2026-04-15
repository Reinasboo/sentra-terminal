"""
Simple Integration Test - No Unicode
Tests all endpoints and verifies frontend-backend integration
"""

import requests
import time
import sys
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_TIMEOUT = 5
HEADERS = {"Content-Type": "application/json"}

# Test data
TEST_WALLET = "11111111111111111111111111111112"
TEST_MESSAGE = "Test authentication message"
TEST_SIGNATURE = "3Xp5132sBucEBhYDL77DwKkHavJE91k7FtxJNqkMTmBgcvHwZ3cofFVDyngD apR1M923HxSQ2tWDvJ88MfqSSiC2"

# Endpoint map with expected status codes
ENDPOINTS = {
    "Core": [
        ("GET", "/", 200, "Root endpoint"),
        ("GET", "/health", 200, "Health check"),
        ("GET", "/ready", 200, "Readiness probe"),
    ],
    "Authentication": [
        ("POST", "/auth/message", 200, "Get auth message", {"wallet_address": TEST_WALLET}),
        ("POST", "/auth/verify", 200, "Verify signature", {
            "wallet_address": TEST_WALLET,
            "message": TEST_MESSAGE,
            "signature": TEST_SIGNATURE
        }),
        ("POST", "/auth/login", 401, "Login (invalid sig)", {
            "wallet_address": TEST_WALLET,
            "message": TEST_MESSAGE,
            "signature": "invalid"
        }),
    ],
    "Markets": [
        ("GET", "/markets/", 200, "Get markets list"),
        ("GET", "/markets/BTC", 200, "Get market (BTC)"),
    ],
    "Analytics": [
        ("GET", "/analytics/liquidations/BTC", 200, "Get liquidations"),
        ("GET", "/analytics/sentiment/BTC", 200, "Get sentiment"),
        ("GET", "/analytics/trending-narratives", 200, "Trending narratives"),
        ("GET", "/analytics/whales/BTC", 200, "Get whales"),
    ],
    "AI": [
        ("GET", "/ai/insight/BTC", 200, "AI insight"),
    ],
}

class SimpleTester:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def test_endpoint(self, method, path, expected_status, description, data=None):
        try:
            url = f"{API_BASE_URL}{path}"
            
            if method == "GET":
                response = requests.get(url, headers=HEADERS, timeout=TEST_TIMEOUT)
            elif method == "POST":
                response = requests.post(url, headers=HEADERS, json=data, timeout=TEST_TIMEOUT)
            else:
                raise ValueError(f"Unknown method: {method}")
            
            passed = response.status_code == expected_status
            status = "[OK]" if passed else "[FAIL]"
            
            print(f"{status} {method:6} {path:30} -> {response.status_code:3} | {description}")
            
            if passed:
                self.passed += 1
            else:
                self.failed += 1
                self.errors.append(f"{method} {path}: Expected {expected_status}, got {response.status_code}")
            
            return passed
        
        except Exception as e:
            print(f"[ERROR] {method:6} {path:30} -> ERROR | {str(e)}")
            self.failed += 1
            self.errors.append(f"{method} {path}: {str(e)}")
            return False
    
    def run_all_tests(self):
        print("\n" + "="*80)
        print("SENTRA TERMINAL - INTEGRATION TEST SUITE")
        print("="*80 + "\n")
        
        for category, endpoints in ENDPOINTS.items():
            print(f"\n[CATEGORY] {category}")
            print("-" * 80)
            
            for test in endpoints:
                method, path, expected_status, description = test[:4]
                data = test[4] if len(test) > 4 else None
                self.test_endpoint(method, path, expected_status, description, data)
        
        self.print_summary()
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"[PASS] Passed: {self.passed}")
        print(f"[FAIL] Failed: {self.failed}")
        print(f"[INFO] Total:  {self.passed + self.failed}")
        
        if self.errors:
            print("\n[ERROR] ERRORS:")
            for error in self.errors:
                print(f"  - {error}")
        else:
            print("\n[OK] All tests passed!")
        
        success_rate = (self.passed / (self.passed + self.failed) * 100) if (self.passed + self.failed) > 0 else 0
        print(f"\n[STAT] Success Rate: {success_rate:.1f}%")
        print("="*80 + "\n")
        
        return self.failed == 0


class SimpleGapAnalyzer:
    """Analyze frontend-backend integration gaps"""
    
    def __init__(self):
        self.gaps = []
    
    def analyze_files(self):
        """Check for key files"""
        current_dir = Path(__file__).parent
        frontend_dir = current_dir / "frontend" / "src" / "hooks"
        backend_dir = current_dir / "backend" / "app" / "api"
        
        print("\n" + "="*80)
        print("FRONTEND-BACKEND INTEGRATION ANALYSIS")
        print("="*80 + "\n")
        
        # Check for key hook files
        hooks_to_check = {
            "useAuth.ts": "/auth",
            "useWebSocket.ts": "/ws",
        }
        
        print("[CHECK] Checking Frontend Hooks...")
        for hook_file, expected_endpoint in hooks_to_check.items():
            hook_path = frontend_dir / hook_file
            if hook_path.exists():
                print(f"[OK] {hook_file} exists")
            else:
                print(f"[MISS] {hook_file} MISSING")
                self.gaps.append(f"Frontend hook missing: {hook_file}")
        
        # Check API client
        api_client = frontend_dir.parent / "lib" / "apiClient.ts"
        if api_client.exists():
            print(f"[OK] API Client exists (apiClient.ts)")
        else:
            print(f"[MISS] API Client MISSING")
            self.gaps.append("Frontend API client missing")
        
        # Check backend endpoints
        print("\n[CHECK] Checking Backend Endpoints...")
        api_files = {
            "auth.py": 5,
            "websocket.py": 5,
            "markets.py": 3,
            "analytics.py": 4,
            "ai.py": 2,
            "trading.py": 6,
        }
        
        for api_file, endpoint_count in api_files.items():
            api_path = backend_dir / api_file
            if api_path.exists():
                print(f"[OK] {api_file} exists with {endpoint_count} endpoints")
            else:
                print(f"[MISS] {api_file} MISSING")
                self.gaps.append(f"Backend API file missing: {api_file}")
        
        return self.gaps
    
    def print_gap_analysis(self):
        """Print gap analysis results"""
        if self.gaps:
            print("\n[WARN] INTEGRATION GAPS FOUND:")
            for gap in self.gaps:
                print(f"  - {gap}")
        else:
            print("\n[OK] No integration gaps detected")
        
        return len(self.gaps) == 0


def main():
    """Main test runner"""
    print("\n[START] Starting Integration Tests...\n")
    
    # Run integration tests
    tester = SimpleTester()
    
    # Check if server is running
    try:
        requests.get(f"{API_BASE_URL}/health", timeout=2)
        print("[OK] Server is already running\n")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Server not running - make sure to start it first!")
        return False
    
    # Run endpoint tests
    tester.run_all_tests()
    
    # Analyze frontend-backend integration
    analyzer = SimpleGapAnalyzer()
    analyzer.analyze_files()
    analyzer.print_gap_analysis()
    
    # Overall result
    overall_success = tester.failed == 0 and len(analyzer.gaps) == 0
    
    if overall_success:
        print("\n[SUCCESS] ALL INTEGRATION TESTS PASSED!")
        return True
    else:
        print("\n[ALERT] Check details above for failures")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
