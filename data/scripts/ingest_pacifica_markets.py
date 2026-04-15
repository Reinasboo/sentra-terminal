"""
Ingest market data from Pacifica API
"""
import asyncio
import sys
sys.path.insert(0, '/backend')

from app.db import SessionLocal, init_db
from app.services import pacifica_client
from app.models import Market
from datetime import datetime


async def ingest_markets():
    """Fetch market data from Pacifica and store in database"""
    init_db()
    db = SessionLocal()

    symbols = ["BTC", "ETH", "SOL", "ARB", "OP"]

    for symbol in symbols:
        try:
            data = await pacifica_client.get_market_data(symbol)

            if not data:
                print(f"No data for {symbol}")
                continue

            market = db.query(Market).filter(Market.symbol == symbol).first()
            if not market:
                market = Market(symbol=symbol)
                db.add(market)

            market.price = data.get("price", 0)
            market.open_interest = data.get("open_interest", 0)
            market.funding_rate = data.get("funding_rate", 0)
            market.volume_24h = data.get("volume_24h", 0)
            market.last_updated = datetime.utcnow()

            db.commit()
            print(f"✓ Ingested {symbol}: ${market.price}")

        except Exception as e:
            print(f"✗ Error ingesting {symbol}: {e}")

    db.close()


if __name__ == "__main__":
    asyncio.run(ingest_markets())
    print("Market ingestion complete")
