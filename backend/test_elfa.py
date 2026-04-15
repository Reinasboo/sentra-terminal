import asyncio
import aiohttp
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv('ELFA_API_KEY')
base_url = 'https://api.elfa.ai'

async def test_endpoints():
    headers = {
        'x-elfa-api-key': api_key,
        'Content-Type': 'application/json'
    }
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Try top mentions without date range
        print("=" * 50)
        print("Test 1: Top mentions for BTC (no date range)")
        try:
            async with session.get(
                f'{base_url}/v2/data/top-mentions',
                headers=headers,
                params={'ticker': 'BTC'},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                print(f"Status: {resp.status}")
                data = await resp.json()
                if isinstance(data, dict) and 'message' in data:
                    print(f"Error: {data.get('message')}")
                elif isinstance(data, list):
                    print(f"Got {len(data)} mentions")
                    if data:
                        print(f"Sample: {json.dumps(data[0], indent=2)[:200]}")
        except Exception as e:
            print(f"Exception: {e}")
        
        # Test 2: Try with just sentiment endpoint
        print("\n" + "=" * 50)
        print("Test 2: Account sentiment")
        try:
            async with session.get(
                f'{base_url}/v2/sentiment',
                headers=headers,
                params={'ticker': 'BTC'},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                print(f"Status: {resp.status}")
                data = await resp.json()
                print(f"Response: {json.dumps(data, indent=2)[:300]}")
        except Exception as e:
            print(f"Exception: {e}")
        
        # Test 3: Try posts endpoint
        print("\n" + "=" * 50)
        print("Test 3: Posts for BTC")
        try:
            async with session.get(
                f'{base_url}/v2/posts',
                headers=headers,
                params={'ticker': 'BTC'},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                print(f"Status: {resp.status}")
                data = await resp.json()
                if isinstance(data, list):
                    print(f"Got {len(data)} posts")
                else:
                    print(f"Response: {json.dumps(data, indent=2)[:300]}")
        except Exception as e:
            print(f"Exception: {e}")
        
        # Test 4: Try mentions endpoint (different path)
        print("\n" + "=" * 50)
        print("Test 4: Mentions (different path)")
        try:
            async with session.get(
                f'{base_url}/v2/mentions',
                headers=headers,
                params={'ticker': 'BTC'},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                print(f"Status: {resp.status}")
                data = await resp.json()
                if isinstance(data, list):
                    print(f"Got {len(data)} mentions")
                else:
                    print(f"Response: {json.dumps(data, indent=2)[:300]}")
        except Exception as e:
            print(f"Exception: {e}")

asyncio.run(test_endpoints())
