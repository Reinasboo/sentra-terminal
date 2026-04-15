"""
Pacifica Trading API Service

Uses official Pacifica SDK pattern with Solana keypair signing.
Reference: https://github.com/pacifica-fi/python-sdk
"""

import time
import json
import requests
import base58
import asyncio
import logging
from typing import Dict, Optional, Tuple, Any
from dataclasses import dataclass
import os
from solders.keypair import Keypair

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pacifica API Constants
REST_URL = os.getenv("PACIFICA_API_BASE_URL", "https://api.pacifica.fi/api/v1")
TESTNET_URL = "https://test-api.pacifica.fi/api/v1"


@dataclass
class OrderRequest:
    """Market order request"""
    symbol: str
    amount: str
    side: str  # "bid" or "ask"
    slippage_percent: str
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None


@dataclass
class LimitOrderRequest:
    """Limit order request"""
    symbol: str
    amount: str
    side: str  # "bid" or "ask"
    tick_level: int
    tif: str = "gtc"  # Good-til-cancelled
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None


@dataclass
class StopOrderRequest:
    """Stop order request"""
    symbol: str
    amount: str
    side: str
    trigger_price: str
    limit_price_offset: str = "50"
    reduce_only: bool = False
    client_order_id: Optional[str] = None
    builder_code: Optional[str] = None


@dataclass
class PositionTPSLRequest:
    """Take Profit / Stop Loss request"""
    symbol: str
    side: str
    take_profit: Optional[Dict] = None
    stop_loss: Optional[Dict] = None
    builder_code: Optional[str] = None


def prepare_message(header: Dict, payload: Dict) -> str:
    """
    Prepare JSON message for signing.
    Matches Pacifica SDK: common/utils.py prepare_message()
    """
    if "type" not in header or "timestamp" not in header or "expiry_window" not in header:
        raise ValueError("Header must have type, timestamp, and expiry_window")
    
    data = {
        **header,
        "data": payload,
    }
    
    # Sort keys recursively for consistent JSON
    def sort_json_keys(value):
        if isinstance(value, dict):
            sorted_dict = {}
            for key in sorted(value.keys()):
                sorted_dict[key] = sort_json_keys(value[key])
            return sorted_dict
        elif isinstance(value, list):
            return [sort_json_keys(item) for item in value]
        else:
            return value
    
    data = sort_json_keys(data)
    
    # Important: compact JSON separators for proper signature
    message = json.dumps(data, separators=(",", ":"), sort_keys=True)
    return message


def sign_message(header: Dict, payload: Dict, keypair: Keypair) -> Tuple[str, str]:
    """
    Sign a message using Solana keypair.
    Matches Pacifica SDK: common/utils.py sign_message()
    
    Returns:
        (message, signature) - message is JSON string, signature is base58 encoded
    """
    message = prepare_message(header, payload)
    message_bytes = message.encode("utf-8")
    signature = keypair.sign_message(message_bytes)
    signature_b58 = base58.b58encode(bytes(signature)).decode("ascii")
    return message, signature_b58


