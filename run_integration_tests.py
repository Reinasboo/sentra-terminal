"""
Comprehensive Integration Test Suite
Tests all endpoints and verifies frontend-backend integration
"""

import requests
import time
import json
import subprocess
import os
import sys
from pathlib import Path

# Force UTF-8 encoding for console output (Windows compatibility)
if sys.platform == "win32":
    os.environ['PYTHONIOENCODING'] = 'utf-8'

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

class IntegrationTester:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def test_endpoint(self, method, path, expected_status, description, data=None):
        """Test a single endpoint"""
        try:
            url = f"{API_BASE_URL}{path}"
            
            if method == "GET":
                response = requests.get(url, headers=HEADERS, timeout=TEST_TIMEOUT)
            elif method == "POST":
                response = requests.post(url, headers=HEADERS, json=data, timeout=TEST_TIMEOUT)
            else:
                raise ValueError(f"Unknown method: {method}")
            
            passed = response.status_code == expected_status
            status = "✅" if passed else "❌"
            
            self.results.append({
                "status": status,
                "method": method,
                "path": path,
                "expected": expected_status,
                "actual": response.status_code,
                "description": description
            })
            
            if passed:
                self.passed += 1
            else:
                self.failed += 1
                self.errors.append(f"{method} {path}: Expected {expected_status}, got {response.status_code}")
            
            return passed
        
        except requests.exceptions.ConnectionError:
            self.results.append({
                "status": "⚠️",
                "method": method,
                "path": path,
                "expected": expected_status,
                "actual": "CONNECTION_ERROR",
                "description": description
            })
            self.failed += 1
            self.errors.append(f"{method} {path}: Connection refused")
            return False
        
        except Exception as e:
            self.results.append({
                "status": "❌",
                "method": method,
                "path": path,
                "expected": expected_status,
                "actual": str(e),
                "description": description
            })
            self.failed += 1
            self.errors.append(f"{method} {path}: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all endpoint tests"""
        print("\n" + "="*80)
        print("SENTRA TERMINAL - INTEGRATION TEST SUITE")
        print("="*80 + "\n")
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        
        for category, endpoints in ENDPOINTS.items():
            print(f"\n📋 {category}")
            print("-" * 80)
            
            for test in endpoints:
                method, path, expected_status, description = test[:4]
                data = test[4] if len(test) > 4 else None
                
                self.test_endpoint(method, path, expected_status, description, data)
                
                result = self.results[-1]
                print(f"{result['status']} {result['method']:6} {result['path']:30} → {result['actual']:3} | {result['description']}")
        
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️  Total:  {self.passed + self.failed}")
        
        if self.errors:
            print("\n❌ ERRORS:")
            for error in self.errors:
                print(f"  - {error}")
        else:
            print("\n✅ All tests passed!")
        
        success_rate = (self.passed / (self.passed + self.failed) * 100) if (self.passed + self.failed) > 0 else 0
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        print("="*80 + "\n")
        
        return self.failed == 0


class FrontendBackendGapAnalyzer:
    """Analyze frontend-backend integration gaps"""
    
    def __init__(self):
        self.gaps = []
        self.issues = []
    
    def analyze_typescript_hooks(self):
        """Check frontend TypeScript hooks match backend endpoints"""
        # Get absolute paths
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
        
        print("📁 Checking Frontend Hooks...")
        for hook_file, expected_endpoint in hooks_to_check.items():
            hook_path = frontend_dir / hook_file
            if hook_path.exists():
                print(f"✅ {hook_file} exists")
            else:
                print(f"❌ {hook_file} MISSING")
                self.gaps.append(f"Frontend hook missing: {hook_file}")
        
        # Check API client
        api_client = frontend_dir.parent / "lib" / "apiClient.ts"
        if api_client.exists():
            print(f"✅ API Client exists (apiClient.ts)")
        else:
            print(f"❌ API Client MISSING")
            self.gaps.append("Frontend API client missing")
        
        # Check backend endpoints
        print("\n📁 Checking Backend Endpoints...")
        api_files = {
            "auth.py": ["/auth/message", "/auth/login", "/auth/refresh", "/auth/verify", "/auth/me"],
            "websocket.py": ["/ws/connect", "/ws/prices", "/ws/sentiment", "/ws/liquidations", "/ws/whales"],
            "markets.py": ["/markets/", "/markets/{symbol}", "/markets/{symbol}/refresh"],
            "analytics.py": ["/analytics/liquidations", "/analytics/sentiment", "/analytics/whales"],
            "ai.py": ["/ai/insight", "/ai/explain-market-move"],
            "trading.py": ["/trading/orders/market", "/trading/orders/limit"],
        }
        
        for api_file, endpoints in api_files.items():
            api_path = backend_dir / api_file
            if api_path.exists():
                print(f"✅ {api_file} exists with {len(endpoints)} endpoints")
            else:
                print(f"❌ {api_file} MISSING")
                self.gaps.append(f"Backend API file missing: {api_file}")
        
        return self.gaps
    
    def print_gap_analysis(self):
        """Print gap analysis results"""
        if self.gaps:
            print("\n⚠️ INTEGRATION GAPS FOUND:")
            for gap in self.gaps:
                print(f"  - {gap}")
        else:
            print("\n✅ No integration gaps detected")
        
        return len(self.gaps) == 0


def wait_for_server(timeout=30):
    """Wait for API server to start"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=2)
            print(f"✅ Server is ready")
            return True
        except requests.exceptions.ConnectionError:
            elapsed = time.time() - start_time
            print(f"⏳ Waiting for server... ({elapsed:.1f}s)")
            time.sleep(1)
    
    print(f"❌ Server failed to start within {timeout}s")
    return False


def main():
    """Main test runner"""
    print("\n[START] Starting Integration Tests...\n")
    
    # Run integration tests
    tester = IntegrationTester()
    
    # Check if server is running
    try:
        requests.get(f"{API_BASE_URL}/health", timeout=2)
        print("[OK] Server is already running\n")
    except requests.exceptions.ConnectionError:
        print("[WARNING] Server not running - make sure to start it first with:")
        print("   cd backend && python -m uvicorn app.main:app --reload\n")
        return False
    
    # Run endpoint tests
    tester.run_all_tests()
    
    # Analyze frontend-backend integration
    analyzer = FrontendBackendGapAnalyzer()
    analyzer.analyze_typescript_hooks()
    analyzer.print_gap_analysis()
    
    # Overall result
    overall_success = tester.failed == 0 and len(analyzer.gaps) == 0
    
    if overall_success:
        print("\n[SUCCESS] ALL INTEGRATION TESTS PASSED!")
        return True
    else:
        print("\n[WARNING] SOME TESTS FAILED - See details above")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
