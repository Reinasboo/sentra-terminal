#!/usr/bin/env python3
"""
Pacifica API Configuration Verification Script

This script checks if all required Pacifica API environment variables are
properly configured and displays their status.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def load_env():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent / 'backend' / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        return True
    return False

def check_variable(name, description, required=True):
    """Check if an environment variable is set"""
    value = os.getenv(name)
    
    if not value:
        if required:
            status = f"{Colors.RED}✗ NOT SET (REQUIRED){Colors.RESET}"
            print(f"{Colors.BOLD}{name}{Colors.RESET}: {status}")
            print(f"  └─ {description}")
            return False
        else:
            status = f"{Colors.YELLOW}⚠ NOT SET (optional){Colors.RESET}"
            print(f"{Colors.BOLD}{name}{Colors.RESET}: {status}")
            print(f"  └─ {description}")
            return True
    
    if value.startswith('your_') or value == 'your_pacifica_builder_code_here':
        status = f"{Colors.YELLOW}⚠ PLACEHOLDER VALUE{Colors.RESET}"
        print(f"{Colors.BOLD}{name}{Colors.RESET}: {status}")
        print(f"  └─ {description}")
        print(f"  └─ Current: {value}")
        return False
    
    # Show only first few chars of sensitive data
    masked = value[:10] + '...' if len(value) > 10 else value
    status = f"{Colors.GREEN}✓ CONFIGURED{Colors.RESET}"
    print(f"{Colors.BOLD}{name}{Colors.RESET}: {status}")
    print(f"  └─ {description}")
    print(f"  └─ Current: {masked}")
    return True

def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}Pacifica API Configuration Verification{Colors.RESET}")
    print("=" * 60)
    
    # Load environment
    if not load_env():
        print(f"\n{Colors.RED}Error: .env file not found at backend/.env{Colors.RESET}")
        print("Please ensure you're running this script from the project root.")
        sys.exit(1)
    
    print(f"\n{Colors.GREEN}✓ Environment file loaded: backend/.env{Colors.RESET}\n")
    
    # Check variables
    print(f"{Colors.BOLD}Required Configuration:{Colors.RESET}")
    print("-" * 60)
    
    required_ok = True
    required_ok &= check_variable(
        'PACIFICA_API_BASE_URL',
        'Base URL for Pacifica API',
        required=True
    )
    required_ok &= check_variable(
        'PACIFICA_API_KEY',
        'API Key for authentication',
        required=True
    )
    required_ok &= check_variable(
        'PACIFICA_API_SECRET',
        'API Secret for request signing',
        required=True
    )
    
    print(f"\n{Colors.BOLD}Optional Configuration:{Colors.RESET}")
    print("-" * 60)
    
    optional_ok = True
    optional_ok &= check_variable(
        'PACIFICA_BUILDER_CODE',
        'Builder code for earning fees (optional)',
        required=False
    )
    
    # Summary
    print(f"\n{Colors.BOLD}Summary:{Colors.RESET}")
    print("-" * 60)
    
    if required_ok:
        print(f"{Colors.GREEN}✓ All required variables are configured!{Colors.RESET}")
    else:
        print(f"{Colors.RED}✗ Some required variables are missing or invalid.{Colors.RESET}")
        print(f"\nTo fix this, edit {Colors.BOLD}backend/.env{Colors.RESET} and replace:")
        print(f"  • your_pacifica_api_key_here → your actual API key")
        print(f"  • your_pacifica_api_secret_here → your actual API secret")
    
    if not optional_ok:
        print(f"\n{Colors.YELLOW}⚠ Optional builder code not configured.{Colors.RESET}")
        print(f"  You can still use orders, but won't earn builder fees.")
    
    # API Health Check
    print(f"\n{Colors.BOLD}API Endpoint Status:{Colors.RESET}")
    print("-" * 60)
    
    api_url = os.getenv('PACIFICA_API_BASE_URL', 'https://api.pacifica.fi/api/v1')
    print(f"Base URL: {Colors.BLUE}{api_url}{Colors.RESET}")
    
    # Try to import requests for connectivity check
    try:
        import requests
        print(f"\nAttempting to verify API connectivity...")
        try:
            response = requests.head(
                f"{api_url}/health",
                timeout=5
            )
            if response.status_code < 500:
                print(f"{Colors.GREEN}✓ API is reachable{Colors.RESET}")
            else:
                print(f"{Colors.YELLOW}⚠ API returned status {response.status_code}{Colors.RESET}")
        except requests.exceptions.Timeout:
            print(f"{Colors.YELLOW}⚠ API request timed out{Colors.RESET}")
        except requests.exceptions.ConnectionError:
            print(f"{Colors.RED}✗ Cannot connect to API (network issue or endpoint down){Colors.RESET}")
        except Exception as e:
            print(f"{Colors.YELLOW}⚠ Connection check failed: {str(e)}{Colors.RESET}")
    except ImportError:
        print(f"{Colors.YELLOW}⚠ requests library not installed (skipping connectivity check){Colors.RESET}")
    
    # Final status
    print(f"\n{Colors.BOLD}Configuration Status:{Colors.RESET}")
    print("-" * 60)
    
    if required_ok:
        print(f"{Colors.GREEN}✓ READY TO USE{Colors.RESET}")
        print(f"\nNext steps:")
        print(f"1. Restart the backend server to load updated environment")
        print(f"2. Test trading endpoints at http://localhost:8000/docs")
        print(f"3. Try creating an order via /trading/orders/market")
        print(f"\nBackend restart command:")
        print(f"{Colors.BLUE}$env:PYTHONPATH = \".\"; cd backend; python -m uvicorn app.main:app --port 8000{Colors.RESET}")
    else:
        print(f"{Colors.RED}✗ CONFIGURATION INCOMPLETE{Colors.RESET}")
        print(f"\nNext steps:")
        print(f"1. Get your credentials from Pacifica: https://pacifica.fi")
        print(f"2. Edit backend/.env with your actual credentials")
        print(f"3. Run this script again to verify")
        print(f"4. Restart the backend server")
        print(f"\nFor detailed instructions, see: PACIFICA_CREDENTIALS_SETUP.md")
    
    print(f"\n" + "=" * 60 + "\n")
    
    return 0 if required_ok else 1

if __name__ == '__main__':
    sys.exit(main())