class PacificaClient:
    """
    Client for Pacifica REST API using official SDK authentication pattern.
    
    Requires PACIFICA_PRIVATE_KEY environment variable with base58-encoded private key.
    """
    
    def __init__(self, private_key: Optional[str] = None):
        """
        Initialize Pacifica client with private key.
        
        Args:
            private_key: Base58-encoded private key. If None, reads from PACIFICA_PRIVATE_KEY env var.
        """
        self.private_key = private_key or os.getenv("PACIFICA_PRIVATE_KEY")
        self.base_url = REST_URL
        self.keypair: Optional[Keypair] = None
        self.account: Optional[str] = None
        
        if self.private_key and self.private_key != "your_base58_solana_private_key_here":
            try:
                self.keypair = Keypair.from_base58_string(self.private_key)
                self.account = str(self.keypair.pubkey())
                logger.info(f"Pacifica client initialized. Account: {self.account}")
            except Exception as e:
                logger.error(f"Failed to load private key: {e}")
                logger.warning("Pacifica signing functionality will not work. Configure PACIFICA_PRIVATE_KEY env var.")
        else:
            logger.warning("No valid private key configured. Pacifica signing functionality will not work.")
    
    def _sign_request(
        self,
        signature_type: str,
        payload: Dict,
        expiry_window: int = 5000
    ) -> Tuple[Dict, str]:
        """
        Sign a request and return headers + signed request body.
        
        Args:
            signature_type: Type of request (e.g., "create_market_order")
            payload: Request payload to sign
            expiry_window: Time window for signature validity in milliseconds
            
        Returns:
            (request_dict, message) - Full signed request and the message that was signed
        """
        if not self.keypair or not self.account:
            raise ValueError("Keypair not initialized. Cannot sign request.")
        
        # Create signature header
        timestamp = int(time.time() * 1000)
        signature_header = {
            "timestamp": timestamp,
            "expiry_window": expiry_window,
            "type": signature_type,
        }
        
        # Sign the message
        message, signature = sign_message(signature_header, payload, self.keypair)
        
        # Construct signed request
        request_dict = {
            "account": self.account,
            "signature": signature,
            "timestamp": timestamp,
            "expiry_window": expiry_window,
            **payload,
        }
        
        return request_dict, message
    
    async def create_market_order(
        self,
        symbol: str,
        amount: str,
        side: str,
        slippage_percent: str,
        reduce_only: bool = False,
        client_order_id: Optional[str] = None,
        builder_code: Optional[str] = None,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Create a market order.
        
        Args:
            symbol: Trading pair (e.g., "BTC")
            amount: Order amount
            side: "bid" or "ask"
            slippage_percent: Acceptable slippage percentage
            reduce_only: Only reduce existing position
            client_order_id: Optional client-side order ID
            builder_code: Builder code for referral (if building on Pacifica)
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {
            "symbol": symbol,
            "amount": amount,
            "side": side,
            "slippage_percent": slippage_percent,
            "reduce_only": reduce_only,
        }
        
        if client_order_id:
            payload["client_order_id"] = client_order_id
        if builder_code:
            payload["builder_code"] = builder_code
        
        try:
            request_dict, message = self._sign_request(
                "create_market_order",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/orders/create_market"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Market order response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    logger.error(f"Error {response.status_code}: {error_data}")
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error creating market order: {e}")
            return {"status": "error", "message": str(e)}
    
    async def create_limit_order(
        self,
        symbol: str,
        amount: str,
        side: str,
        tick_level: int,
        tif: str = "gtc",
        reduce_only: bool = False,
        client_order_id: Optional[str] = None,
        builder_code: Optional[str] = None,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Create a limit order.
        
        Args:
            symbol: Trading pair (e.g., "BTC")
            amount: Order amount
            side: "bid" or "ask"
            tick_level: Price level (in ticks)
            tif: Time in force ("gtc", "ioc", "fok")
            reduce_only: Only reduce existing position
            client_order_id: Optional client-side order ID
            builder_code: Builder code for referral
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {
            "symbol": symbol,
            "amount": amount,
            "side": side,
            "tick_level": tick_level,
            "tif": tif,
            "reduce_only": reduce_only,
        }
        
        if client_order_id:
            payload["client_order_id"] = client_order_id
        if builder_code:
            payload["builder_code"] = builder_code
        
        try:
            request_dict, message = self._sign_request(
                "create_limit_order",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/orders/create_limit"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Limit order response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error creating limit order: {e}")
            return {"status": "error", "message": str(e)}
    
    async def create_stop_order(
        self,
        symbol: str,
        amount: str,
        side: str,
        trigger_price: str,
        limit_price_offset: str = "50",
        reduce_only: bool = False,
        client_order_id: Optional[str] = None,
        builder_code: Optional[str] = None,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Create a stop order.
        
        Args:
            symbol: Trading pair (e.g., "BTC")
            amount: Order amount
            side: "bid" or "ask"
            trigger_price: Price at which order triggers
            limit_price_offset: Offset from trigger price for limit order
            reduce_only: Only reduce existing position
            client_order_id: Optional client-side order ID
            builder_code: Builder code for referral
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {
            "symbol": symbol,
            "amount": amount,
            "side": side,
            "trigger_price": trigger_price,
            "limit_price_offset": limit_price_offset,
            "reduce_only": reduce_only,
        }
        
        if client_order_id:
            payload["client_order_id"] = client_order_id
        if builder_code:
            payload["builder_code"] = builder_code
        
        try:
            request_dict, message = self._sign_request(
                "create_stop_order",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/orders/create_stop"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Stop order response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error creating stop order: {e}")
            return {"status": "error", "message": str(e)}
    
    async def set_position_tpsl(
        self,
        symbol: str,
        side: str,
        take_profit: Optional[Dict] = None,
        stop_loss: Optional[Dict] = None,
        builder_code: Optional[str] = None,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Set take profit and/or stop loss for a position.
        
        Args:
            symbol: Trading pair (e.g., "BTC")
            side: Position side
            take_profit: Dict with {"limit_price": "...", "client_order_id": "..."}
            stop_loss: Dict with {"trigger_price": "...", "limit_price_offset": "...", "client_order_id": "..."}
            builder_code: Builder code for referral
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {
            "symbol": symbol,
            "side": side,
        }
        
        if take_profit:
            payload["take_profit"] = take_profit
        if stop_loss:
            payload["stop_loss"] = stop_loss
        if builder_code:
            payload["builder_code"] = builder_code
        
        try:
            request_dict, message = self._sign_request(
                "set_position_tpsl",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/positions/set_tpsl"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Position TPSL response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error setting position TPSL: {e}")
            return {"status": "error", "message": str(e)}
    
    async def approve_builder_code(
        self,
        builder_code: str,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Approve a builder code.
        
        Args:
            builder_code: Builder code to approve
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {"builder_code": builder_code}
        
        try:
            request_dict, message = self._sign_request(
                "approve_builder_code",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/builder/approve"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Approve builder code response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error approving builder code: {e}")
            return {"status": "error", "message": str(e)}
    
    async def revoke_builder_code(
        self,
        builder_code: str,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Revoke a builder code.
        
        Args:
            builder_code: Builder code to revoke
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {"builder_code": builder_code}
        
        try:
            request_dict, message = self._sign_request(
                "revoke_builder_code",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/builder/revoke"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Revoke builder code response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error revoking builder code: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_builder_approvals(self, account: Optional[str] = None) -> Dict:
        """
        Get builder codes approved by account.
        
        Args:
            account: Account address. If None, uses client's account.
            
        Returns:
            API response dictionary
        """
        account = account or self.account
        if not account:
            return {"status": "error", "message": "Account not set"}
        
        try:
            url = f"{self.base_url}/builder/approvals/{account}"
            response = requests.get(url, timeout=30)
            
            logger.info(f"Get approvals response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error getting builder approvals: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_trade_history(
        self,
        account: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict:
        """
        Get trade history for account.
        
        Args:
            account: Account address. If None, uses client's account.
            limit: Number of records to return
            offset: Offset for pagination
            
        Returns:
            API response dictionary
        """
        account = account or self.account
        if not account:
            return {"status": "error", "message": "Account not set"}
        
        try:
            url = f"{self.base_url}/history/{account}"
            params = {"limit": limit, "offset": offset}
            response = requests.get(url, params=params, timeout=30)
            
            logger.info(f"Get trade history response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error getting trade history: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_builder_trades(
        self,
        builder_code: str,
        limit: int = 100,
        offset: int = 0
    ) -> Dict:
        """
        Get trades for a builder code.
        
        Args:
            builder_code: Builder code to query
            limit: Number of records to return
            offset: Offset for pagination
            
        Returns:
            API response dictionary
        """
        try:
            url = f"{self.base_url}/builder/trades/{builder_code}"
            params = {"limit": limit, "offset": offset}
            response = requests.get(url, params=params, timeout=30)
            
            logger.info(f"Get builder trades response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error getting builder trades: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_builder_overview(self, account: Optional[str] = None) -> Dict:
        """
        Get builder overview/statistics for account.
        
        Args:
            account: Account address. If None, uses client's account.
            
        Returns:
            API response dictionary
        """
        account = account or self.account
        if not account:
            return {"status": "error", "message": "Account not set"}
        
        try:
            url = f"{self.base_url}/builder/overview/{account}"
            response = requests.get(url, timeout=30)
            
            logger.info(f"Get builder overview response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error getting builder overview: {e}")
            return {"status": "error", "message": str(e)}
    
    async def claim_referral_code(
        self,
        referral_code: str,
        expiry_window: int = 30000
    ) -> Dict:
        """
        Claim a referral code.
        
        Args:
            referral_code: Referral code to claim
            expiry_window: Signature expiry window in milliseconds
            
        Returns:
            API response dictionary
        """
        payload = {"referral_code": referral_code}
        
        try:
            request_dict, message = self._sign_request(
                "claim_referral_code",
                payload,
                expiry_window
            )
            
            url = f"{self.base_url}/referral/claim"
            response = requests.post(
                url,
                json=request_dict,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            logger.info(f"Claim referral code response: {response.status_code}")
            
            if response.status_code == 200:
                return {"status": "success", "data": response.json()}
            else:
                try:
                    error_data = response.json()
                    return {"status": "error", "message": str(error_data), "code": response.status_code}
                except:
                    return {"status": "error", "message": response.text, "code": response.status_code}
        
        except Exception as e:
            logger.error(f"Error claiming referral code: {e}")
            return {"status": "error", "message": str(e)}
