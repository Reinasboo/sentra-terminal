"""
Ingest social data from Elfa API
"""
import asyncio
import sys
sys.path.insert(0, '/backend')

from app.db import SessionLocal, init_db
from app.services.elfa_service import elfa_client
from app.models import SocialData
from datetime import datetime


async def ingest_social_data():
    """Fetch social sentiment data from Elfa and store in database"""
    init_db()
    db = SessionLocal()

    try:
        # Fetch trending tokens
        trending_tokens = await elfa_client.get_trending_tokens()
        print(f"Found {len(trending_tokens)} trending tokens")

        for token_data in trending_tokens:
            token = token_data.get("symbol") or token_data.get("ticker", "")
            if not token:
                continue

            mentions = token_data.get("mentions", 0)
            sentiment = token_data.get("sentiment_score", 0.5)

            social = SocialData(
                token=token,
                platform="aggregated",
                mentions=mentions,
                sentiment_score=sentiment,
                trending=True,
                timestamp=datetime.utcnow()
            )
            db.add(social)

        db.commit()
        print(f"✓ Ingested social data for {len(trending_tokens)} tokens")

    except Exception as e:
        print(f"✗ Error ingesting social data: {e}")

    # Fetch trending narratives
    try:
        narratives = await elfa_client.get_trending_narratives()
        from app.models import Narrative

        for narrative_data in narratives[:10]:  # Top 10
            narrative = Narrative(
                title=narrative_data.get("title", ""),
                description=narrative_data.get("description", ""),
                momentum_score=narrative_data.get("momentum_score", 0),
                mention_velocity=narrative_data.get("mention_velocity", 0),
                timestamp=datetime.utcnow()
            )
            db.add(narrative)

        db.commit()
        print(f"✓ Ingested {len(narratives[:10])} narratives")

    except Exception as e:
        print(f"✗ Error ingesting narratives: {e}")

    db.close()


if __name__ == "__main__":
    asyncio.run(ingest_social_data())
    print("Social data ingestion complete")
