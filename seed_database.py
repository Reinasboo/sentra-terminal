#!/usr/bin/env python
"""
Database seeding script - Populates database with sample data
Run this to initialize test data for all endpoints
"""

import sys
import os
from datetime import datetime, timedelta

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine

from app.db import DATABASE_URL, Base
from app.models import (
    Market, Trade, Position, Liquidation, Trader, 
    SocialData, Narrative, AIInsight, LiquidationCluster
)


def seed_markets(db: Session):
    """Seed market data for major trading pairs"""
    print("Seeding markets...")
    
    markets_data = [
        {
            "symbol": "BTC",
            "price": 42500.00,
            "price_change_1h": 0.5,
            "price_change_24h": 2.3,
            "price_change_7d": 5.1,
            "open_interest": 15000000000,
            "open_interest_change": 250000000,
            "funding_rate": 0.00015,
            "funding_rate_8h": 0.00012,
            "volume_24h": 25000000000,
            "liquidation_long": 45000000,
            "liquidation_short": 38000000,
        },
        {
            "symbol": "ETH",
            "price": 2250.00,
            "price_change_1h": 0.3,
            "price_change_24h": 1.8,
            "price_change_7d": 4.2,
            "open_interest": 8000000000,
            "open_interest_change": 150000000,
            "funding_rate": 0.00012,
            "funding_rate_8h": 0.00010,
            "volume_24h": 12000000000,
            "liquidation_long": 25000000,
            "liquidation_short": 22000000,
        },
        {
            "symbol": "SOL",
            "price": 95.50,
            "price_change_1h": -0.2,
            "price_change_24h": 1.2,
            "price_change_7d": 3.5,
            "open_interest": 3000000000,
            "open_interest_change": 50000000,
            "funding_rate": 0.00010,
            "funding_rate_8h": 0.00008,
            "volume_24h": 4500000000,
            "liquidation_long": 8000000,
            "liquidation_short": 7500000,
        },
        {
            "symbol": "ARB",
            "price": 0.85,
            "price_change_1h": 0.1,
            "price_change_24h": 0.8,
            "price_change_7d": 2.3,
            "open_interest": 500000000,
            "open_interest_change": 20000000,
            "funding_rate": 0.00008,
            "funding_rate_8h": 0.00006,
            "volume_24h": 800000000,
            "liquidation_long": 1200000,
            "liquidation_short": 1100000,
        },
    ]
    
    for market_data in markets_data:
        existing = db.query(Market).filter(Market.symbol == market_data["symbol"]).first()
        if not existing:
            market = Market(**market_data, last_updated=datetime.utcnow())
            db.add(market)
            print(f"  + {market_data['symbol']}")
        else:
            print(f"  ~ {market_data['symbol']} (already exists)")
    
    db.commit()
    print("Markets seeded successfully\n")


def seed_trades(db: Session):
    """Seed sample trade data"""
    print("Seeding trades...")
    
    now = datetime.utcnow()
    trades_data = [
        {"symbol": "BTC", "price": 42500, "size": 0.5, "side": "LONG", "trader_address": "whale_1", "is_whale": True},
        {"symbol": "BTC", "price": 42480, "size": 0.3, "side": "SHORT", "trader_address": "whale_2", "is_whale": True},
        {"symbol": "ETH", "price": 2250, "size": 10, "side": "LONG", "trader_address": "trader_1", "is_whale": False},
        {"symbol": "ETH", "price": 2245, "size": 15, "side": "SHORT", "trader_address": "whale_1", "is_whale": True},
        {"symbol": "SOL", "price": 95.5, "size": 100, "side": "LONG", "trader_address": "trader_2", "is_whale": False},
    ]
    
    for i, trade_data in enumerate(trades_data):
        trade_data["timestamp"] = now - timedelta(hours=i)
        trade = Trade(**trade_data)
        db.add(trade)
        print(f"  + Trade {i+1}: {trade_data['symbol']}")
    
    db.commit()
    print("Trades seeded successfully\n")


def seed_positions(db: Session):
    """Seed sample position data"""
    print("Seeding positions...")
    
    now = datetime.utcnow()
    positions_data = [
        {
            "trader_address": "whale_1",
            "symbol": "BTC",
            "size": 5.0,
            "collateral": 850000,
            "entry_price": 42000,
            "liquidation_price": 38000,
            "leverage": 5.0,
            "side": "LONG",
        },
        {
            "trader_address": "whale_2",
            "symbol": "BTC",
            "size": 3.0,
            "collateral": 600000,
            "entry_price": 42500,
            "liquidation_price": 39000,
            "leverage": 4.0,
            "side": "SHORT",
        },
        {
            "trader_address": "trader_1",
            "symbol": "ETH",
            "size": 50,
            "collateral": 100000,
            "entry_price": 2250,
            "liquidation_price": 2000,
            "leverage": 2.0,
            "side": "LONG",
        },
    ]
    
    for i, pos_data in enumerate(positions_data):
        pos_data["timestamp"] = now
        position = Position(**pos_data, pnl=10000)
        db.add(position)
        print(f"  + Position {i+1}: {pos_data['trader_address']} {pos_data['symbol']}")
    
    db.commit()
    print("Positions seeded successfully\n")


