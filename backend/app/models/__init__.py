from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), unique=True, index=True)
    price = Column(Float)
    price_change_1h = Column(Float, nullable=True)
    price_change_24h = Column(Float, nullable=True)
    price_change_7d = Column(Float, nullable=True)
    open_interest = Column(Float)
    open_interest_change = Column(Float, nullable=True)
    funding_rate = Column(Float)
    funding_rate_8h = Column(Float, nullable=True)
    volume_24h = Column(Float)
    liquidation_long = Column(Float, nullable=True)
    liquidation_short = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, index=True)


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    price = Column(Float)
    size = Column(Float)
    side = Column(String(4))  # LONG or SHORT
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    trader_address = Column(String(255), nullable=True)
    is_whale = Column(Boolean, default=False, index=True)


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    trader_address = Column(String(255), index=True)
    symbol = Column(String(50), index=True)
    size = Column(Float)
    collateral = Column(Float)
    entry_price = Column(Float)
    liquidation_price = Column(Float)
    leverage = Column(Float)
    pnl = Column(Float, nullable=True)
    side = Column(String(4))  # LONG or SHORT
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Liquidation(Base):
    __tablename__ = "liquidations"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    price = Column(Float)
    amount = Column(Float)
    side = Column(String(4))  # LONG or SHORT
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Trader(Base):
    __tablename__ = "traders"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(255), unique=True, index=True)
    win_rate = Column(Float, nullable=True)
    total_pnl = Column(Float, nullable=True)
    avg_leverage = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    trade_count = Column(Integer, default=0)
    trader_score = Column(Float, default=0)
    last_activity = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SocialData(Base):
    __tablename__ = "social_data"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(50), index=True)
    platform = Column(String(50))  # twitter, telegram, prediction_market
    mentions = Column(Integer)
    sentiment_score = Column(Float, nullable=True)
    trending = Column(Boolean, default=False)
    top_post = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Narrative(Base):
    __tablename__ = "narratives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    momentum_score = Column(Float)
    mention_velocity = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    insight_type = Column(String(50))  # market_move, liquidation_risk, whale_alert, etc.
    content = Column(Text)
    confidence_score = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class LiquidationCluster(Base):
    __tablename__ = "liquidation_clusters"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    price_level = Column(Float)
    long_amount = Column(Float)
    short_amount = Column(Float)
    total_amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
