from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Market Schemas
class MarketBase(BaseModel):
    symbol: str
    price: float
    open_interest: float
    funding_rate: float
    volume_24h: float


class MarketCreate(MarketBase):
    pass


class Market(MarketBase):
    id: int
    price_change_1h: Optional[float] = None
    price_change_24h: Optional[float] = None
    liquidation_long: Optional[float] = None
    liquidation_short: Optional[float] = None
    last_updated: datetime

    class Config:
        from_attributes = True


# Trade Schemas
class TradeBase(BaseModel):
    symbol: str
    price: float
    size: float
    side: str


class TradeCreate(TradeBase):
    trader_address: Optional[str] = None


class Trade(TradeBase):
    id: int
    timestamp: datetime
    is_whale: bool

    class Config:
        from_attributes = True


# Position Schemas
class PositionBase(BaseModel):
    trader_address: str
    symbol: str
    size: float
    collateral: float
    entry_price: float
    liquidation_price: float
    leverage: float
    side: str


class PositionCreate(PositionBase):
    pass


class Position(PositionBase):
    id: int
    pnl: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# Liquidation Schemas
class LiquidationBase(BaseModel):
    symbol: str
    price: float
    amount: float
    side: str


class LiquidationCreate(LiquidationBase):
    pass


class Liquidation(LiquidationBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Trader Schemas
class TraderBase(BaseModel):
    address: str


class TraderCreate(TraderBase):
    pass


class Trader(TraderBase):
    id: int
    win_rate: Optional[float] = None
    total_pnl: Optional[float] = None
    avg_leverage: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    trade_count: int
    trader_score: float
    last_activity: Optional[datetime] = None

    class Config:
        from_attributes = True


# Social Data Schemas
class SocialDataBase(BaseModel):
    token: str
    platform: str
    mentions: int


class SocialDataCreate(SocialDataBase):
    sentiment_score: Optional[float] = None


class SocialData(SocialDataBase):
    id: int
    sentiment_score: Optional[float] = None
    trending: bool
    timestamp: datetime

    class Config:
        from_attributes = True


# AI Insight Schemas
class AIInsightBase(BaseModel):
    symbol: str
    insight_type: str
    content: str


class AIInsightCreate(AIInsightBase):
    confidence_score: Optional[float] = None


class AIInsight(AIInsightBase):
    id: int
    confidence_score: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# Market Explanation Schema
class MarketExplanationRequest(BaseModel):
    symbol: str = "BTC"


class MarketExplanationResponse(BaseModel):
    symbol: str
    explanation: str
    timestamp: datetime