def seed_liquidations(db: Session):
    """Seed sample liquidation data"""
    print("Seeding liquidations...")
    
    now = datetime.utcnow()
    liq_data = [
        {"symbol": "BTC", "price": 41500, "amount": 5000000, "side": "LONG"},
        {"symbol": "BTC", "price": 41600, "amount": 4500000, "side": "LONG"},
        {"symbol": "BTC", "price": 43000, "amount": 3500000, "side": "SHORT"},
        {"symbol": "ETH", "price": 2200, "amount": 2000000, "side": "LONG"},
        {"symbol": "ETH", "price": 2300, "amount": 1800000, "side": "SHORT"},
    ]
    
    for i, liq in enumerate(liq_data):
        liq["timestamp"] = now - timedelta(hours=i)
        liquidation = Liquidation(**liq)
        db.add(liquidation)
        print(f"  + Liquidation {i+1}: {liq['symbol']} {liq['side']}")
    
    db.commit()
    print("Liquidations seeded successfully\n")


def seed_traders(db: Session):
    """Seed sample trader data"""
    print("Seeding traders...")
    
    traders_data = [
        {
            "address": "whale_1",
            "win_rate": 0.65,
            "total_pnl": 250000,
            "avg_leverage": 4.5,
            "sharpe_ratio": 1.8,
            "trade_count": 47,
            "trader_score": 78.5,
            "last_activity": datetime.utcnow(),
        },
        {
            "address": "whale_2",
            "win_rate": 0.58,
            "total_pnl": 180000,
            "avg_leverage": 3.8,
            "sharpe_ratio": 1.4,
            "trade_count": 35,
            "trader_score": 71.2,
            "last_activity": datetime.utcnow(),
        },
        {
            "address": "trader_1",
            "win_rate": 0.52,
            "total_pnl": 45000,
            "avg_leverage": 2.5,
            "sharpe_ratio": 0.9,
            "trade_count": 23,
            "trader_score": 55.8,
            "last_activity": datetime.utcnow(),
        },
    ]
    
    for trader_data in traders_data:
        existing = db.query(Trader).filter(Trader.address == trader_data["address"]).first()
        if not existing:
            trader = Trader(**trader_data)
            db.add(trader)
            print(f"  + {trader_data['address']}")
    
    db.commit()
    print("Traders seeded successfully\n")


def seed_social_data(db: Session):
    """Seed sample social sentiment data"""
    print("Seeding social data...")
    
    now = datetime.utcnow()
    social_data_list = [
        {"token": "BTC", "platform": "twitter", "mentions": 1250, "sentiment_score": 0.72},
        {"token": "BTC", "platform": "telegram", "mentions": 450, "sentiment_score": 0.68},
        {"token": "BTC", "platform": "reddit", "mentions": 320, "sentiment_score": 0.65},
        {"token": "ETH", "platform": "twitter", "mentions": 950, "sentiment_score": 0.70},
        {"token": "ETH", "platform": "telegram", "mentions": 380, "sentiment_score": 0.66},
        {"token": "SOL", "platform": "twitter", "mentions": 650, "sentiment_score": 0.62},
    ]
    
    for i, data in enumerate(social_data_list):
        data["timestamp"] = now - timedelta(hours=i)
        data["trending"] = True
        social = SocialData(**data)
        db.add(social)
        print(f"  + {data['token']} on {data['platform']}")
    
    db.commit()
    print("Social data seeded successfully\n")


def main():
    """Run all seed functions"""
    print("\n" + "="*60)
    print("DATABASE SEEDING SCRIPT")
    print("="*60 + "\n")
    
    # Create engine and tables
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        seed_markets(db)
        seed_trades(db)
        seed_positions(db)
        seed_liquidations(db)
        seed_traders(db)
        seed_social_data(db)
        
        print("="*60)
        print("DATABASE SEEDING COMPLETE")
        print("="*60)
        print("\nYou can now test the endpoints:")
        print("  - GET /markets/")
        print("  - GET /markets/BTC")
        print("  - GET /analytics/sentiment/BTC")
        print("  - GET /analytics/liquidations/BTC")
        print("  - GET /analytics/whales/BTC")
        print()
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
