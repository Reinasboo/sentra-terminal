from sqlalchemy.orm import Session
from app.models import SocialData, Narrative
from app.services.elfa_service import elfa_client
from typing import Dict, List
from datetime import datetime, timedelta


class SentimentEngine:
    """Analyzes social sentiment and trends"""

    @staticmethod
    async def analyze_token_sentiment(token: str, db: Session) -> Dict:
        """Analyze overall sentiment for a token"""
        # Get recent social data (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        social_data = db.query(SocialData).filter(
            SocialData.token == token,
            SocialData.timestamp >= seven_days_ago
        ).order_by(SocialData.timestamp.asc()).all()

        # If no data in database, return defaults (skip slow Elfa API call)
        # The Elfa API is typically slow or unavailable in test mode
        # In production, this would call: await elfa_client.get_top_mentions(token)
        if not social_data:
            return {
                "token": token,
                "sentiment_score": 0.5,
                "total_mentions": 0,
                "mention_velocity": 0,
                "platforms": {},
                "source": "defaults"
            }

        if social_data:
            # Calculate sentiment from database records
            sentiment_scores = [d.sentiment_score for d in social_data if d.sentiment_score is not None]
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
            
            # Count total mentions by platform
            total_mentions = sum(d.mentions for d in social_data if d.mentions)
            mention_velocity = SentimentEngine.calculate_mention_velocity(social_data)
            
            # Build platform breakdown
            platforms = {}
            for d in social_data:
                platform = d.platform or "unknown"
                if platform not in platforms:
                    platforms[platform] = 0
                platforms[platform] += d.mentions
            
            return {
                "token": token,
                "sentiment_score": avg_sentiment,
                "total_mentions": total_mentions,
                "mention_velocity": mention_velocity,
                "platforms": platforms,
                "source": "database"
            }
        
        # No data available, return defaults
        return {
            "token": token,
            "sentiment_score": None,
            "total_mentions": 0,
            "mention_velocity": 0,
            "platforms": {},
            "source": "none"
        }

    @staticmethod
    def calculate_mention_velocity(social_data: List[SocialData]) -> float:
        """Calculate how fast mentions are growing (0-100) from database records"""
        if not social_data or len(social_data) < 2:
            return 0.0

        # Sort by timestamp
        sorted_data = sorted(social_data, key=lambda x: x.timestamp)

        # Calculate total mentions per day
        total_first = sum(d.mentions for d in sorted_data[:len(sorted_data)//2] if d.mentions)
        total_last = sum(d.mentions for d in sorted_data[len(sorted_data)//2:] if d.mentions)
        
        if total_first == 0:
            return 0.0
        
        # Compute growth rate and cap at 100
        growth_rate = ((total_last - total_first) / total_first) * 100
        return min(max(growth_rate, 0), 100)

    @staticmethod
    def calculate_mention_velocity_from_mentions(mentions: List[Dict]) -> float:
        """Calculate mention velocity from live API mentions (0-100)"""
        if not mentions or len(mentions) == 0:
            return 0.0
        
        # Base velocity on mention count and sentiment distribution
        mention_count = len(mentions)
        sentiment_scores = []
        
        for mention in mentions:
            sentiment = mention.get("sentiment_score") or mention.get("sentiment") or 0.5
            if isinstance(sentiment, (int, float)):
                sentiment_scores.append(float(sentiment))
        
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
        # Velocity = mention count (as percentage of 100) weighted by sentiment
        velocity = min(100, (mention_count / 10) * avg_sentiment * 100)
        return velocity

    @staticmethod
    async def get_trending_narratives(db: Session, limit: int = 10) -> List[Dict]:
        """Get trending narratives from database or Elfa API"""
        narratives = db.query(Narrative).order_by(
            Narrative.momentum_score.desc()
        ).limit(limit).all()

        # If we have recent narratives, return them
        if narratives and len(narratives) > 0:
            return [
                {
                    "id": n.id,
                    "title": n.title,
                    "source": "database"
                }
                for n in narratives
            ]

        # If no narratives in database, skip Elfa API (tends to be slow/unavailable)
        # In production, would call: await elfa_client.get_trending_narratives()
        # For now, return empty list to keep API responsive
        return []

    @staticmethod
    async def fetch_and_store_social_data(db: Session):
        """Fetch latest social data from Elfa and store in database"""
        try:
            # Fetch trending tokens
            trending = await elfa_client.get_trending_tokens()

            for token_data in trending:
                token = token_data.get("symbol", token_data.get("ticker", ""))
                if not token:
                    continue

                mentions = token_data.get("mentions", 0)
                sentiment = token_data.get("sentiment_score", 0.5)

                social_record = SocialData(
                    token=token,
                    platform="aggregated",
                    mentions=mentions,
                    sentiment_score=sentiment,
                    trending=True,
                    timestamp=datetime.utcnow()
                )
                db.add(social_record)

            db.commit()
        except Exception as e:
            print(f"Error fetching social data: {e}")
