"""
Ingest trade data from Pacifica API
"""
import asyncio
import sys
sys.path.insert(0, '/backend')

from app.db import SessionLocal, init_db
from app.services import pacifica_client
from app.models import Trade
from datetime import datetime


async def ingest_trades():
    """Fetch trades from Pacifica and store in database"""
    init_db()
    db = SessionLocal()

    symbols = ["BTC", "ETH", "SOL", "ARB", "OP"]

    for symbol in symbols:
        try:
            trades = await pacifica_client.get_trades(symbol, limit=100)

            if not trades:
                print(f"No trades for {symbol}")
                continue

            for trade_data in trades:
                # Check if trade already exists
                existing = db.query(Trade).filter(
                    Trade.symbol == symbol,
                    Trade.timestamp == datetime.fromisoformat(trade_data.get("timestamp", datetime.utcnow().isoformat()))
                ).first()

                if existing:
                    continue

                trade = Trade(
                    symbol=symbol,
                    price=trade_data.get("price", 0),
                    size=trade_data.get("size", 0),
                    side=trade_data.get("side", "LONG"),
                    trader_address=trade_data.get("trader", None),
                    is_whale=False,  # Will be determined by whale detection service
                    timestamp=datetime.fromisoformat(trade_data.get("timestamp", datetime.utcnow().isoformat()))
                )
                db.add(trade)

            db.commit()
            print(f"✓ Ingested {len(trades)} trades for {symbol}")

        except Exception as e:
            print(f"✗ Error ingesting trades for {symbol}: {e}")

    db.close()


if __name__ == "__main__":
    asyncio.run(ingest_trades())
    print("Trades ingestion complete")
